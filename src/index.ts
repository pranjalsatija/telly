import * as bodyParser from "body-parser";
import * as express from "express";
import * as firebase from "firebase-admin";
import * as http from "http";
import * as routes from "./routes";
import * as twilio from "./twilio";

require("dotenv").load();
twilio.authenticate();

const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT);
firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL,
});

const app = express.default();
app.use(bodyParser.json());
app.use("/auth", routes.default);

http.createServer(app).listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}.`);
});
