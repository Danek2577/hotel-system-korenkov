const validationScheme = require('../utils/validation/validationScheme');
const bookingService = require('../service/bookingService');

/**
 * Booking Controller - Singleton
 */
class BookingController {
    /**
     * Create booking (Admin)
     */
    async admCreate(req, res, next) {
        try {
            const data = await validationScheme.bookingCreate.validateAsync(req.body);
            const bookingId = await bookingService.admCreate(data);
            next({id: bookingId});
        } catch (e) {
            next(e);
        }
    }

    /**
     * Update booking (Admin)
     */
    async admUpdate(req, res, next) {
        try {
            const data = await validationScheme.bookingUpdate.validateAsync({
                ...req.body,
                bookingId: parseInt(req.params.bookingId)
            });
            await bookingService.admUpdate(data);
            next(true);
        } catch (e) {
            next(e);
        }
    }

    /**
     * Get bookings list (Admin)
     */
    async admGet(req, res, next) {
        try {
            const data = await validationScheme.bookingAdmGet.validateAsync(req.query);
            const result = await bookingService.admGet(data);
            next(result);
        } catch (e) {
            next(e);
        }
    }

    /**
     * Get single booking (Admin)
     */
    async admGetOne(req, res, next) {
        try {
            const {bookingId} = await validationScheme.bookingAdmGetOne.validateAsync({
                bookingId: parseInt(req.params.bookingId)
            });
            const booking = await bookingService.admGetOne(bookingId);
            next(booking);
        } catch (e) {
            next(e);
        }
    }

    /**
     * Cancel booking (Admin)
     */
    async admCancel(req, res, next) {
        try {
            const {bookingId} = await validationScheme.bookingCancel.validateAsync({
                bookingId: parseInt(req.params.bookingId)
            });
            await bookingService.admCancel(bookingId);
            next(true);
        } catch (e) {
            next(e);
        }
    }

    /**
     * Delete booking (Admin)
     */
    async admDelete(req, res, next) {
        try {
            const {bookingId} = await validationScheme.bookingAdmGetOne.validateAsync({
                bookingId: parseInt(req.params.bookingId)
            });
            await bookingService.admDelete(bookingId);
            next(true);
        } catch (e) {
            next(e);
        }
    }

    /**
     * Check room availability
     */
    async bookingAvailabilityGet(req, res, next) {
        try {
            const data = await validationScheme.bookingAvailability.validateAsync(req.query);
            const result = await bookingService.bookingAvailabilityGet(data);
            next(result);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new BookingController();
