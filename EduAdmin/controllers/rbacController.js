const rbacController = (requiredRole) => {
  return (req, res, next) => {
    const userRole = res.locals.user.role;
    if (userRole !== requiredRole) {
      return res.status(403).send({ message: "Access denied!!!, Needs Admin access" });
    } else {
      next();
    }
  };
};

module.exports = rbacController;
