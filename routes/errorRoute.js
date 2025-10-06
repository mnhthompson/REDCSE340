const express = require("express");
const router = new express.Router();
const ErrorController = require("../controllers/errorController");
const utilities = require("../utilities");

router.use("/", utilities.handleErrors(async (req, res, next) => {
    // throw new Error("intentional error") // Comment this line to allow controller to cause the error
    next();
}));

router.get("/error", utilities.handleErrors(ErrorController.causeError));

module.exports = router;