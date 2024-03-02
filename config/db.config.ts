import { SequelizeScopeError } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import * as models from "../models";

// Authenticate and connect to the database
export const authenticate = () => {
  // Get database URL from environment variable
  const database_url = String(process.env.DB_URL);

  // Check if SSL is enabled
  const is_ssl = Boolean(process.env.ENABLE_DB_SSL);

  // Create Sequelize instance
  const db = new Sequelize(database_url, {
    dialect: "postgres",
    dialectOptions: !is_ssl
      ? {}
      : {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
    logging: false,
    models: Object.values(models),
  });

  // Try syncing models with database
  db.sync()
    .then(async () =>
      console.log("Connection to Database has been established successfully.")
    )
    .catch((error: SequelizeScopeError) =>
      console.error(`Unable to connect to the database: ${error.message}`)
    );
};
