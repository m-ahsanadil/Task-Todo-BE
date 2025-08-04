import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Server } from "http";
import { Service } from "typedi";
import { useExpressServer } from "routing-controllers";
import router from "./routes/routers.routes";
import config from "./config";
import { getConnection } from "./db-connection";
import http from "http";

@Service()
export class App {
  public readonly expressApplication: express.Application;

  constructor() {
    this.expressApplication = express();
    this.initializeMiddleware();
    this.initializeControllers();
  }

  private initializeMiddleware(): void {
    // logging for debugging
    this.expressApplication.use((req, res, next) => {
      console.log(`Request received: method: ${req.method}, url: ${req.url}`);
      res.on("finish", () => {
        console.log(`Request completed: statusCode: ${res.statusCode}`);
      });
      next();
    });

    function getCorsOptions() {
      if (
        process.env.NODE_ENV === "production"
      ) {
        return {
          origin: [
            "http://localhost:3000",
            "http://localhost:3000/login",

          ],
          optionsSuccessStatus: 200,
          credentials: true,
          methods: "GET,POST,PUT,PATCH,DELETE",
          allowedHeaders: ["Content-Type", "Authorization"],
        };
      } else {
        return {
          origin: "*",
          optionsSuccessStatus: 200,
          credentials: true,
        };
      }
    }
    this.expressApplication.use(cors(getCorsOptions()));
    this.expressApplication.use(bodyParser.json());
    this.expressApplication.use(bodyParser.urlencoded({ extended: true }));
    this.expressApplication.use(router);

  }

  private initializeControllers(): void {
    useExpressServer(this.expressApplication, {
      controllers: [__dirname + "/controllers/*.ts"],
      defaultErrorHandler: false,
    });
  }

  public async startExpressServer(): Promise<Server> {
    try {
      await getConnection();

      // Start the server
      const server = http.createServer(this.expressApplication);
      const serverPromise = new Promise<Server>((resolve, reject) => {
        server
          .listen(config.server.port, () => {
            const serverType = config.env === "production" ? "HTTPS" : "HTTP";
            console.log(
              `\n${serverType} Server running on: {\n` +
              ` PORT: ${config.server.port}\n` +
              ` ENVIRONMENT: ${config.env}\n` +
              ` DATABASE: ${config.database[config.env].name}\n` +
              ` HOST: ${config.database[config.env].host}\n}`
            );
            resolve(server);
          })
          .on("error", (err) => {
            console.error("Server startup error:", err);
            reject(err);
          });
      });

      await serverPromise;
      return server;
    } catch (error) {
      console.error("Server initialization failed:", error);
      throw error;
    }
  }
}
