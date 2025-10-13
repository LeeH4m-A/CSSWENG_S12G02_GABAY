import express from 'express';
import argon2 from 'argon2';
import { userModel, loginHistoryModel, actionHistoryModel } from '../model/model.js';
const router = express.Router();

// server for profile page
router.get('/', 
    async (req, res) => {
        res.render('profile', {
            layout: 'index',
            title: 'Profile Page',
            user: req.session.user
    } 
);

});

/* TODO: add a confirmation message to prevent accidental updates, 
    Additionally, I think, we can change the whole profile section, add the ID 
                  and make a separate page for update specifically.
*/

// server for updating user's information in profile page
router.post('/update', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const updateFields = { name, email };

        if (password) {
            const hashedPassword = await argon2.hash(password);
            updateFields.password = hashedPassword;
        }
        
        // update user data
        await userModel.updateOne({ email: req.session.user.email }, { $set: updateFields });

        // update session email if changed
        req.session.user.email = email; 
        req.session.user.name = name; 

        // update login history with new user information
        await loginHistoryModel.updateMany({ email: req.session.user.email }, { $set: { email: email, name: name } });
        
        // update action history with new user information
        await actionHistoryModel.updateMany( { email: req.session.user.email }, { $set: { email: email, name: name } });
        
        // insert action history for updating user profile
        await actionHistoryModel.insertOne({
            name: name,
            role: req.session.user.role,
            email: email,
            action: "Update profile information",
            actionDateTime: new Date()
        });

        res.redirect('/profile?message=User information updated successfully');
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).send("Internal Server Error");
    }
});


router.get('/id', async(req, res) =>{
    res.render('identification', {
            layout: 'index',
            title: 'View ID',
            user: req.session.user,
            join_date: null
        }
        
    );
})
export default router;