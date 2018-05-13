
import * as express from "express";

export default buildRouter();

function buildRouter(): express.Router {
    const router = express.Router();
    router.post("/start", startAuthentication);
    router.post("/finish", finishAuthentication);
    return router;
}

function startAuthentication(req: express.Request, res: express.Response) {
    return;
}

function finishAuthentication(req: express.Request, res: express.Response) {
    return;
}
