import express from 'express';
import argon2 from 'argon2';
import multer from 'multer';
import { userModel, loginHistoryModel, actionHistoryModel } from '../model/model.js';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 }, // 1MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

const router = express.Router();
/*
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
*/

/* TODO: add a confirmation message to prevent accidental updates, 
    Additionally, I think, we can change the whole profile section, add the ID 
                  and make a separate page for update specifically.
*/

router.post('/update', upload.single('photo'), async (req, res) => {
  try {
    const { name, age, birthday, contactNo, gender, barangay, city, revertPhoto } = req.body;

    const updateFields = { 
      name,
      age,
      contactNo,
      gender,
      birthday,
      location: { barangay, city }
    };

    if (req.file) {
      updateFields.userIcon = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    } else if (revertPhoto === 'true') {
      updateFields.userIcon = null;
    }

    const updatedUser = await userModel.findOneAndUpdate(
      { email: req.session.user.email },
      { $set: updateFields },
      { new: true }
    ).lean();

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    // Create a proper user object for response
    const userResponse = {
      ...updatedUser,
      // If userIcon exists and has data, create a data URL for immediate display
      userIcon: updatedUser.userIcon && updatedUser.userIcon.data 
        ? `data:${updatedUser.userIcon.contentType};base64,${updatedUser.userIcon.data.toString('base64')}`
        : null
    };

    // Update session
    req.session.user = {
      ...req.session.user,
      name: updatedUser.name,
      gender: updatedUser.gender,
      userIcon: userResponse.userIcon
    };

    res.json({ 
      message: 'Profile updated successfully', 
      user: userResponse 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/', async (req, res) => {
  try {

    const userDoc = await userModel.findOne({ email: req.session.user.email }).lean();
    if (!userDoc) return res.status(404).send('User not found');

    const firstLogin = await loginHistoryModel
      .find({ email: req.session.user.email })
      .sort({ lastLoginDateTime: 1 })
      .limit(1)
      .lean();

    const joinDate = firstLogin.length
                        ? new Date(firstLogin[0].lastLoginDateTime).toLocaleDateString('en-US')
                        : null;

    const user = {
      _id: userDoc._id,
      name: userDoc.name,
      email: userDoc.email,
      birthday: userDoc.birthday,
      contactNo: userDoc.contactNo,
      gender: userDoc.gender,
      location: userDoc.location,
      role: userDoc.role,
      joinDate,
      userIcon: userDoc.userIcon && userDoc.userIcon.data
            ? `data:${userDoc.userIcon.contentType};base64,${userDoc.userIcon.data.toString('base64')}`
            : null
    };

    res.render('identification', {
      layout: 'index',
      title: 'View ID',
      user
    });

  } catch (error) {
    console.error('Error fetching user ID:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;