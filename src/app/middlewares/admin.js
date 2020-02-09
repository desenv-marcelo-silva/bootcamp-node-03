import * as Error from '../util/Error';

export default async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return Error.Unauthorized(res, 'Operação não permitida.');
    }

    return next();
  } catch (error) {
    return Error.Unauthorized(res, 'Token inválido.');
  }
};
