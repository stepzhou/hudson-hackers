$(function() {
	var allItineraries = $.jStorage.get("all", []);
	console.log("from local storage:" + allItineraries);

	for (var i = 0; i < allItineraries.length; i++) {
		singleItinerary = allItineraries[i];
		$(".user-itineraries").append("<div class='single-itinerary'> <h4>"+ singleItinerary.name + "</h4><ul>");
		for (var j = 0; j < singleItinerary.venues.length; j++) {
			singleVenue = singleItinerary.venues[j];
			$(".user-itineraries").append("<li>"+ singleVenue.name + "</li>");
		};
		$(".user-itineraries").append("</ul></div>");
	};
});
