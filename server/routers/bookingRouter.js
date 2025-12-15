const Router = require('express');
const router = new Router();
const endHandler = require('../middleware/endHandler');
const authJwt = require('../middleware/authJwt');
const bookingController = require('../controllers/bookingController');

// Public endpoint - check room availability
router.get('/availability', bookingController.bookingAvailabilityGet, endHandler);

// Admin endpoints
router.get('/adm', authJwt(['ADMIN', 'MANAGER']), bookingController.admGet, endHandler);
router.get('/adm/:bookingId', authJwt(['ADMIN', 'MANAGER']), bookingController.admGetOne, endHandler);

router.post('/adm', authJwt(['ADMIN', 'MANAGER']), bookingController.admCreate, endHandler);

router.put('/adm/:bookingId', authJwt(['ADMIN', 'MANAGER']), bookingController.admUpdate, endHandler);
router.put('/adm/:bookingId/cancel', authJwt(['ADMIN', 'MANAGER']), bookingController.admCancel, endHandler);

router.delete('/adm/:bookingId', authJwt(['ADMIN']), bookingController.admDelete, endHandler);

module.exports = router;
