import multer from 'multer';
import fs from "fs";
import {LoggerRepository} from "../../repositories/LoggerRepository.js";
import {connectAtlasDb} from "../../../config/atlasmongoConfig.js";

export const uploadDirectory = './storage/docs/structured/uploads';

/**
 * Configuration object for multer's disk storage.
 *
 * This variable sets up the destination and filename for storing uploaded files using multer.
 *
 * @property {Function} destination - Determines the folder location where uploaded files will be stored.
 * @property {Function} filename - Determines the name of the file within the destination folder, including a timestamp to ensure uniqueness.
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

/**
 * Filters uploaded files based on their MIME type.
 *
 * @param {object} req - The request object from the client.
 * @param {object} file - The file object representing the uploaded file.
 * @param {function} cb - Callback function to indicate whether the file should be accepted or rejected.
 *
 * The fileFilter checks if the MIME type of the uploaded file is in the list of allowed MIME types. If it is,
 * the callback is invoked with `true` to accept the file. If the MIME type is not allowed, an error is logged
 * and the callback is invoked with an error and `false` to reject the file.
 */
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf', // PDF
        'application/msword', // DOC
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
        'application/vnd.ms-excel', // XLS
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
        'text/csv' // CSV
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        LoggerRepository.errorLogger(`Unsupported file type: ${file.mimetype}`);
        cb(new Error('Unsupported file type'), false);
    }
};
/**
 * Middleware for handling multipart/form-data, which is primarily used for uploading files.
 * Utilizes the multer library to manage and process the uploaded files.
 *
 * The upload settings:
 * - Uses a specified storage engine to define where and how files are stored.
 * - Applies a file filter to control which files are accepted.
 * - Handles multiple files under the field name 'files' with a maximum count of 10.
 *
 * The resulting files will be available in `req.files` as an array.
 *
 * @type {Function}
 */
const upload = multer({
    storage,
    fileFilter
}).array('files', 10);
/**
 * Handles file uploads through an API endpoint.
 *
 * @param {Object} req - The request object containing file upload information.
 * @param {Object} res - The response object to send the upload status and file information.
 *
 * Logs and returns appropriate responses based on the result of the upload process.
 * Potential error cases include Multer errors, other upload errors, and no files being uploaded.
 * Successful uploads will return a JSON response with the uploaded file details.
 */
export const uploadFilesTroughAPI = async (req, res) => {
    try {
        upload(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                LoggerRepository.errorLogger(`Multer error: ${err.message}`);
                return res.status(500).json({ error: 'Multer error: ' + err.message });
            } else if (err) {
                LoggerRepository.errorLogger(`Error: ${err.message}`);
                return res.status(422).json({ error: 'Error: ' + err.message });
            }

            if (!req.files || req.files.length === 0) {
                LoggerRepository.errorLogger(`Error: No files uploaded`);
                return res.status(400).json({ message: 'No files uploaded' });
            }

            LoggerRepository.infoLogger(`Files uploaded successfully`);
            res.status(200).json({
                message: 'Files uploaded successfully',
                files: req.files.map(file => ({
                    originalname: file.originalname,
                    filename: file.filename,
                    path: file.path,
                    size: file.size
                }))
            });
        });
    }  finally {
        await (await connectAtlasDb()).close();
        console.log('Connection to Atlas DB closed');
    }

};
