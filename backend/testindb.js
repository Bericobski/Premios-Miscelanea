const db = require('./database');



exports.getUsuarios = (req, res) => {

    const query = 'SELECT * FROM usuarios';

    db.query(query, (err, results) => {

        if (err) {

            console.error('Error executing query:', err);

            res.status(500).send('Error fetching usuarios');

            return;

        }

        res.json(results);

    });

}