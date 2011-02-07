
var format = "json"
var api_key = "ff4f40b52906a3fae2961e17739db037"
var url = "http://api.flickr.com/services/rest/"
var method = "flickr.photos.search"
var user_id= "10938641@N05" 
var tags = "show"
var per_page = "500"

$.get(url, {"method":method,"api_key":api_key,"format":format,"user_id":user_id,"tags":tags,"per_page":per_page},
    function(data) {
        data = data.replace(/^jsonFlickrApi\(/,'').replace(/\)$/,'');
        var res = jQuery.parseJSON(data);
        var photos = res.photos.photo;
        shuffle(photos);
        index = 0;
        nextPhoto(photos,index);
    });

function nextPhoto(photos,index) {
    timer = setTimeout(function() {
        var photo_url = "http://farm" + photos[index].farm + ".static.flickr.com/" + photos[index].server + "/" + photos[index].id + "_" + photos[index].secret + "_b_d.jpg";
        var img = new Image();
        img.src = photo_url;
        $("body").attr('src',img.src);
        index++;
        nextPhoto(photos,index);
    }, 7000);
}

function shuffle ( ls ) {
    var i = ls.length;
    if ( i == 0 ) return false;
    while ( --i ) {
       var j = Math.floor( Math.random() * ( i + 1 ) );
       var tempi = ls[i];
       var tempj = ls[j];
       ls[i] = tempj;
       ls[j] = tempi;
     }
}


