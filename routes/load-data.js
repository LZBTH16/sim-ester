const express = require('express');
const router = express.Router();
const { Client } = require('pg'); 
const fs = require('fs');

router.get('/', function(req, res, next) {
    (async function() {
        try {
            if(process.env.ENVIRONMENT === 'production'){
                return res.redirect('/index');
            }

            const pool = await sql.connect(dbConfig);

            res.setHeader('Content-Type', 'text/html');
            res.write('<title>Data Loader</title>');
            res.write('<h1>Connecting to database.</h1><p>');

            let data = fs.readFileSync("./ddl/SQLServer_orderdb.ddl", { encoding: 'utf8' });
            let commands = data.split(";");
            for (let i = 0; i < commands.length; i++) {
                let command = commands[i];
                res.write(command);                
                try {
                    let result = await pool.request().query(command);
                    res.write('<p>' + JSON.stringify(result) + '</p>');
                }
                catch (err) {
                    // Ignore any errors                    
                }            
            }

            res.write('"<h2>Database loading complete!</h2>');
            res.end();
        } catch(err) {
            console.dir(err);
            res.write(err.toString());
        }
        res.end();
    })();
});

module.exports = router;