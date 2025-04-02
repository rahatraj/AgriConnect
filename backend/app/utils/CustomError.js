class CustomError extends Error {
    constructor(message, statusCode, details = null){
        super(message)
        this.statusCode = statusCode
        this.details = details

        // Maintain proper stack trace for where the error was thrown
        Error.captureStackTrace(this, this.constructor);
    }
}

export default CustomError;