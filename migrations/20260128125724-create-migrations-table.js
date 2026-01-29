export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("migrations", {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    shop_id: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    shop_domain: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    status: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    title: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    created_by: {
      type: Sequelize.TEXT,
      allowNull: false
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
}

export async function down(queryInterface) {
  await queryInterface.dropTable("migrations");
}
