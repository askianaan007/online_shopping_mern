const connectDatabase = require("../config/database");
const products = require("../data/products.json");
const Product = require("../models/productModel");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: "backend/config/config.env" });
connectDatabase();

const seedProducts = async () => {
  try {
    await Product.deleteMany();
    console.log("all data cleared");
    await Product.insertMany(products);
    console.log("products added successfully");
  } catch (error) {
    console.log(error.message);
  }
  process.exit();
};
seedProducts();
