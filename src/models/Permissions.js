const Sequelize = require('sequelize');
const sequelize = require('./database_setup');

class Permission extends Sequelize.Model {}

Permission.init(
    {
        id: {
            type: Sequelize.DataTypes.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },

        name: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        route: {
            type: Sequelize.DataTypes.STRING,
        },
        enabled: {
            type: Sequelize.DataTypes.BOOLEAN,
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
    }
);

module.exports = Permission;
