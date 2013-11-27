$(function() {
    var map = L.map('map').setView([40.78, -73.97], 12);

    L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
        key: cloudmade_key,
        styleId: 96931,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
        maxZoom: 18
    }).addTo(map);


    $('#search-form').submit(function	()	{
		var	venue = $('#venue-text').val(),
			location = $('#location-text').val();

		if(!location) { 
			// implement this later; need to convert longitude/latitude or use appropriate parameter
			// if(navigator.geolocation) {
				// navigator.geolocation.getCurrentPosition(searchFourSquare);
			// }
			location = 'New York'; // default to New York for now
		}

		if (!!venue) {
			//make calls to foursquare API
		}
	});

	function searchFourSquare(venue, location) {
		//Foursquare(apiKey, authUrl, apiUrl)
		var apiKey = "PF4Q2R5DJRQDBH1KLXPAUJAX0200NRT0S3IHDNDADDGHCRYB";
		this.foursquare = new Foursquare(apiKey, "https://foursquare.com/oauth2/authorize", "https://api.foursquare.com");

		foursquare.searchNearVenues(location, 
			function (reply) {

			}
		);
	}

});
