$(function() {

var itineraryOptions = '<div class="btn-group">';
	itineraryOptions += '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>';

	var allItineraries = $.jStorage.get("all", []);
	var singleItinerary;
	var singleVenue;
	var currentItineraryOptions;

	for (var i = 0; i < allItineraries.length; i++) {

		singleItinerary = allItineraries[i];
		$(".user-itineraries").append("<div class='single-itinerary'> <h4>"+ singleItinerary.name + "</h4><ul>");
		for (var j = 0; j < singleItinerary.venues.length; j++) {
			singleVenue = singleItinerary.venues[j];
			$(".user-itineraries").append("<li>"+ singleVenue.name + "</li>");
		};

		console.log("i: " + i + "singleItinerary.name: " + singleItinerary.name);

		currentItineraryOptions = itineraryOptions;
		currentItineraryOptions += '<ul class="dropdown-menu" role="menu"><li><a href="view.html#' + singleItinerary.name + '">View</a>';
		currentItineraryOptions += '<li class="divider"></li><li><button onclick="cloneItinerary(\'' + singleItinerary.name + '\')" class="btn btn-default" id="clone-button">Clone</button></li>';	
		currentItineraryOptions += '<li class="divider"></li><li><button onclick="deleteItinerary(\'' + singleItinerary.name + '\')" class="btn btn-default" id="delete-button">Delete</button></li>';
		currentItineraryOptions += '<li class="divider"></li><li><a href="#">TODO: email my itinerary</a></li></ul></div>';

		$(".user-itineraries").append("</ul> " + currentItineraryOptions + " </div>");
	};
});

function deleteItinerary(itineraryName) {
	console.log("We will delete " + itineraryName);
	var allItineraries = $.jStorage.get("all", []);
	var singleItinerary;
	var singleVenue;

	for (var i = 0; i < allItineraries.length; i++) {
		singleItinerary = allItineraries[i];

		if (singleItinerary.name === itineraryName) {
			allItineraries.splice(i, 1);
			$.jStorage.set("all", allItineraries);
			break;
		}
	}

	location.reload();
}
function cloneItinerary(itineraryName) {
	console.log("We will clone " + itineraryName);
	var allItineraries = $.jStorage.get("all", []);
	var singleItinerary;
	var singleVenue;

	for (var i = 0; i < allItineraries.length; i++) {
		singleItinerary = allItineraries[i];

		if (singleItinerary.name === itineraryName) {
			var copyItinerary = {};
			copyItinerary['venues'] = singleItinerary.venues.slice(0);
			copyItinerary['creation_time'] = (new Date()).getTime();
			copyItinerary['name'] = "Clone Of " + singleItinerary.name;

			// allItineraries.splice(allItineraries.length, 1, copyItinerary);
			allItineraries.push(copyItinerary);
			$.jStorage.set("all", allItineraries);
			break;
		}
	}

	location.reload();
}

