"use strict";

const mongoose = require('mongoose');

const authorSchema == mongoose.Schema({
  firstName: {type: 'string', required: true},
  lastName: {type: 'string', required: true},
  userName: {type: 'string', unique: true}
});

const commentSchema = mongoose.Schema({
  content: 'string'
});

const blogSchema = mongoose.Schema({
  title: {type: 'string', required: true},
  content: {type: 'string', required: true},
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'Author'},
  comments: [commentSchema],
  created: {type: 'date', required: true}
});

blogSchema.virtual("authorName").get(function(){
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogSchema.pre('find', function(next){
  this.populate('author');
  this.select('-comments');
  next();
});

blogSchema.pre('findOne', function(next){
  this.populate('author');
  next();
});

blogSchema.methods.serialize = function() {
  return  {
    id: this._id,
    title: this.title,
    content: this.content,
    author: this.authorName,
    created: this.created
  };
};

const Author = mongoose.model("Author", authorSchema);
const Post = mongoose.model("Post", blogSchema);

module.exports = {Post, Author};