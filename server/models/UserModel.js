const sequelize = require('./index');
const {DataTypes} = require('sequelize');

/**
 * @typedef {Object} User
 * @property {number} [id]
 * @property {string} email - email пользователя
 * @property {string} password_hash - хэш пароля
 * @property {string} name - имя пользователя
 * @property {'ADMIN'|'MANAGER'} role - роль пользователя
 * @property {number} date_add - дата добавления (UNIX timestamp)
 * @property {number|null} [date_delete] - дата удаления (soft delete)
 */

/**
 * @type {import('sequelize').Model<User, User>}
 */
const UserModel = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('ADMIN', 'MANAGER'),
        allowNull: false,
        defaultValue: 'MANAGER'
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
    tableName: 'users'
});

module.exports = {UserModel};
