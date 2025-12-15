const Router = require('express');
const router = new Router();
const endHandler = require('../middleware/endHandler');
const authJwt = require('../middleware/authJwt');
const roomController = require('../controllers/roomController');

// Public endpoints
router.get('/', roomController.roomPublicGet, endHandler);
router.get('/:roomId', roomController.roomPublicGetOne, endHandler);

// Admin endpoints
router.get('/adm/list', authJwt(['ADMIN', 'MANAGER']), roomController.admGet, endHandler);
router.get('/adm/:roomId', authJwt(['ADMIN', 'MANAGER']), roomController.admGetOne, endHandler);

router.post('/adm', authJwt(['ADMIN', 'MANAGER']), roomController.admCreate, endHandler);

router.put('/adm/:roomId', authJwt(['ADMIN', 'MANAGER']), roomController.admUpdate, endHandler);

router.delete('/adm/:roomId', authJwt(['ADMIN']), roomController.admDelete, endHandler);

module.exports = router;
