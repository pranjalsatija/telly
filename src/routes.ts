
import * as express from "express";
import * as firebase from "firebase-admin";
import * as twilio from "./twilio";

export default buildRouter();

function buildRouter(): express.Router {
    const router = express.Router();
    router.post("/start", startAuthentication);
    router.post("/finish", finishAuthentication);
    return router;
}

async function startAuthentication(req: express.Request, res: express.Response): Promise<void> {
    async function createVerificationCode() {
        // do something
    }

    async function sendSMS(verificationCode: string) {
        // do something
    }

    res.json("code_sent");
}

function finishAuthentication(req: express.Request, res: express.Response) {
    return;
}
