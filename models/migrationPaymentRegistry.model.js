import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const MigrationPaymentRegistry = sequelize.define(
  "MigrationPaymentRegistry",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },

    migration_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },

    provider: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    email: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    external_payment_id: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    shopify_payment_method_id: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    shopify_customer_id: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    status: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    tableName: "migration_payment_registry",
    timestamps: false, // only created_at exists
    createdAt: "created_at",
    indexes: [
      {
        unique: true,
        fields: ["migration_id", "provider", "external_payment_id"],
        name: "uq_payment_registry_unique"
      }
    ]
  }
);

export default MigrationPaymentRegistry;
