
import * as express from "express";
import * as firebase from "firebase-admin";
import * as randomstring from "randomstring";
import * as twilio from "./twilio";

export default buildRouter();

function buildRouter(): express.Router {
    const router = express.Router();
    router.post("/start", startAuthentication);
    router.post("/finish", finishAuthentication);
    return router;
}

async function startAuthentication(req: express.Request, res: express.Response) {
    let phoneNumber: string;

    try {
        phoneNumber = await twilio.standardizePhoneNumber(req.body.phone_number);
    } catch (error) {
        res.status(error.code || 500).json(error);
        return;
    }

    async function createVerificationCode(): Promise<any> {
        const verificationCode: string = randomstring.generate({
            charset: "numeric",
            length: 6,
        });

        return new Promise((fulfill, reject) => {
            firebase.database().ref(`/verificationCodes`).push({
                phone_number: phoneNumber,
                verification_code: verificationCode,
            }, (error) => {
                if (error != null) {
                    reject(error);
                } else {
                    fulfill(verificationCode);
                }
            });
        });
    }

    async function sendSMS(verificationCode: string) {
        twilio.sendSMS(phoneNumber, `Your verification code for ${process.env.SERVICE_NAME} is ${verificationCode}.`);
    }

    try {
        const code = await createVerificationCode();
        await sendSMS(code);
    } catch (error) {
        res.status(error.code || 500).send(error);
    }

    res.json({
        message: `Code sent to ${phoneNumber}.`,
    });
}

async function finishAuthentication(req: express.Request, res: express.Response) {
    return;
}