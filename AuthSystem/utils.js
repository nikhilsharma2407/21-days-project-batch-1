const sanitizeUserData = (user) => {
  if (user) {
    const { password, ...userData } = user;

    return userData;
  }
};

module.exports = {
  sanitizeUserData,
};
