$(function() {
	var allItineraries = $.jStorage.get("all", []);
	console.log("from local storage:" + allItineraries);
	$(".user-itineraries").append(allItineraries);
});
