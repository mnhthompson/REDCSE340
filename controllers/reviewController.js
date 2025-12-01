const reviewModel = require("../models/review-model");
const utilities = require("../utilities/");
const reviewCont = {};

/* ***************************
 * Display all reviews for a user in Account Admin
 * ************************** */
reviewCont.buildAccountReviews = async function (req, res, next) {
  const accountId = req.session.user.account_id;
  const nav = await utilities.getNav();
  try {
    const reviews = await reviewModel.getReviewsByAccountId(accountId);
    res.render("account/adminReviews", {
      title: "Your Reviews",
      nav,
      reviews,
    });
  } catch (error) {
    next(error);const reviewModel = require("../models/review-model");
const utilities = require("../utilities");
const reviewCont = {};


/* ***************************
 * Display all reviews for a user in Account Admin
 * ************************** */
reviewCont.buildAccountReviews = utilities.handleErrors(async (req, res, next) => {
  const accountId = req.session.user.account_id;
  const nav = await utilities.getNav();
  const reviews = await reviewModel.getReviewsByAccountId(accountId);

  res.render("account/adminReviews", {
    title: "Your Reviews",
    nav,
    reviews,
  });
});

/* ***************************
 * Build review edit form
 * ************************** */
reviewCont.buildEditReview = utilities.handleErrors(async (req, res, next) => {
  const reviewId = parseInt(req.params.reviewId);
  const accountId = req.session.user.account_id;
  const nav = await utilities.getNav();

  const review = await reviewModel.getReviewById(reviewId);

  if (!review || review.account_id !== accountId) {
    req.flash("notice", "You cant edit this review.");
    return res.redirect("/account/admin");
  }

  res.render("account/editReview", {
    title: "Edit Review",
    nav,
    review,
  });
});

/* ***************************
 * Update review text
 * ************************** */
reviewCont.updateReview = utilities.handleErrors(async (req, res, next) => {
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

/* ***************************
 * Delete a review
 * ************************** */
reviewCont.deleteReview = utilities.handleErrors(async (req, res, next) => {
  const reviewId = parseInt(req.params.reviewId);
  const accountId = req.session.user.account_id;

  const review = await reviewModel.getReviewById(reviewId);
  if (!review || review.account_id !== accountId) {
    req.flash("notice", "You cant delete this review.");
    return res.redirect("/account/admin");
  }

  await reviewModel.deleteReview(reviewId);
  req.flash("notice", "Review deleted");
  res.redirect("/account/admin");
});

/* ***************************
 * Add a new review
 * ************************** */
reviewCont.addReview = utilities.handleErrors(async (req, res, next) => {
  const { text, inventoryId } = req.body;
  const account = req.session.user;

  if (!text || text.trim() === "") {
    req.flash("notice", "Review cant be empty.");
    return res.redirect(`/inv/${inventoryId}`);
  }

  const screenName = reviewCont.getScreenName(account);

  await reviewModel.addReview({
    text,
    inventory_id: inventoryId,
    account_id: account.account_id,
    screen_name: screenName,
  });

  req.flash("notice", "Review added");
  res.redirect(`/inv/${inventoryId}`);
});

module.exports = reviewCont;

  }
};

/* ***************************
 * Build review edit form
 * ************************** */
reviewCont.buildEditReview = async function (req, res, next) {
  const reviewId = parseInt(req.params.reviewId);
  const nav = await utilities.getNav();
  const accountId = req.session.user.account_id;

  try {
    const reviews = await reviewModel.getReviewsByAccountId(accountId);
    const review = reviews.find((r) => r.review_id === reviewId);
    if (!review) {
      req.flash("notice", "Review not found or you cannot edit this review.");
      return res.redirect("/account/admin");
    }
    res.render("account/editReview", {
      title: "Edit Review",
      nav,
      review,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Update review text
 * ************************** */
reviewCont.updateReview = async function (req, res, next) {
  const { reviewId, reviewText } = req.body;
  const accountId = req.session.user.account_id;

  if (!reviewText || reviewText.trim().length === 0) {
    req.flash("notice", "Review cant be empty.");
    return res.redirect(`/reviews/edit/${reviewId}`);
  }
  try {
    await reviewModel.updateReview(reviewId, reviewText);
    req.flash("notice", "Review updated");
    res.redirect("/account/admin");
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Delete a review
 * ************************** */
reviewCont.deleteReview = async function (req, res, next) {
  const reviewId = parseInt(req.params.reviewId);
  const accountId = req.session.user.account_id;
  try {
    await reviewModel.deleteReview(reviewId);
    req.flash("notice", "Review deleted");
    res.redirect("/account/admin");
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Add a new review
 * ************************** */
reviewCont.addReview = async function (req, res, next) {
  const { text, inventoryId } = req.body;
  const accountId = req.session.user.account_id;

  if (!text || text.trim().length === 0) {
    req.flash("notice", "Review cannot be empty.");
    return res.redirect(`/inv/${inventoryId}`);
  }
  try {
    await reviewModel.addReview(text, inventoryId, accountId);
    req.flash("notice", "Review added successfully.");
    res.redirect(`/inv/${inventoryId}`);
  } catch (error) {
    next(error);
  }
};

module.exports = reviewCont;
