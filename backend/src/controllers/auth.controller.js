const authService = require("../services/auth.service");

exports.SignUp = async (req, res) => {
  const { name, email, password, company } = req.body;

  const result = await authService.SignUp({ name, email, password, company });
  return res.status(result.statusCode).json(result);
};

exports.SignIn = async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.SignIn({ email, password });
  return res.status(result.statusCode).json(result);
};

exports.GetMe = async (req, res) => {
  const userId = req.user.userId;
  const result = await authService.GetMe(userId);
  return res.status(result.statusCode).json(result);
};
