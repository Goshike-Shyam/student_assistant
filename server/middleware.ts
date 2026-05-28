import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: AppError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
};

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const validateRequest = (schema: Record<string, any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { body, params, query } = req;
    const toValidate = { ...body, ...params, ...query };

    for (const [key, value] of Object.entries(schema)) {
      if (value.required && !toValidate[key]) {
        throw new AppError(400, `Missing required field: ${key}`);
      }
    }

    next();
  };
};
