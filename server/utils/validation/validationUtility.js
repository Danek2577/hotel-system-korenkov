const Joi = require('joi');

/**
 * Common validation utilities with Russian error messages
 */
class ValidationUtility {
    // Basic ID field
    id = Joi.number().integer().positive().required().messages({
        'number.base': 'Поле "ID" должно быть числом',
        'number.integer': 'Поле "ID" должно быть целым числом',
        'number.positive': 'Поле "ID" должно быть положительным числом',
        'any.required': 'Поле "ID" обязательно для заполнения'
    })

    idOptional = Joi.number().integer().positive().messages({
        'number.base': 'Поле "ID" должно быть числом',
        'number.integer': 'Поле "ID" должно быть целым числом',
        'number.positive': 'Поле "ID" должно быть положительным числом'
    })

    // Email validation
    email = Joi.string().email().required().messages({
        'string.email': 'Поле "Электронная почта" должно содержать корректный email',
        'any.required': 'Поле "Электронная почта" обязательно для заполнения',
        'string.empty': 'Поле "Электронная почта" не может быть пустым'
    })

    // Phone validation
    phone = Joi.string().pattern(/^[\d\+\-\(\)\s]{10,20}$/).required().messages({
        'string.pattern.base': 'Поле "Телефон" должно содержать корректный номер телефона',
        'any.required': 'Поле "Телефон" обязательно для заполнения',
        'string.empty': 'Поле "Телефон" не может быть пустым'
    })

    // Password validation
    password = Joi.string().min(6).max(100).required().messages({
        'string.min': 'Пароль должен содержать минимум 6 символов',
        'string.max': 'Пароль должен содержать максимум 100 символов',
        'any.required': 'Поле "Пароль" обязательно для заполнения',
        'string.empty': 'Поле "Пароль" не может быть пустым'
    })

    // Name validation
    name = Joi.string().min(2).max(200).required().messages({
        'string.min': 'Имя должно содержать минимум 2 символа',
        'string.max': 'Имя должно содержать максимум 200 символов',
        'any.required': 'Поле "Имя" обязательно для заполнения',
        'string.empty': 'Поле "Имя" не может быть пустым'
    })

    // Price validation
    price = Joi.number().positive().required().messages({
        'number.base': 'Цена должна быть числом',
        'number.positive': 'Цена должна быть положительным числом',
        'any.required': 'Поле "Цена" обязательно для заполнения'
    })

    // Capacity validation
    capacity = Joi.number().integer().min(1).max(20).required().messages({
        'number.base': 'Вместимость должна быть числом',
        'number.integer': 'Вместимость должна быть целым числом',
        'number.min': 'Вместимость должна быть минимум 1',
        'number.max': 'Вместимость должна быть максимум 20',
        'any.required': 'Поле "Вместимость" обязательно для заполнения'
    })

    // Unix timestamp validation
    unixTimestamp = Joi.number().integer().positive().required().messages({
        'number.base': 'Дата должна быть в формате UNIX timestamp',
        'number.integer': 'Дата должна быть целым числом',
        'number.positive': 'Дата должна быть положительным числом',
        'any.required': 'Поле "Дата" обязательно для заполнения'
    })

    // Pagination
    offset = Joi.number().integer().min(0).default(0).messages({
        'number.base': 'Offset должен быть числом',
        'number.integer': 'Offset должен быть целым числом',
        'number.min': 'Offset не может быть отрицательным'
    })

    limit = Joi.number().integer().positive().max(100).default(20).messages({
        'number.base': 'Limit должен быть числом',
        'number.integer': 'Limit должен быть целым числом',
        'number.positive': 'Limit должен быть положительным числом',
        'number.max': 'Limit не может превышать 100'
    })

    // JSON blocks for rich description
    blocks = Joi.array().items(Joi.object()).default([])
}

module.exports = new ValidationUtility();
