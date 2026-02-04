import {connectAtlasDb} from "../../config/atlasmongoConfig.js";
import {MongoDBChatMessageHistory} from "@langchain/mongodb";
import {BufferMemory} from "langchain/memory";
import {AIMessage, HumanMessage} from "@langchain/core/messages";
const {DB_BASE_NAME} = process.env;

/**
 * ChatService class handles the operations related to managing chat sessions and messages.
 * It connects to the database, allows adding new messages, retrieving the messages list,
 * and preparing messages for display.
 */
export class ChatService {
    constructor(sessionId) {
        this.sessionId = sessionId;
        this.collection = null;
    }

    async initDb() {
        const client = await connectAtlasDb();
        this.collection = client.db(DB_BASE_NAME).collection("conversations_collection");
    }

    async addNewMessage(message) {
        if (!this.collection) await this.initDb();
        const chatHistory = new MongoDBChatMessageHistory({
            collection: this.collection,
            sessionId: this.sessionId,
        });
        await chatHistory.addMessage(message);
        return new BufferMemory({
            chatHistory: (await chatHistory.getMessages()).slice(-20),
            returnMessages: true,
            memoryKey: "history"
        });
    }

    async getMessagesList() {
        if (!this.collection) await this.initDb();
        const chatHistory = new MongoDBChatMessageHistory({
            collection: this.collection,
            sessionId: this.sessionId,
        });
        return new BufferMemory({
            chatHistory: (await chatHistory.getMessages()).slice(-20),
            returnMessages: true,
            memoryKey: "history"
        });
    }

    prepareMessagesList(messages) {
        let messageHistories = [];
        messages.forEach(message => {
            if (message instanceof AIMessage) {
                messageHistories.push({role: "AI:", content: `${message.content}`});
            } else if (message instanceof HumanMessage) {
                messageHistories.push({role: "User:", content: `${message.content}`});
            }
        });
        return messageHistories;
    }
}