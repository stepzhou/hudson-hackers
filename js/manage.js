$(function() {
	var allItineraries = $.jStorage.get("all", []);
	console.log("from local storage:" + allItineraries);

	for (var i = 0; i < allItineraries.length; i++) {
		singleItinerary = allItineraries[i];
		$(".user-itineraries").append("<div class='single-itinerary'> <ul>");
		for (var j = 0; j < singleItinerary.length; j++) {
			singleVenue = singleItinerary[j];
			$(".user-itineraries").append("<li>"+ singleVenue.name + "</li>");
		};
		$(".user-itineraries").append("</ul></div>");
	};

	//$(".user-itineraries").append(allItineraries);
});
