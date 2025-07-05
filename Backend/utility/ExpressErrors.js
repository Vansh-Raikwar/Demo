class ExpressError extends Error {
    constructor(message, statusCode) {
        super(message); // Call the parent Error class constructor
        this.statusCode = statusCode; // Set the status code
    }
}
module.exports=ExpressError;