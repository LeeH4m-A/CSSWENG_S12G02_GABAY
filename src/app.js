/* TODO: Add Session cookies */
/* TODO: replace deprecated modules*/

import express from 'express';
import bodyParser from 'body-parser';
import { engine } from 'express-handlebars';
import moment from 'moment';
import session from 'express-session';
import cloudinary from 'cloudinary';
import MongoDBStore from 'connect-mongo';

/* MongoDB connection */
import db_conn from "./model/db.js";

/* Routes */
import index from './routes/index.js';
import viewEventsRoutes from './routes/viewevents.js';

const server = express();
const port = process.env.PORT || 3000;

/* Body parser */
server.use(bodyParser.json());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

/* Session setup */

/* Setting up session */
server.use(session({
  secret: process.env.SESSION_SECRET || 'gabay',
  saveUninitialized: true,
  resave: true,
  store: new MongoDBStore({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/gabayDB',
    dbName: process.env.MONGODB_DBNAME,
  }),
  rolling: true,
  cookie: { httpOnly: true, secure: false, maxAge: null },
}));


/* TODO: put all helpers in helpers folder */
/* Handlebars setup */
server.engine('hbs', engine({
    extname: 'hbs',
    helpers: {
        formatDate: function (date) {
            return moment(date).format('MMMM D, YYYY h:mm:ss A');
        },
        eq: (a, b) => a === b,
        or: (...args) => {
            args.pop(); 
            return args.some(arg => arg);
        },
        increment: function (value) {
            return value + 1;
        },
        decrement: function (value) {
            return value - 1;
        },
        gt: function (a, b) {
            return a > b;
        },
        lt: function (a, b) {
            return a < b;
        }, 
        isSelected: function (value, option) {
            return value === option ? 'selected' : '';
        },
        includes: (array, value) => {
            if (!Array.isArray(array)) return false;
            return array.includes(value);
        },
        isActive: (href, currentPath) => {
            if (!href || !currentPath) return '';
            return currentPath.startsWith(href) ? 'active' : '';
        }
    },
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
    defaultLayout: "index",
}));
server.set('view engine', 'hbs');

/* Set src/views as the views directory */
server.set("views", "src/views");

/* Serve static content from the public directory */
server.use("/", express.static("public"));

/* Set routers */

server.use("/", index);
server.use('/viewevents', viewEventsRoutes);
/* TODO: Remove once done, this is for quick session removal*/
server.get('/session/destroy', (req, res) => {
  req.session.destroy();
  res.status(200).send('ok');
});


/* Cloudinary */
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME || 'dof7fh2cj',
  api_key: process.env.CLOUD_KEY || '411879496332247',
  api_secret: process.env.CLOUD_SECRET || 'LEEZpzSauYJuHUzCmwQtL80HI5c',
});

/* Connect to MongoDB and begin listening to requests */
db_conn.connect().then(() => {
  server.set('db_conn', db_conn);
  server.set('db', db_conn.mongoose.connection);

  function finalClose() {
    console.log('Closing MongoDB connection...');
    db_conn.mongoose.connection.close();
    process.exit();
  }
  ['SIGTERM', 'SIGINT', 'SIGQUIT'].forEach(sig => process.on(sig, finalClose));

  server.listen(port, () => console.log(`Listening on port ${port}`));
});