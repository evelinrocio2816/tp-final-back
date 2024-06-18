
const mongoose = require("mongoose");
const { mongo_url } = require("../config/config");
const { log } = require("winston");
const logger = require("../utils/loggers");


class BaseDatos {
    static #instance;

    constructor() {
        mongoose.connect(mongo_url)
            .then(() => {
                logger.info("Conexión exitosa a MongoDB");
            })
            .catch((error) => {
                logger.error("Error al conectar a MongoDB:", error);
                
            });
        }
    static getInstance(){
        if( this.#instance){
           logger.info("Conexion Previa");
            return this.#instance
        }
        this.#instance = new BaseDatos()
            logger.info("Conexion Exitosa!!");
        return this.#instance
    }
}
 module.exports = BaseDatos.getInstance();


