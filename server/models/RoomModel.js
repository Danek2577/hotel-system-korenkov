const sequelize = require('./index');
const { DataTypes } = require('sequelize');

/**
 * @typedef {Object} Room
 * @property {number} [id]
 * @property {string} name - название/номер комнаты
 * @property {'STANDARD'|'LUXURY'|'SUITE'} category - категория номера
 * @property {number} price - цена за ночь
 * @property {number} capacity - вместимость
 * @property {'AVAILABLE'|'BOOKED'|'MAINTENANCE'} status - статус номера
 * @property {Object[]} [blocks] - блоки описания (JSON)
 * @property {boolean} is_published - опубликован ли номер
 * @property {number} date_add - дата добавления (UNIX timestamp)
 * @property {number|null} [date_edit] - дата редактирования
 * @property {number|null} [date_delete] - дата удаления (soft delete)
 */

/**
 * @type {import('sequelize').Model<Room, Room>}
 */
const RoomModel = sequelize.define('krs_rooms', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    category: {
        type: DataTypes.ENUM('STANDARD', 'LUXURY', 'SUITE'),
        allowNull: false,
        defaultValue: 'STANDARD'
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2
    },
    status: {
        type: DataTypes.ENUM('AVAILABLE', 'BOOKED', 'MAINTENANCE'),
        allowNull: false,
        defaultValue: 'AVAILABLE'
    },
    blocks: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    is_published: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    date_add: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date_edit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    date_delete: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    }
}, {
    tableName: 'krs_rooms',
    timestamps: false
});

module.exports = { RoomModel };
