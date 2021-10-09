// Create ws server
// on upgrade event, authenticate the request and send the ws messages to amazon transcribe

import WebSocket, { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { createPresignedUrl } from './utilities.js';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';

const expressApp = express();

expressApp.use(express.static('dist'));

//access-origin-allow-all
expressApp.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


// send index.html using path
expressApp.get('/', function(req, res) {
    res.sendFile(path.join(process.cwd(), 'index.html'));
});

// route not found
expressApp.use((req, res, next) => {
    res.status(404).send('Page not found');
});


dotenv.config();

const serverApp = createServer(expressApp);
const wss = new WebSocketServer({ noServer: true });
const PORT = process.env.PORT || 8080;




serverApp.on('upgrade', function upgrade(request, socket, head) {
    console.log("upgrade request coming in");
    // This function is not defined on purpose. Implement it with your own logic.
    //   authenticate(request, (err, client) => {
    //     if (err || !client) {
    //       socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    //       socket.destroy();
    //       return;
    //     }

    //   });

    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });

});

wss.on('connection', async function connection(wsFromClient, request) {

    const preSignedURL = await createPresignedUrl();
    // send message to amazon transcribe
    
    
    // create ws connection to amazon transcribe
    const wsToTranscribeService = new WebSocket(preSignedURL);

    

    wsToTranscribeService.on('open', function open() {
        console.log('Connection to AWS Transcribe open');
        wsFromClient.on('message', function incoming(dataFromClient) {
            console.log(`Received message from client`);
            console.log(wsToTranscribeService.readyState);
            if(wsToTranscribeService.readyState === WebSocket.OPEN) {
                console.log('sending message to transcribe service');
                wsToTranscribeService.send(dataFromClient);
            }
            
        });

        wsFromClient.on('close', function close() {
            console.log('Connection to client closed');
            wsToTranscribeService.close();
        });

        wsFromClient.on('error', function error(err) {
            console.log(err + ' error from client');
            wsToTranscribeService.close();
        });

        wsToTranscribeService.on('message', function incoming(dataFromTranscribeService) {
            console.log(`Received message from AWS Transcribe`);
            wsFromClient.send(dataFromTranscribeService);
        });
    
        wsToTranscribeService.on('close', function close() {
            console.log('Connection to AWS Transcribe closed');
            wsFromClient.close();
        });
    
        wsToTranscribeService.on('error', function error(err) {
            console.log(err + ' error from AWS Transcribe');
            wsFromClient.close();
    
        });
    });
    

   
});

export default serverApp;