const Sequelize = require("sequelize");
const sequelize = require("./database_setup");
const Product = require("./product");
const User = require("./User");

class Cart extends Sequelize.Model {}

Cart.init(
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
        modelName: "Cart",
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
        quantity: Sequelize.DataTypes.INTEGER,
    },
    {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: "CartItem",
    }
);

Cart.belongsTo(User, { foreignKey: "userID" });
User.hasOne(Cart, { foreignKey: "userID" });

// Foreign Keys:
// CartId
// ProductId
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

module.exports = { Cart, CartItem };
