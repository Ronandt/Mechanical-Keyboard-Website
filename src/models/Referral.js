const Sequelize = require('sequelize');
const sequelize = require('./database_setup');
const User = require('./User');
// const Referral = require("./Referral")

class Referral extends Sequelize.Model {
    // compareStatus(value) {
    //   if(value)
    //   return
    // }
}

Referral.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: 'id',
            allowNull: false,
        },
        referral_code: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            unique: 'referral_code',
        },
        redeemed: {
            type: Sequelize.DataTypes.INTEGER,
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
        modelName: 'Referral',
    }
);

Referral.belongsTo(User, { foreignKey: 'authorID' });

module.exports = Referral;
