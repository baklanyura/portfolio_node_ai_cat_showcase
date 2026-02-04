import fs from 'fs';
import https from 'https';
import {app} from './app.js';

const {PORT, NODE_ENV} = process.env;

// Check for certificates in development environment
let httpsServer;

if (NODE_ENV === 'LOCAL') {
    try {
        // Read certificates if they exist
        const privateKey = fs.readFileSync('key.pem', 'utf8');
        const certificate = fs.readFileSync('cert.pem', 'utf8');
        const credentials = {key: privateKey, cert: certificate};

        httpsServer = https.createServer(credentials, app);
        console.log('Certificates found. Starting HTTPS server for local environment...');
    } catch (err) {
        console.error('Certificates not found or an error occurred while reading: ', err);
        console.log('Check for the presence of key.pem and cert.pem files for HTTPS connection.');
    }
} else {
    console.log('Launching in production environment. SSL is handled by reverse proxy (e.g., Nginx).');

}

// cron.schedule('*/5 * * * *', async () => {
//     await cronAddDocsToDB_backup().then(async () => {
//         await fs.promises.rm(uploadDirectory, {recursive: true, force: true});
//         await fs.promises.mkdir(uploadDirectory, { recursive: true });
//     });
// });

// Starting the server
if (httpsServer) {
    httpsServer.listen(PORT, (error) => {
        if (error) {
            console.log(`Error: ${error}`);
        } else {
            console.log(`Listening on https://example.com/path);
        }
    });
} else {
    app.listen(PORT, (error) => {
        if (error) {
            console.log(`Error: ${error}`);
        } else {
            console.log(`HTTP server running on https://example.com/path);
        }
    });
}
