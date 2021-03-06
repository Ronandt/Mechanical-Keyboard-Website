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
        UserId: {
            type: Sequelize.DataTypes.INTEGER
        },
        name: {
            type: Sequelize.DataTypes.STRING
        },
        phone: {
            type: Sequelize.DataTypes.STRING
        },
        sn: {
            type: Sequelize.DataTypes.STRING
        },
        amount: {
            type: Sequelize.DataTypes.INTEGER
        },
        shipping_status: {
            type: Sequelize.DataTypes.STRING
        },
        payment_status: {
            type: Sequelize.DataTypes.STRING
        }
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
        OrderId: {
            type: Sequelize.DataTypes.INTEGER
        },
        ProductId: {
            type: Sequelize.DataTypes.INTEGER
        },
        price: {
            type: Sequelize.DataTypes.INTEGER 
        },
        quantity: {
           type: Sequelize.DataTypes.INTEGER
        }
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
        OrderId: {
            type: Sequelize.DataTypes.INTEGER
        },
        Payment_method: {
            type: Sequelize.DataTypes.STRING,
        },
        isSuccess: {
            type: Sequelize.DataTypes.BOOLEAN
        },
        failure_message: {
            type: Sequelize.DataTypes.TEXT
        },
        payTime: {
            type: Sequelize.DataTypes.DATE
        }
    },
    {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: "Payment",
    }
);

// User and order association 
Order.belongsTo(User);
User.hasMany(Order);

// Order and Product association
Order.belongsToMany(Product, {
    through: {
      model: OrderItem,
      unique: false
    },
    foreignKey: 'OrderId',
    as: 'orderProducts'
})
Product.belongsToMany(Order, {
    through: {
        model: OrderItem,
        unique: false
    },
    foreignKey: 'ProductId',
    as: 'orders'
})


// Order and Payment association
Order.hasMany(Payment);
Payment.belongsTo(Order);

module.exports = { Order, OrderItem, Payment };
