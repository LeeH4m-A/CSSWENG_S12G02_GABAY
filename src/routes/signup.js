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
    // Validate name
    body("name").trim().notEmpty().withMessage("Name is required."),

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
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),

    // idk hash password middleware?, reusable by change pass too..

    check_form_errors, // middleware to handle validation errors

    /* Data should be VALID by this point */

    async (req, res, next) => {
        try {
            const { name, email, password } = req.body;

            // Hash password
            const hashedPassword = await argon2.hash(password);

            // Create new user
            const newUser = await userModel.create({
                name,
                email,
                password: hashedPassword,
                role: "Member",
                userIcon:
                    "https://res.cloudinary.com/dof7fh2cj/image/upload/v1719207075/hagwnwmxbpkpczzyh46g.jpg",
            });

            req.body.found_user = newUser; 
            next();
            
        } catch (err) {
            console.error(err);
        }
    },

    /* By this point, found_user is the newly-created user (or null if some weird error happened */

    /* Attach user ID to session */

    letUserIn
);

export default router;