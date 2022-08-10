const Sequelize = require('sequelize');
const sequelize = require('./database_setup');

class Voucher extends Sequelize.Model {
    // compareStatus(value) {
    //   if(value)
    //   return
    // }
}

Voucher.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        voucher_title: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,
            unique: false,
        },
        voucher_code: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        voucher_name: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,
            unique: false,
        },
        voucher_value: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
            unique: false,
        },
        voucher_status: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,
            unique: false,
            // set(value) {
            //   this.setDataValue("password", bcrypt.hashSync(value, 10) + "");
            // }
        },
        total_voucher: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
            unique: false,
        },
        voucher_desc: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,
            unique: false,
        },
        start_date: {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
            unique: false,
        },
        days: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,
            unique: false,
        },
        voucher_type: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,
            unique: false,
        },
        voucher_used: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
            unique: false,
        },
        voucher_cat: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,
            unique: false,
        },
        usage: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,
            unique: false,
        },
        spend: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,
            unique: false,
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
        modelName: 'Voucher',
    }
);

module.exports = Voucher;
