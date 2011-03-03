
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
var FLICKR_PER_PAGE = 10;
var SHOW_DIV_ID = "mainShow";
var INIT_SHOW_HTML = '<img src="http://farm6.static.flickr.com/5258/5480682306_d1eed449f4_b.jpg">';


function Debug() {
    this.running = false;
}

Debug.prototype = {
    running : false,
    initTime : null,
    start : function() {
	this.running = true;
	this.initTime = (new Date).getTime();
	$("#bigscreenLog").append(0.00 + " | debug started<br>");
    },
    log : function(msg) {
	$("#bigscreenLog").append((new Date).getTime() - this.initTime + " | " + msg + "<br>");
    }
}

var dbug = new Debug();




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
    this.page = 1;
    this.params = params;
    if (!('per_page' in this.params)) {
	this.params['per_page'] = Math.min(Math.floor(Math.random()+0.5)*FLICKR_PER_PAGE,490);
    }
    this.params['extras'] = "o_dims";
}

FlickrLoader.prototype = {
    url : null,
    page : null,
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
	thisloader = this;
	if (window.debug) {
	    dbug.log("request data from " + this.url + this.params);
	}
	this.params["page"] = this.page + 1 + '';
        $.get(this.url, this.params,
            function(data) {
	        if (window.debug) {
	            dbug.log("receive data from " + this.url + this.params);
	        }
	        thisloader.data = data.replace(/^jsonFlickrApi\(/,'').replace(/\)$/,'');
                thisloader.res = jQuery.parseJSON(thisloader.data);
                thisloader.flickr_photos = thisloader.res.photos.photo;
		thisloader.photos = [];
		for (var i = 0; i < thisloader.flickr_photos.length; i++) {
		    thisloader.photos.push(thisloader.buildPhoto(thisloader.flickr_photos[i]));
		}
		if (window.debug) {
	            dbug.log(thisloader.photos.length + " Photos made from " + this.url + this.params);
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


function Show(loader,divId,debugFlag) {
    this.loader = loader;
    this.divId = divId;
    this.div = $("#"+this.divId);
    this.height = this.div.css("height");
    this.width = this.div.css("width");
    this.index = 0;
    this.photoIndex = 0;
    this.screenSequence = 0;
    this.screens = [];
    this.photos = [];
    this.prepared = false;
    this.running = false;
    this.debug = debugFlag;
    this.initFetchRequested = false;
    window.debug = this.debug;
    if (window.debug) {
	dbug.start();	
    }

    /* this.initPage(); */
    /*this.fitToWindow(); */
}

Show.prototype = {
    loader : null,
    divId : null,
    div : null,
    index : null,
    photoIndex : null,
    screenSequence : null,
    photos : null,
    screens : null,
    prepared : false,
    running : false,
    debug : false,
    initFetchRequested : false,
    /*    initPage : function() {
        $('#'+SHOW_DIV_ID).html(INIT_SHOW_HTML);
    },
    fitToWindow : function() {
	$(this.div).css({"width" : (window.screen.availWidth - 160) + "px",
			 "margin" : "20px auto" } );
	$(this.photo).css({"width" : (window.screen.availWidth - 162) + "px"});
	},  */
    prepare : function() {
	if (window.debug) {
	    dbug.log("Show.prepare()");
        }
	this.prepared = true;
    },
    fetchPhotos : function() {
	this.loader.get(this,this.onboardPhotos);
	this.initFetchRequested = true;
    },
    onboardPhotos : function() {   /* callback from the loader upon getting data */
	shuffled_photos = shufflePhotos(this.loader.photos);
	this.photos.push.apply(this.photos,shuffled_photos);
	dbug.log("onboarding " + this.photos.length + " photos into " + this.photos.length + " screens");
	this.insertScreens(this.photos);
    },
    insertScreens : function() {
	for (var i = 0; i < this.photos.length; i++) {
	    var screen = this.makeScreen(this.photos[i]);
	    this.photoIndex++;
	    this.insertScreen(screen,false);
	}
    },
    makeScreen : function(photo) {
	var screen = new Screen(this.screenSequence, [photo]);
	screen.content = '<div class="screenDiv hidden" id="screenDiv' + screen.id + '" ><img class="screenImg" id="screenImg' + screen.id + '" src="' + screen.photos[0].url + '" /></div>';
	return screen;
    },
    insertScreen : function(screen) {  
	if (window.debug) {
	    dbug.log("insertScreen() screen" + screen.id + " | " + screen.photos[0].url.substring(0,20));
        }
	if (this.screenSequence == 0) {
	    this.div.html(screen.content);
	} else {
	    this.div.append(screen.content);
        }

	this.screenSequence++;
	this.screens.push(screen);
	if (this.screenSequence == 1) {    /* hook to handle the initial page load case */
	    this.displayScreen(0);
	    this.index++;
	    if (window.debug) {
		dbug.log("Show.insertScreen() displaying initial screen" + screen.id + " | " + screen.photos[0].url.substring(0,20));
	    }   
        }
    },
    start : function() {

	if (!(this.running)) {
	    if (!(this.prepared)) {
	        this.prepare();
	    }
	    if (window.debug) {
		dbug.log("Show.start()")
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
    displayScreen : function(index) {
	screenDiv = $("#screenDiv"+index);
	$(".screenDiv").addClass("hidden").removeClass("visible");
	$(screenDiv).addClass("visible").removeClass("hidden");
	if (window.debug) {
	    dbug.log("Show.displayScreen() displaying screenDiv" + $(screenDiv).css("id") );
	}
    },
    advance : function() {
	if (!(this.initFetchRequested)) {  /* initial page load */
	    this.fetchPhotos();
        } else {
	    if (this.index <= this.screenSequence) {
	        this.displayScreen(this.index);
	        this.index++;
	    } else {
	        this.fetchPhotos();
            }
        }
        var thisshow = this;
        timer = setTimeout(function() {
	    if (thisshow.running) {
                thisshow.advance();
	    }
        }, DEFAULT_DELAY);
    }
}


/* ------------------------------------------------- */


function extend(child, supertype) {
    child.prototype.__proto__ = supertype.prototype;
}
extend(FlickrLoader, PhotoLoader);


function shufflePhotos(photos) {
    var i = photos.length;
    if ( i == 0 ) return false;
    while ( --i ) {
	var j = Math.floor( Math.random() * ( i + 1 ) );
	var tempi = photos[i];
	var tempj = photos[j];
	photos[i] = tempj;
	photos[j] = tempi;
    }
    return photos;
}