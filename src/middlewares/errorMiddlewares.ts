import type { NextFunction, Request, Response } from 'express';

export interface MessageResponse {
  message: string;
}

export interface ErrorResponse extends MessageResponse {
  stack?: string;
}

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  const error = new Error(`Something Went Wrong`);

  next(error);

  // logging??
  return;
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response<ErrorResponse>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);

  const resp: ErrorResponse = {
    message: '',
  };

  if (
    // Check error related for request body, (bodyparsererrors)
    [
      'encoding.unsupported',
      'request.aborted',
      'entity.too.large',
      'request.size.invalid',
      'stream.encoding.set',
      'parameters.too.many',
      'charset.unsupported',
      'encoding.unsupported',
      'entity.verify.failed',
      'entity.parse.failed',
    ].indexOf(err['type']) !== -1
  ) {
    resp.message = 'Something wrong in request';
  } else {
    resp.message = 'Something went wrong';
  }

  if (process.env.NODE_ENV !== 'production') {
    resp.stack = err.stack;
  }

  res.json(resp);

  // logging??
  return;
}
