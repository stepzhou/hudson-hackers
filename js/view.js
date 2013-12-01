function View(apiKey, secretKey, apiUrl, authUrl, cloudmadeKey) {
    this.foursquare = new Foursquare(apiKey, secretKey, apiUrl, authUrl);
    this.map = new L.map('map')
        .setView([40.78, -73.97], 13);
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
        this.addVenueMarker(venues[i]);
    }
}

View.prototype.addVenueMarker = function(venue) {
    var latLng = new L.LatLng(venue.location.lat, venue.location.lng);
    venue_name = venue.name;
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

$(function() {
    new View(foursquare_client, foursquare_secret, 
             "https://foursquare.com/", "https://api.foursquare.com",
             cloudmade_key);
});

