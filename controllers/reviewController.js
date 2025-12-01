const reviewModel = require("../models/review-model");
const utilities = require("../utilities");
const reviewCont = {};

// Display all reviews in Account Admin
reviewCont.buildAccountReviews = utilities.handleErrors(async (req, res) => {
  const account = res.locals.accountData;
  if (!account) {
    req.flash("notice", "You must be logged in to view your reviews.");
    return res.redirect("/account/login");
  }

  const nav = await utilities.getNav();
  const reviews = await reviewModel.getReviewsByAccountId(account.account_id);

  res.render("account/adminReviews", {
    title: "Your Reviews",
    nav,
    reviews,
    loggedIn: 1,
  });
});

// Build edit review form
reviewCont.buildEditReview = utilities.handleErrors(async (req, res) => {
  const reviewId = parseInt(req.params.reviewId);
  const account = res.locals.accountData;
  if (!account) {
    req.flash("notice", "You must be logged in to edit reviews.");
    return res.redirect("/account/login");
  }

  const nav = await utilities.getNav();
  const review = await reviewModel.getReviewById(reviewId);

  if (!review || review.account_id !== account.account_id) {
    req.flash("notice", "You can't edit this review.");
    return res.redirect("/reviews/account");
  }

  res.render("account/editReview", {
    title: "Edit Review",
    nav,
    review,
    loggedIn: 1,
  });
});

// Update 
reviewCont.updateReview = utilities.handleErrors(async (req, res) => {
  const { reviewId, review_text } = req.body;
  const account = res.locals.accountData;

  if (!account) {
    req.flash("notice", "You must be logged in to update a review.");
    return res.redirect(`/inv/${req.body.inv_id}`);
  }

  if (!review_text || review_text.trim() === "") {
    req.flash("notice", "Review can't be empty.");
    return res.redirect(`/reviews/edit/${reviewId}`);
  }

  await reviewModel.updateReview(reviewId, review_text);
  req.flash("notice", "Review updated");
  res.redirect("/reviews/account");
});

// Delete 
reviewCont.deleteReview = utilities.handleErrors(async (req, res) => {
  const reviewId = parseInt(req.params.reviewId);
  const account = res.locals.accountData;

  if (!account) {
    req.flash("notice", "You must be logged in to delete a review.");
    return res.redirect("/account/login");
  }

  const review = await reviewModel.getReviewById(reviewId);
  if (!review || review.account_id !== account.account_id) {
    req.flash("notice", "You can't delete this review.");
    return res.redirect("/reviews/account");
  }

  await reviewModel.deleteReview(reviewId);
  req.flash("notice", "Review deleted");
  res.redirect("/reviews/account");
});

// Add 
reviewCont.addReview = utilities.handleErrors(async (req, res) => {
  const { review_text, inv_id } = req.body;
  const account = res.locals.accountData;

  if (!account) {
    req.flash("notice", "You must be logged in to add a review.");
    return res.redirect(`/inv/${inv_id}`);
  }

  if (!review_text || review_text.trim() === "") {
    req.flash("notice", "Review can't be empty.");
    return res.redirect(`/inv/${inv_id}`);
  }

  await reviewModel.addReview({
    review_text,
    inv_id,
    account_id: account.account_id,
  });

  req.flash("notice", "Review added");
  res.redirect(`/inv/${inv_id}`);
});

module.exports = reviewCont;
