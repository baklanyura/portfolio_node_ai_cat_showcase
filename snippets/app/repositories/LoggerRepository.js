import winston from "winston";
const {combine, timestamp, printf} = winston.format;

export class LoggerRepository {
    constructor() {}

    createLogger(level, file) {
        const currentDate = new Date().toISOString().split('T')[0];
        return winston.createLogger({
            level: level,
            format: combine(
                timestamp(),
                printf((info) => `[${info.timestamp} ${info.level}]/[${file}:${info.line}]: ${info.message}`)
            ),
            transports: [
                new winston.transports.File({
                    filename: `./storage/app/log/${level}/${currentDate}.log`,
                    level: level
                })
            ]
        });
    }

    static log(level, message) {
        const { file, line } = LoggerRepository.getCallerInfo();
        const loggerRepo = new LoggerRepository();
        const logger = loggerRepo.createLogger(level, file);
        logger.log({ level: level, message: message, line: line });
    }

    static infoLogger(message) {
        LoggerRepository.log('info', message);
    }

    static errorLogger(message) {
        LoggerRepository.log('error', message);
    }

    static getCallerInfo() {
        const error = new Error();
        const stack = error.stack.split("\n");
        let callerLine = 'unknown';
        for (let i = 0; i < stack.length; i++) {
            if (stack[i].includes('LoggerRepository.infoLogger')
                || stack[i].includes('LoggerRepository.errorLogger')
            ) {
                callerLine = stack[i + 1];
                break;
            }
        }

        const [, file = 'unknown', line = 'unknown'] = /\((.*):(\d+):\d+\)$/.exec(callerLine) || [];

        return { file, line };
    }
}