var _markerID = 0;
var history = {};
var currentItinerary = {};

/**
 * Itinerary view prototype
 */
function View(apiKey, secretKey, apiUrl, authUrl, cloudmadeKey) {
    this.foursquare = new Foursquare(apiKey, secretKey, apiUrl, authUrl);
    this.map = new L.map('map')
    .setView([40.78, -73.97], 13);
    var map = this.map;
    L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
        key: cloudmadeKey,
        styleId: 96931,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
        minZoom: 5,
        maxZoom: 15
    }).addTo(map);
    this.markerLayer = new L.layerGroup();
    this.saveMarkerLayer = new L.layerGroup();
    this.saveMarkerLayer.addTo(map);
    this.markerLayer.addTo(map);
    this.searchForm();
    this.saveHook();
}

/**
 * Adds markers upon search. Defaults to New York if no location is given
 */
View.prototype.searchForm = function() {
    var that = this;
    $('#search-form').submit(function () {
        history = {};
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
/**
 * Draws markers given a list of venues
 */
View.prototype.drawMarkers = function(venue) {
    this.markerLayer.clearLayers();
    var center = this.map.getCenter();
    this.foursquare.searchVenues(center.lat, center.lng, venue, bind(this.onVenues, this));
    this.addItineraryMarkers();
}

/**
 * Iterates through venue results to add venue marker
 */
View.prototype.onVenues = function(venues) {
    for (var i = 0; i < venues.length; i++) {
        this.foursquare.getVenueInformation(venues[i].id, bind(this.addVenueMarker, this));        
    }
}

/**
 * Adds venue markers to the map
 */
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
    history[_markerID] = venue;
    marker_text += '<b>' + venue_name + '</b>';
    marker_text += venue_description;
    marker_text += '<br><img src="https://playfoursquare.s3.amazonaws.com/press/logo/icon-16x16.png"><a href=' + venue_link + ' target="_blank">FourSquare</a>';
    marker_text += '<br><button class="btn btn-default btn-sm" onclick="addToItinerary(' + _markerID + ')">Add to Itinerary</button>';
    marker_text += '</div>'

    var marker = new L.Marker(latLng, {title:venue_name, riseOnHover:true})
    .bindPopup(marker_text)
        //.bindPopup(venue['name'])
        .on('click', function(e) { this.openPopup(); })
        .on('unclick', function(e) { this.closePopup(); });
        this.markerLayer.addLayer(marker);
}

/**
 * Adds markers for current itinerary items to the map
 */
View.prototype.addItineraryMarkers = function() {
    
    console.log(currentItinerary);

    for (var key in currentItinerary) {
        var venue = currentItinerary[key];
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
        marker_text += '</div>'

        var saveIcon = L.icon({
          iconUrl: 'lib/leaflet/images/save-marker-icon.png',
          shadowUrl: 'lib/leaflet/images/marker-shadow.png',
          iconSize: [25,41],
          shadowSize: [41,41],
          iconAnchor: [12, 41],
          shadowAnchor: [12,41]
        });

        var marker = new L.Marker(latLng, {icon: saveIcon, title:venue_name, riseOnHover:true})
        .bindPopup(marker_text)
          //.bindPopup(venue['name'])
          .on('click', function(e) { this.openPopup(); })
          .on('unclick', function(e) { this.closePopup(); });
          this.saveMarkerLayer.addLayer(marker);
    }
}

/**
 * Set up save button click
 */
View.prototype.saveHook = function() {
    $('#save').on('click', this.saveItinerary);
}

View.prototype.saveItinerary = function() {
    var time = new Date();
    var itinerary = {};
    var venues = new Array();
    $("#accordion .s_panel").each(function(index) {
        console.log("this.id:" + this.id);
        venues.push(currentItinerary[this.id]);
    });
    itinerary['venues'] = venues;
    itinerary['creation_time'] = time.getTime();
    itinerary['name'] = "Default";
    console.log(itinerary);
    var value = $.jStorage.get("all", []);
    value.push(itinerary);
    $.jStorage.set("all", value);
    // $.cookie.json = true;
    // $.cookie('dummy', JSON.stringify(currentItinerary));
    // console.log(JSON.parse($.cookie('dummy')));
}

// TODO: Make object to hold this information
function addToItinerary(venueID) {
    item_text = "<div class='s_panel' id=" + venueID + "><h4>"
    item_text += history[venueID].name + "</h4><div>"
    item_text += history[venueID].description + "</div></div>"
    $("#accordion").append(item_text);
    $("#accordion").accordion("destroy");
    $("#accordion").accordion({
        collapsible: true,
        active: true,
        containment: 'column mapparent',
        height: 'fill',
        header: 'h4',
        heightStyle: "content"
    }).sortable({items: '.s_panel'});

    currentItinerary[venueID] = history[venueID]; // adds selected venue to array 
}

$(function() {
    new View(foursquare_client, foursquare_secret, 
       "https://foursquare.com/", "https://api.foursquare.com",
       cloudmade_key);
});
