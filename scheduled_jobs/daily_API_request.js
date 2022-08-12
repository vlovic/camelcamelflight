const cron = require('node-cron')
const axios = require('axios')

exports.initDailyAPIRequests = () => {
    cron.schedule('* * * * *', () => {
        axios.get('http://localhost:3000/dummy-API')
            .then(response => console.log(response.data))
    })
};
