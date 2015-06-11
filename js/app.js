// Load Distance Matrix Service
var distanceMatrixService;

GoogleMapsLoader.load(function (google) {
	distanceMatrixService = new google.maps.DistanceMatrixService();
});

// Query
function getDistance(origin, destination, travelMode) {
	distanceMatrixService.getDistanceMatrix({
		origins: [origin],
		destinations: [destination],
		travelMode: travelMode || google.maps.TravelMode.DRIVING
	}, callback);
}

function callback(response, status) {
	if (status == google.maps.DistanceMatrixStatus.OK) {
		var origins = response.originAddresses,
			destinations = response.destinationAddresses;

		for (var i = 0; i < origins.length; i++) {
			var results = response.rows[i].elements;
			for (var j = 0; j < results.length; j++) {
				var element = results[j],
					distance = element.distance.text,
					duration = element.duration.text,
					from = origins[i],
					to = destinations[j];

				console.log('Distance:', distance, 'Duration:', duration, 'From:', from, 'To:', to);
			}
		}
	}
}
