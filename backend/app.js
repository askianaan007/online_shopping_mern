const express = require("express");
const products = require("./routes/product");
const auth = require("./routes/auth");
const errorHandler = require("./middlewares/error");

const app = express();

app.use(express.json());
app.use("/api/v1/", products);
app.use("/api/v1/", auth);
app.use(errorHandler);

module.exports = app;
