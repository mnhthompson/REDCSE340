const reviewModel = require("../models/review-model");
const utilities = require("../utilities");
const reviewCont = {};

// Display all reviews in Account Admin /
reviewCont.buildAccountReviews = utilities.handleErrors(async (req, res) => {
  const accountId = req.session.user.account_id;
  const nav = await utilities.getNav();
  const reviews = await reviewModel.getReviewsByAccountId(accountId);

  res.render("account/adminReviews", {
    title: "Your Reviews",
    nav,
    reviews,
    loggedIn: res.locals.loggedin || 0,
  });
});

//  Build edit review form 
reviewCont.buildEditReview = utilities.handleErrors(async (req, res) => {
  const reviewId = parseInt(req.params.reviewId);
  const accountId = req.session.user.account_id;
  const nav = await utilities.getNav();

  const review = await reviewModel.getReviewById(reviewId);

  if (!review || review.account_id !== accountId) {
    req.flash("notice", "You cant edit this review.");
    return res.redirect("/reviews/account");
  }

  res.render("account/editReview", {
    title: "Edit Review",
    nav,
    review,
    loggedIn: res.locals.loggedin || 0,
  });
});

//  Update  

reviewCont.updateReview = utilities.handleErrors(async (req, res) => {
  const { reviewId, review_text } = req.body;
  const accountId = req.session.user.account_id;

  if (!review_text || review_text.trim() === "") {
    req.flash("notice", "Review cant be empty.");
    return res.redirect(`/reviews/edit/${reviewId}`);
  }

  await reviewModel.updateReview(reviewId, review_text);
  req.flash("notice", "Review updated");
  res.redirect("/reviews/account");
});

//  Delete 
reviewCont.deleteReview = utilities.handleErrors(async (req, res) => {
  const reviewId = parseInt(req.params.reviewId);
  const accountId = req.session.user.account_id;

  const review = await reviewModel.getReviewById(reviewId);
  if (!review || review.account_id !== accountId) {
    req.flash("notice", "You cant delete this review.");
    return res.redirect("/reviews/account");
  }

  await reviewModel.deleteReview(reviewId);
  req.flash("notice", "Review deleted");
  res.redirect("/reviews/account");
});

//  Add
reviewCont.addReview = utilities.handleErrors(async (req, res) => {
  const { review_text, inv_id } = req.body;
  const account = req.session.user;

  if (!review_text || review_text.trim() === "") {
    req.flash("notice", "Review cant be empty.");
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
