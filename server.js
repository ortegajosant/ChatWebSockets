"use strict";
// Asigna nombre del proceso para verlo en el log
process.title = 'node-chat';

// websocket y http servers
var webSocketServer = require('websocket').server;
var http = require('http');
var auxfunctions = require('./auxfunctions.js');


// Global variables

// Puerto donde se ejecuta el websocket server
const webSocketsServerPort = 1337;
const IP = auxfunctions.getIPAddress();
var server;
var wsServer;
var history = []; // Mensajes enviados
var clients = []; // Lista de los clientes actuales (usuarios conectados)
var colors; // Colores para asignación de clientes
/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * HTTP server
 */
function runHTTPServer() {
    colors = ['red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange'];
    colors.sort(function (a, b) { return Math.random() > 0.5; });
    // Inicializa el server HTTP
    server = http.createServer();

    server.listen(webSocketsServerPort, IP);

    console.log(" Server is listening on " + IP + ":" + webSocketsServerPort);
}

/**
 * WebSocket server
 */
function runWebSocketServer() {

    runHTTPServer();

    wsServer = new webSocketServer({
        // El websocket utiliza el servidor http, para servirse
        httpServer: server
    });

    // Cada vez que un cliente se intenta conectar
    wsServer.on('request', function (request) {
        console.log((new Date()) + ' Connection from origin '
            + request.origin + '.');

        // Se acepta la conexión
        var connection = request.accept(null, request.origin);
        console.log('Cliente:', connection.remoteAddress);

        // Se extrae el índice del cliente para removerlo cuando se desconecta
        var index = clients.push(connection) - 1;
        var userName = false;
        var userColor = false;
        console.log('Conexión aceptada.');

        // Se le envía el historial de mensajes
        if (history.length > 0) {
            connection.sendUTF(
                JSON.stringify({ type: 'history', data: history }));
        }

        // Al enviar un mensaje
        connection.on('message', function (message) {
            if (message.type === 'utf8') {
                // Se verifica que ya tenga Usuario ingresado

                if (userName === false) {
                    // Asigna usuario y color
                    userName = htmlEntities(message.utf8Data);
                    userColor = colors.shift();

                    // Se agrega el color para el usuario en la conexión.
                    connection.sendUTF(
                        JSON.stringify({ type: 'color', data: userColor }));
                    console.log(' Usuario: ' + userName + ' de color ' + userColor);

                } else { // Recibir, archivar y compartir el mensaje
                    console.log(' Received Message from ' + userName + ': ' + message.utf8Data);

                    // Se agrega el mensaje al historial
                    var obj = {
                        time: (new Date()).getTime(),
                        text: htmlEntities(message.utf8Data),
                        author: userName,
                        color: userColor
                    };
                    history.push(obj);
                    history = history.slice(-100);

                    // Se transmite el mensaje a todos los clientes conectados
                    var json = JSON.stringify({ type: 'message', data: obj });
                    for (var i = 0; i < clients.length; i++) {
                        clients[i].sendUTF(json);
                    }
                }
            }
        });


        // Desconexión de usuario
        connection.on('close', function (connection) {
            if (userName !== false && userColor !== false) {
                console.log(userName + " " + userColor + " disconnected.");
                // Quitar usuario de la lista
                clients.splice(index, 1);
                colors.push(userColor);
            }
        });
    });
}


runWebSocketServer();