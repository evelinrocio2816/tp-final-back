const dotenv = require("dotenv");
const program = require("../utils/commander.js");
const mercadopago = require('mercadopago');
const {mode} = program.opts(); 

dotenv.config({
    path: mode === "produccion" ? "./.env.produccion": "./.env.desarrollo"
});

const configObject = {
    mongo_url: process.env.MONGO_URL,
    PORT : process.env.PORT,
    Access_token: process.env.YOUR_ACCESS_TOKEN,
    Public_key:  process.env.YOUR_PUBLIC_KEY
}




module.exports = configObject;