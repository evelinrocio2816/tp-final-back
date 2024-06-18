const nodemailer = require("nodemailer");
const logger = require("../utils/loggers");

class EmailManager {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            auth: {
                user: "evelinr2816@gmail.com",
                pass: "qfeu dsxg ggre xsoh"
            }
        });
    }

    async purchaseEmail(email, first_name, ticket, totalAmount) {
        try {
            const mailOptions = {
                from: "<Evelinr2816@gmail.com>",
                to: email,
                subject: "Confirmacion de compra",
                html: `<h1>Confirmacion de compra</h1>
                       <p> ${first_name} Gracias por tu compra,</p>
                       <p>Total de la compra: <span>${totalAmount}</span></p> 
                       <p>Tu numero de ticket: ${ticket}</p>`
            };
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            logger.info("Error al enviar correo electrónico:", error);
            throw new Error("Error al enviar correo electrónico");
        }
    }

    async sendResetEmail(email, first_name, token) {
        try {
            const mailOptions = {
                from: 'evelinr2816@gmail.com',
                to: email,
                subject: 'Restablecer Contraseña',
                html: `
                    <h1>Restablecimiento de Contraseña</h1>
                    <p>Hola ${first_name},</p>
                    <p>Has solicitado restablecer tu contraseña. Utiliza el siguiente código para cambiar tu contraseña:</p>
                    <p><strong>${token}</strong></p>
                    <p>Este código expirará en 1 hora.</p>
                    <a href="http://localhost:8080/password">Restablecer Contraseña</a>
                    <p>Si no solicitaste este restablecimiento, ignora este correo.</p>
                `
            };

            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            logger.error("Error al enviar correo electrónico:", error);
            throw new Error("Error al enviar correo electrónico");
        }
    }
    async sendEmail({ to, first_name }) {
        const mailOptions = {
            from: "<Evelinr2816@gmail.com>",
            to: to,
            subject: "Eliminacion de la cuenta",
            html: `<h1>Eliminacion</h1>
                   <p> ${first_name} </p>
                   <p>Decidimos eliminar tu cuenta por registro de inactividad`
        };
    
        try {
          await this.transporter.sendMail(mailOptions);
          logger.info(`Correo enviado a ${to}`);
        } catch (error) {
          logger.error('Error enviando correo:', error);
        }
      }
      async sendProductDeletionEmail(email, first_name, productId) {
        const mailOptions = {
            from: "<evelinr2816@gmail.com>",
            to: email,
            subject: "Producto Eliminado",
            html: `<h1>Producto Eliminado</h1>
                   <p>Hola ${first_name},</p>
                   <p>Te informamos que tu producto con ID ${productId} ha sido eliminado.</p>
                   <p>Saludos,<br>Equipo de Soporte</p>`
        };

        try {
            await this.transporter.sendMail(mailOptions);
            logger.info(`Correo enviado a ${email}`);
        } catch (error) {
            logger.error('Error enviando correo:', error);
        }
    }
}

module.exports = EmailManager;
