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

Defines all URL the app responds to. Each route file groups related URL (e.g., index.js handles /login, /signup, etc.). Would typically import controller functions and middleware.

### controllers/

Does the final "push" to the database.


### middlewares/

Functions that run before a controller is executed. Used for authentication, validation, logging, etc. It has access to req, res, and next().


```bash
export function checkAuth(req, res, next) {
  if (!req.session.user) 
    return res.redirect('/login');
  next(); // Will call the next function
}

// Example:
//                  vv  if successful, call next function          
router.post('/', checkAuth, validateInput, dashboardController);

```

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