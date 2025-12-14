const validationScheme = require('../utils/validation/validationScheme');
const roomService = require('../service/roomService');

/**
 * Room Controller - Singleton
 */
class RoomController {
    /**
     * Create room (Admin)
     */
    async admCreate(req, res, next) {
        try {
            const data = await validationScheme.roomCreate.validateAsync(req.body);
            const roomId = await roomService.admCreate(data);
            next({id: roomId});
        } catch (e) {
            next(e);
        }
    }

    /**
     * Update room (Admin)
     */
    async admUpdate(req, res, next) {
        try {
            const data = await validationScheme.roomUpdate.validateAsync({
                ...req.body,
                roomId: parseInt(req.params.roomId)
            });
            await roomService.admUpdate(data);
            next(true);
        } catch (e) {
            next(e);
        }
    }

    /**
     * Get rooms list (Admin)
     */
    async admGet(req, res, next) {
        try {
            const data = await validationScheme.roomAdmGet.validateAsync(req.query);
            const result = await roomService.admGet(data);
            next(result);
        } catch (e) {
            next(e);
        }
    }

    /**
     * Get single room (Admin)
     */
    async admGetOne(req, res, next) {
        try {
            const {roomId} = await validationScheme.roomAdmGetOne.validateAsync({
                roomId: parseInt(req.params.roomId)
            });
            const room = await roomService.admGetOne(roomId);
            next(room);
        } catch (e) {
            next(e);
        }
    }

    /**
     * Delete room (Admin)
     */
    async admDelete(req, res, next) {
        try {
            const {roomId} = await validationScheme.roomAdmGetOne.validateAsync({
                roomId: parseInt(req.params.roomId)
            });
            await roomService.admDelete(roomId);
            next(true);
        } catch (e) {
            next(e);
        }
    }

    /**
     * Get public rooms list
     */
    async roomPublicGet(req, res, next) {
        try {
            const {offset, limit, category} = req.query;
            const result = await roomService.roomPublicGet({
                offset: parseInt(offset) || 0,
                limit: parseInt(limit) || 20,
                category
            });
            next(result);
        } catch (e) {
            next(e);
        }
    }

    /**
     * Get single public room
     */
    async roomPublicGetOne(req, res, next) {
        try {
            const roomId = parseInt(req.params.roomId);
            const room = await roomService.roomPublicGetOne(roomId);
            next(room);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new RoomController();
