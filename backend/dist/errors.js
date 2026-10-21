export class HttpError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'HttpError';
    }
}
export function errorMessage(error) {
    return error instanceof Error ? error.message : 'Unknown error';
}
