const bcrypt = require("bcrypt");
const Sequelize = require("sequelize");
const sequelize = require("./database_setup");
const moment = require("moment");

class User extends Sequelize.Model {
  compareHash(value) {
    return bcrypt.compareSync(value, this.getDataValue("password"));
  }

  verifyTokenAge() {
    return moment().format("x") - this.getDataValue("resetTokenDate")  > 3000000
  }

  generateResetToken() {
    this.setDataValue("resetToken", Sequelize.UUIDV4);
    this.setDataValue("resetTokenDate", `${moment().format("x")}`);
  }
}

User.init(
  {
    id: {
      type: Sequelize.DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
      allowNull: false,
    },
    username: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
      unique: false,
      set(value) {
        if (value) {
          this.setDataValue("password", bcrypt.hashSync(value, 10) + "");
        }
      },
    },
    isStaff: {
      type: Sequelize.DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
    },
    authMethod: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      defaultValue: "local",
      isIn: [["local", "oauth"]],
    },
    resetTokenID: {
      //denormalisation
      type: Sequelize.DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
    },
    resetTokenDate: {
      type: Sequelize.DataTypes.NUMBER,
      allowNull: true,
      defaultValue: null,
    },
    updatedAt: {
      type: Sequelize.DataTypes.DATE,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    sequelize,
    modelName: "User",
  }
);

module.exports = User;
