const { Server } = require('socket.io');
const { verifySocketToken } = require('./JWT');

const socketEvents = [
    'orgProfile',
    'profileImage',
    'pendingReports',
    'pendingParticipants',
    'pendingPlans',
    'activitySchedule',
    'activityCount',
    'regionGraph',
    'programmeGraph',
    'participantAnalysis',
    'targetGroups',
    'targetRegions',
    'keyProgrammes',
    'donors',
    'donorContacts',
    'participants',
    'proposals',
    'agenda',
    'activityPlans',
    'narratives',
    'users',
];

// Use Redis-db 
const accounts = [];
module.exports = function(server) {
    // Initialize socket
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ['GET','POST'],
            credentials: true
        }
    });
    // middleware
    io.use(verifySocketToken);
    
    io.on('connection', socket => {
        console.log(`Socket ${socket.id} connected`);

        socket.on('init', aud => {
            accounts.push({[aud]: socket.id});
        });
    
        socketEvents.forEach(event => {
            socket.on(event, ({aud, data}) => {
                accounts.forEach(account => {
                    const id = account[aud];
                    if (id) io.to(id).emit(event, data);
                });
            });
        });
        
        socket.on('disconnect', () => {
            for (let i=0; i<accounts.length; i++) {
                const socketId = Object.values(accounts[i])[0];
                if (socketId === socket.id) {
                    accounts.splice(i, 1);
                    break;
                }
            }
        });
    });
}