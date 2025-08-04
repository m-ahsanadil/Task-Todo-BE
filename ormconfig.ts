import { ConnectionOptions } from "typeorm";
import config from "./src/config";
import "./dotenv";
import * as mysql2 from "mysql2";


const getSslConfig = (environment: string) => {
  switch (environment) {
    case "production":
      return {
        ssl: {
          rejectUnauthorized: false,
        },
      };
    case "development":
      return {
        ssl: {
          rejectUnauthorized: false,
        },
      };
    case "testing":
      return {
        ssl: {
          rejectUnauthorized: false,
        },
      };
    default:
      throw new Error(`Unsupported environment: ${environment}`);
  }
};

const connectionOptions: ConnectionOptions = {
  type: "mysql",
   driver: mysql2 as any,
  host: config.database[config.env].host,
  port: config.database[config.env].port,
  username: config.database[config.env].username,
  password: config.database[config.env].password,
  database: config.database[config.env].name,
  synchronize: true,
  ...getSslConfig(config.env),
  logging: ["error", "warn", "log"],
  entities: [__dirname + "/src/models/**/*.ts"],
  migrations: ["src/migrations/**/*.js"],
  subscribers: ["src/subscribers/**/*.ts"],
};

export default connectionOptions;
