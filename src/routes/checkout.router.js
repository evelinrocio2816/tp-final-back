const express = require('express');
const router = express.Router();
const checkoutController = require("../controllers/checkout.controllers.js")

// Ruta para mostrar la página de checkout

// Ruta para crear una preferencia de pago
router.post('/create_preference', checkoutController.createPreference);

// Rutas de retorno
router.get('/success', checkoutController.success);
router.get('/failure', checkoutController.failure);
router.get('/pending', checkoutController.pending);

module.exports = router;
