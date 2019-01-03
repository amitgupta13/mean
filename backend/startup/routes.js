const express = require('express');
const postRoutes = require('../routes/posts');
const usersRoutes = require('../routes/users');
const bodyParser = require("body-parser");
const path = require('path');


module.exports = function(app){
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use('/images', express.static(path.join('backend/images')));

    app.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Origin, X-Requested-With, Content-Type, Accept, Authorization"
        );
        res.setHeader(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        );
        next();
      });

    app.use('/api/posts', postRoutes);
    app.use('/api/users', usersRoutes);
}