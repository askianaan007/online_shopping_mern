const express = require("express");
const {
  getProducts,
  newProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  createReview,
  getReviews,
  deleteReview,
} = require("../controllers/productController");
const {
  isAuthenticatedUser,
  authorizeRoles,
} = require("../middlewares/authenticate");

const router = express.Router();

router.route("/products").get( getProducts);

router
  .route("/admin/product/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newProduct);

router
  .route("/product/:id")
  .get(getSingleProduct)
  .put(updateProduct)
  .delete(deleteProduct);

router
  .route("/review")
  .put(isAuthenticatedUser, createReview)
  .delete(isAuthenticatedUser, deleteReview);
router.route("/reviews").get(isAuthenticatedUser, getReviews);

module.exports = router;
