const Sequelize = require('sequelize');
const sequelize = require('./database_setup');
const User = require('./User');

class Ticket extends Sequelize.Model {}

Ticket.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        title: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            unique: false,
        },
        description: {
            type: Sequelize.DataTypes.STRING(500),
            allowNull: true,
            unique: false,
        },
        status: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            validate: { isIn: [['open', 'closed']] },
            defaultValue: 'open',
        },
        severity: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            unique: false,
            validate: { isIn: [['low', 'medium', 'high']] },
        },
        category: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            unique: false,
            validate: { isIn: [['bug', 'product', 'request']] },
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        createdAt: true,
        updatedAt: true,
        sequelize,
        modelName: 'Ticket',
    }
);

Ticket.belongsTo(User, { foreignKey: 'authorID' });
User.hasMany(Ticket, { foreignKey: 'authorID' });

module.exports = Ticket;
