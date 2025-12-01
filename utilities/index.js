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

Util.buildItemListing = async function(data, reviews = [], account = null, pendingReview = null) {
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
            ${Number.parseFloat(data.inv_price).toLocaleString('en-US', { style: 'currency', currency: 'USD'})}
          </div>
          <div class="description">
            <p>${data.inv_description}</p>
            <dl>
              <dt>MILEAGE</dt>
              <dd>${data.inv_miles.toLocaleString('en-US', { style: 'decimal'})}</dd>
              <dt>COLOR</dt>
              <dd>${data.inv_color}</dd>
              <dt>CLASS</dt>
              <dd>${data.classification_name}</dd>
            </dl>
          </div>
        </div>

        <div class="reviews-wrapper mt-2">
          <button type="button" class="btn btn-secondary mb-2"
                  onclick="this.closest('.reviews-wrapper').querySelector('#reviews').classList.toggle('d-none')">
            Reviews (${reviews ? reviews.length : 0})
          </button>

          <section id="reviews" class="d-none">
    `;

    // Build reviews HTML
    
    if (!reviews || reviews.length === 0) {
      listingHTML += `<p>No reviews yet.</p>`;
    } else {
      reviews.forEach(r => {
        const firstInitial = r.account_firstname ? r.account_firstname.charAt(0) : '';
        const lastNoSpaces = r.account_lastname ? r.account_lastname.replace(/\s+/g,'') : '';
        const screenName = firstInitial + lastNoSpaces;
        listingHTML += `
          <article class="review card mb-3 p-3">
            <div class="review-meta small text-muted">
              <strong>${screenName}</strong> — ${new Date(r.review_date).toLocaleString()}
            </div>
            <div class="review-text mt-2">${r.review_text}</div>
          </article>
        `;
      });
    }

    // Build review form if logged in

    if (account) {
      const screenName = (account.first_name ? account.first_name.charAt(0) : '') +
                         (account.last_name ? account.last_name.replace(/\s+/g,'') : '');
      listingHTML += `
        <form id="addReviewForm" action="/reviews/add" method="POST" class="mt-3">
          <div class="mb-2">
            <label for="screen_name" class="form-label">Screen name</label>
            <input type="text" id="screen_name" class="form-control" value="${screenName}" readonly>
          </div>
          <div class="mb-2">
            <label for="review_text" class="form-label">Your review</label>
            <textarea id="review_text" name="review_text" rows="4" class="form-control" required>${
              pendingReview ? pendingReview.review_text : ''
            }</textarea>
          </div>
          <input type="hidden" name="inv_id" value="${data.inv_id}">
          <button type="submit" class="btn btn-primary btn-sm">Submit Review</button>
        </form>
      `;
    } else {
      listingHTML += `<p class="mt-3">You can add a review by <a href="/account/login">logging in</a>.</p>`;
    }

    listingHTML += `
          </section> 
        </div> 
      </section> 
    `;
  } else {
    listingHTML = `<p>Sorry, no vehicles could be found.</p>`;
  }

  return listingHTML;
}


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