const Sequelize = require('sequelize');
const sequelize = require('./database_setup');

class Product extends Sequelize.Model {}

Product.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: 'id',
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
        colour: {
            type: Sequelize.DataTypes.STRING,
        },
        image: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        },
        status: {
            type: Sequelize.DataTypes.STRING,
            defaultValue: 'online',
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
