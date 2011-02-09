

var DEFAULT_PER_PAGE = 500;
var DEFAULT_DELAY = 5000;

var SHOW_HTML = '<div id="mainShow"><div id="screenA" class="screen"></div><div id="screenB" class="screen"></div></div>'

    function Photo(originalId,originalSource,originalUrl,originalOwner,originalTitle) {
    this.originalId = originalId;
    this.originalSource = originalSource;
    this.originalUrl = originalUrl;
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
    img : null
}


function Div() {
}

Div.prototype = {
    domId : null,
    domClass : null
}



function PhotoSet(photos) {
    this.photos = photos;
}

PhotoSet.prototype = {
    photos : null,
    shuffle : function() {
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


function FlickrSet(photos) {
    PhotoSet.call(this, photos);
}
FlickrSet.prototype = {
}



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
    },
    get : function(show,per_page) {
        this.ready = false;
        $.get(this.url, {"method":this.method,"api_key":this.api_key,"format":this.format,"user_id":this.user_id,"tags":this.tags,"per_page":per_page,"extras":"o_dims"},
            function(data) {
	        this.data = data.replace(/^jsonFlickrApi\(/,'').replace(/\)$/,'');
                this.res = jQuery.parseJSON(this.data);
                this.photos = this.res.photos.photo;
	        this.photoSet = new FlickrSet(this.photos);
	        show.endLoad(this.photoSet,true);
	        return;
	    });
    }
}




function Screen(divId) {
    this.div = $("#"+divId);
    this.photos = [];
}

Screen.prototype = {
    div : null,
    photos : null,
    visible : null,
    addPhoto : function(photo) {
	if (this.photos.length == 0) {
            this.photos = [photo];
	    $(this.div).html('<img src="
	}
        $('body').html(SHOW_HTML);
    },



function Show(loader) {
    this.loader = loader;
    this.index = 0;
    this.preparePage();
    this.fitToScreen();
}

Show.prototype = {
    loader : null,
    photo : null,
    index : null,
    photoSet : null,
    photos : null,
    preparePage : function() {
        $('body').html(SHOW_HTML);
    },
    fitToScreen : function() {
	$(this.div).css({"width" : (window.screen.availWidth - 160) + "px",
			 "margin" : "20px auto" } );
	$(this.photo).css({"width" : (window.screen.availWidth - 162) + "px"});
    },
    beginLoad : function(per_page) {
        this.loader.get(this,per_page);
    },
    endLoad : function(photoSet,start) {
	this.photoSet = photoSet;
	this.photoSet.shuffle();
	this.photos = this.photoSet.photos;
	if (start) this.start();
    },
    start : function() {
        this.nextPhoto();
    },
    nextPhoto : function() {
        var thisshow = this;
        timer = setTimeout(function() {
            var photo_url = "http://farm" + thisshow.photos[thisshow.index].farm + ".static.flickr.com/" + thisshow.photos[thisshow.index].server + "/" + thisshow.photos[thisshow.index].id + "_" + thisshow.photos[thisshow.index].secret + "_b_d.jpg";
            var img = new Image();
            img.src = photo_url;
	    thisshow.photo.css("display","none");
	    thisshow.photo.attr("src",img.src);

	    /* not reliable - need better way */
	    var height = thisshow.photo.height();
	    var width = thisshow.photo.width();
	    if (height > width) {
	        thisshow.photo.css({"width" : "none", "height" : window.screen.availHeight - 80 + "px"}); }
	    else {
		thisshow.photo.css({"width" : (window.screen.availWidth - 162) + "px", "height" : "none" });
            }
	    thisshow.photo.css("display","block");
            thisshow.index++;
            thisshow.nextPhoto();
        }, DEFAULT_DELAY);
    }
}



function extend(child, supertype) {
    child.prototype.__proto__ = supertype.prototype;
}
extend(FlickrSet, PhotoSet);
extend(FlickrLoader, PhotoLoader);



var flickr = new FlickrLoader("json",
			      "ff4f40b52906a3fae2961e17739db037",
			      "http://api.flickr.com/services/rest/",
			      "flickr.photos.search",
			      "10938641@N05",
			      "show"
			      );

$(document).ready(function() {
    $("body").css('background-color','#000000');
    var show = new Show(flickr,"mainShow");
    show.beginLoad(DEFAULT_PER_PAGE);
});





