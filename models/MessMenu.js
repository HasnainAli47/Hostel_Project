const mongoose = require('mongoose');

const messMenuSchema = new mongoose.Schema({
    image: {
        data: Buffer,
        contentType: String
    }
});

const MessMenu = mongoose.model('MessMenu', messMenuSchema);

module.exports = MessMenu;
