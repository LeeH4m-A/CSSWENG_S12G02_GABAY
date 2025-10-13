// This folder is for handler of the "push" to database

// For example


// router.post('/dashboard', checkAuth, validateInput, dashboardController);
//                              ^^          ^^          // Controller would handle the "push" to 
import { loginHistoryModel } from "../model/model.js";

export default async (req, res) => {
    const user = req.body.found_user;

    if(user){
        // Record login history
        await loginHistoryModel.create({
            name: user.name,
            role: user.role,
            email: user.email,
            lastLoginDateTime: new Date(),
        });

        if (req.body.remember) {
            req.session.cookie.expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
        } else {
            req.session.cookie.expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
        }

        req.session.user = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            userIcon: user.userIcon
        };
        res.redirect("/dashboard");

    } else {
        res.status(400).json({ success: false, message: "User authentication failed." });
    }
}