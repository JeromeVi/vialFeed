////////////////////////////////////////////////////////////////////////////
import { Template } from 'meteor/templating';

import { Articles } from '../api/articles.js';

import './article.html';
////////////////////////////////////////////////////////////////////////////
Session.setDefault('wantModif', false)

resize = function() {
  //allow us to limit the text length
    $('.liArticle').each(function(i, obj) {
    mySpan = $(this).find('.mySpan');
    if(mySpan.text().length > 500){
      //put the read more button
      $(this).find('.readMore').removeClass('hidden');
      //limit the character size
      mySpan.text(mySpan.text().substring(0,495) + '\n' + " [...]");
    }

  });
}


Template.article.onCreated(function articleOnCreated() {
    resize();
});

Template.article.events({
  //permet d'effacer un article de la DB
  'click .delete'() {
        Meteor.call('articles.remove', this._id);
  },
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//lorsque l'on clique sur le bouton modifier
  'click .modify'(event) {
    event.preventDefault();
      //on prends les infos de l'article que l'on veut modifier
      const id = this._id
      const art = Articles.findOne({_id: id});
      const titre =  art["titre"];
      const text = art["text"];
      const photo = art["photo"];
      /////////////////////////////////////////////////////////
      //on met les infos dans des variables de sessions pour les "transporter"
      Session.set('titreTemp', titre);
      Session.set('textTemp', text);
      Session.set('photoTemp',photo);
      Session.set('idTemp', id);
      ////////////////////////////////////////////////////////////////////////
      //on dit que l'on veut faire une modification (cela fait appraître le formulaire)
      Session.set('wantModif', true);
      //on set un timeout sinon on ne peut pas aller tout en bas de la page car l'élément "form modif" n'est pas encore là
      //je sais qu'il existe un méthode pour synchroniser les actions mais je ne m'en souviens plus...
      setTimeout(function(){
        //on se déplace en bas de la page
        window.scrollTo(0,document.body.scrollHeight);
      }, 20)
  },
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
'click .readMore'(event) {
  //il faut tout masquer et faire appraître seulement l'article cliqué
  event.preventDefault();
  const id = this._id
  const art = Articles.findOne({_id: id});
  titre =  art["titre"];
  text = art["text"];
  const photo = art["photo"];

  $('.titreArticle').each(function(i, obj) {
    title= obj.textContent;
    var art =  Articles.findOne({titre: title });
    if((art.titre === titre)&&(art.text === text)){

    }else{
      $(obj).closest(".liArticle").hide();
    }
  });
  //j'ai crée une classe css hidden qui met juste display:none
    //je cache le header qui contient les boutons et l'ajout
  $("#headerBody").addClass("hidden");
    //je cache le titre du site
  $("#vialFeed").addClass("hidden");
    //je cache les boutons de modification et suppression de l'article
  $(".modify").addClass("hidden");
  $(".delete").addClass("hidden");
    //je cache la map au cas où on avait cliquer sur la localisation
  $("#map").addClass("hidden");

    //je change le titre "les articles" par le titre de l'article et le modifie un peu
  $("#titreListe").html("VialFeed: ");
  $("#titreListe").css("font-family","\'Lemon\'");
  $("#titreListe").css({ 'font-size': 90 });

 //maintenant il faut changer la mise en forme de l'article pour qu'il prenne plus de place
    //on commence par enlever le bouton "lire l'article"
    $(".readMore").addClass("hidden");
    //on aggrandit le cadre de l'article pour qu'il prenne presque toute la largeur du site
    document.getElementById('lesArticles').style.width = "auto";
    //on affiche tous les caractères de l'article
    $('.mySpan').text(text);
    //on ajoute un bouton pour retourner sur le site complet
    $(".readAll").removeClass("hidden");


//on se déplace sur l'article
window.scrollTo(0,0);
},
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
'click .readAll'(event) {
  location.reload();
},

});


Template.article.helpers({
  isOwner: function() {
    return this.owner === Meteor.userId();
  },
  //permet de voir si la valeur 'wantModif' est true --> va permettre d'afficher le formulaire plus loin
  wantModif: function() {
    return Session.get('wantModif');
  }
});
