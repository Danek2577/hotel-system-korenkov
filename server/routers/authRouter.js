const Router = require('express');
const router = new Router();
const endHandler = require('../middleware/endHandler');
const authJwt = require('../middleware/authJwt');
const authController = require('../controllers/authController');

// Public endpoints
router.post('/register', authController.register, endHandler);
router.post('/login', authController.login, endHandler);

// Authorized endpoints
router.get('/check', authJwt(), authController.check, endHandler);
router.get('/users', authJwt(['ADMIN']), authController.admGet, endHandler);

module.exports = router;
