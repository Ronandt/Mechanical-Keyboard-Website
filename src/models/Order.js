const Sequelize = require("sequelize");
const sequelize = require("./database_setup");
const Product = require("./product");
const User = require("./User");

class Order extends Sequelize.Model {}

Order.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: "Order",
    }
);

class OrderItem extends Sequelize.Model {}
OrderItem.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
        },
        quantity: Sequelize.DataTypes.INTEGER,
    },
    {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: "OrderItem",
    }
);

class Payment extends Sequelize.Model {}

Payment.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
        },
        Payment_method: {
            type: Sequelize.STRING,
        },
        isSuccess: Sequelize.BOOLEAN,
        payTime: Sequelize.DATE,
    },
    {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: "Payment",
    }
);

Order.belongsTo(User, { foreignKey: "userID" });
User.hasMany(Order, { foreignKey: "userID" });

// OrderItem Foreign Keys:
// OrderId
// ProductId
Order.belongsTo(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });

// Payment Table
Order.hasMany(Payment, { foreignKey: "OrderID" });
Payment.belongsTo(Order, { foreignKey: "OrderID" });

module.exports = { Order, OrderItem, Payment };
