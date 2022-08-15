const cron = require('node-cron')
const axios = require('axios')
require('dotenv').config()
const sqlite3 = require('sqlite3')

let db = new sqlite3.Database('./database/flight-data.sqlite')

exports.initDailyAPIRequests = () => {
    cron.schedule('0 1 * * *', () => {

        //Check if API request has already been made today:
        let date = new Date().toISOString().slice(0, 10)
        let bool = `EXISTS(SELECT 1 FROM prices WHERE date="${date}")`
        let sql = 'SELECT ' + bool + ';';
        db.get(sql, function cb(err, result) {
            if (err) {
                console.log(err.message);
            };

            console.log(result[bool])

            if (result[bool] == 0) {

                const options = {
                    method: 'GET',
                    url: 'https://skyscanner44.p.rapidapi.com/search',
                    params: {
                        adults: '1',
                        origin: 'MUC',
                        destination: 'BER',
                        departureDate: '2022-10-11',
                        currency: 'EUR'
                    },
                    headers: {
                        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                        'X-RapidAPI-Host': 'skyscanner44.p.rapidapi.com'
                    }
                };

                axios.request(options)
                    .then(function (response) {

                        let flight = response.data.itineraries.buckets[0].items[0];
                        let flight_id = flight.id;
                        let datetime = new Date();
                        let date = datetime.toISOString().slice(0, 10);

                        {
                            let bool = `EXISTS(SELECT 1 FROM flights WHERE flightid="${flight_id}")`
                            let sql = 'SELECT ' + bool + ';';

                            db.get(sql, function cb(err, result) {
                                if (err) {
                                    console.log(err.message);
                                }
                                console.log(result[bool])
                                if (result[bool] == 0) {
                                    console.log("adding a row to flights...")
                                    let origin = flight.legs[0].origin.name;
                                    let destination = flight.legs[0].destination.name;
                                    let departuredate = flight.legs[0].departure.slice(0, 10);
                                    let departuretime = flight.legs[0].departure.slice(11, 19);
                                    let flights_sql = `INSERT INTO flights (flightid, origin, destination, departuredate, departuretime)
                                    VALUES('${flight_id}', '${origin}', '${destination}', '${departuredate}', '${departuretime}');`;
                                    db.run(flights_sql, function cb(err) {
                                        if (err) console.log(err);
                                        else console.log('Row inserted in flights table')
                                    })
                                };
                            });
                        }

                        {
                            let bool = `EXISTS(SELECT 1 FROM prices WHERE flight="${flight_id}" AND date="${date}")`
                            let sql = 'SELECT ' + bool + ';';
                            db.get(sql, function cb(err, result) {
                                if (err) {
                                    console.log(err.message);
                                }
                                console.log(result[bool])
                                if (result[bool] == 0) {
                                    let price = flight.price.raw
                                    let prices_sql = `INSERT INTO prices (flight, price, date)
                                VALUES('${flight_id}', ${price}, '${date}');`
                                    db.run(prices_sql, function cb(err) {
                                        if (err) console.log(err);
                                        else console.log("Row inserted in prices table")
                                    })
                                };
                            })
                        }
                    }).catch(function (error) {
                        console.error(error);
                    });
            };
        });
    });
}
