const authService = require("../services/auth.service");

exports.SignUp = async (req, res) => {
  const { username, email, password } = req.body;

  const result = await authService.SignUp({ username, email, password });
  return res.status(result.statusCode).json(result);
};

exports.SignIn = async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.SignIn({ email, password });
  return res.status(result.statusCode).json(result);
};
