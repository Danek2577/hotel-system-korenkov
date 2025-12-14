const validationScheme = require('../utils/validation/validationScheme');
const userService = require('../service/userService');

/**
 * Auth Controller - Singleton
 */
class AuthController {
    /**
     * Register new user
     */
    async register(req, res, next) {
        try {
            const data = await validationScheme.authRegister.validateAsync(req.body);
            const result = await userService.authRegister(data);
            next(result);
        } catch (e) {
            next(e);
        }
    }

    /**
     * Login user
     */
    async login(req, res, next) {
        try {
            const data = await validationScheme.authLogin.validateAsync(req.body);
            const result = await userService.authLogin(data);
            next(result);
        } catch (e) {
            next(e);
        }
    }

    /**
     * Check current user auth
     */
    async check(req, res, next) {
        try {
            const {userId} = req.body;
            const user = await userService.authCheck({userId});
            next(user);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new AuthController();
