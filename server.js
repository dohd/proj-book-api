require('dotenv/config');
const createError = require('http-errors');

const appConfig = require('./utils/config');
const socketio = require('./utils/socketio');
const { verifyAccessToken } = require('./utils/JWT');
const authRoute = require('./routes/auth');
const privateApiRoute = require('./routes');

// App instance
const { app } = new appConfig();

// Routes
app.use('/api/auth', authRoute);
app.use('/api', verifyAccessToken, privateApiRoute);

// Catch-all Route
app.use((req, res, next) => {
    next(new createError.NotFound());
});
// Route error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({ 
        error: {
            status: err.status || 500,
            message: err.message
        } 
    });
});

// Server instance
const port = process.env.PORT || 3001;
const server = app.listen(port, () => {
    console.log('Server ready on port:', port);
});
socketio(server);
