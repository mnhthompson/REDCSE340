const reviewModel = require("../models/review-model");
const utilities = require("../utilities");

const reviewCont = {};

// View All Reviews (Account)

reviewCont.buildAccountReviews = utilities.handleErrors(async (req, res) => {
  const account = res.locals.accountData;
  if (!account) {
    req.flash("notice", "You must be logged in to view your reviews.");
    return res.redirect("/account/login");
  }

  const nav = await utilities.getNav();
  const reviews = await reviewModel.getReviewsByAccountId(account.account_id);

  return res.render("reviews/account", {
    title: "Your Reviews",
    nav,
    reviews,
    loggedIn: 1
  });
});


// Show Edit Review Form

reviewCont.buildEditReview = utilities.handleErrors(async (req, res) => {
  const reviewId = Number(req.params.reviewId);
  const account = res.locals.accountData;

  if (!account) {
    req.flash("notice", "You must be logged in to edit reviews.");
    return res.redirect("/account/login");
  }

  const nav = await utilities.getNav();
  const review = await reviewModel.getReviewById(reviewId);

  if (!review || review.account_id !== account.account_id) {
    req.flash("notice", "You cant edit this review.");
    return res.redirect("/reviews/account");
  }

  return res.render("account/editReview", {
    title: "Edit Review",
    nav,
    review,
    loggedIn: 1
  });
});


//Update 

reviewCont.updateReview = utilities.handleErrors(async (req, res) => {
  const { reviewId, review_text, inv_id } = req.body;
  const account = res.locals.accountData;

  if (!account) {
    req.flash("notice", "You must be logged in to update a review.");
    return res.redirect(`/inv/detail/${inv_id}`);
  }

  if (!review_text || review_text.trim() === "") {
    req.flash("notice", "Review cant be empty.");
    return res.redirect(`/reviews/edit/${reviewId}`);
  }

  await reviewModel.updateReview(reviewId, review_text);

  req.flash("notice", "Review updated successfully.");
  return res.redirect("/reviews/account");
});


// Delete 

reviewCont.deleteReview = utilities.handleErrors(async (req, res) => {
  const reviewId = Number(req.params.reviewId);
  const account = res.locals.accountData;

  if (!account) {
    req.flash("notice", "You must be logged in to delete a review.");
    return res.redirect("/account/login");
  }

  const review = await reviewModel.getReviewById(reviewId);

  if (!review || review.account_id !== account.account_id) {
    req.flash("notice", "You cant delete this review.");
    return res.redirect("/reviews/account");
  }

  await reviewModel.deleteReview(reviewId);

  req.flash("notice", "Review deleted.");
  return res.redirect("/reviews/account");
});


// Add 

reviewCont.addReview = utilities.handleErrors(async (req, res) => {
  const { review_text, inv_id } = req.body;
  const account = res.locals.accountData;

  if (!account) {
    req.flash("notice", "You must be logged in to add a review.");
    return res.redirect(`/inv/detail/${inv_id}`);
  }

  if (!review_text || review_text.trim() === "") {
    req.flash("notice", "Review cant be empty.");
    return res.redirect(`/inv/detail/${inv_id}`);
  }

  await reviewModel.addReview({
    review_text,
    inv_id,
    account_id: account.account_id
  });

  req.flash("notice", "Review added.");
  return res.redirect(`/inv/detail/${inv_id}`);
});

module.exports = reviewCont;
