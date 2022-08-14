const Sequelize = require('sequelize');
const sequelize = require('./database_setup');

class PDF extends Sequelize.Model {}

PDF.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: 'id',
            allowNull: false,
        },
        link: {
            type: Sequelize.DataTypes.STRING
        },
        name: {
            type:Sequelize.DataTypes.STRING
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
        createdAt: true,
        updatedAt: true,
        sequelize,
  
    }
);

module.exports = PDF

