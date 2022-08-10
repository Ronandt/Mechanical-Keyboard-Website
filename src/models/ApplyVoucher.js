const Sequelize = require('sequelize');
const sequelize = require('./database_setup');
const Voucher = require('./Voucher');
const User = require('./User');

class ApplyVoucher extends Sequelize.Model {}

ApplyVoucher.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
        },
        VoucherId: {
            type: Sequelize.DataTypes.INTEGER,
        },
        UserId: {
            type: Sequelize.DataTypes.STRING,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: 'ApplyVoucher',
    }
);

ApplyVoucher.belongsTo(Voucher, {
    foreignKey: 'VoucherId',
    as: 'voucher',
});

Voucher.hasMany(ApplyVoucher, {
    foreignKey: 'ApplyVoucherId',
    as: 'applyvoucher',
});

module.exports = ApplyVoucher;
