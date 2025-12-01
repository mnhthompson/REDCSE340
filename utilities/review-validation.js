const utilities = require("../utilities");
const { body, validationResult } = require("express-validator");
const validate = {};

/* Add / Update Review Data Validation Rules  */
validate.reviewRules = () => {
  return [
    body("review_text")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 5 })
      .withMessage("Review must be at least 5 characters long."),

    body("inv_id")
      .trim()
      .escape()
      .notEmpty()
      .isInt()
      .withMessage("Inventory ID is required and must be a number."),

    body("account_id")
      .trim()
      .escape()
      .notEmpty()
      .isInt()
      .withMessage("Account ID is required and must be a number."),
  ];
};

/*  Check review data and return errors */
validate.checkReviewData = async (req, res, next) => {
  const { review_text, inv_id } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/detail", {
      errors,
      title: "Submit Review",
      nav,
      review_text,
      inv_id,
      loggedIn: res.locals.loggedin || 0,
    });
    return;
  }
  next();
};

module.exports = validate;
