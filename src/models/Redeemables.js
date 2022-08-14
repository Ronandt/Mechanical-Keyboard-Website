const Sequelize = require('sequelize');
const sequelize = require('./database_setup');
const Voucher = require('./Voucher');
const Product = require('./product');

class Redeemables extends Sequelize.Model {}

Redeemables.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: 'id',
        },
        VoucherId: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
        },
        ProductId: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
        },
        Price: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
        },
        Redeemcount: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: 'Redeemables',
    }
);

Redeemables.hasOne(Voucher);

Voucher.belongsTo(Redeemables);

// Redeemables.belongsTo(Product, {

//     foreignKey: 'ProductId',
//     as:"product"

//   })

// Product.hasOne(Redeemables, {
//     foreignKey: 'RedeemablesId',
//     as: 'productredeemables'
// });

module.exports = Redeemables;
