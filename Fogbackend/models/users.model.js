import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import sequelize from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    provider: {
      type: DataTypes.ENUM("local", "google", "facebook"),
      allowNull: false,
      defaultValue: "local",
    },

    providerId: {
      type: DataTypes.STRING, // ID from Google/Facebook
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false, // ✅ required
      unique: true,
      validate: {
        isEmail: { msg: "Must be a valid email address" },
        notNull: { msg: "Email is required" },
      },
    },

    firstname: {
      type: DataTypes.STRING,
      allowNull: false, // ✅ required
      validate: {
        notEmpty: { msg: "First name cannot be empty" },
        notNull: { msg: "First name is required" },
      },
    },

    lastname: {
      type: DataTypes.STRING,
      allowNull: true, // Optional
    },

    password: {
      type: DataTypes.STRING,
      allowNull: true, // Will be null for social logins
      validate: {
        // Only enforce if provider is local
        isLongEnough(value) {
          if (this.provider === "local" && (!value || value.length < 6)) {
            throw new Error("Password must be at least 6 characters long");
          }
        },
      },
    },

    role: {
      type: DataTypes.ENUM("user", "admin"),
      allowNull: false,
      defaultValue: "user",
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: { msg: "Avatar must be a valid URL" },
      },
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeSave: async (user) => {
        if (user.provider === "local" && user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

// Instance method: check password
User.prototype.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default User;
