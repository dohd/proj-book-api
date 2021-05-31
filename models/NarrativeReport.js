const { db, DataTypes } = require('../utils/database');

const NarrativeQuiz = db.define('narrative_quiz', {
    query: DataTypes.STRING
}, { freezeTableName: true, timestamps: false });

const NarrativeReport = db.define('narrative_report', {
    accountId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false }
});

const Response = db.define('response', {
    response: { type: DataTypes.STRING, allowNull: false },
    accountId: { type: DataTypes.INTEGER, allowNull: false },
});

const EventImage = db.define('event_image', {
    url: { type: DataTypes.STRING, allowNull: false },
    accountId: { type: DataTypes.INTEGER, allowNull: false },
});

const CaseStudy = db.define('case_study', {
    case: { type: DataTypes.STRING, allowNull: false },
    accountId: { type: DataTypes.INTEGER, allowNull: false },
});

module.exports = { 
    NarrativeReport, Response, EventImage,
    CaseStudy, NarrativeQuiz 
};

// One-to-One Association
NarrativeReport.hasOne(CaseStudy, {
    foreignKey: { name: 'narrativeReportId', allowNull: false },
    as: 'caseStudy'
});
CaseStudy.belongsTo(NarrativeReport, { as: 'narrativeReport' });

// One-to-Many Association
NarrativeReport.hasMany(EventImage, {
    foreignKey: { name: 'narrativeReportId', allowNull: false },
    as: 'eventImages'
});
EventImage.belongsTo(NarrativeReport, { as: 'narrativeReport' });

NarrativeReport.hasMany(Response, {
    foreignKey: { name: 'narrativeReportId', allowNull: false },
    as: 'responses'
});
Response.belongsTo(NarrativeReport, { as: 'narrativeReport' });

NarrativeQuiz.hasMany(Response, { 
    foreignKey: { name: 'narrativeQuizId', allowNull: false },
    as: 'responses',
    onDelete: 'set null'
});
Response.belongsTo(NarrativeQuiz, { as: 'narrativeQuiz' });