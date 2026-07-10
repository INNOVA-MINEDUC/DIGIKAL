import jwt from 'jsonwebtoken'

export const authMiddleware = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "Acceso denegado — token requerido"
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Token inválido"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

    req.token = token;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Token inválido o expirado"
    });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      error: "Acceso denegado — se requiere rol de administrador"
    });
  }

  next();
};
