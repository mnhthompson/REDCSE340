// Needed Resources 
const express = require("express");
const router = new express.Router();
const reviewController = require("../controllers/reviewController");
const utilities = require("../utilities");
const reviewValidate = require("../utilities/review-validation"); // review-specific validation

// locks
router.use("/add", utilities.checkLogin);
router.use("/edit/:reviewId", utilities.checkLogin);
router.use("/update", utilities.checkLogin);
router.use("/delete/:reviewId", utilities.checkLogin);

// Add 
router.post(
  "/add",
  reviewValidate.reviewRules(),
  reviewValidate.checkReviewData,
  utilities.handleErrors(reviewController.addReview)
);

// Edit 
router.get(
  "/edit/:reviewId",
  utilities.handleErrors(reviewController.buildEditReview)
);

// Update 
router.post(
  "/update",
  reviewValidate.reviewRules(),
  reviewValidate.checkReviewData,
  utilities.handleErrors(reviewController.updateReview)
);

// Delete 
router.post(
  "/delete/:reviewId",
  utilities.handleErrors(reviewController.deleteReview)
);

// Get all reviews for a specific inventory item (for detail view)
router.get(
  "/inventory/:invId",
  utilities.handleErrors(reviewController.getReviewsByInventory)
);

// Get all reviews by the logged-in account (for account admin)
router.get(
  "/account",
  utilities.checkLogin,
  utilities.handleErrors(reviewController.getReviewsByAccount)
);

module.exports = router;
