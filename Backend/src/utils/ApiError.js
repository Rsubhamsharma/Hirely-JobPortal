class ApiError extends Error {
  // Accepts (statusCode, message, data, errors, stack)
  constructor(
    statusCode = 500,
    message = "Something went wrong",
    data = null,
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = false;
    this.errors = errors;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
