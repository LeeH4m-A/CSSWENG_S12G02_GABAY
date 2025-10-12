/* TODO: add an error message div to forms and do fetch/ajax, so the app feels smoother. */
/* For sprint 1's sake, we redirect using ?= , which in my opinion is bad */


/* Redirect is inside  check_form_errors.js, can be used by other forms like function */

import express from "express";
import argon2 from "argon2";
import { body } from "express-validator";

import check_form_errors from "../middlewares/check_form_errors.js";

import { userModel } from "../model/model.js";
import letUserIn from "../controllers/let_user_in.js";

const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.get('/', (req, res) => {
    res.render('login', {
        title: 'Login Page',
        failed: req.query.failed,
    });
});


// POST /login
router.post(
    "/",
    // Validate user exists
    body("email").custom(async (email, { req }) => {
        const user = await userModel.findOne({ email });

        if (!user){
            throw new Error("User does not exist");
        } 
        /*
        if (user.deleted){
            throw new Error("User has been deleted");
        }
        */
       
        /* Genuinely I have no idea how to best pass this along the chain so lol */
        req.body.found_user = user;
        return true;
    }),

    /* Ensure the password is valid */
    body("password").custom(async (password, { req }) => {
        if (!req.body.found_user) {
            return false; /* Skip entirely if user not found */
        }

        const valid = await argon2.verify(req.body.found_user.password, password);

        if (!valid) {
            throw new Error("Invalid password");
        } else {
            return true;
        }
    }),

    check_form_errors, 

    /* Data should be VALID by this point */

    /* Attach user ID to session */
    letUserIn
);

export default router;
