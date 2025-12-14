const sequelize = require('./index');
const {DataTypes} = require('sequelize');
const {RoomModel} = require('./RoomModel');

/**
 * @typedef {Object} Booking
 * @property {number} [id]
 * @property {number} room_id - ID номера
 * @property {string} guest_name - имя гостя
 * @property {string} guest_phone - телефон гостя
 * @property {number} date_start - дата начала (UNIX timestamp)
 * @property {number} date_end - дата окончания (UNIX timestamp)
 * @property {number} total_price - итоговая стоимость
 * @property {'CONFIRMED'|'CANCELLED'} status - статус бронирования
 * @property {number} date_add - дата создания (UNIX timestamp)
 * @property {number|null} [date_delete] - дата удаления (soft delete)
 */

/**
 * @type {import('sequelize').Model<Booking, Booking>}
 */
const BookingModel = sequelize.define('bookings', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    room_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: RoomModel,
            key: 'id'
        }
    },
    guest_name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    guest_phone: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    date_start: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date_end: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('CONFIRMED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'CONFIRMED'
    },
    date_add: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date_delete: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    }
}, {
    tableName: 'bookings'
});

// Associations
RoomModel.hasMany(BookingModel, {foreignKey: 'room_id', as: 'bookings'});
BookingModel.belongsTo(RoomModel, {foreignKey: 'room_id', as: 'room'});

module.exports = {BookingModel};
