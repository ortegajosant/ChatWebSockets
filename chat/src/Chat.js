import React, { Component } from 'react';
import $ from 'jquery';
import './Chat.css';

class Chat extends Component {
    componentDidMount() {
        this.run();
    }

    render() {
        return (
            <body>
                <div id="content"></div>
                <div>
                    <span id="status">Conectando...</span>
                    <input type="text" id="input" disabled="disabled" />
                </div>
            </body>

        );
    }

    checkWS(content, input) {

        // Se utiliza el websocket que proviene del Browser ej: Mozilla
        window.WebSocket = window.WebSocket || window.MozWebSocket;

        if (!window.WebSocket) {
            content.html($('<p>',
                { text: 'Lo sentimos, el navegador no soporta WebSockets.' }
            ));
            input.hide();
            $('span').hide();
            return false;
        }

        return true;

    }

    run() {
        var content = $('#content');
        var input = $('#input');

        if (!this.checkWS(content, input))
            return

        
        var status = $('#status');

        var myColor = false;

        var myName = false;

        // Abrir la conexión
        var connection = new WebSocket('ws:/192.168.0.10:1337');
        connection.onopen = function () {
            // Se ingresa el nombre de usuario
            input.removeAttr('disabled');
            status.text('Nombre de Usuario:');
        };

        connection.onerror = function (error) {

            content.html($('<p>', {
                text: 'Lo sentimos, hay un problema de conexión o con el servidor'
            }));
        };
        // Mensajes entrantes
        connection.onmessage = function (message) {
            // Se parsea el JSON
            try {
                var json = JSON.parse(message.data);
            } catch (e) {
                console.log('Invalid JSON: ', message.data);
                return;
            }


            if (json.type === 'color') {
                myColor = json.data;
                status.text(myName + ': ').css('color', myColor);
                input.removeAttr('disabled').focus();

            } else if (json.type === 'history') {
                // Se agregan los mensajes al chat
                for (var i = 0; i < json.data.length; i++) {
                    addMessage(json.data[i].author, json.data[i].text,
                        json.data[i].color, new Date(json.data[i].time));
                }

            } else if (json.type === 'message') {
                // let the user write another message
                input.removeAttr('disabled');
                addMessage(json.data.author, json.data.text,
                    json.data.color, new Date(json.data.time));
            } else {
                console.log('Revisar la estructura del JSON:', json);
            }
        };

        /**
         * Enviar mensajes al presionar la tecla _Enter_
         */
        input.keydown(function (e) {
            if (e.keyCode === 13) {
                var msg = $(this).val();
                if (!msg) {
                    return;
                }

                connection.send(msg);
                $(this).val('');
                
                // Deshabilitar el envío hasta que el servidor lo procese
                input.attr('disabled', 'disabled');
                
                // Se asigna el nombre de usuario en caso de que no lo tenga
                if (myName === false) {
                    myName = msg;
                }
            }
        });

        /**
         * Este intervalo es para verificar que la conexión con el servidor se mantiene
         */
        setInterval(function () {
            if (connection.readyState !== 1) {
                status.text('Error');
                input.attr('disabled', 'disabled').val(
                    'Imposible comunicarse con el servidor.');
            }
        }, 3000);

        /**
         * Se añade el mensaje a al ventana del chat
         */
        function addMessage(author, message, color, dt) {
            content.prepend('<p><span style="color:' + color + '">'
                + author + '</span> @ ' + (dt.getHours() < 10 ? '0'
                    + dt.getHours() : dt.getHours()) + ':'
                + (dt.getMinutes() < 10
                    ? '0' + dt.getMinutes() : dt.getMinutes())
                + ': ' + message + '</p>');
        }
    }
}

export default Chat;