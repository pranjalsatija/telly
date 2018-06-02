
import * as express from "express";
import * as util from "./util";

export default buildRouter();

function buildRouter(): express.Router {
    const router = express.Router();
    router.post("/start", startAuthentication);
    router.post("/finish", finishAuthentication);
    return router;
}

async function startAuthentication(req: express.Request, res: express.Response) {
    try {
        const phoneNumber = await util.standardizePhoneNumber(req.body.phone_number);
        const code = await util.createVerificationCode(phoneNumber);
        const message = `Your verification code for ${process.env.SERVICE_NAME} is ${code}.`;

        await util.sendSMS(phoneNumber, message);

        res.json(`We sent a code sent to ${phoneNumber}.`);
    } catch (error) {
        res.status(error.code || 500).json(error.message || error);
        return;
    }
}

async function finishAuthentication(req: express.Request, res: express.Response) {
    try {
        const userPhoneNumber = await util.standardizePhoneNumber(req.body.phone_number);
        const userVerificationCode = req.body.verification_code;
        const verificationCode = await util.getVerificationCode(userPhoneNumber);

        if (verificationCode === userVerificationCode) {
            res.json(await util.generateToken(userPhoneNumber));
            util.deleteAllVerificationCodes(userPhoneNumber);
        } else {
            throw {
                code: 401,
                message: "The provided verification code was invalid.",
            };
        }
    } catch (error) {
        res.status(error.code || 500).json(error.message || error);
        return;
    }
}
