const errorHandler = (err,req,res,next)=> {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error"

    const response = {
        success : false,
        message
    }

    if (err.details) {
        response.errors = err.details
    }

    //  for debugging purpose
    console.error("Error", err)

    // Log the error (optional: include stack traces for debugging in development)
    if (process.env.NODE_ENV === "development") {
        console.error(err.stack);
    }

    return res.status(statusCode).json(response)
}

export default errorHandler;