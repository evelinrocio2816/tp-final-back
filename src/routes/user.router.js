const express = require("express");
const router = express.Router();
const passport = require("passport");
const UserController = require("../controllers/user.controllers.js");
const userController = new UserController();
const upload = require("../services/multer.js");
const cron = require("node-cron");


router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", passport.authenticate("jwt", { session: false }), userController.profile);
router.post("/logout", userController.logout);
router.get("/admin", passport.authenticate("jwt", { session: false }), userController.admin);
router.post("/requestPasswordReset", userController.requestPasswordReset); 
router.post('/reset-password', userController.resetPassword);

router.put('/premium/:uid', userController.togglePremium)
router.post('/api/user/:uid/documents', upload.fields([{ name: 'document' }, { name: 'products' }, { name: 'profile' }]), userController.uploadDocuments);

// Ejecutar la limpieza de usuarios inactivos cada 30 minutos
cron.schedule('*/30 * * * *', () => { userController.cleanInactiveUsers();});

router.get('/admin/users', userController.listUsers);
router.post('/admin/users/:_id/edit', userController.editUser);
router.post('/admin/users/:_id/delete', userController.deleteUser);

router.post('/:uid/documents', upload.fields([{ name: 'document' }, { name: 'products' }, { name: 'profile' }]), userController.uploadDocuments);
// Ruta para obtener todos los usuarios
router.get('/',userController.getAllUsers);

module.exports= router