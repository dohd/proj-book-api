const { db } = require('../utils/database');
const { 
    NarrativeReport, Response, CaseStudy,
    NarrativeQuiz, EventImage
} = require('../models/NarrativeReport');
const Agenda = require('../models/Agenda');
const Activity = require('../models/Activity');

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

            const activityReports = await Activity.findAll({
                where: { accountId },
                attributes: ['id','action'],
                order: [['updatedAt', 'DESC']],
                include: [
                    {
                        model: NarrativeReport,
                        as: 'narratives',
                        required: true,
                        include: [
                            {
                                model: CaseStudy,
                                as: 'caseStudy',
                                attributes: ['id','case']
                            },
                            {
                                model: EventImage,
                                as: 'eventImages',
                                attributes: ['id','url']
                            },
                            {
                                model: Response,
                                as: 'responses',
                                attributes: ['id','response'],
                                include: [
                                    {
                                        model: Agenda,
                                        as: 'agenda',
                                        attributes: ['id','task']
                                    },
                                    {
                                        model: NarrativeQuiz,
                                        as: 'narrativeQuiz'
                                    }
                                ]
                            }
                        ]    
                    }
                ]
            });

            res.send(activityReports);
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