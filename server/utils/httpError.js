/**
 * Custom HTTP Error class for API errors
 */
class httpError extends Error {
    code = 500;

    /**
     * @param {number} code - HTTP status code
     * @param {string} message - Error message
     */
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}

module.exports = httpError;
