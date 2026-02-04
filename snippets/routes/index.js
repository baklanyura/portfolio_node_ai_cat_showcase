import {Router} from "express";
import {verifyToken} from "../app/middleware/verifyToken.js";
import {individualApiConversation} from "../app/http/controllers/individualApiConversation.ctrl.js";
import {expertApiConversation} from "../app/http/controllers/expertApiConversation.ctrl.js";

const indexRouter = Router();

indexRouter.post('/api/individual_conversation', verifyToken, individualApiConversation)
indexRouter.post('/api/experts_conversation', verifyToken, expertApiConversation)

export default indexRouter;
