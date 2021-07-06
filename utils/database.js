const { Sequelize, DataTypes, Op } = require('sequelize');

// Initiate database connection
const db = (
    process.env.NODE_ENV === 'production' ?
    new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        native: true
    }): 
    new Sequelize(process.env.DATABASE_URL)
);

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