const { db, DataTypes } = require('../utils/database');

const ProfileImage = db.define('profile_image', {
    url: { type: DataTypes.STRING, allowNull: false },
});

module.exports = ProfileImage;