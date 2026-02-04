import {MongoDBAtlasVectorSearch} from "@langchain/mongodb";
import {loadAllDocsFromDirectories} from "./loadFilesFromDirectory.js";
import {connectAtlasDb} from "../../../config/atlasmongoConfig.js";
import {LoggerRepository} from "../../repositories/LoggerRepository.js";

const {DB_BASE_NAME} = process.env;

/**
 * Adds documents to a MongoDB collection using embeddings and a specified directory path.
 *
 * This function connects to the MongoDB Atlas database, retrieves a specific collection,
 * loads documents from the provided directory path, and populates the collection with these
 * documents using embeddings for vector search.
 *
 * @param {Object} embeddings - The embeddings used to process the documents.
 * @param {string} dirPath - The directory path from which to load documents.
 * @returns {Promise<void>} - A promise that resolves when the documents have been added to the MongoDB collection.
 *
 * @throws {Error} - Throws an error if there is an issue connecting to the database, retrieving the collection,
 *                   loading documents from the directory, or any other operation within the function.
 */
export const addDocumentsToMongoDB_backup = async (embeddings, dirPath) => {
    const client = await connectAtlasDb();
    const collection = await client.db(DB_BASE_NAME).collection("vector_store_collection");
    // await collection.deleteMany({});
    loadAllDocsFromDirectories(dirPath).then(data => {
        return MongoDBAtlasVectorSearch.fromDocuments(
            data,
            embeddings, {
                collection: collection,
                indexName: "vsearch_index", // The name of the Atlas search index. Defaults to "default"
                textKey: "text", // The name of the collection field containing the raw content. Defaults to "text"
                embeddingKey: "embedding", // The name of the collection field containing the embedded text. Defaults to "embedding"
            });
    })
        .catch(err => LoggerRepository.errorLogger(`Error in loading documents: ${err}`))
        .finally(() => {
            client.close();
            console.log("Client closed.");
        });

}