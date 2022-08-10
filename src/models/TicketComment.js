const Sequelize = require('sequelize');
const sequelize = require('./database_setup');
const Ticket = require('./Ticket');
const User = require('./User');

class TicketComment extends Sequelize.Model {}

TicketComment.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        message: {
            type: Sequelize.DataTypes.STRING(1000),
            allowNull: true,
        },
        meta: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,
            validate: { isIn: [['open', 'closed']] },
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
        modelName: 'TicketComment',
    }
);

TicketComment.belongsTo(User, { foreignKey: 'authorID' });
User.hasMany(Ticket, { foreignKey: 'authorID' });

TicketComment.belongsTo(Ticket, { foreignKey: 'ticketID' });
Ticket.hasMany(TicketComment, { foreignKey: 'ticketID' });

module.exports = TicketComment;
