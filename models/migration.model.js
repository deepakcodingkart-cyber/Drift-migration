import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const Migration = sequelize.define(
  "Migration",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    shop_id: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    shop_domain: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    created_by: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  },
  {
    tableName: "migrations",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);

export default Migration;
