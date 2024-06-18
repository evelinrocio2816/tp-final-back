const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const initializePassport = require("./config/passport.config.js");
const PORT = 8080;
require("./db/database.js");
const compression=require("express-compression")
const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const viewsRouter = require("./routes/views.router.js");
const userRouter = require("./routes/user.router.js");
const mockingRouter = require("./routes/mocking.router.js")
const handleErrors= require("./middleware/error.js")
const addLogger= require("./middleware/logger.js")
const TestRouter = require("./routes/Test.router.js")
const logger= require("./utils/loggers.js")

const checkoutRouter = require("./routes/checkout.router.js")

//Swagger
const swaggerJSDoc = require("swagger-jsdoc")
const swaggerUiExpress = require("swagger-ui-express")


//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./src/public"));
app.use(compression({
    brotli:{
        enabled:true,
        zlib:{}
    }
}))
app.use(handleErrors)
app.use(addLogger)


//Passport 
app.use(cookieParser());
app.use(passport.initialize());
initializePassport();


////Handlebars

app.engine("handlebars",exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

//AuthMiddleware
const authMiddleware = require("./middleware/authmiddleware.js");
app.use(authMiddleware);

//Rutas: 
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/user", userRouter);
app.use("/", viewsRouter);
app.use("/" , mockingRouter)
app.use("/", TestRouter)

app.use('/checkout', checkoutRouter);


const httpServer = app.listen(PORT, () => {
    logger.info(`Servidor escuchando en el Puerto: http://localhost:${PORT}`);
});
module.exports = app;
//Websockets: 
const SocketManager = require("./sockets/socketmanager.js");
const { info } = require("winston");
new SocketManager(httpServer);

//swagger

const swaggerOptions ={
    definition: {
        openapi: "3.0.1",
        info:{
            title: "Documentacion de tienda de Ropas",
            description: "App dedicada a la venta online de ropas y accesorios de damas"
        }
    },
    apis: ["./src/docs/**/*.yaml"]
}

//Conecto swagger con mi servidor Express

const specs = swaggerJSDoc(swaggerOptions);
app.use("/apidocs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs))