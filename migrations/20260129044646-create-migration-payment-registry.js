export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("migration_payment_registry", {
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

    provider: {
      type: Sequelize.TEXT,
      allowNull: false
    },

    email: {
      type: Sequelize.TEXT,
      allowNull: false
    },

    external_payment_id: {
      type: Sequelize.TEXT,
      allowNull: false
    },

    shopify_payment_method_id: {
      type: Sequelize.TEXT,
      allowNull: true
    },

    shopify_customer_id: {
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
    }
  });

  // ✅ unique constraint
  await queryInterface.addConstraint("migration_payment_registry", {
    fields: ["migration_id", "provider", "external_payment_id"],
    type: "unique",
    name: "uq_payment_registry_unique"
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("migration_payment_registry");
}
