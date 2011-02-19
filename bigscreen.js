
var DEFAULT_DELAY = 5000;
var SHOW_DIV_ID = "mainShow";
var SHOW_HTML = '<div id="' + SHOW_DIV_ID + '"></div>'


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
    get : function(show,per_page) {
        this.ready = false;
        $.get(this.url, {"method":this.method,"api_key":this.api_key,"format":this.format,"user_id":this.user_id,"tags":this.tags,"per_page":per_page,"extras":"o_dims"},
            function(data) {
	        this.data = data.replace(/^jsonFlickrApi\(/,'').replace(/\)$/,'');
                this.res = jQuery.parseJSON(this.data);
                this.flickr_photos = this.res.photos.photo;
		this.photos = [];
		for (var i = 0; i < this.flickr_photos.length; i++) {
		    this.photos.push(this.buildPhoto(this.flickr_photos[i]));
		}
	        this.photoSet = new PhotoSet(this.photos);
	        show.endLoad(this.photoSet,true);
	        return;
	    });
    }
}


/* ------------------------------------------------- */


function Screen(id,show) {
    this.id = id;
    this.visible = false;
    this.photos = [];
}

Screen.prototype = {
    id : null,
    div : null,
    photos : null,
    visible : null,
    setPhoto : function(photo) {
	if (this.photos.length >= 0) {
	    photo.imgId = this.divId + '__' + (this.photos.length + 1);
	    photo.imgHtml = '<img id="' + photo.imgId + '" src="' + photo.url + '"/>';
	    $(this.div).html(photo.imgHtml);
            this.photos = [photo];
	    photo.img = $("#" + photo.imgId);
	}
    }
}


/* ------------------------------------------------- */


function Show(loader,divId) {
    this.loader = loader;
    this.divId = divId;
    this.index = 0;
    this.screens = [];
    this.preparePage();
    this.fitToWindow();
}

Show.prototype = {
    loader : null,
    divId : null,
    div : null,
    photo : null,
    index : null,
    photoSet : null,
    photos : null,
    screens : null,
    preparePage : function() {
        $('body').html(SHOW_HTML);
	this.div = $("#"+this.divId);
    },
    fitToWindow : function() {
	$(this.div).css({"width" : (window.screen.availWidth - 160) + "px",
			 "margin" : "20px auto" } );
	$(this.photo).css({"width" : (window.screen.availWidth - 162) + "px"});
    },
    fetchPhotos() : function() {
	this.loader.get(this.onboardPhotos);
    },
    onboardPhotos(new_photos) : function() {
	this.photos.append(new_photos);
	this.shufflePhotos();
    },
    beginLoad : function(per_page) {
        this.loader.get(this,per_page);
    },
    endLoad : function(photoSet,start) {
	this.photoSet = photoSet;
	this.photoSet.shufflePhotos();
	this.photos = this.photoSet.photos;
	if (start) this.start();
    },
    start : function() {
        this.advance();
    },
    makeNewScreen : function() {
	if (this.photos.length() >= 1) {
	    var screen = new Screen("Screen__" + this.screenSequence,[this.photos[0]]);
	    this.photos.remove(this.photos[0]);
	    this.screenSequence++;
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
	        this.makeNewScreen();  /* error handling */
            }
	    return this.screens[index];
        } else {
	    this.makeNewScreen();
	    return false;
        }
    },
    advance : function() {
        var thisshow = this;
        timer = setTimeout(function() {
	    var screen = this.getNextScreen()
	    if (screen) {
		this.currentScreen.div.addClass("hidden").removeClass("visible");
		this.currentScreen = screen;
		this.currentScreen.div.addClass("visible").removeClass("hidden");
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
    alert("ready");
    $("body").css('background-color','#000000');
    var show = new Show(flickr,SHOW_DIV_ID);
    show.start();
});





