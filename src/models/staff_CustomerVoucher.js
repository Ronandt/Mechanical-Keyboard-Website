// const Sequelize = require("sequelize");
// const sequelize = require("./database_setup");
// const Voucher = require("./Voucher");
// const User = require("./User");

// class StaffCustomerVoucher extends Sequelize.Model {}

// StaffCustomerVoucher.init(
//     {
//         id: {
//             type: Sequelize.DataTypes.INTEGER,
//             autoIncrement: true,
//             primaryKey: true,
//             unique: true,
//         },
//         UserId: {
//             type: Sequelize.DataTypes.INTEGER
//         },

//     },
//     {
//         freezeTableName: true,
//         timestamps: true,
//         sequelize,
//         modelName: "StaffCustomerVoucher",
//     }
// );

// class StaffVoucherItem extends Sequelize.Model {}
// StaffVoucherItem.init(
//     {
//         id: {
//             type: Sequelize.DataTypes.INTEGER,
//             autoIncrement: true,
//             primaryKey: true,
//             unique: true,
//         },
//         StaffCustomerVoucherId: {
//             type: Sequelize.DataTypes.INTEGER
//         },
//         VoucherId: {
//             type: Sequelize.DataTypes.INTEGER
//         },

//     },
//     {
//         freezeTableName: true,
//         timestamps: true,
//         sequelize,
//         modelName: "StaffVoucherItem",
//     }
// );

// // User and order association
// StaffCustomerVoucher.belongsTo(User);
// User.hasOne(StaffCustomerVoucher);

// // Order and Product association
// StaffCustomerVoucher.belongsToMany(Voucher, {
//     through: {
//       model: StaffVoucherItem,
//       unique: false
//     },
//     foreignKey: 'StaffCustomerVoucherId',
//     as: 'products'
// })
// Voucher.belongsToMany(StaffCustomerVoucher, {
//     through: {
//         model: StaffVoucherItem,
//         unique: false
//     },
//     foreignKey: 'VoucherId',
//     as: 'orders'
// })
// Order.hasMany(OrderItem);
// OrderItem.belongsTo(Order);

// Product.hasMany(OrderItem);
// OrderItem.belongsTo(Product)
