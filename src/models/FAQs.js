const Sequelize = require('sequelize');
const sequelize = require('./database_setup');

class FAQs extends Sequelize.Model {}

FAQs.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        Category: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        Question: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        Answer: {
            type: Sequelize.STRING(500),
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
        modelName: 'FAQs',
    }
);

module.exports = FAQs;
