//c'est un template helper

////////////////////////////////////////////////////////////////////////////
import { Session } from 'meteor/session'
import { Template } from 'meteor/templating';

import { Articles } from '../api/articles.js';
import './article.js';
import './body.html';
// template pour ajouter, modifier, consulter le feed Instagram
import './ajoutement.html';
import './modify.html';
import './instagramFeed.html';
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
Template.body.onCreated(function bodyOnCreated() {
  Meteor.subscribe('articles');
  Session.set('insta',1);
  Session.set('showArt',1);
  resize();
});
/////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
Template.body.helpers({
  //permet de lire les informations des articles pour les afficher de plus récent au plus ancien dans le template article.html
  articles() {
    return Articles.find({}, {sort: {createdAt: -1}});
  },
  //permet de voir si la valeur 'wantModif' est true --> va permettre d'afficher le formulaire plus loin
  wantModif: function() {
    return Session.get('wantModif');
  },
  idTemp: function(){
    return Session.get('idTemp');
  },
  wantLoc: function(){
    return Session.get('wantLoc');
  },
  where: function(){
   return Session.get('city') + " [" + Session.get('state') + "] " + Session.get('country');
  },
  wantInsta: function(){
    return Session.get('wantInsta');
  },
  city: function(){
    return Session.get('city');
  },
});
/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
Template.body.events({
//-------------------------------------------------------------------------------------------------------------------------------
 'submit .newArticle'(event) {
   event.preventDefault();
   const target = event.target;
   const text = target.text.value;
   const titre = target.titre.value;
   const photo = target.photo.value;
   lieux = '';
   if(Session.get('wantLoc') == true){
     lieux = Session.get('city') + " [" + Session.get('state') + "] " + Session.get('country');
   }
   //permet de prendre les valeurs du formulaire et de tester si elles ne sont pas vides ou juste des espaces
   if ((/\S/.test(text))||(/\S/.test(titre))) {
     Meteor.call('articles.insert',text,titre,photo,lieux);
   }else {
     alert("Vous devez remplir tous les champs");
   }
 //permet de remettre les champs vides après l'appel de la méthode
   target.text.value = '';
   target.titre.value = '';
   target.photo.value = '';
 },
//-------------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------
 'submit .modifyArticle'(event) {
  event.preventDefault();
  const target = event.target;
  const textModif = target.textModif.value;
  const titreModif = target.titreModif.value;
  const photoModif = target.photoModif.value;
  const idModif = Session.get('idTemp');
  //permet de prendre les valeurs du formulaire et de tester si elles ne sont pas vides ou juste des espaces
  if ((/\S/.test(textModif))||(/\S/.test(titreModif))) {
    Meteor.call('articles.modify',idModif,textModif,titreModif,photoModif);
    Session.set('wantModif',false);
  //permet de se déplacer sur l'article que nous venons de modifier
  setTimeout(function(){
    $('.titreArticle').each(function(i, obj) {
        if(obj.textContent.includes(titreModif)){
            var position = obj.offsetTop;
            window.scrollTo(0,position);
            //on limite la taille du texte au cas où l'utilisateur a ajoute beaucoup de textContent
            resize();
            return false;
        }
    });
  }, 20)
  /////////////////////////////////////////////////////
  }else {
    alert("Vous ne pouvez pas laissez de champs vides");
  }
 },
//-------------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------
 'click .posBut'(event){
   Session.set('wantLoc',true);
   // permet de créer un map google et de localiser le visiteur du site puis d'afficher sa position sur la map
   window.initMap = function(){
     var map = new google.maps.Map(document.getElementById('map'), {
       center: {lat: -34.397, lng: 150.644},
       zoom: 6,
       mapTypeId: google.maps.MapTypeId.SATELLITE
     });
     var infoWindow = new google.maps.InfoWindow({map: map});
     // Try HTML5 geolocation.
     if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(function(position) {
       var pos = {
         lat: position.coords.latitude,
         lng: position.coords.longitude
       };
         //permet de savoir la ville + le canton + le pays d'où la personne viens
    var geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    geocoder.geocode({'latLng': latlng}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
  				if (results[1]) {
    					for (var i = 0; i < results.length; i++) {
      					   if (results[i].types[0] === "locality") {
            					var city = results[i].address_components[0].short_name;
            					var state = results[i].address_components[2].short_name;
                      var country = results[i].address_components[3].long_name;
                      Session.set('city',city);
                      Session.set('state',state);
                      Session.set('country',country);
            				}
            	}
    			}else {
            console.log("No reverse geocode results.")
          }
    			}else {
            console.log("Geocoder failed: " + status)
          }
    });
        ///////////////////////////////////////////////////////////////////////////////////////////////////
       infoWindow.setPosition(pos);
       infoWindow.setContent('Vous êtes ici');
       map.setCenter(pos);
       map.setTilt(45);
       map.setZoom(18);
     }, function() {
         handleLocationError(true, infoWindow, map.getCenter());
       });
     } else {
       handleLocationError(false, infoWindow, map.getCenter());
     }
   }
   function handleLocationError(browserHasGeolocation, infoWindow, pos) {
     infoWindow.setPosition(pos);
     infoWindow.setContent(browserHasGeolocation ?
                           'Error: The Geolocation service failed.' :
                           'Error: Your browser doesn\'t support geolocation.');
   }
   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //pour aller tout en bas là où il y a la map
   setTimeout(function(){
      window.scrollTo(0,document.body.scrollHeight);
   }, 50)
 },
//-------------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------
 'click #goToInstagramFeed'(event){
   Session.set('wantInsta',true);
    if ( Session.get('insta') == 1 ) {
      document.getElementById("goToInstagramFeed").textContent= "Masquer le feed";
      Session.set('insta',2);
    } else {
      document.getElementById("goToInstagramFeed").textContent= "Aller voir le feed Instagram";
      Session.set('wantInsta',false);
      Session.set('insta',1);
    }
//c'est pour prendre les photos instagram de la ville au visiteur mais on ne peut plus sans avoir été validé par Instagram
  setTimeout(function(){
    var feed = new Instafeed({
      get: 'user', //tagged or user
      //  tagName: 'awesome',
      userId: '269126703', //'269126703' = moi ,
      accessToken: '269126703.1677ed0.78fe7de935fb486c8b4656de26fb962f'
    });
  feed.run();
  window.scrollTo(0,200);
  }, 200)
},
//-------------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------
  'click .tfbutton'(event){
    research = document.getElementById('tftextinput').value.toLowerCase();
    nombreValide = 0;
    lesPositions = [];
    lesTitres = [];
    index = 1;
    error = 0;

    //test si ce n'est pas vide
    if ((/\S/.test(research))==false){
      alert("vous ne pouvez pas effectuer de recherches vides");
    }else{
      //parcour les titres afin de trouver ceux qui contiennent la recherche
      $('.titreArticle').each(function(i, obj) {
        actual = obj.textContent.toLowerCase();
        if(actual.includes(research)){
          //si il contient on incrémente le nombreValide
          nombreValide = nombreValide +  1;
          //on ajoute la position de cet article dans le tableaux
          lesPositions.push(obj.offsetTop);
          lesTitres.push(actual);
          //on va sur le premier index du tableau
          window.scrollTo(0,lesPositions[0]);
          document.getElementById('tftextinput').value = "";
        }else{
          $(obj).closest(".liArticle").hide();
          document.getElementById('tftextinput').value = "";
       }
    });
   if(nombreValide == 0){
     alert("impossible de trouver un article contenant votre recherche");
   }else if(nombreValide == 1){
     console.log("Il y a un seul article qui correspond à la recherche");
   }else{
     //s'il y en a >1 on affiche le bouton
    console.log("Il y a : " + (nombreValide-1)  + " articles supplémentaires contenant votre recherche");
    document.getElementById("nextArt").setAttribute('type','button');
    document.getElementById("nextArt").setAttribute('value','article n°' + (index+1));
   }
  }
  },
//-------------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------
'click #nextArt'(event){
  window.scrollTo(0,lesPositions[index]);
  //si on est toujours pas au dernier on continue
  if(index < (lesPositions.length-1)){
    index += 1;
    document.getElementById("nextArt").setAttribute('value','article n°' + (index+1));
  }else{
    //si on est au dernier on cache le bouton
    index = 1;
    lesPositions.length = 0;
    document.getElementById("nextArt").setAttribute('type','hidden');
  }
  },
//-------------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------
'click #showMesArticles'(event){

  var id = Meteor.userId();
  title = "";
  comp = 1;
  positionsMesArticles = [];

  if ( Session.get('showArt') == 1 ) {
    document.getElementById("showMesArticles").textContent= "Voir tous les articles";
    //on parcours tous les articles et si l'auteurID est différent on les caches
    $('.titreArticle').each(function(i, obj) {
      title= obj.textContent;
      var art =  Articles.findOne({titre: title });
      if(art.owner != id){
        $(obj).closest(".liArticle").hide();
      }else{
        //si l'article est à lui on ajoute la position dans un tableau
        positionsMesArticles.push(obj.offsetTop);
      }
    });
    if(positionsMesArticles.length > 0){
      //on se déplace sur le premier article de l'utilisateur
      window.scrollTo(0,positionsMesArticles[0]);
    }else{
      alert("vous n'avez aucuns articles");
      location.reload();
    }
    //on met la valeur à 2 pour savoir que l'étape suivant ce sera afficher tous les articles
    Session.set('showArt',2);
  } else {
    document.getElementById("showMesArticles").textContent= "Afficher mes articles";
    //on parcours tous les articles pour mettre les afficher avec .show()
    $('.titreArticle').each(function(i, obj) {
      title= obj.textContent;
      $(obj).closest(".liArticle").show();
    });
    //on met la valeur à 1 pour savoir que la prochaine fois on veut afficher nos articles
    Session.set('showArt',1);
  }
 },
//-------------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------
'click #sendFeedBack'(event){
  /////////
  // En vrai il faudrait faire un formulaire php ou chercher comment envoyer l'email à mon adresse
  ////////
  event.preventDefault();
  //on prends le contenu du champ email et msg
  var email = $('#email').val();
  var msg = $('#msg').val();
  //on les testes
  if (((/\S/.test(email))==false)||((/\S/.test(msg))==false)){
    alert("Veuillez remplir tous les champs svp");
  }else{
    //permet d'ouvrir le mail et le préfaire
    var link = "mailto:jerome.vial@swisscom.com"
               + "?subject=" + escape("A feedback about your website")
               + "&body=" + escape(msg)
      ;
    window.location.href = link;
    ////////////////////////////////////////////
    //on vide les champs
    $('#email').val('');
    $('#msg').val('');
  }
},
});

// permet d'effacer les variables de Session lorsque l'on se déconnecte
Accounts.onLogout(function() {
  sessionStorage.clear();
  location.reload();
});
///////////////////////////////////////////////////////////////////
