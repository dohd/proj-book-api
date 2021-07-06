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

// accounts should be persisted on redis-db 
const accounts = [];

module.exports = function(server) {
    let origin;
    if (process.env.NODE_ENV === 'development') {
        origin = process.env.DEV_CLIENT_URL;
    }
    if (process.env.NODE_ENV === 'production') {
        origin = process.env.CLIENT_SOCKET_URL;
    }

    // Initialize socket
    const io = new Server(server, {
        cors: {
            origin: origin,
            methods: ['GET','POST'],
            credentials: true
        }
    });
    io.use(verifySocketToken);
    
    io.on('connection', socketConnected);
    function socketConnected(socket) {
        console.log('Socket connected id: ' + socket.id);

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