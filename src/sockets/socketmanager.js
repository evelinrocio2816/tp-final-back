const socket = require("socket.io");
const ProductRepository = require("../repositories/product.repository.js");
const productRepository = new ProductRepository(); 
const MessageModel = require("../models/message.models.js");
const logger = require("../utils/loggers.js");
const ProductControllers = require("../controllers/product.controllers.js")
const productControllers = new ProductControllers()

class SocketManager {
    constructor(httpServer) {
        this.io = socket(httpServer);
        this.initSocketEvents();
    }

    async initSocketEvents() {
        this.io.on("connection", async (socket) => {
           logger.info("Un cliente se conectó");
            
            socket.emit("products", await productRepository.getProducts() );

            socket.on("deleteProduct", async (productiId) => {
                await productControllers.deleteProduct(productiId);
                this.emitUpdatedProducts(socket);
            });

            socket.on("addProduct", async (product) => {
                await productRepository.addProduct(product);
                this.emitUpdatedProducts(socket);
            });

            socket.on("message", async (data) => {
                await MessageModel.create(data);
                const messages = await MessageModel.find();
                socket.emit("message", messages);
            });
        });
    }

    async emitUpdatedProducts(socket) {
        socket.emit("products", await productRepository.getProducts());
    }
}

module.exports = SocketManager;
