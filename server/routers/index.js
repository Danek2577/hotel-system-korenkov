const Router = require('express');
const router = new Router();

const authRouter = require('./authRouter');
const roomRouter = require('./roomRouter');
const bookingRouter = require('./bookingRouter');

router.use('/auth', authRouter);
router.use('/rooms', roomRouter);
router.use('/bookings', bookingRouter);

module.exports = router;
