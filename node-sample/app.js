var port = process.env.PORT || 3000,
    http = require('http'),
    fs = require('fs'),
    html = fs.readFileSync('index.html');

var log = function(entry) {
    fs.appendFileSync('/tmp/sample-app.log', new Date().toISOString() + ' - ' + entry + '\n');
};

// initialize Express
const express = require('express');
const {spawn} = require('child_process');
const app = express();

// local variables
var _amount = 0; //amount of money user donates

// define POST and GET methods for page
var server = http.createServer(function (req, res) {
    if (req.method === 'POST') {
        var body = '';

        req.on('data', function(chunk) {
            body += chunk;
        });

        req.on('end', function() {
            if (req.url === '/') {
                console.log('Received message: ' + body);

                // coati: parse the amount of money from the string --- prob more elegant way to do this
                var amount_string = body.split('=')[1];

                try {
                    _amount = parseInt(amount_string);
                }
                catch {
                    _amount = 0;
                }
            } else if (req.url = '/scheduled') {
                console.log('Received task ' + req.headers['x-aws-sqsd-taskname'] + ' scheduled at ' + req.headers['x-aws-sqsd-scheduled-at']);
            }

            // call Python donation script
            var dataToSend;
            // spawn new child process to call the python script
            const python = spawn('python', ['make_donation.py']);
            // collect data from script
            python.stdout.on('data', function (data) {
                console.log('Pipe data from python script ...');
                dataToSend = data.toString();
            });
            // in close event we are sure that stream from child process is closed
            python.on('close', (code) => {
                console.log(`child process close all stdio with code ${code}`);
                res.writeHead(200);
                var html_after_payment = '<p>You donated $' + _amount + '</p><p>' + dataToSend + '</p>';
                res.write(html_after_payment);
                res.end();
                console.log(dataToSend);
            });
        });
    } else {
        // display basic pre-made Elastic Beanstalk HTML
        res.writeHead(200);
        res.write(html);
        res.end();
    }
});

// Listen on port 3000, IP defaults to 127.0.0.1
server.listen(port);

// Put a friendly message on the terminal
console.log('Server running at http://127.0.0.1:' + port + '/');
