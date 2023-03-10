const JWT = require('jsonwebtoken');
const createError = require('http-errors');
// const client = require('./redis');

const accessToken = process.env.ACCESS_TOKEN;
const refreshToken = process.env.REFRESH_TOKEN;

module.exports = {
    signAccessToken: user => new Promise((resolve, reject) => {
        const payload = { 
            userId: user.id, 
            roleId: user.roleId 
        };
        const options = {
            expiresIn: '30d',
            issuer: 'myapp.com',
            audience: String(user.accountId)
        };

        JWT.sign(payload, accessToken, options, (err,token) => {
            if (err) {
                console.log(err.message);
                reject(new createError.InternalServerError());                
            }
            resolve(token);        
        });   
    }),

    verifyAccessToken: (req, res, next) => {           
        const authHeader = req.headers.authorization;
        if (!authHeader) throw new createError.Unauthorized();

        const bearerToken = authHeader.split(' ');
        const token = bearerToken[1];

        JWT.verify(token, accessToken, (err, payload) => {
            if (err) {
                console.log(err.message);
                const message = ( 
                    err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
                );
                return next(new createError.Unauthorized(message));
            }
            req.payload = payload;
            next();
        });
    },

    signRefreshToken: user => new Promise((resolve, reject) => {
        const payload = { 
            userId: user.id, 
            roleId: user.roleId 
        };
        const options = {
            expiresIn: '1y',
            issuer: 'myapp.com',
            audience: String(user.accountId)
        };

        JWT.sign(payload, refreshToken, options, (err, token) => {
            if (err) {
                console.log(err.message);
                reject(new createError.InternalServerError());
            }
            resolve(token);
            // Redis cache
            // client.set(user.accountId, token, 'EX', 365*24*60*60, (err,reply) => {
            //     if (err) {
            //         console.log(err.message);
            //         reject(new createError.InternalServerError());
            //     }    
            //     resolve(token);
            // });  
        });
    }),
    
    verifyRefreshToken: token => new Promise((resolve, reject) => {
        JWT.verify(token, refreshToken, (err, payload) => {
            if (err) reject(new createError.Unauthorized());
            resolve(payload.userId);
            // Redis cache
            // client.get(accountId, (err,result) => {
            //     if (err) {
            //         console.log(err.message);
            //         reject(new createError.InternalServerError());
            //     }
            //     if (token === result) resolve(accountId);
            //     reject(new createError.Unauthorized());
            // });
        });
    }),

    verifySocketToken: (socket, next) => {
        const { token } = socket.handshake.query
        // jwt verify
        next();
    }
};