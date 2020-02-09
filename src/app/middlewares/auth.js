import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/auth';
import * as Error from '../util/Error';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return Error.Unauthorized(res, 'Token não enviado.');
  }
  const [, token] = authHeader.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);
    req.userId = decoded.id;
    req.isAdmin = decoded.is_admin || false;
    if (req.url === '/recipient' && !req.isAdmin) {
      return Error.Unauthorized(res, 'Operação não permitida.');
    }

    return next();
  } catch (error) {
    return Error.Unauthorized(res, 'Token inválido.');
  }
};
