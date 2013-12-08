/**
 * Populates the manage page with all itineraries
 */
$(function() {

	var itineraryOptions = '<div class="btn-group">';
	itineraryOptions += '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>';

	var allItineraries = $.jStorage.get("all", []);
	var singleItinerary;
	var singleVenue;
	var currentItineraryOptions;
	var emailBody;

	for (var i = allItineraries.length - 1; i >= 0; i--) {

		singleItinerary = allItineraries[i];
		emailBody = "";
		emailBody = singleItinerary.name + '%0D%0A';

		for (var k = 0; k < singleItinerary.venues.length; k++) {
			emailBody += '%0D%0A' + singleItinerary.venues[k].name;
		}

		// dropdown buttons
		currentItineraryOptions = itineraryOptions;
		currentItineraryOptions += '<div class="dropdown-menu" role="menu">';
		currentItineraryOptions += '<li><a class="btn btn-default" href="view.html#' + singleItinerary.name + ' ">View</a></li>';
		currentItineraryOptions += '<li><a class="btn btn-default" onclick="cloneItinerary(\'' + singleItinerary.name + '\')">Clone</a></li>';
		currentItineraryOptions += '<li><a class="btn btn-default" onclick="deleteItineraryConfirm(\'' + singleItinerary.name + '\')">Delete</a></li>';
		currentItineraryOptions += '<li><a class="btn btn-default" href="mailto: ?subject=Here\'s My PlanIt Itinerary!&body=' + emailBody + '" target="_blank">Mail Itinerary</a>'
		currentItineraryOptions += '</div></div>';
		
		// panel heading
		$(".user-itineraries").append('<div class="panel panel-info" style="width: 600px;">' 
									  + '<div class="panel-heading style="width: 600px;>'
									  +   '<div class="dropdown pull-right">' + currentItineraryOptions + '</div>'
									  +   '<div class="panel-title" style="font-size: 20pt">' + singleItinerary.name + '</div>' 
									  + '</div>');

		// venues
		for (var j = 0; j < singleItinerary.venues.length; j++) {
			singleVenue = singleItinerary.venues[j];
			$(".user-itineraries").append('<li>' + singleVenue.name+ '</li>');
		};
		$(".user-itineraries").append('<br>');
		console.log("i: " + i + ", singleItinerary.name: " + singleItinerary.name);
	};
});

/**
 * Require confirmation to delete an itinerary
 */
function deleteItineraryConfirm(itineraryName) {
	var r = confirm("Are you sure you want to delete itinerary '" + itineraryName + "'?");
	if (r == true) {
	  deleteItinerary(itineraryName)
	}
}

/**
 * Deletes an itinerary from itineraries
 */
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

/**
 * Creates a copy of the selected itinerary
 */
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
	$(this).scrollTop(0);
}
