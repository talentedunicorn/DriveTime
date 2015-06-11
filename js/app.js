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
}

// Handle form submission
var queryForm 	= document.getElementById('query-form'),
	from		= queryForm.getElementsByClassName('from')[0],
	to		= queryForm.getElementsByClassName('to')[0],
	resultsContainer = document.getElementsByClassName('query-results')[0];

if (queryForm.attachEvent) {
	queryForm.attachEvent('submit', submitForm);
} else {
	queryForm.addEventListener('submit', submitForm);
}

function submitForm(e) {
	if (e.preventDefault) e.preventDefault();
	
	// Validate
	if (from.value.trim().length > 0 && to.value.trim().length > 0)
	{
		var results = getDistance(from.value.trim(), to.value.trim());
		console.log(typeof(results));
		showResults('<p>It takes roughly', results.duration, 'to go from', results.from, 'to', results.to, '</p>');
	} else {
		showResults('<p class="error">You need to fill in both fields</p>');
	}

	return false;
}

// Display results
function showResults(results) {
	resultsContainer.innerHTML = results;
}

