import CreateAnswerFromUrlRequest_backup from "../requests/createAnswerFromUrlRequest_backup.js";
import {ObjectId} from "mongodb";
import {RAGModelService__backup} from "../../services/RAGModelService__backup.js";
import {LoggerRepository} from "../../repositories/LoggerRepository.js";
import {connectAtlasDb} from "../../../config/atlasmongoConfig.js";

/**
 * Handles the creation of a conversational model using the RAG (Retrieval-Augmented Generation) Model.
 *
 * @param {Object} req - The HTTP request object, which contains the body of the request.
 * @param {Object} res - The HTTP response object used to send the response back to the client.
 *
 * @throws Will return a 500 status code and a JSON error message if an error occurs during processing.
 */
export const createRAGmodelConversation_backup = async (req, res) => {
    try {
        const request = new CreateAnswerFromUrlRequest_backup(req.body);
        if (!request.passes()) {
            return res.render('index', {
                form2Errors: request.getErrors(),
            });
        }
        const validData = request.validated();
        const sessionId = validData?.session_id !== '' ? validData?.session_id : (new ObjectId()).toString();
        const initRAGModel = await (new RAGModelService__backup(sessionId)).init(validData.question)
        LoggerRepository.infoLogger(`${JSON.stringify(initRAGModel, null, 2)}`)

        res.render('index', {
            form2Success: 'Open AI analyzed your url with answer',
            url: validData.url,
            question: initRAGModel.response.input,
            answer: initRAGModel.response.answer,
            sessionId2: sessionId,
            messagesHistory2: initRAGModel.messageHistories

        });
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