import express from 'express';


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
router.post('/read-user', async (req,res) => {
    // get data from form
    const {email, password} = req.body;

    // get collection
    const userCollection = client.db("test").collection("users");

    // find matching email
    const user = await userCollection.findOne({ email: email });
    
    // if authentication failed, show login failed
    if(!user){
        // reload page with query
        return res.redirect('/login?error=User does not exist');
    }else{
        const match = await bcrypt.compare(password,user.password);
        if(!match){
            return res.redirect('/login?error=Invalid password');
        }
    }
    // insert login history data into the db
    const loginHistoryCollection = client.db("test").collection("loginhistories");
    await loginHistoryCollection.insertOne({
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