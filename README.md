# CSSWENG_S12G02_GABAY


### Clone the repository
```bash
git clone https://github.com/yourusername/CSSWENG_S12G02_GABAY.git
cd CSSWENG_S12G02_GABAY
```

### Install the dependency

```bash
npm install
```


### Setup .env

```bash
MONGODB_URI=mongodb://your-URI
MONGODB_DBNAME=your-DB-name
SESSION_SECRET=your-secret
```

### To run

```bash
npm test
```


### Access the website at

```bash
http://localhost:3000
```



# Developer Notes: 

## Role of Each Component in src/ directory

### app.js

The main file, sets up Express, Handlebars view engine, middleware, sessions, routes and starts the HTTP server.

### routes/

Defines all URL the app responds to. We separate the files per "sub path" in the URL to make it easier, i.e. we currently have an index.js for the root directory. Each route file groups related URL (e.g., user.js handles user/add, user/delete, etc.). Would typically import controller functions and middleware.

### controllers/

Functions that run at the end of the chain when routing. 

```bash
router.post('/', checkAuth, validateInput, loginController);
```
loginController is a controller function in charge of sending the HTTP response back to the client. For the shorter controllers, we just keep this inside the router file inline (specifically the ones where its just a simple render() call).

### middlewares/

Functions that receive the request body, manipulate it, and pass it to the next function in the chain. 


```bash
export function checkAuth(req, res, next) {
  if (!req.session.user) 
    return res.redirect('/login');
  next(); // Will call the next function
}

// Example:
//                  vv  if successful, call next function          
router.post('/', checkAuth, validateInput, loginController);

```
checkAuth is a middleware that does an authentication check from the database and embeds something into the request object so that the controller can access it later


### helpers/

Reusable utility functions not tied to Express, used for hashing, formatting, sending emails, etc. 
**Does not use req or res.**

```bash
//Example
export function formatDate(date) {
  return new Date(date).toLocaleString();
}
```

### views/

Contains all Handlebars .hbs templates.