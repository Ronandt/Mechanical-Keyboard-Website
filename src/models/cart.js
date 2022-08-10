const Sequelize = require('sequelize');
const sequelize = require('./database_setup');
const Product = require('./product');
const User = require('./User');

class Cart extends Sequelize.Model {}

Cart.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
        },
        UserId: {
            type: Sequelize.DataTypes.INTEGER,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: 'Cart',
    }
);

class CartItem extends Sequelize.Model {}
CartItem.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
        },
        CartId: {
            type: Sequelize.DataTypes.INTEGER,
        },
        ProductId: {
            type: Sequelize.DataTypes.INTEGER,
        },
        quantity: Sequelize.DataTypes.INTEGER,
    },
    {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: 'CartItem',
    }
);

Product.belongsToMany(Cart, {
    through: {
        model: CartItem,
        unique: false,
    },
    foreignKey: 'ProductId',
    as: 'carts',
});

Cart.belongsToMany(Product, {
    through: {
        model: CartItem,
        unique: false,
    },
    foreignKey: 'CartId',
    as: 'cartProducts',
});

// Foreign Keys:
// CartId
// ProductId

// Cart.belongsToMany(Product, {through: CartItem },
//     { foreignKey: "userID" },
//     {as: 'cartProducts'});

// Product.belongsToMany(Cart, { through: CartItem });

Product.belongsToMany(
    Cart,
    {
        through: CartItem,
        unique: false,
    },
    { foreignKey: 'ProductId' },
    { as: 'carts' }
);

module.exports = { Cart, CartItem };
