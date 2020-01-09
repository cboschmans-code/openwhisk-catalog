/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const needle = require('needle');

/**
 *  Feed to create a webhook on Trello
 *
 *  @param {object} params - information about the trigger
 *  @param {string} APIKey  - trello API key
 *  @param {string} accessToken - trello API token
 *  @param {string} idModel -id of card, list, board
 *  @param {string} description - description of hook
 *  @return {object} whisk async
 */
function main(params) {
  var description = params.description;
  var accessToken = params.accessToken;
  var APIkey =params.APIKey;
  var idModel=params.idModel;


  var lifecycleEvent = params.lifecycleEvent;
  var triggerName = params.triggerName.split("/");

  // URL of the whisk system. The calls of github will go here.
  var urlHost = require('url').parse(process.env.__OW_API_HOST);
  var whiskCallbackUrl = urlHost.protocol + '//' + process.env.__OW_API_KEY + "@" + urlHost.host + '/api/v1/namespaces/' + encodeURIComponent(triggerName[1]) + '/triggers/' + encodeURIComponent(triggerName[2]);

  // The URL to create the webhook on Github
  var registrationEndpoint = 'https://api.trello.com/1/tokens/' + accessToken + '/webhooks;
  console.log("Using endpoint: " + registrationEndpoint);

  if (lifecycleEvent === 'CREATE') {
   // var events = params.events.split(',');

   /* var body = {
      name: 'web',
      active: true,
      events: events,
      config: {
        url: whiskCallbackUrl,
        content_type: 'json'
      }
    };
*/
    var promise = new Promise(function (resolve, reject) {
      needle.post(registrationEndpoint+'?key='+APIkey, body, { 'json': true, description: description, callbackURL: whiskCallbackUrl, idModel: idModel }, function (error, response, body) {
        if (error) {
          reject({
            response: response,
            error: error,
            body: body
          });
        } else {
          console.log("Status code: " + response.statusCode);

          if (response.statusCode >= 400) {
            console.log("Response from Trello: " + body);
            reject({
              statusCode: response.statusCode,
              response: body
            });
          } else {
            resolve({ response: body });
          }
        }
      });
    });

    return promise;
  } else if (lifecycleEvent === 'DELETE') {
    //list all the existing webhooks first.
    var deletePromise = new Promise(function (resolve, reject) {
      needle.get(registrationEndpoint'?key='+APIkey, function (error, response, body) {

        var foundWebhookToDelete = false;

        if (error) {
          reject({
            response: response,
            error: error,
            body: body
          });
        } else {
          for (var i = 0; i < body.length; i++) {
            if (decodeURI(body[i].callbackURL) === whiskCallbackUrl) {
              foundWebhookToDelete = true;

              console.log('DELETE Webhook : ' + body[i].description);

              needle.delete(registrationEndpoint +'/' +body[i].id +'?key='+APIkey, null, function (error, response, body) {
                if (error) {
                  reject({
                    response: response,
                    error: error,
                    body: body
                  });
                } else {
                  console.log("Status code: " + response.statusCode);
                  if (response.statusCode >= 400) {
                    console.log("Response from Github: " + body);

                    // a 404 is common and confusing enough to warrant an extra message
                    if (response.statusCode === 404) {
                      console.log('Please ensure your accessToken is authorized to delete webhooks.');
                    }

                    reject({
                      statusCode: response.statusCode,
                      response: body
                    });
                  } else {
                    resolve();
                  }
                }
              });
            }
          }

          if (!foundWebhookToDelete) {
            reject('Found no existing webhooks for trigger URL ' + whiskCallbackUrl);
          }
        }
      });
    });

    return deletePromise;
  }
}
