// Load Distance Matrix Service
var distanceMatrixService;

GoogleMapsLoader.load(function (google) {
	distanceMatrixService = new google.maps.DistanceMatrixService();
});

// Get Distance
function getDistance(origin, destination, travelMode) {
	var deferred = $.Deferred();
	distanceMatrixService.getDistanceMatrix({
		origins: [origin],
		destinations: [destination],
		travelMode: travelMode || google.maps.TravelMode.DRIVING
	}, function(response, status){
		if (status == google.maps.DistanceMatrixStatus.OK)
		{
			deferred.resolve(response);
		} else
		{
			deferred.reject(response);
		}
	});

	return deferred.promise();
}

function parseResponse(response) {
	var origins = response.originAddresses,
		destinations = response.destinationAddresses,
		data = {};

	for (var i = 0; i < origins.length; i++) {
		var results = response.rows[i].elements;
		for (var j = 0; j < results.length; j++) {
			var element = results[j],
				distance = element.distance.text,
				duration = element.duration.text,
				from = origins[i],
				to = destinations[j];

			// console.log('Distance:', distance, 'Duration:', duration, 'From:', from, 'To:', to);
			data = {
				distance: distance,
				duration: duration,
				from: from,
				to: to
			};
		}
	}

	return data;
}

// Handle form submission
var queryForm 	= $('#query-form'),
	from		= queryForm.children('.from')[0],
	to		= queryForm.children('.to')[0],
	resultsContainer = $('.query-results');

queryForm.submit(function (e) {
	// console.log('submitting...');
	e.preventDefault();
	var originVal = from.value.trim(),
		destinationVal = to.value.trim();
	
	// Validate
	if (originVal.length > 0 && destinationVal.length > 0)
	{
		getDistance(originVal, destinationVal).then(function(data) {
				var results = parseResponse(data);
				showResults('<p>It takes roughly <strong>' + results.duration + '</strong> to go from <strong>' + results.from + '</strong> to <strong>' + results.to+ '</strong></p>');
			});
	} else {
		showResults('<p class="error">You need to fill in both fields</p>');
	}

	return false;
});

// Display results
function showResults(results) {
	resultsContainer.children().remove();
	resultsContainer.append(results);
}

