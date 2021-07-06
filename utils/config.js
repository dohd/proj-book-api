const express = require('express');
const httpLogger = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Initiate express app server
const app = express();

let origin;
if (process.env.NODE_ENV === 'development') {
    origin = process.env.DEV_CLIENT_URL;
}
if (process.env.NODE_ENV === 'production') {
    origin = process.env.CLIENT_URL;
}

class Config {
    constructor() {
        // Log http server requests
        app.use(httpLogger('dev'));
        // Parse content-type - application/json
        app.use(express.json());
        // Parse content-type - application/x-www-form-urlencoded
        app.use(express.urlencoded({ extended: true }));
        // Parse cookies
        app.use(cookieParser());
        // Allow cross-origin resource sharing
        app.use(cors({
            origin: origin,
            maxAge: 86400,
            credentials: true
        }));
    }

    get app() { return app; }
}

module.exports = Config;