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
            that.foursquare.searchNearVenues(location, venue, bind(that.onVenues, that)); 
        }

        return false;
    });
}

View.prototype.onVenues = function(venues) {
    for (var i = 0; i < venues[0].items.length; i++) {
        console.log(venues[0].items[i]);
        this.addVenueMarker(venues[0].items[i]);
    }
}

View.prototype.addVenueMarker = function(venue) {
    var latLng = new L.LatLng(venue.location.lat, venue.location.lng);
    var marker = new L.Marker(latLng)
        .bindPopup(venue['name'])
        .on('mouseover', function(e) { this.openPopup(); })
        .on('mouseout', function(e) { this.closePopup(); });
    this.map.addLayer(marker);
}

$(function() {
    new View(foursquare_client, foursquare_secret, 
             "https://foursquare.com/", "https://api.foursquare.com",
             cloudmade_key);
});

// $(function() {
//     var map = L.map('map').setView([40.78, -73.97], 12);
// 
//     L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
//         key: cloudmade_key,
//         styleId: 96931,
//         attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
//         maxZoom: 18
//     }).addTo(map);
// 
// 
//     // Messing around with Markers
// 
//     // Sample Marker 1
//     marker1_title = 'Marker 1';
//     marker1_location = [40.77976354892044, -73.97008627653122];
//     var marker1 = L.marker(marker1_location, {
//         title:marker1_title, 
//         riseOnHover:true
//     }).addTo(map);
// 
//     venue_name = 'Shakespeare Garden';
//     venue_description = 'i am in the park';
//     venue_link = "https://foursquare.com/v/shakespeare-garden/4abe7a18f964a520e78d20e3";
//     marker1_text = '<b>' + venue_name + '</b><br>' + venue_description + '<br><img src="https://playfoursquare.s3.amazonaws.com/press/logo/icon-16x16.png"><a href=' + venue_link + ' target="_blank">FourSquare</a>';
//     marker1.bindPopup(marker1_text);
// 
//     // Sample Marker 2
//     marker2_title = 'Marker 2';
//     marker2_location = [40.778667, -73.971635];
//     var marker2 = L.marker(marker2_location, {
//         title:marker2_title, 
//         riseOnHover:true
//     }).addTo(map);
// 
//     venue_name = 'Bank Rock Bridge';
//     venue_description = 'i am in the same park';
//     venue_link = "https://foursquare.com/v/bank-rock-bridge/4edfbf9a9a52cb6e8fb487d0";
//     marker2_text = '<b>' + venue_name + '</b><br>' + venue_description + '<br><img src="https://playfoursquare.s3.amazonaws.com/press/logo/icon-16x16.png"><a href=' + venue_link + ' target="_blank">FourSquare</a>';
//     marker2.bindPopup(marker2_text);
// 
//     $('#search-form').submit(function ()	{
//         var	venue = $('#venue-text').val(),
//         location = $('#location-text').val();
// 
//         // get location; if null, use a default
//         if(!location) { 
//             // implement this later; need to convert longitude/latitude or use appropriate parameter
//             // if(navigator.geolocation) {
//             // navigator.geolocation.getCurrentPosition(searchFourSquare);
//             // }
//             location = 'New York'; // default to New York for now
//         }
// 
//         // validate venue 
//         // implement error-checking
//         if (!!venue) {
//             //make calls to foursquare API
//             searchFoursquare(venue, location);
//         }
// 
//         return false;
//     });
// 
//     function searchFoursquare(venue, location) {
//         var foursquare = new Foursquare(foursquare_client, foursquare_secret, "https://foursquare.com/", "https://api.foursquare.com");
// 
//         foursquare.searchNearVenues(location, venue, function(reply) { 
//             console.log("Search location: " + location);
//             console.log("Search venue: " + venue);
//             console.log(reply);
//         }); 
//     }
// });
