const express = require("express");
const products = require("./routes/product");
const auth = require("./routes/auth");
const order = require("./routes/order");
const errorHandler = require("./middlewares/error");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api/v1/", products);
app.use("/api/v1/", auth);
app.use("/api/v1/", order);
app.use(errorHandler);

module.exports = app;
