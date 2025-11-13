import express from "express";
import argon2 from "argon2";
import { body } from "express-validator";

import check_form_errors from "../middlewares/check_form_errors.js";

import { userModel } from "../model/model.js";
import letUserIn from "../controllers/let_user_in.js";

const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// server to register new account
router.get('/', (req, res) => {
    res.render('signup',{
        title: 'Registration Page',
        emailUsed: req.query.emailUsed,
    });
});


// POST /signup
router.post(
    "/",
    // Validate first name
    body("first_name").trim().notEmpty().withMessage("First name is required."),
    
    // Validate last name
    body("last_name").trim().notEmpty().withMessage("Last name is required."),

    // Validate gender
    body("gender").notEmpty().withMessage("Gender is required."),

    // Validate contact number
    body("contact_no")
        .isLength({ min: 11, max: 11 }).withMessage("Contact number must be 11 digits.")
        .isNumeric().withMessage("Contact number must contain only numbers."),

    // Validate birthday
    body("birthday").isDate().withMessage("Valid birthday is required."),

    // Validate city
    body("city").trim().notEmpty().withMessage("City is required."),

    // Validate barangay
    body("barangay").trim().notEmpty().withMessage("Barangay is required."),

    // Validate email and uniqueness
    body("email")
        .isEmail().withMessage("Invalid email address.")
        .custom(async (email, { req }) => {
            const user = await userModel.findOne({ email });
            if (user) {
                throw new Error("Email has already been used");
            }
            return true;
        }),

    // Validate password
    body("password")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),

    // Validate confirm password
    body("confirm_password")
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords do not match");
            }
            return true;
        }),

    check_form_errors, // middleware to handle validation errors

    /* Data should be VALID by this point */

    async (req, res, next) => {
        try {
            const { first_name, middle_name, last_name, suffix, gender, contact_no, birthday, city, barangay, email, password } = req.body;

            // Hash password
            const hashedPassword = await argon2.hash(password);

            // Create full name from components
            const name = `${first_name}${middle_name ? ` ${middle_name}` : ''} ${last_name}${suffix ? ` ${suffix}` : ''}`.trim();

            // Create new user
            const newUser = await userModel.create({
                name,
                first_name,
                middle_name: middle_name || null,
                last_name,
                suffix: suffix || null,
                gender,
                contactNo: contact_no,
                birthday,
                location: {
                    city,
                    barangay
                },
                email,
                password: hashedPassword,
                role: "Member",
                userIcon: {
                    contentType: null,
                    data: null,
                },
            });

            req.body.found_user = newUser; 
            next();
            
        } catch (err) {
            console.error("Error creating user:", err);
            next(err);
        }
    },

    /* By this point, found_user is the newly-created user (or null if some weird error happened */

    /* Attach user ID to session */

    letUserIn
);


export default router;