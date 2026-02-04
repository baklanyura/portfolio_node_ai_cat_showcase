import {ChatService} from "./ChatService.js";
import {OpenAIEmbeddings} from "@langchain/openai";
import {createChain_backup} from "./ai/createChain_backup.js";
import {modelAI} from "../../config/langchainConfig.js";
import {AIMessage, HumanMessage} from "@langchain/core/messages";
import {LoggerRepository} from "../repositories/LoggerRepository.js";
import {createVectorStore} from "./ai/createVectorStore.js";
import {createChain} from "./ai/createChain.js";

export class RAGModelService {
    constructor(sessionId) {
        this.sessionId = sessionId;
        this.chatService = new ChatService(this.sessionId)
    }

    async init(question) {
        const messages = await this.chatService.getMessagesList();
        let messageHistories = this.sessionId === 'expertsConversationForEducation' ? this.chatService.prepareMessagesList(await messages.chatHistory) : [] ;
        const embeddings = new OpenAIEmbeddings();
        const vectorStore = await createVectorStore(embeddings);
        LoggerRepository.infoLogger(`VectorStore created with parameters: ${JSON.stringify(vectorStore, null, 2)}`)
        const retrievalChain = await createChain(modelAI, vectorStore);
        const response = await retrievalChain.invoke({
            input: question
        });
        await this.chatService.addNewMessage(new HumanMessage(question));
        await this.chatService.addNewMessage(new AIMessage(response.answer));
        if (this.sessionId !== 'expertsConversationForEducation') messageHistories.push(
            {role: "User:", content: `${question}`},
            {role: "AI:", content: `${response.answer}`},
        )
        return {response, messageHistories}
    }

}