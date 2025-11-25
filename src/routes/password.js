import express from 'express';
import argon2 from 'argon2';
import crypto from 'crypto';
import { transporter } from "../helpers/mailer.js";
import { userModel } from '../model/model.js';
import { ResetToken } from '../model/model.js';



const router = express.Router();

// Render Forgot Password Page
router.get('/', (req, resp) => {
    resp.render('forgotpassword', {
        layout: 'index',
        title: 'Forgot Password Page'
    });
});

// POST: Request password reset
router.post('/', async (req, res) => {
    const { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.redirect('/forgot_password?error=Passwords do not match');
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) return res.redirect('/forgot_password?error=Email not found');

        // Hash the new password but don't save yet
        const hashedPassword = await argon2.hash(password);

        // Generate secure random token
        const token = crypto.randomBytes(32).toString("hex");

        // Store token in ResetToken collection
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
        await ResetToken.create({
            userId: user._id,
            token,
            expires,
            tempPassword: hashedPassword
        });

        // Auto-detect URL (Render or local)
        const protocol = req.headers["x-forwarded-proto"] || req.protocol;
        const host = req.headers["x-forwarded-host"] || req.get("host");
        const baseUrl = `${protocol}://${host}`;
        const verifyLink = `${baseUrl}/forgot_password/verify_password?token=${token}`;

        // Send email
        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: email,
            subject: 'Reset Password — GABAY HIV Database',
            text: `Click to confirm password reset:\n\n${verifyLink}\n\nThis link expires in 10 minutes.`
        });

        res.redirect('/login?message=Verification email sent');

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

// GET: Verify password reset token
router.get('/verify_password', async (req, res) => {
    try {
        const { token } = req.query;

        // Find token document
        const resetDoc = await ResetToken.findOne({ token, expires: { $gt: new Date() } });
        if (!resetDoc) return res.redirect('/forgot_password?error=Invalid or expired token');

        // Find user
        const user = await userModel.findById(resetDoc.userId);
        if (!user) return res.redirect('/forgot_password?error=User not found');

        // Update user's password
        await userModel.updateOne({ _id: user._id }, { $set: { password: resetDoc.tempPassword } });

        // Delete token
        await ResetToken.deleteOne({ _id: resetDoc._id });

        res.redirect('/login?message=Password updated successfully');

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

export default router;