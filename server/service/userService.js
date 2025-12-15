const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {UserModel} = require('../models/UserModel');
const httpError = require('../utils/httpError');

/**
 * User Service - Singleton
 * Handles user authentication and management
 */
class UserService {
    /**
     * Register new user
     * @param {string} email
     * @param {string} password
     * @param {string} name
     * @param {'ADMIN'|'MANAGER'} [role]
     * @returns {Promise<{token: string, user: Object}>}
     */
    async authRegister({email, password, name, role = 'MANAGER'}) {
        const candidate = await UserModel.findOne({
            where: {email},
            attributes: ['id']
        });

        if (candidate) {
            throw new httpError(400, 'Пользователь с таким email уже существует');
        }

        const unixNow = Math.floor(Date.now() / 1000);
        const password_hash = await bcrypt.hash(password, 10);

        const user = await UserModel.create({
            email,
            password_hash,
            name,
            role,
            date_add: unixNow
        });

        const token = this.tokenGenerate({id: user.id, role: user.role});

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        };
    }

    /**
     * Login user
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{token: string, user: Object}>}
     */
    async authLogin({email, password}) {
        const user = await UserModel.findOne({
            where: {email, date_delete: null}
        });

        if (!user) {
            throw new httpError(401, 'Неверный email или пароль');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw new httpError(401, 'Неверный email или пароль');
        }

        const token = this.tokenGenerate({id: user.id, role: user.role});

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        };
    }

    /**
     * Get current user info
     * @param {number} userId
     * @returns {Promise<Object>}
     */
    async authCheck({userId}) {
        const user = await UserModel.findOne({
            where: {id: userId, date_delete: null},
            attributes: ['id', 'email', 'name', 'role']
        });

        if (!user) {
            throw new httpError(401, 'Пользователь не найден');
        }

        return user;
    }

    /**
     * Generate JWT token
     * @param {Object} payload
     * @returns {string}
     */
    tokenGenerate(payload) {
        return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '7d'});
    }

    /**
     * Verify JWT token
     * @param {string} token
     * @returns {Object|null}
     */
    tokenVerify(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch {
            return null;
        }
    }

    /**
     * Get all users (Admin)
     * @param {number} [offset]
     * @param {number} [limit]
     * @returns {Promise<{count: number, users: Array}>}
     */
    async admGet({ offset = 0, limit = 20 }) {
        const { count, rows: users } = await UserModel.findAndCountAll({
            where: { date_delete: null },
            attributes: { exclude: ['password_hash', 'date_delete'] },
            order: [['id', 'DESC']],
            limit,
            offset
        });

        return { count, users };
    }
}

module.exports = new UserService();
