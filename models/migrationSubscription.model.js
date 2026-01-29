import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const MigrationSubscription = sequelize.define(
  "MigrationSubscription",
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

    external_subscription_id: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    shopify_subscription_id: {
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
    tableName: "migration_subscriptions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["migration_id", "external_subscription_id"],
        name: "uq_migration_subscription_unique"
      }
    ]
  }
);

export default MigrationSubscription;
