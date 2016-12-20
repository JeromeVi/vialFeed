//// AJOUT DE LA SESSION
import { Session } from 'meteor/session'
////////////////////////////////////////
import { Template } from 'meteor/templating';
import { Articles } from '../api/articles.js';
import './article.js';
import './body.html';
// template pour modifier
import './modify.html';
////////////////////////////////////


// devrait être dans modify.js mais problèmes avec les imports
Template.modify.helpers({
  titreTemp: function(){
    return Session.get('titreTemp');
  },
  textTemp: function(){
    return Session.get('textTemp');
  },
  photoTemp: function(){
    return Session.get('photoTemp');
  }
});
