const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        error: true,
        message: "Utilisateur non authentifié",
        statusCode: 401,
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: true,
        message: "Accès refusé. Vous n'avez pas les permissions nécessaires.",
        statusCode: 403,
      });
    }

    next();
  };
};

module.exports = authorizeRoles;
