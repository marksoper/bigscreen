
var DEFAULT_DELAY = 5000;
var FLICKR_PER_PAGE = 100;
var SHOW_DIV_ID = "mainShow";
var INIT_SHOW_HTML = '<img src="http://media.kickstatic.com/kickapps/images/11071/photos/PHOTO_1985903_11071_3947667_main.jpg">'

/* ------------------------------------------------- */


function Photo(originalId,originalSource,originalUrl,originalOwner,originalTitle) {
    this.originalId = originalId;
    this.originalSource = originalSource;
    this.originalUrl = originalUrl;
    this.url = originalUrl;
    this.originalOwner = originalOwner;
    this.originalTitle = originalTitle;
}

Photo.prototype = {
    originalId : null,
    originalSource : null,
    originalUrl : null,
    originalOwner : null,
    originalTitle : null,
    originalNotOrientedWidth : null,
    originalNotOrientedHeight : null,
    url : null,
    imgId : null,
    imgHtml : null,
    img : null
}


/* ------------------------------------------------- */


function PhotoLoader() {
}

PhotoLoader.prototype = {
}

function FlickrLoader(format,
		      api_key,
		      url,
		      method,
		      user_id,
		      tags) {
    PhotoLoader.call(this);
    this.format = format;
    this.api_key = api_key;
    this.url = url;
    this.method = method;
    this.user_id = user_id;
    this.tags = tags;
}
FlickrLoader.prototype = {
    format : null,
    api_key : null,
    url : null,
    method : null,
    user_id : null,
    tags : null,
    buildUrl : function(flickr_photo) {
	return "http://farm" + flickr_photo.farm + ".static.flickr.com/" + flickr_photo.server + "/" + flickr_photo.id + "_" + flickr_photo.secret + "_b_d.jpg";
    },
    buildPhoto : function(flickr_photo) {
	var photo = new Photo(flickr_photo.id,"Flickr",this.buildUrl(flickr_photo),flickr_photo.owner);
	photo.originalNotOrientedWidth = flickr_photo.o_width;
	photo.originalNotOrientedHeight = flickr_photo.o_height;
	return photo;
    },
    get : function(show,callback) {
        this.ready = false;
	thisloader = this;
        $.get(this.url, {"method":this.method,"api_key":this.api_key,"format":this.format,"user_id":this.user_id,"tags":this.tags,"per_page":FLICKR_PER_PAGE,"extras":"o_dims"},
            function(data) {
	        thisloader.data = data.replace(/^jsonFlickrApi\(/,'').replace(/\)$/,'');
                thisloader.res = jQuery.parseJSON(thisloader.data);
                thisloader.flickr_photos = thisloader.res.photos.photo;
		thisloader.photos = [];
		for (var i = 0; i < thisloader.flickr_photos.length; i++) {
		    thisloader.photos.push(thisloader.buildPhoto(thisloader.flickr_photos[i]));
		}
	        callback.call(show);
	    });
    }
}


/* ------------------------------------------------- */


function Screen(id,photos) {
    this.id = id;
    this.photos = photos;
    this.content = null;
}

Screen.prototype = {
    id : null,
    photos : null,
    content : null
}


/* ------------------------------------------------- */


function Show(loader,divId) {
    this.loader = loader;
    this.divId = divId;
    this.div = $("#"+this.divId);
    this.index = 0;
    this.screenSequence = 0;
    this.screens = [];
    this.photos = [];
    /* this.initPage(); */
    /*this.fitToWindow(); */
}

Show.prototype = {
    loader : null,
    divId : null,
    div : null,
    photo : null,
    index : null,
    screenSequence : null,
    photos : null,
    screens : null,
    /*    initPage : function() {
        $('#'+SHOW_DIV_ID).html(INIT_SHOW_HTML);
    },
    fitToWindow : function() {
	$(this.div).css({"width" : (window.screen.availWidth - 160) + "px",
			 "margin" : "20px auto" } );
	$(this.photo).css({"width" : (window.screen.availWidth - 162) + "px"});
	},  */
    fetchPhotos : function() {
	this.loader.get(this,this.onboardPhotos);
    },
    onboardPhotos : function() {
	this.photos = this.loader.photos;
	this.shufflePhotos();
    },
    start : function() {
        this.advance();
    },
    makeNewScreen : function() {
	if (this.photos.length >= 1) {
	    var screen = new Screen("screen" + this.screenSequence,[this.photos[0]]);
	    this.photos.shift();
	    this.screenSequence++;
	    screen.content = '<img class="screen visible" id="' + this.id + '" src="' + this.photos[0].url + '" />';
	    this.screens.push(screen);
	    return screen;
        } else {
	    this.fetchPhotos();
	    return false;
        }
    },
    getNextScreen : function() {
        if (this.index < this.screens.length - 1) {
	    this.index++;
	    if (this.index >= this.screens.length - 1) {
	        this.makeNewScreen();  /* to prep for next cycle - needs error handling */
            }
	    return this.screens[this.index];
        } else {
	    screen = this.makeNewScreen();
	    if (screen) {
                return screen;
            } else {
   	        return false;
            }
        }
    },
    advance : function() {
        var thisshow = this;
        timer = setTimeout(function() {
	    var screen = thisshow.getNextScreen()
	    if (screen) {
		/* alert(screen.id);
		   var div = $("#"+this.divId); */
		alert(thisshow.div.html());
		thisshow.div.children(".screen").addClass("hidden").removeClass("visible");
		thisshow.div.html(div.html() + screen.content);
            }
            thisshow.advance();
        }, DEFAULT_DELAY);
    },
    shufflePhotos : function() {
        var i = this.photos.length;
        if ( i == 0 ) return false;
        while ( --i ) {
            var j = Math.floor( Math.random() * ( i + 1 ) );
            var tempi = this.photos[i];
            var tempj = this.photos[j];
            this.photos[i] = tempj;
            this.photos[j] = tempi;
        }
    }
}


/* ------------------------------------------------- */


function extend(child, supertype) {
    child.prototype.__proto__ = supertype.prototype;
}
extend(FlickrLoader, PhotoLoader);


/* ------------------------------------------------- */


var flickr = new FlickrLoader("json",
			      "ff4f40b52906a3fae2961e17739db037",
			      "http://api.flickr.com/services/rest/",
			      "flickr.photos.search",
			      "10938641@N05",
			      "show"
			      );

$(document).ready(function() {
    var show = new Show(flickr,SHOW_DIV_ID);
    show.start();
});





