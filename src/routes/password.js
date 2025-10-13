import express from 'express';
import argon2 from 'argon2';
import { transporter } from "../helpers/mailer.js";
import { userModel } from '../model/model.js';

const router = express.Router();

// server to change new password
router.get('/', (req,resp) => {
    resp.render('forgotpassword',{
        layout: 'index',
        title: 'Forgot Password Page'
    });
});


// server to post user's new password into the database when forgotten
router.post('/', async (req, res) => {
    const { email, password, confirmPassword } = req.body;

    // check if passwords match
    if (password !== confirmPassword) {
        return res.redirect('/forgot_password?error=Passwords do not match');
    }

    try {

        // find user by email
        const user = await userModel.findOne({ email: email });

        if (!user) {
            return res.redirect('/forgot_password?error=Email not found');
        }

        // hash the new password
        const hashedPassword = await await argon2.hash(password);

        //send an email to the target user's email address
        var mailOptions = {
            from: 'brandon_jamil_so@dlsu.edu.ph',
            to: email,
            subject: 'Verification To Reset Password in GABAY HIV Database',
            text: "to confirm reset of password please use this link http://localhost:3000/verify-password?email="+email+"&pass="+hashedPassword
        };  

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
            console.log(error);
            } else {
            console.log('Email sent: ' + info.response);
            return res.redirect('/login?message=Email has been sent to verify password reset');
            }
        });

    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get('/verify_password', async (req,resp) => {

    //get query
    try {
        // get db collection
        const email = req.query.email;
        const newPassword = req.query.pass;

        // find user by email
        const user = await userModel.findOne({ email: email });

        if (!user) {
            return resp.redirect('/forgot_password?error=Email not found');
        }

        // update the user's password in the database
        await userModel.updateOne({ email: email }, { $set: { password: newPassword } });

        resp.redirect('/login?message=Password updated successfully');

    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).send("Internal Server Error");
    }

});

export default router;