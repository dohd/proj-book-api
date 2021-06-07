const { Server } = require('socket.io');
const { verifySocketToken } = require('./JWT');

const socketEvents = [
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

// accounts should be persisted on redis-db 
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
    io.use(verifySocketToken);
    
    io.on('connection', socketConnected);
    function socketConnected(socket) {
        socket.on('init', aud => {
            accounts.push({[aud]: socket.id});
        });

        socketEvents.forEach(event => {
            socket.on(event, ({aud, data}) => {
                accounts.forEach(account => {
                    let id = account[aud];
                    if (id) io.to(id).emit(event, data);
                });
            });
        });
    }
}