import express from 'express';

const router = express.Router();


// server to register new account
router.get('/', (req,resp) => {
    resp.render('signup',{
        layout: 'index',
        title: 'Registration Page',
        emailUsed:req.query.emailUsed,
    });
});

// post user details into the database upon signing up
router.post('/', async (req, res) => {
    // retrieve user details
    const { name, email, password, role} = req.body;

    // get db collection
    const userCollection = client.db("test").collection("users");
    
    // check if email is used in database
    const user = await userCollection.findOne({ email: email });

    if (user) {
        // reload page with query
        return res.redirect("/signup?emailUsed=true");
    }

    // hash password used
    const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, function (err, hash) {
            if (err) reject(err);
            resolve(hash);
        });
    });

    // insert data into the db (new accounts has member role)
    await userCollection.insertOne({
        name: name,
        email: email,
        password: hashedPassword,
        role: 'Member',
        isAdmin: false,
        userIcon: 'https://res.cloudinary.com/dof7fh2cj/image/upload/v1719207075/hagwnwmxbpkpczzyh46g.jpg'
    });

    // when successful, return to login page
    return res.redirect('/');
});

export default router;