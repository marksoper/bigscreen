

var DEFAULT_PER_PAGE = 500;


function PhotoSet(photos) {
    this.photos = photos;
}

PhotoSet.prototype.shuffle() = function {
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


function FlickrSet(photos) {
}
FlickrSet.prototype = new PhotoSet();
FlickrSet.prototype.constructor = FlickrSet;

function Loader() {
}

function FlickrLoader(format,
		      api_key,
		      url,
		      method,
		      user_id,
		      tags) {
    this.format = format;
    this.api_key = api_key;
    this.url = url;
    this.method = method;
    this.user_id = user_id;
    this.tags = tags;
}
FlickrLoader.prototype = new Loader();
FlickrLoader.prototype.constructor = FlickrLoader;

FlickrLoader.prototype.get = function(per_page) {
    $.get(this.url, {"method":this.method,"api_key":this.api_key,"format":this.format,"user_id":this.user_id,"tags":this.tags,"per_page":this.per_page},
        function(data) {
	    data = data.replace(/^jsonFlickrApi\(/,'').replace(/\)$/,'');
            var res = jQuery.parseJSON(data);
            var photos = res.photos.photo;
	    var photoSet = new FlickrSet(photos);
	    return photoSet;
	}      
}

function Show(loader) {
    this.loader = loader;
    this.index = 0;
}

Show.prototype.load() = function {
    this.photoSet = this.loader.get(DEFAULT_PER_PAGE);
    this.photoSet.shuffle();
    this.photos = this.photoSet.photos;
}

Show.prototype.start() = function {
    this.nextPhoto();
}

show.prototype.nextPhoto() = function {
    timer = setTimeout(function() {
        var photo_url = "http://farm" + this.photos[this.index].farm + ".static.flickr.com/" + this.photos[this.index].server + "/" + this.photos[this.index].id + "_" + this.photos[this.index].secret + "_b_d.jpg";
        var img = new Image();
        img.src = photo_url;
        $("body").html('"<div style=' + '"width:100%;"' + '><img src="' + img.src + '"></div>'); 
        this.index++;
        this.nextPhoto();
    }, 7000);
}



var flickr = new FlickrLoader(format = "json",
			      api_key = "ff4f40b52906a3fae2961e17739db037",
			      url = "http://api.flickr.com/services/rest/",
			      method = "flickr.photos.search",
			      user_id= "10938641@N05",
			      tags = "show",
			      per_page = "500"
			      );

var show = new Show(flickr);

$("body").css('background-color','#000000');

show.start();




