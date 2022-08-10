const Sequelize = require('sequelize');
const sequelize = require('./database_setup');
const User = require('./User');
const Ticket = require('./Ticket');

class TicketAssignee extends Sequelize.Model {}

TicketAssignee.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        createdAt: true,
        updatedAt: true,
        sequelize,
        modelName: 'TicketAssignee',
    }
);

TicketAssignee.belongsTo(User, { foreignKey: 'userID' });
User.hasMany(TicketAssignee, { foreignKey: 'userID' });

TicketAssignee.belongsTo(Ticket, { foreignKey: 'ticketID' });
Ticket.hasMany(TicketAssignee, { foreignKey: 'ticketID' });

module.exports = TicketAssignee;
