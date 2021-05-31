const { Sequelize, DataTypes, Op } = require('sequelize');

// const {
//     DB, DB_USERNAME, DB_PASSSWORD, 
//     DB_HOST, DB_PORT
// } = process.env;

// Initiate SQL database connection
// const db = new Sequelize({
//     database: DB,
//     username: DB_USERNAME,
//     password: DB_PASSSWORD,
//     host: DB_HOST,
//     port: DB_PORT,
//     dialect: 'postgres',
//     dialectOptions: {
//         ssl: {
//             require: true,
//             rejectUnauthorized: false
//         }
//     }
// });

const db = new Sequelize(process.env.DATABASE_URL, {dialect: 'postgres', native: true});

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
