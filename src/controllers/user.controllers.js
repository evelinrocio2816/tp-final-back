const UserModel = require("../models/user.models.js");
const CartModel = require("../models/cart.models.js");
const jwt = require("jsonwebtoken");
const { createHash, isValidPassword } = require("../utils/hashBcryp.js");
const UserDTO = require("../dto/user.dto.js");
const CustomErrors = require("../services/errors/custom-error.js");
const { EErrors } = require("../services/errors/enums.js");
const { generateInfoError } = require("../services/errors/info.js");
const logger =require("../utils/loggers.js"); 

const {generateResetToken}= require("../utils/tokenreset.js")
const EmailManager = require("../services/email.js");
const emailManager = new EmailManager();
const moment = require("moment");

const UserRepository = require("../repositories/user.repository.js");
const userRepository = new UserRepository();

class UserController {
  async register(req, res) {
    const { first_name, last_name, email, password, age } = req.body;
    try {
      const existUser = await UserModel.findOne({ email });
      if (existUser) {
        throw CustomErrors.createError({
          email: "Usuario nuevo",
          causa: generateInfoError(existUser.email),
          mensaje: "Error al intentar crear un usuario",
          codigo: EErrors.TIPO_INVALID,
        });
      }

      //Creo un nuevo carrito:
      const newCart = new CartModel();
      logger.info("Nuevo carrito creado:", newCart);
      await newCart.save();

      const newUser = new UserModel({
        first_name,
        last_name,
        email,
        cart: newCart._id,
        password: createHash(password),
        age,
      });

      logger.info("Nuevo usuario creado:", newUser);
      await newUser.save();

      const token = jwt.sign({ user: newUser }, "coderhouse", {
        expiresIn: "1h",
      });

      logger.info("Token generado:", token);
      res.cookie("CookieToken", token, {
        maxAge: 3600000,
        httpOnly: true,
      });

      res.redirect("/api/user/profile");
    } catch (error) {
      logger.error("Error en el registro de usuario:", error);
      res.status(500).send("Error interno del servidor");
    }
  }

  async login(req, res) {
    const { email, password } = req.body;
    try {
      const userFound = await UserModel.findOne({ email });
      logger.info("Usuario encontrado en el inicio de sesión:", userFound);
      if (!userFound) {
        return res.status(401).send("Usuario no válido");
      }
      const isValid = isValidPassword(password, userFound);
      logger.info("La contraseña es válida:", isValid);
      if (!isValid) {
        return res.status(401).send("Contraseña incorrecta");
      }
      const token = jwt.sign({ user: userFound }, "coderhouse", {
        expiresIn: "1h",
      });

      logger.info("Token generado:", token);
      res.cookie("CookieToken", token, {
        maxAge: 3600000,
        httpOnly: true,
      });

      res.redirect("/api/user/profile");
    } catch (error) {
      logger.error("Error en el inicio de sesión:", error);
      res.status(500).send("Error interno del servidor");
    }
  }

  async profile(req, res) {
    try {
      const isPremium = req.user.role === "premium";
      const userDto = new UserDTO(
        req.user.first_name,
        req.user.last_name,
        req.user.role
      );
      logger.info("Usuario obtenido en el perfil:", userDto);
      const isAdmin = req.user.role === "admin";
      const cartId = req.user.cart.toString();

      res.render("profile", { user: userDto, isPremium, isAdmin, cartId });
    } catch (error) {
      res.status(500).send("Error interno del servidor");
    }
  }
  async logout(req, res) {
    if (req.user) {
      try {
        req.user.last_connection = new Date();
        await req.user.save();
      } catch (error) {
        logger.error(error);
        res.status(500).send("Error interno del servidor");
        return;
      }
    }
    res.clearCookie("CookieToken");
    logger.info("Usuario desconectado.");
    res.redirect("/login");
  }

  async admin(req, res) {
    if (req.user.user.role !== "admin") {
      return res.status(403).send("Acceso denegado");
    }
    logger.info("Acceso de administrador.");
    res.render("admin");
  }

  //Tercer integradora:
  async requestPasswordReset(req, res) {
    const { email } = req.body;

    try {
      // Buscar al usuario por su correo electrónico
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).send("Usuario no encontrado");
      }

      // Generar un token
      const token = generateResetToken();

      // Guardar el token en el usuario
      user.resetToken = {
        token: token,
        expiresAt: new Date(Date.now() + 3600000), // 1 hora de duración
      };
      await user.save();

      // Enviar correo electrónico con el enlace de restablecimiento utilizando EmailService
      await emailManager.sendResetEmail(email, user.first_name, token);

      res.redirect("/confirmation-env");
    } catch (error) {
      logger.error(error);
      res.status(500).send("Error interno del servidor");
    }
  }

  async resetPassword(req, res) {
    const { email, password, token } = req.body;

    try {
      // Buscar al usuario por su correo electrónico
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.render("changepassword", { error: "Usuario no encontrado" });
      }

      // Obtener el token de restablecimiento de la contraseña del usuario
      const resetToken = user.resetToken;
      if (!resetToken || resetToken.token !== token) {
        return res.render("passwordreset", {
          error: "El token de restablecimiento de contraseña es inválido",
        });
      }

      // Verificar si el token ha expirado
      const now = new Date();
      if (now > resetToken.expiresAt) {
        // Redirigir a la página de generación de nuevo correo de restablecimiento
        return res.redirect("/changepassword");
      }

      // Verificar si la nueva contraseña es igual a la anterior
      if (isValidPassword(password, user)) {
        return res.render("changepassword", {
          error: "La nueva contraseña no puede ser igual a la anterior",
        });
      }

      // Actualizar la contraseña del usuario
      user.password = createHash(password);
      user.resetToken = undefined; // Marcar el token como utilizado
      await user.save();

      // Renderizar la vista de confirmación de cambio de contraseña
      return res.redirect("/login");
    } catch (error) {
      logger.error(error);
      return res
        .status(500)
        .render("passwordreset", { error: "Error interno del servidor" });
    }
  }

  async togglePremium(req, res) {
    const { uid } = req.params;

    try {
      const user = await UserModel.findById(uid);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      const newRole = user.role === "user" ? "premium" : "user";
      // Llamar al método updateUserRole con el nuevo rol como string
      const actualized = await userRepository.updateUserRole(uid, newRole);
      if (!actualized) {
        return res
          .status(403)
          .send({
            message:
              "El usuario debe cargar los siguientes documentos: Identificación, Comprobante de domicilio, Comprobante de estado de cuenta",
          });
      }
      res.json(actualized);
    } catch (error) {
      console.log(error);
    }
  }

  //4 integradora
  async uploadDocuments(req, res) {
    const { uid } = req.params;
    const uploadedDocuments = req.files;

    try {
      const user = await UserModel.findById(uid);
      if (!user) {
        return res.status(404).send("Usuario no encontrado");
      }
      if (uploadedDocuments) {
        if (uploadedDocuments.document) {
          user.documents = user.documents.concat(
            uploadedDocuments.document.map((doc) => ({
              name: doc.originalname,

              reference: doc.path,
            }))
          );
        }
        if (uploadedDocuments.profile) {
          user.documents = user.documents.concat(
            uploadedDocuments.profile.map((doc) => ({
              name: doc.originalname,

              reference: doc.path,
            }))
          );
        }
      }

      await user.save();

      return res.status(200).send("Documentos subidos exitosamente");
    } catch (error) {
      console.error(error);

      res.status(500).send("Error interno del servidor");
    }
  }
  async cleanInactiveUsers(req, res) {
    try {
      // Tiempo límite de inactividad (3 minutos para pruebas, 2 días para producción)
      const inactiveTimeLimit = moment().subtract(30, "minutes"); // Para pruebas
      // const inactiveTimeLimit = moment().subtract(2, 'days'); // Para producción

      // Encontrar usuarios inactivos
      const inactiveUsers = await UserModel.find({
        last_connection: { $lt: inactiveTimeLimit.toDate() },
      });
      const inactiveEmails = inactiveUsers.map((user) => user.email);

      if (inactiveUsers.length === 0) {
        logger.info("No se encontraron usuarios inactivos.");
        if (res) 
        return;
      }
      // Eliminar usuarios inactivos
      await UserModel.deleteMany({
        _id: { $in: inactiveUsers.map((user) => user._id) },
      });

      // Enviar correos electrónicos
      inactiveEmails.forEach(async (email) => {
        await emailManager.sendEmail({to: email});
      });

      logger.info(`Usuarios inactivos eliminados: ${inactiveUsers.length}`);
    } catch (error) {
      logger.error("Error eliminando usuarios inactivos:", error);
    }
  }

  
  async listUsers(req, res) {
    try {
      const users = await userRepository.getAllUsers();
      res.render("admin-users", { users });
    } catch (error) {
      logger.error(error);
      res.status(500).send("Error interno del servidor");
    }
  }

  async editUser(req, res) {
    const { _id } = req.params;
    const { role } = req.body;
    try {
      const updatedUser = await userRepository.updateUserRole(
        _id,
        { role },
        { new: true }
      );
      if (!updatedUser) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.redirect("/admin/users"); // Redirige a la lista de usuarios después de editar
    } catch (error) {
      logger.error(error);
      res.status(500).send("Error interno del servidor");
    }
  }

  async deleteUser(req, res) {
    const { _id } = req.params;

    try {
      const deletedUser = await userRepository.deleteUserById(_id);

      if (!deletedUser) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.redirect("/admin/users"); // Redirige a la lista de usuarios después de eliminar
    } catch (error) {
      logger.error(error);
      res.status(500).send("Error interno del servidor");
    }
  }

  // Controlador para obtener todos los usuarios
  async getAllUsers(req, res) {
    try {
      // Buscar todos los usuarios en la base de datos
      const users = await userRepository.getAllUsers(
        {},
        "first_name last_name email role"
      );

      // Verificar si se encontraron usuarios
      if (!users || users.length === 0) {
        return res.status(404).json({ message: "No se encontraron usuarios." });
      }

      // Devolver la lista de usuarios con los campos especificados
      res.status(200).json(users);
      console.log(users);
    } catch (error) {
     logger.error("Error al obtener usuarios:", error);
      res.status(500).json({ message: "Error al obtener usuarios." });
    }
  }
}
module.exports = UserController;

     

