const Sequelize = require('sequelize');
const sequelize = require('./database_setup');

class Product extends Sequelize.Model {}

Product.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        name: {
            type: Sequelize.DataTypes.STRING,
        },
        description: {
            type: Sequelize.DataTypes.TEXT,
        },
        brand: {
            type: Sequelize.DataTypes.STRING,
        },
        category: {
            type: Sequelize.DataTypes.STRING,
        },
        stock: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
        },
        price: {
            type: Sequelize.DataTypes.INTEGER,
        },
        image: {
            type: Sequelize.DataTypes.BLOB,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: 'Product',
    }
);

module.exports = Product;
