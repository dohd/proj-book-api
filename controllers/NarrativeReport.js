const { QueryTypes } = require('sequelize');
const moment = require('moment');

const { db } = require('../utils/database');

const queryStr = require('../queries/narrativeReport');
const { NarrativeReport, Response, CaseStudy } = require('../models/NarrativeReport');

module.exports = {
    create: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const { activityId, caseStudy, responses } = req.body;

            const result = await db.transaction(async transaction => {

                const report = await NarrativeReport.create({
                    accountId, activityId, 
                    title: req.body.title
                }, {transaction});

                const case_study = await CaseStudy.create({ 
                    accountId, case: caseStudy, narrativeReportId: report.id
                }, {transaction});

                const report_responses = responses.map(val => {
                    val.accountId = accountId;
                    val.narrativeReportId = report.id;
                    return val;
                });
                await Response.bulkCreate(report_responses, {transaction});

                const savedResponse = await Response.findAll({
                    where: { narrativeReportId: report.id },
                    attributes: { exclude: ['accountId'] },
                    transaction
                });

                const savedCaseStudy = case_study.toJSON();
                delete savedCaseStudy.accountId;

                return {
                    caseStudy: savedCaseStudy,
                    responses: savedResponse,
                };
            });

            res.send(result);
        } catch (error) {
            next(error);
        }
    },

    findAll: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;

            for (const key in req.query) {
                if (req.query[key] === 'undefined') {
                    req.query[key] = null;
                }
            }

            const yr = new Date().getFullYear();
            const dates = [
                new Date(yr, 0, 1), 
                new Date(yr, 11, 31)
            ].map(v => moment(v).format('YYYY-MM-DD'));

            const params = {
                programmeId: req.query.programme || null,
                regionId: req.query.region || null,
                groupId: req.query.group || null,
                from: req.query.from || dates[0],
                to: req.query.to || dates[1]
            };

            const data = await db.query(queryStr, {
                replacements: {accountId, ...params},
                type: QueryTypes.SELECT
            });
            res.send(data);
        } catch (error) {
            next(error);
        }
    },

    delete: async (req, res, next) => {
        try {
            const { id } = req.params;
            await NarrativeReport.destroy({ where: { id } });
            res.sendStatus(204);
        } catch (error) {
            next(error);
        }
    }
};