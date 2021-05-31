const { Sequelize, DataTypes, Op } = require('sequelize');

// Initiate SQL database connection
const db = new Sequelize(process.env.DATABASE_URL);

// Confirm database connection
db.authenticate()
.then(() => {
    console.log('Postgre_db connected \n');
    db.sync({ 
        logging: false, 
        force: false, 
        alter: true 
    });
    // db.drop();
})
.catch(err => {
    console.error('Postgre_db connection failed:', err);
});

module.exports = { db, DataTypes, Op };
