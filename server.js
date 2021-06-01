const createError = require('http-errors');

const appConfig = require('./utils/config');
const { verifyAccessToken } = require('./utils/JWT');
const authRoute = require('./routes/auth');
const privateApiRoute = require('./routes');

// App instance
const app = new appConfig();

// Routes
app.use('/api/auth', authRoute);
app.use('/api', verifyAccessToken, privateApiRoute);
app.get('/', (req, res) => res.send({ message: 'api index route'}));

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
const server = app.listen(app.port, () => {
    console.log('Server ready on port:', app.port);
});

process.on('SIGINT', () => {
    console.log(' Server disconnected! ');
    server.close();
});