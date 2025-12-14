const sequelize = require('../models');
const {Op} = require('sequelize');
const {RoomModel} = require('../models/RoomModel');
const {BookingModel} = require('../models/BookingModel');
const httpError = require('../utils/httpError');

/**
 * Room Service - Singleton
 * Handles room CRUD operations
 */
class RoomService {
    /**
     * Create new room
     * @param {string} name
     * @param {'STANDARD'|'LUXURY'|'SUITE'} category
     * @param {number} price
     * @param {number} capacity
     * @param {'AVAILABLE'|'BOOKED'|'MAINTENANCE'} [status]
     * @param {Object[]} [blocks]
     * @param {boolean} [is_published]
     * @returns {Promise<number>} - Room ID
     */
    async admCreate({
        name,
        category,
        price,
        capacity,
        status = 'AVAILABLE',
        blocks = [],
        is_published = true
    }) {
        const unixNow = Math.floor(Date.now() / 1000);

        return await sequelize.transaction(async (transaction) => {
            const room = await RoomModel.create({
                name,
                category,
                price,
                capacity,
                status,
                blocks,
                is_published,
                date_add: unixNow
            }, {transaction});

            return room.id;
        });
    }

    /**
     * Update room
     * @param {number} roomId
     * @param {string} name
     * @param {'STANDARD'|'LUXURY'|'SUITE'} category
     * @param {number} price
     * @param {number} capacity
     * @param {'AVAILABLE'|'BOOKED'|'MAINTENANCE'} status
     * @param {Object[]} [blocks]
     * @param {boolean} [is_published]
     */
    async admUpdate({
        roomId,
        name,
        category,
        price,
        capacity,
        status,
        blocks,
        is_published
    }) {
        await sequelize.transaction(async (transaction) => {
            const room = await RoomModel.findOne({
                where: {id: roomId, date_delete: null},
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!room) {
                throw new httpError(404, 'Номер не найден');
            }

            const unixNow = Math.floor(Date.now() / 1000);

            room.name = name;
            room.category = category;
            room.price = price;
            room.capacity = capacity;
            room.status = status;
            room.blocks = blocks;
            room.is_published = is_published;
            room.date_edit = unixNow;

            await room.save({transaction});
        });
    }

    /**
     * Get rooms list (Admin)
     * @param {number} [roomId]
     * @param {string} [name]
     * @param {'STANDARD'|'LUXURY'|'SUITE'} [category]
     * @param {'AVAILABLE'|'BOOKED'|'MAINTENANCE'} [status]
     * @param {number} [offset]
     * @param {number} [limit]
     * @returns {Promise<{count: number, rooms: Array}>}
     */
    async admGet({roomId, name, category, status, offset = 0, limit = 20}) {
        const where = {date_delete: null};

        if (roomId) where.id = roomId;
        if (name) where.name = {[Op.substring]: name};
        if (category) where.category = category;
        if (status) where.status = status;

        const {count, rows: rooms} = await RoomModel.findAndCountAll({
            where,
            attributes: {exclude: ['date_delete']},
            order: [['id', 'DESC']],
            limit,
            offset
        });

        return {count, rooms};
    }

    /**
     * Get single room (Admin)
     * @param {number} roomId
     * @returns {Promise<Object>}
     */
    async admGetOne(roomId) {
        const room = await RoomModel.findOne({
            where: {id: roomId, date_delete: null},
            attributes: {exclude: ['date_delete']},
            include: [{
                association: 'bookings',
                where: {date_delete: null, status: 'CONFIRMED'},
                required: false,
                attributes: ['id', 'guest_name', 'date_start', 'date_end', 'status']
            }]
        });

        if (!room) {
            throw new httpError(404, 'Номер не найден');
        }

        return room;
    }

    /**
     * Get public rooms list
     * @param {number} [offset]
     * @param {number} [limit]
     * @param {'STANDARD'|'LUXURY'|'SUITE'} [category]
     * @returns {Promise<{count: number, rooms: Array}>}
     */
    async roomPublicGet({offset = 0, limit = 20, category}) {
        const where = {
            date_delete: null,
            is_published: true
        };

        if (category) where.category = category;

        const {count, rows: rooms} = await RoomModel.findAndCountAll({
            where,
            attributes: ['id', 'name', 'category', 'price', 'capacity', 'status', 'blocks'],
            order: [['id', 'DESC']],
            limit,
            offset
        });

        return {count, rooms};
    }

    /**
     * Get single public room
     * @param {number} roomId
     * @returns {Promise<Object>}
     */
    async roomPublicGetOne(roomId) {
        const room = await RoomModel.findOne({
            where: {id: roomId, date_delete: null, is_published: true},
            attributes: ['id', 'name', 'category', 'price', 'capacity', 'status', 'blocks']
        });

        if (!room) {
            throw new httpError(404, 'Номер не найден');
        }

        return room;
    }

    /**
     * Delete room (soft delete)
     * @param {number} roomId
     */
    async admDelete(roomId) {
        await sequelize.transaction(async (transaction) => {
            const room = await RoomModel.findOne({
                where: {id: roomId, date_delete: null},
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!room) {
                throw new httpError(404, 'Номер не найден');
            }

            // Check for active bookings
            const activeBookings = await BookingModel.count({
                where: {
                    room_id: roomId,
                    status: 'CONFIRMED',
                    date_delete: null,
                    date_end: {[Op.gt]: Math.floor(Date.now() / 1000)}
                },
                transaction
            });

            if (activeBookings > 0) {
                throw new httpError(400, 'Невозможно удалить номер с активными бронированиями');
            }

            const unixNow = Math.floor(Date.now() / 1000);
            room.date_delete = unixNow;
            await room.save({transaction});
        });
    }

    /**
     * Check room availability for date range
     * @param {number} roomId
     * @param {number} dateStart
     * @param {number} dateEnd
     * @param {number} [excludeBookingId] - Exclude booking for updates
     * @returns {Promise<boolean>}
     */
    async availabilityCheck({roomId, dateStart, dateEnd, excludeBookingId = null}) {
        const where = {
            room_id: roomId,
            status: 'CONFIRMED',
            date_delete: null,
            // Collision detection: (RequestStart < ExistingEnd) && (RequestEnd > ExistingStart)
            date_start: {[Op.lt]: dateEnd},
            date_end: {[Op.gt]: dateStart}
        };

        if (excludeBookingId) {
            where.id = {[Op.ne]: excludeBookingId};
        }

        const conflictingBooking = await BookingModel.findOne({where});

        return !conflictingBooking;
    }
}

module.exports = new RoomService();
