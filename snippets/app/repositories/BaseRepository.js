import {connectAtlasDb} from "../../config/atlasmongoConfig.js";

const {DB_BASE_NAME} = process.env;

/**
 * BaseRepository class responsible for managing database connections and operations
 * for a specified collection within a MongoDB database.
 */
export class BaseRepository {
    constructor(collectionName) {
        this.db = null;
        this.dbName = DB_BASE_NAME;
        this.collectionName = collectionName;
    }

    async connect() {
        if (!this.db) {
            this.client = await connectAtlasDb();
            this.db = this.client.db(this.dbName);
            this.collection = this.db.collection(this.collectionName);
        }
    }
    async closeConnection() {
        if (this.client) {
            await this.client.close();
            console.log("Connection closed!")
            this.client = null;
            this.db = null;
        }
    }
}
