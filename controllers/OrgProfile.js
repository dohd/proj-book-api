const { db } = require('../utils/database');
const Detail = require('../models/Detail');
const ContactPerson = require('../models/ContactPerson');

module.exports = {
    findOne: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;

            const detail = await Detail.findOne({ 
                where: { accountId },
                attributes: ['name','telephone','email'] 
            });

            const contactPerson = await ContactPerson.findOne({ 
                where: { accountId },
                attributes: ['fName','lName','telephone', 'email'] 
            });

            res.send({ contactPerson, detail });
        } catch (error) {
            next(error);
        }
    },

    update: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const data = req.body;

            const detail = {
                name: data.orgName,
                telephone: data.orgTelephone,
                email: data.orgEmail,
            };
            const person = {
                telephone: data.cpTelephone,
                email: data.cpEmail,
                fName: data.fName,
                lName: data.lName,
            };

            await db.transaction(async transaction => {
                await Detail.update(detail, { where: { accountId }, transaction });
                await ContactPerson.update(person, { where: { accountId }, transaction });
                return;
            });
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }
};