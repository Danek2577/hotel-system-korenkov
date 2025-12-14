/**
 * End Handler Middleware
 * Handles responses and errors uniformly
 * @param {*} payload - Response data or Error
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 */
module.exports = async (payload, req, res, next) => {
    // Handle transaction if exists
    const transaction = req?.body?.transaction;

    // Handle Joi validation errors
    if (payload?.isJoi) {
        if (transaction) await transaction.rollback();
        return res.status(400).json({
            message: payload.details?.[0]?.message || 'Ошибка валидации'
        });
    }

    // Handle other errors
    if (payload instanceof Error) {
        if (transaction) await transaction.rollback();
        return res.status(payload?.code || 400).json({
            message: payload?.message || 'Произошла ошибка'
        });
    }

    // Success response
    if (transaction) await transaction.commit();

    return res.status(200).json({message: payload || true});
};
