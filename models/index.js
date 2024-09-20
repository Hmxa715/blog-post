const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('blog_db', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

// Initialize models
const Post = require('./post')(sequelize);
const Comment = require('./comment')(sequelize);

// Pass the models to the associate method
Post.associate({ Comment });
Comment.associate({ Post });

// Export models and sequelize instance
module.exports = {
    sequelize,
    Post,
    Comment
};
