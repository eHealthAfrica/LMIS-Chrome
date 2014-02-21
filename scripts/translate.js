'use strict';

/**
 * Adds a new translation to 'messages.json'
 */

var fs = require('fs'),
    prompt = require('cli-prompt'),
    changeCase = require('change-case');

var messageFile = 'app/_locales/en/messages.json';

fs.readFile(messageFile, function(err, data) {
  if(err) {
    throw err;
  }

  var messages = JSON.parse(data);

  prompt('Message to translate: ', function(message) {
    var key = changeCase.camelCase(message);
    messages[key] = {
      'message': message
    };

    fs.writeFile(messageFile, JSON.stringify(messages, null, 2), function(err) {
      if(err) {
        throw err;
      }
    });
  });

});

