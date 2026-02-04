import {WhatsAppChatsModel_backup} from "../models/WhatsAppChatsModel_backup.js";
import {BaseRepository} from "./BaseRepository.js";

/**
 * WhatsAppChatsRepository provides methods to interact with the WhatsApp chat collection
 * in the database.
 *
 * Extends the BaseRepository and is used to create and check the existence of chat records.
 */
export class WhatsAppChatsRepository_backup extends BaseRepository {
    /**
     * Constructs an instance of a class responsible for managing a collection
     * of WhatsApp chats.
     *
     * @return {Object} Returns an instance of the class initialized with
     * the identifier "whatsapp_chats_collection".
     */
    constructor() {
        super("whatsapp_chats_collection");
    }

    async createAppChat(chat_id, timestamp) {
        if (!this.db) await this.connect();
        const chatModel = new WhatsAppChatsModel_backup(chat_id, timestamp);
        const result = await this.collection.insertOne(chatModel);
        return chatModel;

    }

    async appChatExists(chat_id, timestamp) {
        if (!this.db) await this.connect();
        const result = await this.collection.findOne({_chat_id: chat_id, _timestamp: timestamp});
        return result !== null;
    }
}