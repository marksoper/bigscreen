
/*
    Copyright (c) 2011 Mark Soper, http://marksoper.net
    MIT License
*/

/*  
    DEPENDENCIES
    bigscreen.js requires JQuery
    For more information:
      http://plugins.jquery.com/project/bigscreen
    You need a line like this in your <head>:
      <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js"></script>
*/



/* ------------------------------------------------- */


/*  TO DEPLOY: ADD SOMETHING LIKE THIS TO YOUR SITE

var SHOW_DIV_ID = "mainShow";

var flickr = new FlickrLoader("json",
			      "<YOUR FLICKR API KEY>",
			      "http://api.flickr.com/services/rest/",
			      "flickr.photos.search",
			      "<FLICKR USER ID>",
			      "<TAGS"
			      );

$(document).ready(function() {
    var show = new Show(flickr,SHOW_DIV_ID);
    show.start();
});

*/




var DEFAULT_DELAY = 6500;
var FLICKR_PER_PAGE = 100;
var SHOW_DIV_ID = "mainShow";
var INIT_SHOW_HTML = '<img src="http://farm6.static.flickr.com/5258/5480682306_d1eed449f4_b.jpg">';





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

function FlickrLoader(url, params) {
    PhotoLoader.call(this);
    this.url = url;
    this.params = params;
    if (!('per_page' in this.params)) {
	this.params['per_page'] = Math.min(Math.floor(Math.random()+0.5)*FLICKR_PER_PAGE,490);
    }
    this.params['extras'] = "o_dims";
}

FlickrLoader.prototype = {
    url : null,
    params : {},
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
        /* random per_page value used because Flickr seems to have a bug in api           where results occasionally don't return.  Changing the per_page value often fixes the problem, inexplicably */
        /* $.get(this.url, {"method":this.method,"api_key":this.api_key,"format":this.format,"user_id":this.user_id,"tags":this.tags,"per_page":Math.min((Math.random()+0.5)*FLICKR_PER_PAGE,490),"extras":"o_dims"}, */
        $.get(this.url, this.params,
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
    this.height = this.div.css("height");
    this.width = this.div.css("width");
    this.index = 0;
    this.screenSequence = 0;
    this.screens = [];
    this.photos = [];
    this.prepared = false;
    this.running = false;
    /* this.initPage(); */
    /*this.fitToWindow(); */
}

Show.prototype = {
    loader : null,
    divId : null,
    div : null,
    index : null,
    screenSequence : null,
    photos : null,
    screens : null,
    prepared : false,
    running : false,
    /*    initPage : function() {
        $('#'+SHOW_DIV_ID).html(INIT_SHOW_HTML);
    },
    fitToWindow : function() {
	$(this.div).css({"width" : (window.screen.availWidth - 160) + "px",
			 "margin" : "20px auto" } );
	$(this.photo).css({"width" : (window.screen.availWidth - 162) + "px"});
	},  */
    prepare : function() {
	if (typeof bigscreenDEBUG == 'undefined') {
            var bigscreenDEBUG = false;
        }
        var DEBUG = bigscreenDEBUG;
	if (DEBUG) {
            alert(getTime().toGMTString() + " | " + "Show.prepare");
	    $("#bigscreenLog").append(getTime().toGMTString() + " | " + "Show.prepare");
        }
	this.prepared = true;
    },
    fetchPhotos : function() {
	this.loader.get(this,this.onboardPhotos);
    },
    onboardPhotos : function() {
	this.photos = this.loader.photos;
	this.shufflePhotos();
    },
    start : function() {

	if (!(this.running)) {
	    if (!(this.prepared)) {
	        this.prepare();
	    }
	    if (DEBUG) {
		
            }
	    this.running = true;
            this.advance();
	}
    },
    stop : function() {
	if (this.running) {
	    this.running = false;
	}
    },
    reset : function() {
	this.photos = [];
	this.screens = [];
	this.div.html('');
    },
    makeNewScreen : function() {
	if (this.photos.length >= 1) {
	    var screen = new Screen("screen" + this.screenSequence,[this.photos[0]]);
	    this.photos.shift();
	    this.screenSequence++;
	    screen.content = '<div class="screenDiv"><img class="screenImg visible" id="' + screen.id + '" src="' + screen.photos[0].url + '" /></div>';
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
	    var screen = this.makeNewScreen();
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
		thisshow.div.children(".screenDiv").addClass("hidden").removeClass("visible");
		thisshow.div.html(thisshow.div.html() + screen.content);
		liveImg = $('#'+screen.id);
		/* alert($(liveImg).height() + " x " + $(liveImg).width()); */
	        
		if (DEBUG) {
		    thisshow.debugDiv.html(thisshow.debugDiv.html() + "screen " + screen.id + " - " + screen.photos[0].url);
                }
            }
	    if (thisshow.running) {
                thisshow.advance();
	    }
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





