export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("migration_subscriptions", {
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

    external_subscription_id: {
      type: Sequelize.TEXT,
      allowNull: false
    },

    shopify_subscription_id: {
      type: Sequelize.TEXT,
      allowNull: true
    },

    status: {
      type: Sequelize.TEXT,
      allowNull: false
    },

    error_message: {
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

  // ✅ unique constraint (migration_id + external_subscription_id)
  await queryInterface.addConstraint("migration_subscriptions", {
    fields: ["migration_id", "external_subscription_id"],
    type: "unique",
    name: "uq_migration_subscription_unique"
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("migration_subscriptions");
}
