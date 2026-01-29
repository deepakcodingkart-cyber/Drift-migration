import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const MigrationFile = sequelize.define(
  "MigrationFile",
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
    file_type: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    file_name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    file_path: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    migration_type: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    dry_run_status: {
      type: DataTypes.TEXT,
      defaultValue: "pending"
    },
    execution_status: {
      type: DataTypes.TEXT,
      defaultValue: "pending"
    },
    dry_run_report_path: {
      type: DataTypes.TEXT
    }
  },
  {
    tableName: "migration_files",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);

export default MigrationFile;
