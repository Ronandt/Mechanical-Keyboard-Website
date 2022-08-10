const sequelize = require('./database_setup');
const User = require('./user');
const Ticket = require('./ticket');
const mysql = require('mysql2/promise');
const superusers = require('../../data/superusers');
const Permission = require('../models/Permissions');
const Role = require('../models/Role');
const CartItem = require('../models/cart');

require('dotenv').config();

const ensureCreated = async () => {
    // create if not exist
    const database = process.env.DB_NAME;
    const user = process.env.DB_USER;
    const password = process.env.DB_PWD;
    const host = process.env.DB_HOST;
    const port = process.env.DB_PORT;

    const connection = await mysql.createConnection({
        host,
        port,
        user,
        password,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
};

const initaliseDatabase = async () => {
    await ensureCreated();

    await sequelize
        .authenticate()
        .then(async () => {
            Role.belongsToMany(Permission, { through: 'RolePermission' });
            await sequelize
                .sync({ alter: true })
                .then((e) => console.log('Successfully altered'))
                .catch((e) => {
                    console.log(e);
                    sequelize.sync({ force: true });
                });
        })
        .catch((err) => {
            console.log(err);
        });

    Object.entries(superusers).forEach(async ([key, superuser]) => {
        if (
            !(
                (await User.findOne({ where: { email: superuser.email } })) ||
                (await User.findOne({
                    where: { username: superuser.username },
                }))
            )
        ) {
            const user = await User.create({
                email: superuser.email,
                username: superuser.username,
                password: superuser.password,
                isStaff: superuser.isStaff,
            });
            // @lx0f - for experimenting
            await Ticket.create({
                title: 'hello this is ticket',
                description: 'this is the super mega ultra description',
                severity: 'high',
                category: 'bug',
                authorID: user.id,
            });
        }
    });

    //if(User.findOne())
};

module.exports = initaliseDatabase;
