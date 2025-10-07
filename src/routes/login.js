import express from 'express';
import argon2 from 'argon2';
import { userModel, loginHistoryModel } from '../model/model.js';

const router = express.Router();

router.get('/', (req, res) => {
  if (req.session.username) {
    // If already logged in, go to dashboard
    return res.redirect('/dashboard');
  }

  res.render('login', {
    layout: 'index',
    title: 'Login Page',
    failed: req.query.failed,
  });
});

//server to check user email and password by searching the database
router.post('/', async (req,res) => {
    // get data from form
    const {email, password} = req.body;

    // get collection

    // find matching email
    const user = await userModel.findOne({ email: email });
    
    // if authentication failed, show login failed
    if(!user){
        // reload page with query
        return res.redirect('/login?error=User does not exist');
    }else{
        const match = await argon2.verify(user.password, password);
        if(!match){
            return res.redirect('/login?error=Invalid password');
        }
    }

    await loginHistoryModel.insertOne({
        name: user.name,
        role: user.role,
        email: user.email,
        lastLoginDateTime: new Date() 
    });
    
    if(req.body.remember == "true"){
        req.session.cookie.expires  = new Date(Date.now() + 1000*60*60*24*30);//thirty days
        //console.log(req.session.cookie.expires);
    }else{
        req.session.cookie.expires  = new Date(Date.now() + 1000*60*60);//one hour
        //console.log(req.session.cookie.expires);
    }

    // add user into session
    req.session.username = user.name;
    req.session.email = user.email;
    req.session.role = user.role;
    req.session.userIcon = user.userIcon;
    //console.log(req.body.remember);
    
    // if authentication is successful, redirect to dashboard
    res.redirect('/dashboard');
    
});


export default router;