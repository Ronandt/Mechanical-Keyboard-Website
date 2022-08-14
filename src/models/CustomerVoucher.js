const Sequelize = require('sequelize');
const sequelize = require('./database_setup');
const Voucher = require('./Voucher');
const User = require('./User');

class CustomerVoucher extends Sequelize.Model {}

CustomerVoucher.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: 'id',
        },
        UserID: {
            type: Sequelize.DataTypes.INTEGER,
        },

        setrole: {
            type: Sequelize.DataTypes.INTEGER,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: 'CustomerVoucher',
    }
);
class VoucherItem extends Sequelize.Model {}

VoucherItem.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: 'id',
        },
        VoucherListId: {
            type: Sequelize.DataTypes.INTEGER,
        },
        VoucherId: {
            type: Sequelize.DataTypes.INTEGER,
        },
        Type: {
            type: Sequelize.DataTypes.STRING,
        },
        usage: Sequelize.DataTypes.INTEGER,
    },
    {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: 'VoucherItem',
    }
);

Voucher.belongsToMany(CustomerVoucher, {
    through: {
        model: VoucherItem,
        unique: false,
    },
    foreignKey: 'VoucherId',
    as: 'voucherlist',
});
CustomerVoucher.belongsToMany(Voucher, {
    through: {
        model: VoucherItem,
        unique: false,
    },
    foreignKey: 'VoucherListId',
    as: 'voucheritem',
});

CustomerVoucher.belongsTo(User, { foreignKey: 'UserID' });
User.hasOne(CustomerVoucher, { foreignKey: 'UserID' });

CustomerVoucher.hasMany(VoucherItem);
VoucherItem.belongsTo(CustomerVoucher);

Voucher.hasMany(VoucherItem);
VoucherItem.belongsTo(Voucher);

module.exports = { CustomerVoucher, VoucherItem };
