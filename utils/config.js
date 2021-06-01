require('dotenv/config');
const express = require('express');
const httpLogger = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Initiate express app server
const app = express();
const corsOptions = {
    origin: [
        process.env.CLIENT_URL
    ],
    maxAge: 86400,
    credentials: true
};

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
        app.use(cors(corsOptions));
    }

    use(...args) { return app.use(...args); }
    listen(...args) { return app.listen(...args); }
    getRoute(...args) { return app.get(...args); }

    get port() { return process.env.PORT || 3001; }
}

module.exports = Config;