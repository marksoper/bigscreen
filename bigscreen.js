

var DEFAULT_PER_PAGE = 500;
var DEFAULT_DELAY = 5000;

function Photo() {
    Image.call(this);
}

Photo.prototype = {
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
    get : function(show,per_page) {
        this.ready = false;
        $.get(this.url, {"method":this.method,"api_key":this.api_key,"format":this.format,"user_id":this.user_id,"tags":this.tags,"per_page":per_page},
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






function Show(loader) {
    this.loader = loader;
    this.index = 0;
}

Show.prototype = {
    loader : null,
    index : null,
    photoSet : null,
    photos : null,
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
            var img = new Photo();
            img.src = photo_url;
            $("body").html('"<div style=' + '"width:100%;"' + '><img src="' + img.src + '"></div>'); 
            thisshow.index++;
            thisshow.nextPhoto();
        }, DEFAULT_DELAY);
    }
}



function extend(child, supertype) {
    child.prototype.__proto__ = supertype.prototype;
}
extend(Photo, Image);
extend(FlickrSet, PhotoSet);
extend(FlickrLoader, PhotoLoader);



var flickr = new FlickrLoader("json",
			      "ff4f40b52906a3fae2961e17739db037",
			      "http://api.flickr.com/services/rest/",
			      "flickr.photos.search",
			      "10938641@N05",
			      "show"
			      );

var show = new Show(flickr);

$("body").css('background-color','#000000');

show.beginLoad(DEFAULT_PER_PAGE);





