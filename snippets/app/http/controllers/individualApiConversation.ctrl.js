import {ObjectId} from "mongodb";
import {LoggerRepository} from "../../repositories/LoggerRepository.js";
import CreateIndividualConversationRequest from "../requests/createIndividualConversationRequest.js";
import {apiChatService} from "../../services/APIChatService.js";
import {connectAtlasDb} from "../../../config/atlasmongoConfig.js";

/**
 * Handles the creation of a conversational model using the RAG (Retrieval-Augmented Generation) Model.
 *
 * @param {Object} req - The HTTP request object, which contains the body of the request.
 * @param {Object} res - The HTTP response object used to send the response back to the client.
 *
 * @throws Will return a 500 status code and a JSON error message if an error occurs during processing.
 */
export const individualApiConversation = async (req, res) => {
    try {
        const request = new CreateIndividualConversationRequest(req.body);
        if (!request.passes()) {
            return res.status(422).json({
                errors: request.getErrors(),
            });
        }
        const validData = request.validated();
        const sessionId = validData?.userProfile.ID_number !== '' ? validData?.userProfile.ID_number : (new ObjectId()).toString();
        const respbody = await apiChatService(sessionId, validData);
        return res.status(200).json(respbody);
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