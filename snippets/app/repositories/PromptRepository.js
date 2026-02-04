import PromptModel from "../models/PromptModel.js";
import {BaseRepository} from "./BaseRepository.js";

const {DB_BASE_NAME} = process.env;

/**
 * The PromptRepository class provides a repository for managing prompts
 * in the database. It extends the BaseRepository class and connects to
 * the "prompts_collections".
 */
export class PromptRepository extends BaseRepository {
    /**
     * Constructs a new instance of the class and initializes it with prompts_collections.
     *
     * @return {void}
     */
    constructor() {
        super("prompts_collections");
    }

    async createPrompt(name, promptText) {
        if (!this.db) await this.connect();
        const promptModel = new PromptModel(null, name, promptText);
        const result = await this.collection.insertOne(promptModel.getPromptModelData());
        promptModel._id = result.insertedId.toString();
        return promptModel;

    }

    async getPromptByName(promptName) {
        if (!this.db) await this.connect();
        const promptData = await this.collection.findOne({name: promptName});
        return promptData ? new PromptModel(promptData._id, promptData.name, promptData.promptText) : null;

    }
}
