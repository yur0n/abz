export class ValidationError extends Error {
  constructor(fails, code = 422) {
    super();
    this.data = {
      success: false,
      message: 'Validation failed',
      fails
    };
    this.code = code;
  }
}

export class TokenError extends Error {
  constructor(message, code = 401) {
    super();
    this.data = {
      success: false,
      message,
    };
    this.code = code;
  }
}

export default (error, req, res, next) => {
  if (
    error instanceof ValidationError
    || error instanceof TokenError
    ) return res.status(error.code).json(error.data);

  console.error(error);
  res.status(500).json({ success: false, message: 'Server error.' });
}
