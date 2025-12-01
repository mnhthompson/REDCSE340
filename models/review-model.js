const pool = require("../database/")
const reviewModel = {};

/* Get all reviews for a specific account */
reviewModel.getReviewsByAccountId = async function (accountId) {
  try {
    const sql = `
      SELECT r.review_id, r.review_text, r.review_date, r.inv_id, i.inv_make, i.inv_model, i.inv_year
      FROM review r
      JOIN inventory i ON r.inv_id = i.inv_id
      WHERE r.account_id = $1
      ORDER BY r.review_date DESC
    `;
    const result = await pool.query(sql, [accountId]);
    return result.rows;
  } catch (error) {
    console.error("Error fetching account reviews:", error);
    throw error;
  }
};

/*  Get a single review by ID */
reviewModel.getReviewById = async function (reviewId) {
  try {
    const sql = `SELECT * FROM review WHERE review_id = $1`;
    const result = await pool.query(sql, [reviewId]);
    return result.rows[0];
  } catch (error) {
    console.error("Error fetching review:", error);
    throw error;
  }
};

/*  Update review text */
reviewModel.updateReview = async function (reviewId, reviewText) {
  try {
    const sql = `
      UPDATE review
      SET review_text = $1
      WHERE review_id = $2
      RETURNING *
    `;
    const result = await pool.query(sql, [reviewText, reviewId]);
    return result.rows[0];
  } catch (error) {
    console.error("Error updating review:", error);
    throw error;
  }
};

/*  Delete a review */
reviewModel.deleteReview = async function (reviewId) {
  try {
    const sql = `DELETE FROM review WHERE review_id = $1`;
    await pool.query(sql, [reviewId]);
    return true;
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
};

/*  Add a new review */
reviewModel.addReview = async function ({ review_text, inv_id, account_id }) {
  try {
    const sql = `
      INSERT INTO reviews (review_text, inv_id, account_id, review_date)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    const result = await pool.query(sql, [review_text, inv_id, account_id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error adding review:", error);
    throw error;
  }
};

/*  Get all reviews for an inventory item  */
reviewModel.getReviewsByInventoryId = async function (inv_id) {
  try {
    const sql = `
      SELECT r.review_id, r.review_text, r.review_date, r.account_id, a.account_firstname, a.account_lastname
      FROM review r
      JOIN account a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.review_date DESC
    `;
    const result = await pool.query(sql, [inv_id]);
    return result.rows;
  } catch (error) {
    console.error("Error fetching reviews for inventory:", error);
    throw error;
  }
};

module.exports = reviewModel;
