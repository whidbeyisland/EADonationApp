var port = process.env.PORT || 3000,
    http = require('http'),
    fs = require('fs'),
    html = fs.readFileSync('index.html');

var log = function(entry) {
    fs.appendFileSync('/tmp/sample-app.log', new Date().toISOString() + ' - ' + entry + '\n');
};



// coati: new

const express = require('express');
const {spawn} = require('child_process');
const app = express();




var server = http.createServer(function (req, res) {
    if (req.method === 'POST') {
        console.log('got here 1');
        var body = '';

        req.on('data', function(chunk) {
            console.log('got here 2');
            body += chunk;
        });

        req.on('end', function() {
            if (req.url === '/') {
                log('Received message: ' + body);
            } else if (req.url = '/scheduled') {
                log('Received task ' + req.headers['x-aws-sqsd-taskname'] + ' scheduled at ' + req.headers['x-aws-sqsd-scheduled-at']);
            }

            res.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
            res.end();
        });
    } else {
        console.log('got here 3');


        //coati: generic python code

        var dataToSend;
        // spawn new child process to call the python script
        const python = spawn('python', ['script1.py']);
        console.log('got here 3.1');
        // collect data from script
        python.stdout.on('data', function (data) {
            console.log('Pipe data from python script ...');
            dataToSend = data.toString();
        });
        console.log('got here 3.2');
        // in close event we are sure that stream from child process is closed
        python.on('close', (code) => {
            console.log(`child process close all stdio with code ${code}`);
            // send data to browser
            // res.send(dataToSend)
            console.log(dataToSend);
        });



        //coati: was here before

        console.log('got here 3.3');
        res.writeHead(200);
        res.write(html);


        //coati: trying this

        var html2 = fs.readFileSync('index2.html');
        res.write(html2);
        res.end();
    }
});

// Listen on port 3000, IP defaults to 127.0.0.1
server.listen(port);

// Put a friendly message on the terminal
console.log('Server running at http://127.0.0.1:' + port + '/');