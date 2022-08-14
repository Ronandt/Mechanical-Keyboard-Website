const Sequelize = require('sequelize');
const sequelize = require('./database_setup');
const Product = require('./product');
const User = require('./User');
const DeliveryDetail = require('./DeliveryDetail');

class Order extends Sequelize.Model {}

Order.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: 'id',
        },
        UserId: {
            type: Sequelize.DataTypes.INTEGER,
        },
        subtotal: {
            type: Sequelize.DataTypes.INTEGER,
        },
        amount: {
            type: Sequelize.DataTypes.INTEGER,
        },
        discount: {
            type: Sequelize.DataTypes.INTEGER,
        },
        shipping_fee: {
            type: Sequelize.DataTypes.INTEGER,
        },
        shipping_status: {
            type: Sequelize.DataTypes.STRING,
        },
        payment_status: {
            type: Sequelize.DataTypes.STRING,
        },
        order_status: {
            type: Sequelize.DataTypes.STRING,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: 'Order',
    }
);

class OrderItem extends Sequelize.Model {}
OrderItem.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: 'id',
        },
        OrderId: {
            type: Sequelize.DataTypes.INTEGER,
        },
        ProductId: {
            type: Sequelize.DataTypes.INTEGER,
        },
        price: {
            type: Sequelize.DataTypes.INTEGER,
        },
        quantity: {
            type: Sequelize.DataTypes.INTEGER,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: 'OrderItem',
    }
);

class Payment extends Sequelize.Model {}

Payment.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: 'id',
        },
        OrderId: {
            type: Sequelize.DataTypes.INTEGER,
        },
        Payment_method: {
            type: Sequelize.DataTypes.STRING,
        },
        last4digit: {
            type: Sequelize.DataTypes.INTEGER,
        },
        isSuccess: {
            type: Sequelize.DataTypes.BOOLEAN,
        },
        payTime: {
            type: Sequelize.DataTypes.DATE,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: 'Payment',
    }
);

class Cancelrequest extends Sequelize.Model {}

Cancelrequest.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
        },
        OrderId: {
            type: Sequelize.DataTypes.INTEGER,
        },
        message: {
            type: Sequelize.DataTypes.STRING,
        },
        status: {
            type: Sequelize.DataTypes.STRING,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: 'Cancelrequest',
    }
);
// cancel request and order
Order.hasOne(Cancelrequest);
Cancelrequest.belongsTo(Order);

// User and order association
class Shippinginfo extends Sequelize.Model {}

Shippinginfo.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
        },
        OrderId: {
            type: Sequelize.DataTypes.INTEGER,
        },
        Fname: {
            type: Sequelize.DataTypes.STRING,
        },
        Lname: {
            type: Sequelize.DataTypes.STRING,
        },
        address: {
            type: Sequelize.DataTypes.STRING,
        },
        zipcode: {
            type: Sequelize.INTEGER,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: 'Shippinginfo',
    }
);

// User and order association
Order.belongsTo(User);
User.hasMany(Order);

//shippinginfo and order
Shippinginfo.belongsTo(Order);
Order.hasOne(Shippinginfo);

// Order and Product association
Order.belongsToMany(Product, {
    through: {
        model: OrderItem,
        unique: false,
    },
    foreignKey: 'OrderId',
    as: 'products',
});
Product.belongsToMany(Order, {
    through: {
        model: OrderItem,
        unique: false,
    },
    foreignKey: 'ProductId',
    as: 'orders',
});
Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

Product.hasMany(OrderItem);
OrderItem.belongsTo(Product);

// Order and Payment association
Order.hasOne(Payment);
Payment.belongsTo(Order);

Order.hasOne(DeliveryDetail);
DeliveryDetail.belongsTo(Order);

// cancel request and order
Order.hasOne(Cancelrequest);
Cancelrequest.belongsTo(Order);

module.exports = { Order, OrderItem, Payment, Shippinginfo, Cancelrequest };
