const { Op } = require('../utils/database');
const moment = require('moment');
const { Participant } = require('../models/Participant');
const { KeyProgramme } = require('../models/Essential');

module.exports = {
    findAll: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;

            const yr = new Date().getFullYear();
            const jan = new Date(yr, 0, 1);
            const dec = new Date(yr, 11, 31);
            const yr_range = [jan, dec].map(v => {
                return  moment(v).format('YYYY-MM-DD');
            });

            const fromDate = req.query.from || yr_range[0];
            const toDate = req.query.to || yr_range[1];

            const participants = await Participant.findAll({
                where: { 
                    accountId,
                    activityDate: {
                        [Op.between]: [fromDate, toDate]
                    }
                },
                attributes: ['id','gender','keyProgrammeId']
            });

            const programmes = await KeyProgramme.findAll({
                where: { accountId },
                attributes: ['id']
            });

            const dataset = { male: [], female: [] };

            for (const programme of programmes) {
                let maleCount = 0;
                let femaleCount = 0;

                for (const p of participants) {
                    const programme_match = p.keyProgrammeId === programme.id;                    
                    if (programme_match) {
                        if (p.gender === 'M') maleCount++;
                        if (p.gender === 'F') femaleCount++;
                    }                    
                }
                dataset.male.push(maleCount);
                dataset.female.push(femaleCount);
            }

            res.send(dataset);
        } catch (error) {
            next(error);
        }
    }
};
