var _markerID = 0;

function View(apiKey, secretKey, apiUrl, authUrl, cloudmadeKey) {
    this.foursquare = new Foursquare(apiKey, secretKey, apiUrl, authUrl);
    this.map = new L.map('map')
        .setView([40.78, -73.97], 13);
    var map = this.map;
    L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
        key: cloudmadeKey,
        styleId: 96931,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
        minZoom: 11,
        maxZoom: 18
    }).addTo(map);
    this.markerLayer = new L.layerGroup();
    this.markerLayer.addTo(map);
    this.searchForm();
}

View.prototype.searchForm = function() {
    var that = this;
    $('#search-form').submit(function () {
        var venue = $('#venue-text').val(),
            location = $('#location-text').val();

        // TODO: validate venues
        // get location; if null, use a default for now
        if(!location) { 
            location = 'New York'; // default to New York for now
            that.drawMarkers(venue);
        }
        else {
            // TODO: allow user to select from multiple options instead of hardcode
            // that.foursquare.geocode(location, function(reply) {
            //     for (var i = 0; i < reply.length; i++) {
            //         console.log(reply[i]);
            //     }
            // });

            that.foursquare.geocode(location, function(reply) {
                var locCenter = reply[0]['feature']['geometry']['center'];
                that.map.setView(locCenter, 13);
                that.drawMarkers(venue);
            });
        }

        return false;
    });
}

View.prototype.drawMarkers = function(venue) {
    this.markerLayer.clearLayers();
    var center = this.map.getCenter();
    this.foursquare.searchVenues(center.lat, center.lng, venue, bind(this.onVenues, this));
}

View.prototype.onVenues = function(venues) {
    for (var i = 0; i < venues.length; i++) {
        this.foursquare.getVenueInformation(venues[i].id, bind(this.addVenueMarker, this));        
    }
}

View.prototype.addVenueMarker = function(venue) {
    var latLng = new L.LatLng(venue.location.lat, venue.location.lng);
    var venue_name = venue.name;
    if (!!venue.description) {
        var venue_description = '<br/>' + venue.description;
    }
    else {
        var venue_description = "";
    }

    var venue_link = venue.canonicalUrl;
    var marker_text = '<div id="'  + (++_markerID) + '">';
    marker_text += '<b>' + venue_name + '</b>';
    marker_text += venue_description;
    marker_text += '<br><img src="https://playfoursquare.s3.amazonaws.com/press/logo/icon-16x16.png"><a href=' + venue_link + ' target="_blank">FourSquare</a>';
    marker_text += '<br><button onclick="addToItinerary(' + _markerID + ')">Add to Itinerary</button>';
    marker_text += '</div>'

    var marker = new L.Marker(latLng)
        .bindPopup(marker_text)
        //.bindPopup(venue['name'])
        .on('click', function(e) { this.openPopup(); })
        .on('unclick', function(e) { this.closePopup(); });
    this.markerLayer.addLayer(marker);
}

function addToItinerary (venueID) {
    console.log("veneue " + venueID + " was clicked");
}

$(function() {
    new View(foursquare_client, foursquare_secret, 
             "https://foursquare.com/", "https://api.foursquare.com",
             cloudmade_key);
});


//-------------------FILE SYSTEM API CODE-----------------------//


//TEMPORARY STORAGE - HTML5ROCKS.COM
//window.requestFileSystem(window.TEMPORARY, 5*1024*1024 /*5MB*/, onInitFs, errorHandler);

function onInitFs(fs) {
    console.log('Opened file system: ' + fs.name);
    console.log(window.webkitStorageInfo.queryUsageAndQuota);
    // fs.root.getFile('log.txt', {create: true, exclusive: true}, function(fileEntry) {

    // // fileEntry.isFile === true
    // // fileEntry.name == 'log.txt'
    // // fileEntry.fullPath == '/log.txt' 
    // }, onError);
    fs.root.getFile('log.txt', {create: true}, function(fileEntry) {

        // Create a FileWriter object for our FileEntry (log.txt).
        fileEntry.createWriter(function(fileWriter) {

          fileWriter.onwriteend = function(e) {
            console.log('Write completed.');
          };

          fileWriter.onerror = function(e) {
            console.log('Write failed: ' + e.toString());
          };

          // Create a new Blob and write it to log.txt.
          var blob = new Blob(['Lorem Ipsum'], {type: 'text/plain'});

          fileWriter.write(blob);

        }, onError);

    }, onError);

}
function errorHandler(e) {
    var msg = '';

    switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
        msg = 'QUOTA_EXCEEDED_ERR';
        break;
    case FileError.NOT_FOUND_ERR:
        msg = 'NOT_FOUND_ERR';
        break;
    case FileError.SECURITY_ERR:
        msg = 'SECURITY_ERR';
        break;
    case FileError.INVALID_MODIFICATION_ERR:
        msg = 'INVALID_MODIFICATION_ERR';
        break;
    case FileError.INVALID_STATE_ERR:
        msg = 'INVALID_STATE_ERR';
        break;
    default:
        msg = 'Unknown Error';
    break;
};

  console.log('Error: ' + msg);
}

//PERSISTENT STORAGE - HTML5ROCKS.COM
// This does not work, 'window.webkitStorageInfo' is deprecated. '
// Chrome indicated to use 'navigator.webkitTemporaryStorage' or 'navigator.webkitPersistentStorage' instead.
// window.webkitStorageInfo.requestQuota(PERSISTENT, 1024*1024, function(grantedBytes) {
//   window.requestFileSystem(PERSISTENT, grantedBytes, onInitFs, errorHandler);
// }, function(e) {
//   console.log('Error', e);
// });

//This is edited code, merged with solution found on StackOverflow
navigator.webkitPersistentStorage.requestQuota(1024*1024, function(grantedBytes) {
    console.log('requestQuota: ' , arguments);
    requestFS(grantedBytes);
}, onError);

function requestFS(grantedBytes) {
    console.log("Inside requestFS");
    window.webkitRequestFileSystem(window.PERSISTENT, grantedBytes, function(fs) {
        console.log ('fs: ', arguments); // I see this on Chrome 27 in Ubuntu
    }, onError);
}

//WEBKIT VERSION - StackOverflow
//(1)
// function onError () { console.log ('Error : ', arguments); }
//(2)
//function onError () { console.log ('Error ' + arguments[0].code + ": " + arguments[0].message); }
//(3)
function onError () { console.log ('Error ' + arguments + arguments[0].name + ": " + arguments[0].message); }

// function onError () { console.log ('Error : ', arguments); }


//  
// navigator.webkitPersistentStorage.requestQuota (1024*1024*1024, function(grantedBytes) {
//   console.log ('requestQuota: ', arguments);
//   requestFS(grantedBytes);
// }, onError);

// function requestFS(grantedBytes) {
//   window.webkitRequestFileSystem(window.PERSISTENT, grantedBytes, function(fs) {
//     console.log ('fs: ', arguments); // I see this on Chrome 27 in Ubuntu
//   }, onError);
// }


