import {addDocumentsToMongoDB_backup} from "../../services/ai/addDocumentsToMongoDB_backup.js";
import {OpenAIEmbeddings} from "@langchain/openai";
import fs from "fs";
import {LoggerRepository} from "../../repositories/LoggerRepository.js";
const UPLOADING_FOLDER = process.env.UPLOADING_FOLDER;
function checkDirectoryForFiles(directory) {
    return new Promise((resolve, reject) => {
        fs.readdir(directory, (err, files) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    fs.mkdirSync(UPLOADING_FOLDER);
                    resolve(false);
                } else {
                    reject(err);
                }
            } else {
                resolve(files.length > 0);
            }
        });
    });
}

export const cronAddDocsToDB_backup = async () => {
    try {
        const hasFiles = await checkDirectoryForFiles(UPLOADING_FOLDER);

        if (!hasFiles) {
            return;
        }
        const embeddings = new OpenAIEmbeddings();
        if (!fs.existsSync(UPLOADING_FOLDER)) {
            await fs.promises.mkdir(UPLOADING_FOLDER, {recursive: true});
        }
        return await addDocumentsToMongoDB_backup(embeddings, UPLOADING_FOLDER).then(() => {
            LoggerRepository.infoLogger('Documents loaded to DB');
        }).catch(err => {
            LoggerRepository.errorLogger(`Error checking directory: ${err.message}`)
        });
    } catch (err) {
        LoggerRepository.errorLogger(`Error checking directory: ${err.message}`);
    }

}