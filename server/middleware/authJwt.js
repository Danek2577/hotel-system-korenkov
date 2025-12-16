const jwt = require('jsonwebtoken');
const {UserModel} = require('../models/UserModel');

/**
 * JWT Authentication Middleware
 * @param {string[]} [roles] - Allowed roles (empty = any authenticated user)
 * @returns {Function} Express middleware
 */
module.exports = (roles = []) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({message: 'Отсутствует токен авторизации'});
            }
            const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
            let decoded;
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET);
            } catch (err) {
                return res.status(401).json({message: 'Недействительный токен'});
            }
            if (!decoded?.id) {
                return res.status(401).json({message: 'Ошибка авторизации'});
            }
            const user = await UserModel.findOne({
                where: {id: decoded.id, date_delete: null},
                attributes: ['id', 'role']
            });
            if (!user) {
                return res.status(401).json({message: 'Пользователь не найден'});
            }
            if (roles.length > 0) {
                if (!roles.includes(user.role)) {
                    return res.status(403).json({message: 'Доступ запрещён'});
                }
            }
            req.body.userId = user.id;
            req.body.userRole = user.role;
            next();
        } catch (e) {
            return res.status(401).json({message: 'Ошибка авторизации'});
        }
    };
};
