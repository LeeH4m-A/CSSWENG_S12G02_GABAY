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
MONGODB_URI="mongodb://localhost:27017/reze"
MONGODB_NAME="reze"
MAIL_USER="reze@countrymouse.com"
MAIL_PASS="csm-tm:ra"
CLOUD_NAME="reze-cloud"
CLOUD_KEY="reze-key"
CLOUD_SECRET="reze-cret"
```

### To run

```bash
npm test
```

### Access the website at

```bash
http://localhost:3000
```

# Coding Standards
For Project Structure, HTML, CSS, JavaScript, and UML Diagrams.

## HTML Standards

Adhere to HTML5 standards, use non-semantic HTML tags.

- **Attributes**: Always use double quotes for attribute values.
	```html
	<input type="text" name="username">
	```
- **Formatting**: Ensure proper nesting and closure of all tags to maintain a valid HTML structure.
- **Accessing**: Each HTML file can be accessed via 'href' and should be connected through the appropriate routing mechanisms.

## CSS Standards

Follows a structured approach to maintain readability and consistency.

- **Syntax**: Use `kebab-case` for naming classes and IDs, and always end declarations with a semicolon.
  ```css
  .main-header {
      background-color: #333;
  }
- **Formatting**: place a space after each class or ID selector, only one attribute declaration per line for better readability.
	```css
	.main-header {
	    background-color: #333;
	    color: #fff;
	}
	```
- **Organization**: Use comments to separate different sections and provide explanations where necessary.
	```css
	/* Header styles */
	.main-header {
	    background-color: #333;
	}

	/* Footer styles */
	.main-footer {
	    background-color: #222;
	}
	```

## JavaScript Standards
Ensure code is maintainable and efficient.
- **Location**: All JavaScript files for the front-end should be located in the public directory. Avoid using inline JavaScript in HTML files.
- **Syntax**: 
  - Use `camelCase` for variable and function names.
	```javascript
	let userName = 'user';
	function getUserData() {
	    // some code
	}
	```
  - Server methods for GET and POST requests should be in ```snake_case```.
	```javascript
	server.get('/user_data', (req, res) => {
	    // some code
	});
	server.post('/user_registration', (req, res) => {
	    // some code
	});
	```
- **Formatting:**
  - Use ```try-catch``` blocks for error handling in server methods to ensure stability.
	  ```javascript
	  server.post('/update-user', (req, res) => {
		    try {
		        // method code
		    } catch (error) {
		        // handle error
		    }
		});
	  ```
  - Place a space after each section for readability and organization.

# Project structure

- **public**: This folder houses all the static files such as CSS, JavaScript, images, and fonts.
- **src**: This folder contains backend code, routes, controllers, middleware, etc.
- **app**: This is main file which initializes Express to starts the application

## Inside src/

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


