'use strict';

const http = require('http');
const https = require('https');

class APICall {

  constructor() {
    this.Methods = {
      userCreate: '/user/create'
    };
    this.apiURL = 'http://localhost:3000';
  }

  userRegistration() {
    console.log("User registration event");
    let userData = {
      'password': 'random-todo'
    };

    this.request(this.Methods.userCreate, userData)
    .then((response) => {
      if (response.result != "success") {
        console.log("User registration error: ", response);
        return false;
      }

      if (!response.data.user_id) {
        console.log("User ID not found in answer from API: ", response);
        return false;
      }

      console.log("User successfully registered: " + response.data.user_id);
      return response.data.user_id;
    })
    .catch((err) => {
      console.log(err);
    });
  }

  request(method, data) {
    return new Promise((resolve, reject) => {

      var post_data = JSON.stringify(data),
          post_options = {
            hostname: 'localhost',
            port    : '3000',
            path    : method,
            method  : 'POST',
            headers : {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Content-Length': post_data.length
            }
          };

      let request = http.request(post_options, (res) => {

        if (res.statusCode < 200 || res.statusCode > 299) {
          reject(new Error('Failed to load page, status code: ' + res.statusCode));
        }

        let body = [];
        res.on('data', (chunk) => body.push(chunk));
        res.on('end', () => {
          var bodyString = body.join('');
          try {
            resolve(JSON.parse(bodyString));
          }
          catch (err) {
            reject(new Error('Failed to parse response as JSON: ' + bodyString));
          }
        });

      });

      request.on('error', (err) => reject(err));
      request.write(post_data);
      request.end();

    });
  }

}

module.exports = APICall;