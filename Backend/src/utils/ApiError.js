class ApiError extends Error {
  constructor(
    message = "Something went wrong",
    statusCode,
    stack = "",
    errors = []
  ) {
    this.message = message;
    this.statusCode = statusCode;
    super(message);
    this.data = null;
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
