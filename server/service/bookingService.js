const sequelize = require('../models');
const { Op } = require('sequelize');
const { BookingModel } = require('../models/BookingModel');
const { RoomModel } = require('../models/RoomModel');
const roomService = require('./roomService');
const httpError = require('../utils/httpError');

/**
 * Booking Service - Singleton
 * Handles booking CRUD operations with collision detection
 */
class BookingService {
    /**
     * Create new booking with collision detection
     * @param {number} room_id
     * @param {string} guest_name
     * @param {string} guest_phone
     * @param {number} date_start - UNIX timestamp
     * @param {number} date_end - UNIX timestamp
     * @returns {Promise<number>} - Booking ID
     */
    async admCreate({ roomId, guest_name, guest_phone, date_start, date_end }) {
        return await sequelize.transaction(async (transaction) => {
            // Check if room exists
            const room = await RoomModel.findOne({
                where: { id: roomId, date_delete: null },
                attributes: ['id', 'price', 'status'],
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!room) {
                throw new httpError(404, 'Номер не найден');
            }

            if (room.status === 'MAINTENANCE') {
                throw new httpError(400, 'Номер находится на обслуживании');
            }

            // Check for date collisions
            // Formula: (RequestStart < ExistingEnd) && (RequestEnd > ExistingStart)
            const conflictingBooking = await BookingModel.findOne({
                where: {
                    room_id: roomId,
                    status: 'CONFIRMED',
                    date_delete: null,
                    date_start: { [Op.lt]: date_end },
                    date_end: { [Op.gt]: date_start }
                },
                transaction
            });

            if (conflictingBooking) {
                throw new httpError(400, 'На выбранные даты номер уже занят');
            }

            // Calculate total price
            const nights = Math.ceil((date_end - date_start) / 86400); // 86400 = seconds in day
            const total_price = parseFloat(room.price) * nights;

            const unixNow = Math.floor(Date.now() / 1000);

            const booking = await BookingModel.create({
                room_id: roomId,
                guest_name,
                guest_phone,
                date_start,
                date_end,
                total_price,
                status: 'CONFIRMED',
                date_add: unixNow
            }, { transaction });

            return booking.id;
        });
    }

    /**
     * Update booking
     * @param {number} bookingId
     * @param {string} [guest_name]
     * @param {string} [guest_phone]
     * @param {number} [date_start]
     * @param {number} [date_end]
     * @param {'CONFIRMED'|'CANCELLED'} [status]
     */
    async admUpdate({ bookingId, guest_name, guest_phone, date_start, date_end, status }) {
        await sequelize.transaction(async (transaction) => {
            const booking = await BookingModel.findOne({
                where: { id: bookingId, date_delete: null },
                include: [{
                    association: 'room',
                    attributes: ['id', 'price']
                }],
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!booking) {
                throw new httpError(404, 'Бронирование не найдено');
            }

            // Check collision if dates changed
            const newDateStart = date_start || booking.date_start;
            const newDateEnd = date_end || booking.date_end;

            if (date_start || date_end) {
                const conflictingBooking = await BookingModel.findOne({
                    where: {
                        room_id: booking.room_id,
                        status: 'CONFIRMED',
                        date_delete: null,
                        id: { [Op.ne]: bookingId },
                        date_start: { [Op.lt]: newDateEnd },
                        date_end: { [Op.gt]: newDateStart }
                    },
                    transaction
                });

                if (conflictingBooking) {
                    throw new httpError(400, 'На выбранные даты номер уже занят');
                }

                // Recalculate total price
                const nights = Math.ceil((newDateEnd - newDateStart) / 86400);
                booking.total_price = parseFloat(booking.room.price) * nights;
            }

            if (guest_name) booking.guest_name = guest_name;
            if (guest_phone) booking.guest_phone = guest_phone;
            if (date_start) booking.date_start = date_start;
            if (date_end) booking.date_end = date_end;
            if (status) booking.status = status;

            await booking.save({ transaction });
        });
    }

    /**
     * Get bookings list (Admin)
     * @param {number} [bookingId]
     * @param {number} [room_id]
     * @param {string} [guest_name]
     * @param {'CONFIRMED'|'CANCELLED'} [status]
     * @param {number} [date_from]
     * @param {number} [date_to]
     * @param {number} [offset]
     * @param {number} [limit]
     * @returns {Promise<{count: number, bookings: Array}>}
     */
    async admGet({
        bookingId,
        roomId,
        guest_name,
        status,
        date_from,
        date_to,
        offset = 0,
        limit = 20
    }) {
        const where = { date_delete: null };

        // Defensive parsing to prevent NaN
        const safeBookingId = bookingId ? parseInt(bookingId, 10) : null;
        const safeRoomId = roomId ? parseInt(roomId, 10) : null;
        const safeDateFrom = date_from ? parseInt(date_from, 10) : null;
        const safeDateTo = date_to ? parseInt(date_to, 10) : null;
        const safeOffset = parseInt(offset, 10) || 0;
        const safeLimit = parseInt(limit, 10) || 20;

        if (safeBookingId && !isNaN(safeBookingId)) where.id = safeBookingId;
        if (safeRoomId && !isNaN(safeRoomId)) where.room_id = safeRoomId;
        if (guest_name && typeof guest_name === 'string' && guest_name.trim()) {
            where.guest_name = { [Op.substring]: guest_name };
        }
        if (status) where.status = status;
        if (safeDateFrom && !isNaN(safeDateFrom)) where.date_start = { [Op.gte]: safeDateFrom };
        if (safeDateTo && !isNaN(safeDateTo)) {
            where.date_end = where.date_end
                ? { ...where.date_end, [Op.lte]: safeDateTo }
                : { [Op.lte]: safeDateTo };
        }

        const { count, rows: bookings } = await BookingModel.findAndCountAll({
            where,
            attributes: { exclude: ['date_delete'] },
            order: [['date_start', 'DESC']],
            limit: safeLimit,
            offset: safeOffset,
            include: [{
                association: 'room',
                attributes: ['id', 'name', 'category', 'price']
            }]
        });

        return { count, bookings };
    }

    /**
     * Get single booking (Admin)
     * @param {number} bookingId
     * @returns {Promise<Object>}
     */
    async admGetOne(bookingId) {
        const booking = await BookingModel.findOne({
            where: { id: bookingId, date_delete: null },
            attributes: { exclude: ['date_delete'] },
            include: [{
                association: 'room',
                attributes: ['id', 'name', 'category', 'price', 'capacity']
            }]
        });

        if (!booking) {
            throw new httpError(404, 'Бронирование не найдено');
        }

        return booking;
    }

    /**
     * Cancel booking
     * @param {number} bookingId
     */
    async admCancel(bookingId) {
        const booking = await BookingModel.findOne({
            where: { id: bookingId, date_delete: null }
        });

        if (!booking) {
            throw new httpError(404, 'Бронирование не найдено');
        }

        if (booking.status === 'CANCELLED') {
            throw new httpError(400, 'Бронирование уже отменено');
        }

        booking.status = 'CANCELLED';
        await booking.save();
    }

    /**
     * Delete booking (soft delete)
     * @param {number} bookingId
     */
    async admDelete(bookingId) {
        const booking = await BookingModel.findOne({
            where: { id: bookingId, date_delete: null }
        });

        if (!booking) {
            throw new httpError(404, 'Бронирование не найдено');
        }

        const unixNow = Math.floor(Date.now() / 1000);
        booking.date_delete = unixNow;
        await booking.save();
    }

    /**
     * Get room availability for date range
     * @param {number} roomId
     * @param {number} dateStart
     * @param {number} dateEnd
     * @returns {Promise<{available: boolean, conflictingBookings: Array}>}
     */
    async bookingAvailabilityGet({ roomId, dateStart, dateEnd }) {
        const conflictingBookings = await BookingModel.findAll({
            where: {
                room_id: roomId,
                status: 'CONFIRMED',
                date_delete: null,
                date_start: { [Op.lt]: dateEnd },
                date_end: { [Op.gt]: dateStart }
            },
            attributes: ['id', 'guest_name', 'date_start', 'date_end']
        });

        return {
            available: conflictingBookings.length === 0,
            conflictingBookings
        };
    }
}

module.exports = new BookingService();
