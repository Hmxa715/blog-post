const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Post = sequelize.define('Post', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        body: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    });

    // Define the association inside the model definition file itself
    Post.associate = (models) => {
        Post.hasMany(models.Comment, { as: 'comments', foreignKey: 'postId' });
    };

    return Post;
};
