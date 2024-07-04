const ProductRepository = require("../repositories/product.repository");
const productRepository = new ProductRepository();
const logger =require("../utils/loggers.js") 
const EmailManager = require("../services/email.js");
const UserModel=require("../models/user.models.js")
const emailManager = new EmailManager();
class ProductController {

    async addProduct(req, res) {
        const newProduct = req.body;
        try {
           logger.info("Añadiendo un nuevo producto:", newProduct);
            const result = await productRepository.addProduct(newProduct);
           logger.info("Producto agregado exitosamente:", result);
            res.status(201).json(result); 
        } catch (error) {
           logger.error("Error al agregar un nuevo producto:", error);
            res.status(500).json({ error: "Error interno del servidor al agregar un nuevo producto" }); 
        }
    }

    async getProducts(req, res) {
        try {
            let { limit = 10, page = 1, sort, query } = req.query;
           logger.info("Obteniendo productos con parámetros:", { limit, page, sort, query });
            const products = await productRepository.getProducts(limit, page, sort, query);
           logger.info("Productos obtenidos exitosamente:", products);
            res.json(products);
        } catch (error) {
           logger.error("Error al obtener los productos:", error);
            res.status(500).json({ error: "Error interno del servidor al obtener los productos" });
        }
    }

    async getProductsById(req, res) {
        const id = req.params.pid;
        try {
           logger.info("Obteniendo producto por ID:", id);
            const sought = await productRepository.getProductsById(id);
            if (!sought) {
               logger.info("Producto no encontrado con ID:", id);
                return res.status(404).json({ error: "Producto no encontrado" });
            }
           logger.info("Producto encontrado:", sought);
            res.json(sought);
        } catch (error) {
           logger.error("Error al obtener el producto por ID:", error);
            res.status(500).json({ error: "Error interno del servidor al obtener el producto por ID" }); 
        }
    }

    async updateProduct(req, res) {
        try {
            const id = req.params.pid;
            const updatedProduct = req.body;

           logger.info("Actualizando producto con ID:", id);
            const result = await productRepository.updateProduct(id, updatedProduct);
           logger.info("Producto actualizado exitosamente:", result);
           console.log(result);
            res.json(result);
        } catch (error) {
           logger.error("Error al actualizar el producto:", error);
            res.status(500).json({ error: "Error interno del servidor al actualizar el producto" }); 
        }
    }

    async deleteProduct(req, res) {
        
        const productId = typeof req === "string" ? req : req.params.pid;
        try {
            logger.info("Eliminando producto con ID:", productId);
            
            // Obtener detalles del producto para verificar el usuario propietario
            const product = await productRepository.getProductsById(productId);
            if (!product) {
                return res.status(404).json({ error: "Producto no encontrado" });
            }
    
            // Verificar si el propietario es un usuario premium
            const ownerEmail = product.owner; 
            const owner = await UserModel.findOne({ email: ownerEmail }); 
            if (owner && owner.role=== "premium") {

                // Enviar correo electrónico al usuario premium
                    await emailManager.sendProductDeletionEmail(owner.email, owner.first_name, productId);
                    logger.info(`Correo enviado a ${owner.email}`);
                }
            
    
            let answer = await productRepository.deleteProduct(productId);
            logger.info("Producto eliminado exitosamente:", answer);
        } catch (error) {
            logger.error("Error al eliminar el producto:", error);
        }
    }
    
    //funcion  para  ir a detalles

    async getProductDetails(req, res) {
        const productId = req.params.pid;
        const cartId = req.user.cart;  // Asumiendo que el ID del carrito está en el usuario autenticado
        try {
            const product = await productRepository.getProductsById(productId);
            if (!product) {
                return res.status(404).json({ error: "Producto no encontrado" });
            }
            res.render('productDetails', { product, cartId });
        } catch (error) {
            logger.error("Error al obtener los detalles del producto:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async mockingProducts(req, res){
        const products = [];
        for(let i = 0 ; i <100; i ++ ){
            products.push(generateProducts())
        }
       logger.info("Productos de simulación generados:", products);
        res.json(products);
    }
}

module.exports = ProductController;
