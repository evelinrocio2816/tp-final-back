const UserModel = require("../models/user.models.js");

class UserRepository {
  async findByEmail(email) {
    try {
      return await UserModel.findOne({ email });
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      return await UserModel.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async create(user) {
    try {
      return await user.save();
    } catch (error) {
      throw error;
    }
  }

  async save(user) {
    try {
      return await user.save();
    } catch (error) {
      throw error;
    }
  }
  async getAllUsers() {
    try {
      return await UserModel.find({});
    } catch (error) {
      throw error;
    }
  }

  async updateUserRole(userId, newRole) {
    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        console.log("Usuario no encontrado");
      }

      // Verificar si el usuario ha cargado los documentos requeridos

      const requiredDocuments = [
        "Identificacion.pdf",
        "Comprobante de domicilio.pdf",
        "Comprobante de estado de cuenta.pdf",
      ];

      const userDocuments = user.documents.map((doc) => doc.name);

      const hasRequiredDocuments = requiredDocuments.every((doc) =>
        userDocuments.includes(doc)
      );

      if (!hasRequiredDocuments) {
        return console.log(
          "El usuario debe cargar los siguientes documentos: Identificación, Comprobante de domicilio, Comprobante de estado de cuenta"
        );
      }

      const userActualized = await UserModel.findByIdAndUpdate(
        userId,
        { role: newRole },
        { new: true }
      );

      return userActualized;
    } catch (error) {
      console.log(error);
    }
  }
}



module.exports = UserRepository;
