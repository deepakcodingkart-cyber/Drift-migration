export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("migration_files", {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },

    migration_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: {
        model: "migrations",
        key: "id"
      },
      onDelete: "CASCADE"
    },

    file_type: {
      type: Sequelize.TEXT,
      allowNull: false
    },

    file_name: {
      type: Sequelize.TEXT,
      allowNull: false
    },

    file_path: {
      type: Sequelize.TEXT,
      allowNull: false
    },

    migration_type: {
      type: Sequelize.TEXT,
      allowNull: false
    },

    dry_run_status: {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: "pending"
    },

    execution_status: {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: "pending"
    },

    dry_run_report_path: {
      type: Sequelize.TEXT,
      allowNull: true
    },

    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("now")
    },

    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("now")
    }
  });

  // ✅ Unique constraint (migration_id + file_type)
  await queryInterface.addConstraint("migration_files", {
    fields: ["migration_id", "file_type"],
    type: "unique",
    name: "migration_files_migration_id_file_type_key"
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("migration_files");
}
