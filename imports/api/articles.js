//c'est là où on effectue les méthodes, dans les helpers on appelle ces méthodes
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Articles = new Mongo.Collection('articles');
if (Meteor.isServer) {
  // ça ne tourne que sur le serveur
  Meteor.publish('articles', function articlePublication() {
    return Articles.find({}, {sort: {createdAt: -1}});
  });
}


//Méthodes////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Meteor.methods({
  'articles.insert'(text,titre,photo,lieux) {
    check(text, String);
    check(titre, String);
    check(photo, String);
    check(lieux, String);

    // il doit être connecté
    if (! this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1;
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();
    var heure = dateObj.getHours();
    var minute = dateObj.getMinutes();
    var dateCreation = new Date();


    if(day < 10){
      today = "0" + day;
    }else{
      today= day;
    }


    if(minute < 10){
      min = "0" + minute;
    }else{
      min= minute;
    }


    if(heure < 10){
      hour = "0" + heure;
    }else{
      hour = heure;
    }

    if(/\S/.test(lieux)){
      location = "de " + lieux;
    }else {
      location = "";
    }

    Articles.insert({
      text: text,
      titre: titre,
      photo: photo,
      owner: Meteor.userId(),
      username: Meteor.users.findOne(this.userId).username,
      date: today + "." + month + "." + year,
      heure: hour + "h" + min,
      createdAt: dateCreation,
      lieux:  location,
   });
  },

  'articles.remove'(taskId) {
    const article = Articles.findOne(taskId);
    if (article.owner !== this.userId) {
      // ça veut dire qu'il veut supprimer l'article d'un autre mais c'est déjà contrôller avec le bouton qui apparaît que si c'est la bonne personne
            throw new Meteor.Error('not-authorized, vous ne pouvez pas supprimer les articles des autres');
    }else{
      check(taskId, String);
      Articles.remove(taskId);
    }
  },

  'articles.modify'(taskId,text,titre,photo) {
    const article = Articles.findOne(taskId);
    if (article.owner !== this.userId) {
      // ça veut dire qu'il veut modifier l'article d'un autre mais c'est déjà contrôller avec le bouton qui apparaît que si c'est la bonne personne
            throw new Meteor.Error('not-authorized, vous ne pouvez pas modifier les articles des autres');
    }else{
      check(taskId, String);
      //cela modifier l'article dans la collection
     Articles.update({_id: taskId},{$set:{titre : titre, text : text, photo: photo}});
  }
},
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
