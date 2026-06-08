



const express = require('express');
const app = express();
const mysql = require('mysql2');

const cors = require('cors');

app.use(cors());
app.use(express.json());


const connection = mysql.createConnection({

    host: '190.49.18.84',

    user: 'prueba',

    password: 'AlgoEstrDatos3',

    database: 'facturas'

});


connection.connect((err) => {

    if (err) {

        console.error('Error connecting to database:', err);

        return;

    }

    console.log('Connected to database');

});

app.get('/usuarios', (req, res) => {
       const query = 'SELECT * FROM usuarios';
    
        connection.query(query, (err, results) => {
    
            if (err) {
    
                console.error('Error executing query:', err);
    
                res.status(500).send('Error fetching usuarios');
    
                return;
    
            }
    
            res.json(results);
    
        });
});




app.get('/', (req, res) => {
    res.send('API funcionando');
    
});



app.listen(3000, () => {
    console.log('Servidor corriendo en puerto 3000');
});



