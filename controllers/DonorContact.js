const DonorContact = require('../models/DonorContact');
const Donor = require('../models/Donor');

module.exports = {
    create: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const data = req.body;

            const donor_contact = await DonorContact.create({
                fName: data.fName,
                lName: data.lName,
                telephone: data.telephone,
                email: data.email,
                donorId: data.donorId,
                accountId
            });

            const savedDonor_contact = donor_contact.toJSON();
            delete savedDonor_contact.accountId;
            res.send(savedDonor_contact);
        } catch (error) {
            next(error);
        }
    },

    findAll: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const donorContacts = await DonorContact.findAll({
                where: { accountId }, 
                attributes: { exclude: ['accountId'] },
                order: [['updatedAt','DESC']],
                include: [{
                    model: Donor,
                    as: 'donor',
                    attributes: ['id','name']
                }]
            });
            res.send(donorContacts);
        } catch (error) {
            next(error);
        }
    },

    update: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const { id } = req.params;
            await DonorContact.update(req.body, { where: { id, accountId } });
            res.sendStatus(200);
        } catch (err) {
            next(err);
        }
    },

    delete: async (req, res, next) => {
        try {
            const { id } = req.params;
            await DonorContact.destroy({ where: { id } });
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }
};
