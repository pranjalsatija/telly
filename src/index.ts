import * as bodyParser from "body-parser";
import * as express from "express";
import * as https from "https";
import * as routes from "./routes";

require("dotenv").load();

const app = express.default();
app.use(bodyParser.json());
app.use("/auth", routes.default);

https.createServer({}, app).listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}.`);
});
