"use strict";

const express = require('express'); 
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');
const { Post } = require('./models');

const app = express();
app.use(express.json());

//get blog posts from the posts collection in the blog-app db, limit 5
app.get('/posts', (req, res) => {
  Post.find()
    .limit(5)
    .then(posts => {
      res.json({
        posts: posts.map(post => post.serialize()) 
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

//get post by id
app.get('/posts/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

//create post
app.post('/posts', (req, res) => {
  let requiredFields = ["title", "content", "author", "created"];
  for(let i = 0; i < requiredFields.length; i++){
    let field = requiredFields[i];
    if(!(field in req.body)){
      let message = `Missing \`${field}\` in request body`;
      console.log(message);
      return res.status(400).send(message);
    };
  };

  Post.create({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    created: req.body.created
  })
    .then(post => res.status(201).json(post.serialize()))
    .catch(err => {
      console.error(err);
      res.status(400).json({message: "Internal server error"});
    });
});

app.put('/posts/:id', (req, res) => {
  if(!(req.body.id && req.params.id === req.body.id)){
    const message = `Request path id (${req.params.id}) must match request body id (${req.body.id})`;
    console.error(message);
    return res.status(400).json({message});
  };

  toUpdate = {};
  updateableFields = ["title", "content"];

  updateableFields.forEach(field => {
    if(field in req.body){
      toUpdate[field] = req.body[field];
    };
  });

  Post.findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .then(res => res.status(204).end())
    .catch(err => {
      console.error(err);
      res.status(500).json({message: "Internal server error"});
    });
});

//delete post by id
app.delete('/posts/:id', (req, res) => {
  Post.findByIdAndRemove(req.params.id)
    .then(res => res.status(204).end())
    .catch(error => res.status(500).json({message: "Internal server error"}));
});

//catch all endpoint for non-existant endpoint requests
app.use('*', (req, res) => {
  res.status(404).json({message: 'Not found'});
});

//runServer and closeServer functions
let server

function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(
      databaseUrl,
      err => {
        if(err){
          return reject(err);
        }
        server = app
          .listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve();
          })
          .on("error", error => {
            mongoose.disconnect();
            reject(err);
          });
      }
    );
  });
}

function closeServer() {
  mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log("Shutting down server");
      server.close(err => {
        if(err){
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if(require.main === module){
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};