const Joi = require('joi');
const validationUtility = require('./validationUtility');

/**
 * Validation schemes for all API endpoints
 * All error messages are in Russian
 */
class ValidationScheme {
    // ==================== AUTH ====================

    authLogin = Joi.object().required().keys({
        email: validationUtility.email,
        password: validationUtility.password
    }).options({ stripUnknown: true })

    authRegister = Joi.object().required().keys({
        email: validationUtility.email,
        password: validationUtility.password,
        name: validationUtility.name,
        role: Joi.string().valid('ADMIN', 'MANAGER').default('MANAGER').messages({
            'any.only': 'Роль должна быть ADMIN или MANAGER'
        })
    }).options({ stripUnknown: true })

    // ==================== ROOMS ====================

    roomCreate = Joi.object().required().keys({
        name: Joi.string().min(1).max(100).required().messages({
            'string.min': 'Название номера должно содержать минимум 1 символ',
            'string.max': 'Название номера должно содержать максимум 100 символов',
            'any.required': 'Поле "Название" обязательно для заполнения',
            'string.empty': 'Поле "Название" не может быть пустым'
        }),
        category: Joi.string().valid('STANDARD', 'LUXURY', 'SUITE').default('STANDARD').messages({
            'any.only': 'Категория должна быть STANDARD, LUXURY или SUITE'
        }),
        price: validationUtility.price,
        capacity: validationUtility.capacity,
        status: Joi.string().valid('AVAILABLE', 'BOOKED', 'MAINTENANCE').default('AVAILABLE').messages({
            'any.only': 'Статус должен быть AVAILABLE, BOOKED или MAINTENANCE'
        }),
        blocks: validationUtility.blocks,
        is_published: Joi.boolean().default(true)
    }).options({ stripUnknown: true })

    roomUpdate = this.roomCreate.keys({
        roomId: validationUtility.id
    })

    roomAdmGet = Joi.object().required().keys({
        roomId: validationUtility.idOptional,
        name: Joi.string().max(100).empty(''),
        category: Joi.string().valid('STANDARD', 'LUXURY', 'SUITE').empty(''),
        status: Joi.string().valid('AVAILABLE', 'BOOKED', 'MAINTENANCE').empty(''),
        offset: validationUtility.offset,
        limit: validationUtility.limit,
        sort_by: Joi.string().valid('price', 'name', 'id').empty(''),
        order: Joi.string().valid('ASC', 'DESC').empty('')
    }).options({ stripUnknown: true })

    roomAdmGetOne = Joi.object().required().keys({
        roomId: validationUtility.id
    }).options({ stripUnknown: true })

    // ==================== BOOKINGS ====================

    bookingCreate = Joi.object().required().keys({
        roomId: validationUtility.id.messages({
            'any.required': 'Поле "Номер" обязательно для заполнения'
        }),
        guest_name: Joi.string().min(2).max(200).required().messages({
            'string.min': 'Имя гостя должно содержать минимум 2 символа',
            'string.max': 'Имя гостя должно содержать максимум 200 символов',
            'any.required': 'Поле "Имя гостя" обязательно для заполнения',
            'string.empty': 'Поле "Имя гостя" не может быть пустым'
        }),
        guest_phone: validationUtility.phone.messages({
            'any.required': 'Поле "Телефон гостя" обязательно для заполнения'
        }),
        date_start: validationUtility.unixTimestamp.messages({
            'any.required': 'Поле "Дата заезда" обязательно для заполнения'
        }),
        date_end: validationUtility.unixTimestamp.messages({
            'any.required': 'Поле "Дата выезда" обязательно для заполнения'
        })
    }).options({ stripUnknown: true }).custom((value, helpers) => {
        if (value.date_end <= value.date_start) {
            return helpers.error('custom.dateRange');
        }
        return value;
    }).messages({
        'custom.dateRange': 'Дата выезда должна быть позже даты заезда'
    })

    bookingUpdate = Joi.object().required().keys({
        bookingId: validationUtility.id,
        guest_name: Joi.string().min(2).max(200).messages({
            'string.min': 'Имя гостя должно содержать минимум 2 символа',
            'string.max': 'Имя гостя должно содержать максимум 200 символов'
        }),
        guest_phone: Joi.string().pattern(/^[\d\+\-\(\)\s]{10,20}$/).messages({
            'string.pattern.base': 'Поле "Телефон" должно содержать корректный номер телефона'
        }),
        date_start: Joi.number().integer().positive(),
        date_end: Joi.number().integer().positive(),
        status: Joi.string().valid('CONFIRMED', 'CANCELLED').messages({
            'any.only': 'Статус должен быть CONFIRMED или CANCELLED'
        })
    }).options({ stripUnknown: true }).custom((value, helpers) => {
        if (value.date_start && value.date_end && value.date_end <= value.date_start) {
            return helpers.error('custom.dateRange');
        }
        return value;
    }).messages({
        'custom.dateRange': 'Дата выезда должна быть позже даты заезда'
    })

    bookingAdmGet = Joi.object().required().keys({
        bookingId: validationUtility.idOptional,
        roomId: validationUtility.idOptional,
        status: Joi.string().valid('CONFIRMED', 'CANCELLED').empty(''),
        date_from: Joi.number().integer().positive().empty(''),
        date_to: Joi.number().integer().positive().empty(''),
        active_at: Joi.number().integer().positive().empty(''),
        offset: validationUtility.offset,
        limit: validationUtility.limit
    }).options({ stripUnknown: true })

    bookingAdmGetOne = Joi.object().required().keys({
        bookingId: validationUtility.id
    }).options({ stripUnknown: true })

    bookingCancel = Joi.object().required().keys({
        bookingId: validationUtility.id
    }).options({ stripUnknown: true })

    bookingAvailability = Joi.object().required().keys({
        roomId: validationUtility.id,
        dateStart: validationUtility.unixTimestamp,
        dateEnd: validationUtility.unixTimestamp,
        excludeBookingId: validationUtility.idOptional
    }).options({ stripUnknown: true })
}

module.exports = new ValidationScheme();
