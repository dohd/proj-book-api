const { Sequelize, DataTypes, Op } = require('sequelize');

// Initiate database connection
let db;
if (process.env.NODE_ENV === 'development') {
    db = new Sequelize(process.env.DEV_DATABASE_URL);
}
if (process.env.NODE_ENV === 'production') {
    db = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        native: true
    }); 
}

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