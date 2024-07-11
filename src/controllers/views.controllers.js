const ProductModel = require("../models/products.models.js");
const UserModel = require("../models/user.models.js");
const CartRepository = require("../repositories/cart.repository.js");
const UserRepository = require("../repositories/user.repository.js");
const userRepository = new UserRepository()
const cartRepository = new CartRepository();
const logger =require("../utils/loggers.js") 

class ViewsController {
    async renderProducts(req, res) {
        try {
            const { page = 1, limit = 4 } = req.query;
            const skip = (page - 1) * limit;
            const products = await ProductModel
                .find()
                .skip(skip)
                .limit(limit);

            const totalProducts = await ProductModel.countDocuments();
            const totalPages = Math.ceil(totalProducts / limit);
            const hasPrevPage = page > 1;
            const hasNextPage = page < totalPages;

            const newArray = products.map(product => {
                const { _id, ...rest } = product.toObject();
                return { id: _id, ...rest }; // Agregar el ID al objeto
            });

          logger.info("Productos renderizados:", newArray);

            const cartId = req.user.cart.toString();
          logger.info("ID de carrito:", cartId);

            res.render("products", {
                products: newArray,
                hasPrevPage,
                hasNextPage,
                prevPage: page > 1 ? parseInt(page) - 1 : null,
                nextPage: page < totalPages ? parseInt(page) + 1 : null,
                currentPage: parseInt(page),
                totalPages,
                cartId
            });

        } catch (error) {
          logger.error("Error al obtener productos", error);
            res.status(500).json({
                status: 'error',
                error: "Error interno del servidor"
            });
        }
    }
//Vista de detalles de productos
async renderProductDetails(req, res) {
  const productId = req.params.pid;
  try {
      // Aquí obtienes los detalles del producto según el ID
      const product = await ProductModel.findById(productId);
      if (!product) {
          return res.status(404).json({ error: "Producto no encontrado" });
      }
     res.render("productDetails", {
        product:{
          id:product._id.toString(),
          title: product.title,
          price: product.price,
          description: product.description,
          stock: product.stock,
          image: product.image,
          category: product.category,
          code: product.code,
          status: product.status,
        thumbnails: product.thumbnails,
        owner: product.owner
        },
       cartId:req.user.cart.toString()
      });
  } catch (error) {
      logger.error("Error al obtener los detalles del producto:", error);
      res.status(500).json({ error: "Error interno del servidor" });
  }
}
    async renderCart(req, res) {
        const cartId = req.params.cid;
        try {
            const cart = await cartRepository.getProductsFromCart(cartId);

          logger.info("Carrito obtenido:", cart);

            if (!cart) {
              logger.info("No existe el carrito con ese id");
                return res.status(404).json({ error: "carrito no encontrado" });
            }

            let totalPurchase = 0;

            const productsInCart = cart.products.map(item => {
                const product = item.product.toObject();
                const quantity = item.quantity;
                const totalPrice = product.price * quantity;

                totalPurchase += totalPrice;

                return {
                    product: { ...product, totalPrice },
                    quantity,
                    cartId
                };
            });

          logger.info("Productos en el carrito:", productsInCart);

            res.render("carts", { products: productsInCart, totalPurchase, cartId });
        } catch (error) {
          logger.error("Error al obtener el carrito", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async renderLogin(req, res) {
      logger.info("Renderizando página de inicio de sesión");
        res.render("login");
    }

    async renderRegister(req, res) {
      logger.info("Renderizando página de registro");
        res.render("register");
    }

    async renderRealTimeProducts(req, res) {
      const user = req.user; 
      const { page = 1, limit = 4 } = req.query;
        try {
          logger.info("Renderizando vista de productos en tiempo real");
            res.render("realtimeproducts",  {role: user.role, email: user.email});
        } catch (error) {
          logger.info("Error en la vista real time", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async renderChat(req, res) {
        const cartId=  req.user.cart.toString();
      logger.info("Renderizando página de chat con ID de carrito:", cartId);
        res.render("chat",{cartId});
    }

    async renderHome(req, res) {
      logger.info("Renderizando página de inicio");
        res.render("home");
    }
        //Tercer integradora: 
        async renderResetPassword(req, res) {
          try {
              logger.info('Renderizando vista de restablecimiento de contraseña');
              res.render("passwordreset");
          } catch (error) {
              logger.error('Error al renderizar vista de restablecimiento de contraseña:', error);
              res.status(500).send("Error interno del servidor");
          }
      }
      
      async renderChangePassword(req, res) {
          try {
              logger.info('Renderizando vista de cambio de contraseña');
              res.render("changepassword");
          } catch (error) {
              logger.error('Error al renderizar vista de cambio de contraseña:', error);
              res.status(500).send("Error interno del servidor");
          }
      }
      
      async renderConfirmation(req, res) {
          try {
              logger.info('Renderizando vista de confirmación de envío');
              res.render("confirmation-env");
          } catch (error) {
              logger.error('Error al renderizar vista de confirmación de envío:', error);
              res.status(500).send("Error interno del servidor");
          }
      }
      async renderPremium(req, res) {
        try {
            logger.info('Renderizando vista del panel premium');
            res.render("panel-premium");
        } catch (error) {
            logger.error('Error al renderizar vista del panel premium:', error);
            res.status(500).send("Error interno del servidor");
        }
    }
    async renderCheckoutPage(req, res){
      res.render('checkout');
    };
    async renderDocuments(req, res) {
      const  uid  = req.user._id.toString();
      res.render("documents", { uid: uid});
    }


async renderAdmin(req, res) {
  try {
  const limit = parseInt(req.query.limit) || 10; 
  const page = parseInt(req.query.page) || 1; 
  const loggedInUserId = req.user._id; 
  const role = req.user.role
  const totalUsers = await UserModel.countDocuments({_id: {$ne: loggedInUserId}}); 
  const skipCount = (page - 1) * limit; 
  let criteria = [
  { $match: { _id: {$ne: loggedInUserId}}}, 
  { $skip: skipCount}, 
  { $limit: limit} 
  ]
  
  const users = await UserModel.aggregate(criteria);
  const totalPages = Math.ceil(totalUsers / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  res.render("admin", { 
  users: users, 
  totalPages, 
  prevPage: hasPrevPage ? page - 1 : null, 
  nextPage: hasNextPage ? page + 1 : null,
  currentPage: page,
  hasPrevPage,
  hasNextPage,
  limit: limit, 
  role: role,
  docs: users,

  });
  
  } catch (error) {
  logger.error(error);
  res.status(500).send({message: "Error interno del servidor", error: error.message});
  }
  
  }
}
module.exports = ViewsController;
