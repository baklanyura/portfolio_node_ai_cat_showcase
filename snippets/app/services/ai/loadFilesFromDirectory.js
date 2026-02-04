import {DirectoryLoader} from "langchain/document_loaders/fs/directory";
import {TextLoader} from "langchain/document_loaders/fs/text";
import {CSVLoader} from "@langchain/community/document_loaders/fs/csv";
import {PDFLoader} from "@langchain/community/document_loaders/fs/pdf";
import {DocxLoader} from "@langchain/community/document_loaders/fs/docx"
import {RecursiveCharacterTextSplitter} from "@langchain/textsplitters";
import {UnstructuredDirectoryLoader} from "@langchain/community/document_loaders/fs/unstructured";
import {Mailsendrer_backup} from "../../mail/mailsendrer_backup.js";
import {LoggerRepository} from "../../repositories/LoggerRepository.js";

const {UNSTRUCTURED_API_KEY, MAIL_TO_ADDRESS, UNSTRUCTURED_API_URL} = process.env;

/**
 * Asynchronously loads and processes documents from a specified directory.
 *
 * @param {string} dirPath - The path to the directory containing documents to be loaded.
 * @returns {Promise<Array>} - A promise that resolves with an array of split documents.
 * @throws {Error} Throws an error if no documents are found to split.
 */
export const loadAllDocsFromDirectories = async (dirPath) => {''
    const sendEmail = new Mailsendrer_backup({to: MAIL_TO_ADDRESS});
    const loader = new DirectoryLoader(
        dirPath,
        {
            ".txt": (path) => new TextLoader(path, "text"),
            ".csv": (path) => new CSVLoader(path, "text"),
            ".pdf": (path) => new PDFLoader(path),
            ".PDF": (path) => new PDFLoader(path),
            ".docx": (path) => new DocxLoader(path)
        }
    );
    let structuredDocs;
    try {
        structuredDocs = await loader.load()
    } catch (err) {
        LoggerRepository.errorLogger(`Error when tried to load structured files: ${err}`);
        await sendEmail.sendMessage({
            subject: `Error when tried to load files from folder ${dirPath} found`,
            text: err
        });
    }
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 0,
        separators: ["\n\n", "\n", "(?<-\.)", " "]
    });
    const options = {
        apiKey: UNSTRUCTURED_API_KEY,
        apiUrl: UNSTRUCTURED_API_URL
    }
    let unstructuredDocs;
    if (!structuredDocs) {
        const directoryLoader = new UnstructuredDirectoryLoader(
            dirPath,
            options
        );
        try {
            unstructuredDocs = directoryLoader.load();
        } catch (err) {
            LoggerRepository.errorLogger(`Error when tried to load files: ${err}`);
            await sendEmail.sendMessage({
                subject: `Error when tried to load files from folder ${dirPath} found`,
                text: err
            });
        }
    }

    let data = [];

    if (structuredDocs && structuredDocs.length > 0) {
        data.push(...structuredDocs);
    } else {
        await sendEmail.sendMessage({
            subject: `Failed loading documents from folder ${dirPath} found`,
            text: `No documents were found in the directory  ${dirPath} to process.`
        });
    }
    if (unstructuredDocs && unstructuredDocs.length > 0) {
        data.push(...unstructuredDocs);
    } else {
        await sendEmail.sendMessage({
            subject: `Failed loading documents from folder ${dirPath} found`,
            text: `No documents were found in the directory  ${dirPath} to process.`
        });
    }
    if (data.length > 0) {
        return await splitter.splitDocuments(data);
    } else {
        LoggerRepository.errorLogger(`There is no documents to split`);
        throw new Error("There is no documents to split")
    }
}
