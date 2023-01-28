const mongoose = require('mongoose');
const { DB_URL } = require('../config');

module.exports = () => {

    try {
        mongoose.connect(DB_URL);
        console.log('Db Connected');
    } catch (error) {
        console.error('Error ============ ON DB Connection')
        console.log(error);
    }
 
};

 
