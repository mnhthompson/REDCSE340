const reviewModel = require("../models/review-model");
const utilities = require("../utilities");
const reviewCont = {};

// Display all reviews for a user in Account Admin
reviewCont.buildAccountReviews = utilities.handleErrors(async (req, res) => {
  const accountId = req.session.user.account_id;
  const nav = await utilities.getNav();
  const reviews = await reviewModel.getReviewsByAccountId(accountId);

  res.render("account/adminReviews", {
    title: "Your Reviews",
    nav,
    reviews,
  });
});

// Build edit form
reviewCont.buildEditReview = utilities.handleErrors(async (req, res) => {
  const reviewId = parseInt(req.params.reviewId);
  const accountId = req.session.user.account_id;
  const nav = await utilities.getNav();

  const review = await reviewModel.getReviewById(reviewId);

  if (!review || review.account_id !== accountId) {
    req.flash("notice", "You can't edit this review.");
    return res.redirect("/account/admin");
  }

  res.render("account/editReview", {
    title: "Edit Review",
    nav,
    review,
  });
});

// Update text
reviewCont.updateReview = utilities.handleErrors(async (req, res) => {
  const { reviewId, reviewText } = req.body;
  const accountId = req.session.user.account_id;

  if (!reviewText || reviewText.trim() === "") {
    req.flash("notice", "Review cannot be empty.");
    return res.redirect(`/reviews/edit/${reviewId}`);
  }

  await reviewModel.updateReview(reviewId, reviewText);
  req.flash("notice", "Review updated");
  res.redirect("/account/admin");
});

// Delete 
reviewCont.deleteReview = utilities.handleErrors(async (req, res) => {
  const reviewId = parseInt(req.params.reviewId);
  const accountId = req.session.user.account_id;

  const review = await reviewModel.getReviewById(reviewId);
  if (!review || review.account_id !== accountId) {
    req.flash("notice", "You can't delete this review.");
    return res.redirect("/account/admin");
  }

  await reviewModel.deleteReview(reviewId);
  req.flash("notice", "Review deleted");
  res.redirect("/account/admin");
});

// Add 
reviewCont.addReview = utilities.handleErrors(async (req, res) => {
  const { text, inventoryId } = req.body;
  const account = req.session.user;

  if (!text || text.trim() === "") {
    req.flash("notice", "Review cannot be empty.");
    return res.redirect(`/inv/${inventoryId}`);
  }

  await reviewModel.addReview({
    text,
    inventory_id: inventoryId,
    account_id: account.account_id,
    screen_name: account.screen_name, 
  });

  req.flash("notice", "Review added");
  res.redirect(`/inv/${inventoryId}`);
});

module.exports = reviewCont;
