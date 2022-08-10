const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const sequelize = require('./database_setup');
const moment = require('moment');
const { v4: uuid } = require('uuid');
const { set } = require('../setup');

class User extends Sequelize.Model {
    compareHash(value) {
        return bcrypt.compareSync(value, this.getDataValue('password'));
    }

    verifyTokenAge() {
        return moment().unix() - this.getDataValue('resetTokenDate') < 300;
    }

    generateResetToken() {
        this.setDataValue('resetTokenID', uuid());
        this.setDataValue('resetTokenDate', moment().unix());
        this.save();
    }
}

User.init(
    {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: 'id',
            allowNull: false,
        },
        username: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            unique: 'email',
        },
        image: {
            type: Sequelize.DataTypes.BLOB,
            allowNull: true,
            defaultValue: null,
        },
        password: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,
            unique: 'password',
            set(value) {
                if (value) {
                    this.setDataValue(
                        'password',
                        bcrypt.hashSync(value, 10) + ''
                    );
                }
            },
        },
        isStaff: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
        },
        authMethod: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            defaultValue: 'local',
            isIn: [['local', 'oauth', 'both']],
        },
        resetTokenID: {
            //denormalisation
            type: Sequelize.DataTypes.UUID,
            allowNull: true,
            defaultValue: null,
        },
        resetTokenDate: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        disabled: {
            type: Sequelize.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 0,
        },
        updatedAt: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
        },
        createdAt: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
        },
        date: {
            type: Sequelize.DataTypes.STRING,
            defaultValue: moment().format('L'),
        },
        imageFilePath: {
            type: Sequelize.DataTypes.STRING,
            defaultValue: 'uploads/unknownimage.png',
        },

        address: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: 'User',
    }
);

module.exports = User;
