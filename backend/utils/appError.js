class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    this.isOperational = true;

    //console.log(err.stack); -> Check in Global error in file app.js
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
