import {LoggerRepository} from "../../repositories/LoggerRepository.js";
import path from "path";
const UPLOADING_FOLDER = process.env.UPLOADING_FOLDER;
import fs from "fs";
import {CreateExpertConversationRequest} from "../requests/createExpertConversationRequest.js";
import {apiChatService} from "../../services/APIChatService.js";
import {connectAtlasDb} from "../../../config/atlasmongoConfig.js";

const filePath = path.join(UPLOADING_FOLDER, 'output.txt');

/**
 * Handles the creation of a conversational model using the RAG (Retrieval-Augmented Generation) Model.
 *
 * @param {Object} req - The HTTP request object, which contains the body of the request.
 * @param {Object} res - The HTTP response object used to send the response back to the client.
 *
 * @throws Will return a 500 status code and a JSON error message if an error occurs during processing.
 */
export const expertApiConversation = async (req, res) => {
    try {
        const request = new CreateExpertConversationRequest(req.body);
        if (!request.passes()) {
            return res.status(422).json({
                errors: request.getErrors(),
            });
        }
        const validData = request.validated();
        const sessionId = 'expertsConversationForEducation';
        const respbody = await apiChatService(sessionId, validData);
        if (respbody.question && respbody.answer) {
            const contentToAppend = `- ${respbody.question}\n\n`;
            if (!fs.existsSync(UPLOADING_FOLDER)) {
                fs.mkdirSync(UPLOADING_FOLDER, { recursive: true });
            }
            fs.appendFileSync(filePath, contentToAppend, 'utf8');
        }

        res.status(200).json(respbody);
    } catch (error) {
        LoggerRepository.errorLogger(error.message);
        res.status(500).json({
            message: 'Error occurred',
            error: error.message
        });
    } finally {
      await (await connectAtlasDb()).close();
      console.log('Connection to Atlas DB closed');
    }
}