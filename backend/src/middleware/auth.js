const jwt = require('jsonwebtoken');
const db = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'libreria-gael-secret-dev';

/**
 * Middleware: verifica JWT y adjunta user a req
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token no proporcionado' });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
  }
}

/**
 * Middleware: requiere rol admin o empleado
 */
function requireStaff(req, res, next) {
  if (req.userRole === 'administrador' || req.userRole === 'empleado') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Acceso denegado' });
}

/**
 * Middleware: requiere rol administrador
 */
function requireAdmin(req, res, next) {
  if (req.userRole === 'administrador') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Solo administradores' });
}

module.exports = {
  authenticate,
  requireStaff,
  requireAdmin,
  JWT_SECRET,
};
