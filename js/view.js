var _markerID = 0;
var history = {};
var currentItinerary = {};

/**
 * Itinerary view prototype
 */
function View(apiKey, secretKey, apiUrl, authUrl, cloudmadeKey) {
    this.foursquare = new Foursquare(apiKey, secretKey, apiUrl, authUrl);

    this.map = new L.map('map', {
        layers: MQ.mapLayer(),
        center: [40.78, -73.97],
        zoom: 13
    });

    var map = this.map;
    var baseLayer = L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
        key: cloudmadeKey,
        styleId: 96931,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
        minZoom: 5,
        maxZoom: 15
    }).addTo(map);

    this.markerLayer = new L.layerGroup();
    this.saveMarkerLayer = new L.layerGroup();
    this.routeLayer = new L.layerGroup();
    this.markerLayer.addTo(map);
    this.saveMarkerLayer.addTo(map);
    this.routeLayer.addTo(map);

    this.searchForm();
    this.saveHook();
    this.routeHook();
    this.hideHook();
    this.expandHook();
    this.preloadForm();
    this.splashForm();
}

View.prototype.splashForm = function() {
    var text = window.location.search.substr(1).split("&");
    if(text[0].length > 0) {
        var venue_string = text[0];
        var location_string = text[1];

        // get venue
        var venue = venue_string.split("=")[1];

        // get location
        if(!location_string) { 
            var location = 'New York'; // default to New York if no location given
        } else { 
            var location = location_string.split("=")[1];
        }
        
        var that = this;
        this.foursquare.geocode(location, function(reply) {
            var locCenter = reply[0]['feature']['geometry']['center'];
            that.map.setView(locCenter, 13);
            that.drawMarkers(venue);
        });
    }
}

View.prototype.preloadForm = function() { 
    var link = document.URL;

    if (link.match('#')) {
        var result = link.split('#');
        var itineraryName = result[1]; 
        var itineraries = $.jStorage.get("all", []);
        var itinerary; 

        for (var i = 0; i < itineraries.length; i++) {
            if (itineraries[i].name === itineraryName) {
                itinerary = itineraries[i]; 
                break;
            }
        }

        var centerVenue = itinerary.venues[0];

        for (var i = 0; i < itinerary.venues.length; i++) {
            var venue = itinerary.venues[i];
            currentItinerary[venue.id] = venue;

            var html = $('<div/>', {
                class: 's_panel',
                id: "" + venue.id
            }).appendTo('#accordion');

            $('<h4/>', { text: venue.name }).appendTo(html);
            var accordionDiv = $('<div/>').appendTo(html);

            if (venue.description)
                $('<div/>', { 
                    text: venue.description,
                    class: 'description'}).appendTo(accordionDiv);

            if (venue.location.address) 
                $('<div/>', { 
                    text: venue.location.address + ', ' + venue.location.city + ', ' + venue.location.state,
                    class: 'address'}).appendTo(accordionDiv);

            if (venue.rating)
                $('<div/>', {
                    text: venue.rating + ' / 10 rating',
                    class: 'rating'
                }).appendTo(accordionDiv);

            $('<div/>', {
                text:  venue.stats.checkinsCount + ' checkins across ' + venue.stats.usersCount + ' users',
                class: 'stats' }).appendTo(accordionDiv);

            if (venue.categories.length > 0)
                $('<div/>', { 
                    text: venue.categories.map(function(x) { return x.name; }).join(", "),
                    class: 'categories'}).appendTo(accordionDiv);

            // $("#accordion").accordion("destroy");
            $("#accordion #" + venue.id).accordion({
                collapsible: true,
                active: true,
                containment: 'column mapparent',
                header: 'h4',
                heightStyle: "content"
            }).sortable({items: '.s_panel'});
        }

        this.map.setView([centerVenue.location.lat, centerVenue.location.lng], 13);
        this.addItineraryMarkers();   
    }
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
            location = 'New York';
            that.drawMarkers(venue);
        }
        else {
            that.foursquare.geocode(location, function(reply) {
                var locCenter = reply[0]['feature']['geometry']['center'];
                that.map.setView(locCenter, 13);
                that.drawMarkers(venue);
                console.log(locCenter.lat);
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
    marker_text += '<br><button class="btn btn-default btn-sm" onclick="v.addToItinerary(' + _markerID + ')">Add to Itinerary</button>';
    marker_text += '</div>'

    var marker = new L.Marker(latLng, {title:venue_name, riseOnHover:true})
    .bindPopup(marker_text)
        .on('click', function(e) { this.openPopup(); })
        .on('unclick', function(e) { this.closePopup(); });
        this.markerLayer.addLayer(marker);
}


/**
 * Adds markers for current itinerary items to the map
 */
View.prototype.addItineraryMarkers = function() {
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

        var marker = new L.Marker(latLng, {icon: saveIcon, zIndexOffset: 1000, title:venue_name, riseOnHover:true})
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

    var link = document.URL;
    var value = $.jStorage.get("all", []);

    var time = new Date();
    var itinerary = {};
    var venues = new Array();
    $("#accordion .s_panel").each(function(index) {
        venues.push(currentItinerary[this.id]);
    });
    itinerary['venues'] = venues;
    itinerary['creation_time'] = time.getTime();
    itinerary['name'] = "Default";

    //if the itinerary is being edited,
    //we replace the previously saved itinerary
    //with the updated itinerary
    if (link.match('#')) {
        for (var i = 0; i < value.length; i++) {
            if (value[i].name === link.split("#")[1]){
                value.splice(i, 1, itinerary);
            }
        }
            
    }
    //else, this is a new itinerary, and push it
    //to the end of our locally stored object
    else {

        value.push(itinerary);
        // $.cookie.json = true;
        // $.cookie('dummy', JSON.stringify(currentItinerary));
        // console.log(JSON.parse($.cookie('dummy')));
    }
    $.jStorage.set("all", value);
}

// TODO: Make object to hold this information
View.prototype.addToItinerary = function(venueID) {
    var params = {}
    var venue = history[venueID];
    var html = $('<div/>', {
        class: 's_panel',
        id: "" + venueID
    }).appendTo('#accordion');

    $('<h4/>', { text: venue.name }).appendTo(html);
    var accordionDiv = $('<div/>').appendTo(html);

    if (venue.description)
        $('<div/>', { 
            text: venue.description,
            class: 'description'}).appendTo(accordionDiv);

    if (venue.location.address) 
        $('<div/>', { 
            text: venue.location.address + ', ' + venue.location.city + ', ' + venue.location.state,
            class: 'address'}).appendTo(accordionDiv);

    if (venue.rating)
        $('<div/>', {
            text: venue.rating + ' / 10 rating',
            class: 'rating'
        }).appendTo(accordionDiv);

    $('<div/>', {
        text:  venue.stats.checkinsCount + ' checkins across ' + venue.stats.usersCount + ' users',
        class: 'stats' }).appendTo(accordionDiv);

    if (venue.categories.length > 0)
        $('<div/>', { 
            text: venue.categories.map(function(x) { return x.name; }).join(", "),
            class: 'categories'}).appendTo(accordionDiv);

    // $("#accordion").accordion("destroy");
    $("#accordion #" + venueID).accordion({
        collapsible: true,
        active: true,
        containment: 'column mapparent',
        header: 'h4',
        heightStyle: "content"
    }).sortable({items: '.s_panel'});

    currentItinerary[venueID] = history[venueID]; // adds selected venue to array 
    this.addItineraryMarkers();
}

/**
 * Dummy hideAll button
 */
View.prototype.routeHook = function() {
    $('#route').on('click', bind(this.routeDirections, this));
}

View.prototype.routeDirections = function() {
    dir = MQ.routing.directions();

    var locations = [];
    $("#accordion div.s_panel").each(function(index) {
        var place = currentItinerary[this.id];
        locations.push({latLng: {lat: place.location.lat, lng: place.location.lng}});
    }); 

    dir.route({
        locations: locations,
        routeType: 'pedestrian'
    });
    this.routeLayer.clearLayers();
    this.routeLayer.addLayer(MQ.routing.routeLayer({
        directions: dir,
        fitBounds: false
    }));
}

View.prototype.hideHook = function() {
    $('#hide').on('click', bind(this.hideAll, this));
}

View.prototype.hideAll = function() {
    $("#accordion div.s_panel").accordion("option", "active", false);
}

View.prototype.expandHook = function() {
    $('#expand').on('click', bind(this.expandAll, this));
}

View.prototype.expandAll = function() {
    $("#accordion div.s_panel").accordion("option", "active", 0);
}

function venueMetadata(s) {
    return "<div>" + s + "</div>";
}

var v = new View(foursquare_client, foursquare_secret, 
                 "https://foursquare.com/", "https://api.foursquare.com",
                 cloudmade_key);
