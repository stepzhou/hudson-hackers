// Copyright 2011 Foursquare Labs Inc. All Rights Reserved.
// Requires BBQ, but doesn't need to
// Needs POST support via CORS

function Foursquare(apiKey, secretKey, authUrl, apiUrl) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.apiUrl = apiUrl;
}

Foursquare.prototype.doAuthRedirect = function(authUrl, apiKey) {
    var redirect = window.location.href.replace(window.location.hash, '');
    var url = authUrl + 'oauth2/authenticate?response_type=token&client_id=' + apiKey +
        '&redirect_uri=' + encodeURIComponent(redirect) +
        '&state=' + encodeURIComponent($.bbq.getState('req') || 'users/self');
    window.location.href = url;
};

Foursquare.prototype.makeRequest = function(query, callback) {
    var newQuery = this.apiUrl + '/v2/' + query + ((query.indexOf('?') > -1) ? '&' : '?') + "client_id=" + this.apiKey + "&client_secret=" + this.secretKey + "&limit=40&callback=?";
    // var query = query + ((query.indexOf('?') > -1) ? '&' : '?') + 'client_id=' + this.apiKey + "&client_secret=" + this.secretKey + '&callback=?';
    var query = query + ((query.indexOf('?') > -1) ? '&' : '?') + 'oauth_token=' + this.token + '&callback=?';
    // // 'oauth_token=' + this.token + '&callback=?';
    // $.getJSON(this.apiUrl + '/v2/' + query, {}, callback);

    $.ajax({
        url: newQuery,
        dataType: 'json',
        context: document.body,
        success: callback
    }).error(function(jqXHR, textStatus, errorThrown){
        console.log(textStatus);
        console.log(errorThrown);
    });
};

Foursquare.prototype.geocode = function(query, callback) {
    this.makeRequest('geo/geocode?=query=' + query,
                     function(response) { callback(response['response']['geocode']['interpretations']['items']) });
};

Foursquare.prototype.trendingVenues = function(lat, lng, callback) {
    this.makeRequest('venues/trending?ll=' + lat + ',' + lng,
                     function(response) { callback(response['response']['venues']) });
};

Foursquare.prototype.searchVenues = function(lat, lng, venues, radius, callback) {
    this.makeRequest('venues/explore?ll=' + lat + ',' + lng + "&radius=" + radius + "&query=" + venues,
                     function(response) { callback(response['response']['groups'][0]['items']) });
};

Foursquare.prototype.getVenueInformation = function(venueID, callback) { 
    this.makeRequest("venues/" + venueID, function(result) { 
        callback(result.response.venue);    
    });
};

Foursquare.prototype.searchNearVenues = function(location, venues, callback) {
    this.makeRequest('venues/explore?near=' + location + "&query=" + venues, 
                     function(response) { callback(response['response']['groups'][0]['items']) });
};

Foursquare.prototype.searchTips = function(lat, lng, friendsOnly, callback) {
    this.makeRequest('tips/search?ll=' + lat + ',' + lng + (friendsOnly ? '&filter=friends' : ''),
                     function(response) { callback(response['response']['tips']) });
};

Foursquare.prototype.history = function(callback) {
    this.makeRequest('users/self/checkins?limit=250',
                     function(response) { callback(response['response']['checkins']['items'])  })
};

Foursquare.prototype.venueHistory = function(callback) {
    this.makeRequest('users/self/venuehistory',
                     function(response) { callback(response['response']['venues']['items']) });
};

Foursquare.prototype.todos = function(callback) {
    this.makeRequest('users/self/todos?sort=recent',
                     function(response) { callback(response['response']['todos']['items']) });
};

Foursquare.prototype.friends = function(callback) {
    this.makeRequest('users/self/friends',
                     function(response) { callback(response['response']['friends']['items']) });
};

/**
 * Helper utility duplicating goog.bind from Closure, useful for creating object-oriented callbacks.
 * something(bind(this.foo, this)) is equiavlent to var self = obj; something(function() { self.foo });
 */
function bind(f, obj) {
    return function() {
        f.apply(obj, arguments);
    }
}


