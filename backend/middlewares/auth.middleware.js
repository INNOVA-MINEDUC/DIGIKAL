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

  // opcional: guardar token para usar luego
  req.token = token;

  next();
};


