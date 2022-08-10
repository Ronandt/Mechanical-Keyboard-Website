const Sequelize = require('sequelize');
const sequelize = require('./database_setup');
const Product = require('./product');
const User = require('./User');
class Pevaluation extends Sequelize.Model {}

Pevaluation.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        UserId: {
            type: Sequelize.DataTypes.INTEGER,
        },
        ProductId: {
            type: Sequelize.DataTypes.INTEGER,
        },
        ProductRating: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        ProductRemarks: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        updatedAt: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
        },
        createdAt: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: 'Product_Evaluation',
    }
);
Pevaluation.belongsTo(Product);
Product.hasMany(Pevaluation);
Pevaluation.belongsTo(User);
User.hasMany(Pevaluation);
module.exports = Pevaluation;
