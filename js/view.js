function View(apiKey, secretKey, apiUrl, authUrl, cloudmadeKey) {
    this.foursquare = new Foursquare(apiKey, secretKey, apiUrl, authUrl);
    this.map = new L.map('map')
        .setView([40.78, -73.97], 12);
    var map = this.map;
    L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
        key: cloudmadeKey,
        styleId: 96931,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
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

        // get location; if null, use a default
        if(!location) { 
            // implement this later; need to convert longitude/latitude or use appropriate parameter
            // if(navigator.geolocation) {
            // navigator.geolocation.getCurrentPosition(searchFourSquare);
            // }
            location = 'New York'; // default to New York for now
        }

        // validate venue 
        // implement error-checking
        if (!!venue) {
            that.markerLayer.clearLayers();
            that.foursquare.searchNearVenues(location, venue, bind(that.onVenues, that)); 
        }

        return false;
    });
}

View.prototype.onVenues = function(venues) {
    for (var i = 0; i < venues[0].items.length; i++) {
        // console.log(venues[0].items[i]);
        this.getVenueInformation(venues[0].items[i].id, bind(this.addVenueMarker, this));        
        // this.addVenueMarker(venues[0].items[i]);
    }
}

View.prototype.addVenueMarker = function(venue) {
    var latLng = new L.LatLng(venue.location.lat, venue.location.lng);
    venue_name = venue.name;
    console.log(venue);
    console.log("description:" + venue.description);
    if (!!venue.description) {
        venue_description = venue.description;
    }
    else {
        venue_description = "No description available.";
    }
    venue_link = venue.canonicalUrl;
    marker_text = '<b>' + venue_name + '</b><br>' + venue_description + '<br><img src="https://playfoursquare.s3.amazonaws.com/press/logo/icon-16x16.png"><a href=' + venue_link + ' target="_blank">FourSquare</a>';

    var marker = new L.Marker(latLng)
        .bindPopup(marker_text)
        //.bindPopup(venue['name'])
        .on('mouseover', function(e) { this.openPopup(); })
        .on('mouseout', function(e) { this.closePopup(); });
    this.markerLayer.addLayer(marker);
}

View.prototype.getVenueInformation = function(venueID, callback) { 
    this.foursquare.makeRequest("venues/" + venueID, function(result) { 
        callback(result.response.venue); 
    });
}

$(function() {
    new View(foursquare_client, foursquare_secret, 
             "https://foursquare.com/", "https://api.foursquare.com",
             cloudmade_key);
});

