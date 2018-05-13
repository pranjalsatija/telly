import * as bodyParser from "body-parser";
import * as express from "express";
import * as http from "http";
import * as routes from "./routes";

require("dotenv").load();

const app = express.default();
app.use(bodyParser.json());
app.use("/auth", routes.default);

http.createServer(app).listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}.`);
});
