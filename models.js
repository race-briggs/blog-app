"use strict";

const mongoose = require('mongoose');

blogSchema = mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  author: {
    firstName: {type: String, required: true},
    lastName: {type: String, required: true}
  },
  created: {type: Date, required: true}
});

blogSchema.virtual("authorName").get(function(){
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogSchema.methods.serialize = function() {
  title: this.title,
  content: this.content,
  author: this.authorName,
  created: this.created
};

const Post = mongoose.model("Post", blogSchema);

module.exports = {Post};