const cron = require('node-cron')
const axios = require('axios')
const sqlite3 = require('sqlite3')

let db = new sqlite3.Database('./database/flight-data.sqlite')

exports.initDailyAPIRequests = () => {
    cron.schedule('* * * * *', () => {
        axios.get('http://localhost:3000/dummy-API')
            .then(response => {

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
            })
    });
}
