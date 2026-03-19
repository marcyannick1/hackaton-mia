require("dotenv").config();
require("dotenv").config({ path: "../.env" });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database.config");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_, res) => {
  return res.status(200).json({
    message: "Bienvenue sur l'api du hackaton",
  });
});

app.use("/auth", require("./src/routes/auth.routes"));
app.use("/users", require("./src/routes/user.routes"));
app.use("/documents", require("./src/routes/document.routes"));
app.use("/companies", require("./src/routes/company.routes"));

const PORT = process.env.API_PORT || 3000;

connectDB();

app.listen(PORT, () => {
  console.log(`API démarrée sur : http://localhost:${PORT}`);
});
