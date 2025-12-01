const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}


/** single listing element */

Util.buildItemListing = async function (data, reviews = [], account = null, pendingReview = null) {
  
  let listingHTML = '';

  if (data) {
    listingHTML = `
      <section class="car-listing">
        <img src="${data.inv_image}" alt="${data.inv_make} ${data.inv_model}">
        <div class="car-information">
          <div>
            <h2>${data.inv_year} ${data.inv_make} ${data.inv_model}</h2>
          </div>
          <div>
            ${Number.parseFloat(data.inv_price).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </div>
          <div class="description">
            <p>${data.inv_description}</p>
            <dl>
              <dt>MILEAGE</dt>
              <dd>${data.inv_miles.toLocaleString('en-US')}</dd>
              <dt>COLOR</dt>
              <dd>${data.inv_color}</dd>
              <dt>CLASS</dt>
              <dd>${data.classification_name}</dd>
            </dl>
          </div>
        </div>

        <!-- Reviews toggle button -->
            <button type="button" class="btn btn-outline-primary btn-sm mb-3" 
              onclick="document.getElementById('reviews-section').classList.toggle('d-none')">
              ${reviews.length ? `Reviews (${reviews.length})` : 'Reviews'}
            </button>

        <!-- Reviews section -->
        <section id="reviews-section" class="mt-3 d-none" style="background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
          <h3 style="margin-top: 0; margin-bottom: 15px;">Reviews</h3>

          ${reviews && reviews.length
            ? reviews
                .sort((a, b) => new Date(b.review_date) - new Date(a.review_date))
                .map(r => {
                  const firstInitial = r.account_firstname ? r.account_firstname.charAt(0) : '';
                  const lastNoSpaces = r.account_lastname ? r.account_lastname.replace(/\s+/g, '') : '';
                  const screenName = firstInitial + lastNoSpaces;
                  return `
                    <article class="review card mb-3 p-3" style="background-color: #e9ecef; border: none;">
                      <div class="review-meta small text-muted">
                        <strong>${screenName}</strong> — ${new Date(r.review_date).toLocaleString()}
                      </div>
                      <div class="review-text mt-2">${r.review_text}</div>
                    </article>
                  `;
                })
                .join('')
            : `<p>No reviews yet.</p>`}

          ${account
                  ? `<form id="addReviewForm" action="/reviews/add" method="POST" class="mt-4">
                  <input type="hidden" name="inv_id" value="${data.inv_id}">
                  <input type="hidden" name="account_id" value="${account.account_id}">

                  <!-- Label on top -->
                  <div class="mb-3">
                  <label for="review_text" class="form-label"><strong>Your Review:</strong></label>
                  <textarea id="review_text" name="review_text" rows="4" class="form-control" required>${pendingReview ? pendingReview.review_text : ''}</textarea>
                  </div>

                  <!-- Button centered below textarea -->
                  <div class="text-center">
                  <button type="submit" class="btn btn-primary mt-2">Submit Review</button>
                  </div>
                  </form>
`
            : `<p class="mt-3">You can add a review by <a href="/account/login">logging in</a>.</p>`}
        </section>
      </section>
    `;
  } else {
    listingHTML = `<p>Sorry, no vehicles could be found.</p>`;
  }

  return listingHTML;
};


Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList =
    '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected ";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};

Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);



/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

module.exports = Util