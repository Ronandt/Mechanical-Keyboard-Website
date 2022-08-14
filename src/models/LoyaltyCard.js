const Sequelize = require('sequelize');
const sequelize = require('./database_setup');
const User = require('./User');

class LoyaltyCard extends Sequelize.Model {
    // compareStatus(value) {
    //   if(value)
    //   return
    // }
}

LoyaltyCard.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: 'id',
            allowNull: false,
        },
        Active_Points: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
            unique: false,
        },
        Expired_Points: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
            unique: false,
        },
        Used_Points: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
            unique: false,
        },
        Total_Points: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
            unique: false,
        },
        Status: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,
            unique: false,
        },
        Activation: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
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
        modelName: 'LoyaltyCard',
    }
);

LoyaltyCard.belongsTo(User, { foreignKey: 'authorID' });
User.hasOne(LoyaltyCard, { foreignKey: 'authorID' });

module.exports = LoyaltyCard;
