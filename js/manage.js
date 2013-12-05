$(function() {

var itineraryOptions = '<div class="btn-group">';
	itineraryOptions += '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>';



	var allItineraries = $.jStorage.get("all", []);
	console.log("from local storage:" + allItineraries);

	for (var i = 0; i < allItineraries.length; i++) {
		singleItinerary = allItineraries[i];
		$(".user-itineraries").append("<div class='single-itinerary'> <h4>"+ singleItinerary.name + "</h4><ul>");
		for (var j = 0; j < singleItinerary.venues.length; j++) {
			singleVenue = singleItinerary.venues[j];
			$(".user-itineraries").append("<li>"+ singleVenue.name + "</li>");
		};

		itineraryOptions += '<ul class="dropdown-menu" role="menu"><li><a href="view.html#' + singleItinerary.name + '">View</a></li><li><a href="#">Clone</a></li>';
		itineraryOptions += '<li><a href="#">Delete</a></li>';
		itineraryOptions += '<li class="divider"></li><li><a href="#">TODO: email my itinerary</a></li></ul></div>';

		$(".user-itineraries").append("</ul> " + itineraryOptions + " </div>");
	};
});
