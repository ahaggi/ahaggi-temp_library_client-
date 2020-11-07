const express = require('express');
const path = require('path');
const app = express(); 
app.use(express.static(__dirname + '/dist/library'));
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname + 'dist/library/index.html'));
}); 
app.listen(process.env.PORT || 8080);


/**
 * 
 * npm i express path --save

 * create this file server.js

 * Modify package.json
      "scripts": {
        "start": "node server.js",
        .. ,
        "heroku-postbuild": "ng build --aot --prod"
      }

 * ng build

 * push to github

 * Heruko:
      -create new app
      -inside "deploy" ==> "Deployment method" choose "connect to github"
      - Optionaly choose which github barnch to connect to 

 * 
 * 

 */

