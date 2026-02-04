import {ChatService} from "./ChatService.js";
import {LoggerRepository} from "../repositories/LoggerRepository.js";
import {ExpertModelService} from "./ExpertModelService.js";
import {AIMessage} from "@langchain/core/messages";
import {RAGModelService} from "./RAGModelService.js";

export const apiChatService = async (sessionId, validData) => {
    if (!validData.message || validData.message === '') {
        const chatService = new ChatService(sessionId);
        const messages = await chatService.getMessagesList();
        const messageHistory = sessionId === 'expertsConversationForEducation' ? chatService.prepareMessagesList(await messages.chatHistory) : [];
        return {
            messages: messageHistory
        };
    }
    const initRAGModel = await (new RAGModelService(sessionId)).init(validData.message);
    LoggerRepository.infoLogger(`${JSON.stringify(initRAGModel, null, 2)}`);
    if (sessionId !== 'expertsConversationForEducation') {
        const expertModelService = await (new ExpertModelService()).init(initRAGModel.response.answer, initRAGModel.response.input);
        if (expertModelService !== 'false') {
            await (new ChatService('expertsConversationForEducation')).addNewMessage(new AIMessage(expertModelService));
        }
    }

    return {
        question: initRAGModel.response.input,
        answer: initRAGModel.response.answer,
        messages: initRAGModel.messageHistories
    };
}