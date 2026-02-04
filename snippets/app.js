import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import indexRouter from './routes/index.js';
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const {NODE_ENV} = process.env;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
const corsOptions = {
    origin: '*',
    methods: 'POST,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Referrer-Policy']
};
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = NODE_ENV === 'LOCAL' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

export {app};
