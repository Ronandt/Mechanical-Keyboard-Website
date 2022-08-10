const Sequelize = require('sequelize');
const sequelize = require('./database_setup');

class Mail extends Sequelize.Model {}

Mail.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        mail_title: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,
            unique: false,
        },
        mail_subject: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,
            unique: false,
        },
        template_id: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            unique: false,
        },
        send_type: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            unique: false,
        },
        mail_type: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            unique: false,
        },
        date: {
            type: Sequelize.DataTypes.DATE,
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
        modelName: 'Mail',
    }
);

module.exports = Mail;
