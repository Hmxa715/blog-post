const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Comment = sequelize.define('Comment', {
        body: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    });

    Comment.associate = (models) => {
        Comment.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' });
    };

    return Comment;
};
