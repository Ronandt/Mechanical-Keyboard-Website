const Sequelize = require('sequelize');
const sequelize = require('./database_setup');

class DeliveryDetail extends Sequelize.Model {}

DeliveryDetail.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        OrderId: {
            type: Sequelize.DataTypes.INTEGER,
        },
        shipping_status: {
            type: Sequelize.DataTypes.STRING,
        },

        // ShipOutDate - We send to delivery company
        // OnTheWayDate - Delivery company sends to you
        // ReceivedDate - User received

        ShipOutDate: {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
        },
        ReceivedDate: {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
        },
        CompleteDate: {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: 'DeliveryDetail',
    }
);

module.exports = DeliveryDetail;
