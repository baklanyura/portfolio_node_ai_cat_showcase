import {WhatsAppService_backup} from "../../services/whatsapp/WhatsAppService_backup.js";
import {WhatsAppChatsRepository_backup} from "../../repositories/WhatsAppChatsRepository_backup.js";
import {RAGModelService__backup} from "../../services/RAGModelService__backup.js";
import {LoggerRepository} from "../../repositories/LoggerRepository.js";
import {connectAtlasDb} from "../../../config/atlasmongoConfig.js";

const {WHATSAPP_VERYFY_WEBHOOK_TOKEN, WHATSAPP_TOKEN} = process.env;
/**
 * Verifies the webhook for WhatsApp integration.
 *
 * This function extracts the mode, challenge, and verify_token from the query parameters
 * of the request object. It checks if mode and verify_token exist and processes them accordingly.
 * If the mode is "subscribe" and the verify_token matches the predefined token,
 * it sends the challenge back in the response with a status of 200.
 * Otherwise, it responds with the challenge regardless of the mode or token.
 *
 * @param {Object} req - The request object from the client containing query parameters.
 * @param {Object} res - The response object used to send back the challenge code.
 */
export const verifyWebhook_backup = (req, res) => {
    let mode = req.query["hub.mode"];
    let challenge = req.query["hub.challenge"];
    let verify_token = req.query["hub.verify_token"];

    if (mode && verify_token) {
        if (mode === "subscribe" && verify_token === WHATSAPP_VERYFY_WEBHOOK_TOKEN) {
            return res.status(200).send(challenge);
        } else {
            return res.status(200).send(challenge);
        }
    }
}
/**
 * Handles incoming webhook requests to process and respond to messages received from WhatsApp.
 *
 * @param {Object} req - The Express request object, containing the webhook data in its body.
 * @param {Object} res - The Express response object, used to send back appropriate status codes.
 *
 * This function processes the incoming webhook payload to extract and handle messages.
 * It specifically checks for certain conditions in the payload to determine if a message needs to be processed.
 * If a message is determined to be a text message, it initializes a RAG model, logs the event,
 * and sends a text response back using the WhatsAppService.
 * Files such as images, videos, or documents are not accepted, and an error message is sent back instead.
 * This function also handles logging various events and errors using the LoggerRepository.
 */
export const recieveWebhook_backup = async (req, res) => {
    try {
        let body_param = req.body;
        if (body_param.object) {
            if (body_param.entry &&
                !body_param.entry[0].changes[0].statuses &&
                body_param.entry[0].changes &&
                body_param.entry[0].changes[0].value.messages &&
                body_param.entry[0].changes[0].value.messages[0] &&
                body_param.entry[0].changes[0].value.messages[0].timestamp
            ) {
                const chatRepo = new WhatsAppChatsRepository_backup();
                body_param.entry.forEach(async (entry) => {
                    const changes = entry.changes;
                    changes.forEach(async (change) => {
                        let phone_no_id = change.value.metadata.phone_number_id;
                        if (change.field === 'messages') {
                            const messages = change.value.messages;
                            for (const message of messages) {
                                let from = message.from;
                                let timestamp = message.timestamp;
                                const sessionId = `${phone_no_id}-${from}`;
                                const existChat = await chatRepo.appChatExists(sessionId, timestamp);
                                if (!existChat) {
                                    if (message.type === 'image' || message.type === 'video' || message.type === 'document') {
                                        LoggerRepository.errorLogger(`Tryed uplosding file through whatsApp: ${JSON.stringify(message, null, 2)}`);
                                        await (new WhatsAppService_backup(from)).sendTextMessage("Sorry, but we are unable to accept files through this channel");
                                    } else if (message.type === 'text') {
                                        LoggerRepository.infoLogger(`Recieved text message: ${JSON.stringify(message, null, 2)}`);
                                        const initRAGModel = await (new RAGModelService__backup(sessionId)).init(message.text.body);
                                        LoggerRepository.infoLogger(`Created RAG model with parameters: ${JSON.stringify(initRAGModel, null, 2)}`);
                                        await chatRepo.createAppChat(sessionId, timestamp);
                                        await (new WhatsAppService_backup(from)).sendTextMessage(initRAGModel.response.answer);
                                    }
                                }
                            }
                        }
                    });
                });
                await chatRepo.closeConnection();
                return res.status(200);
            } else {
                LoggerRepository.errorLogger(`Received request body: ${JSON.stringify(body_param, null, 2)}`)
                return res.status(404);
            }
        }
    }  finally {
        await (await connectAtlasDb()).close();
        console.log('Connection to Atlas DB closed');
    }

}