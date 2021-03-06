var distanceMatrixService = new google.maps.DistanceMatrixService(),
	geocoderService = new google.maps.Geocoder(),
	geolocationService = navigator.geolocation;

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
		showNotification('Calculating...');
		getDistance(originVal, destinationVal)
			.done(function() {
				hideNotification();
			})
			.then(function(data) {
				if (data.rows[0].elements[0].status == 'OK')
				{
					// Valid results
					var results = parseResponse(data);
					showResults('<p>It takes roughly <strong>' + results.duration + '</strong> to go from <strong>' + results.from + '</strong> to <strong>' + results.to+ '</strong></p>');
				} else
				{
					showResults('<p><strong>Sorry</strong>, No results found!</p>');
				}
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


// Use HTML5 navigator
if ("geolocation" in navigator)
{
	geolocationService.getCurrentPosition(function (position) {
		// Get current position
		var pos = {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		},
			myLocation = '';

		getLocationName(pos).then(function (results) {
			myLocation = results[0].formatted_address;
			$('#query-form .from').val(myLocation);
		});

	
	}, function () {
		handleNoGeolocation(true);
	});
} else {
	// Browser doesn't support HTML5 geolocation
	handleNoGeolocation(false);
}


function getLocationName(coordinates) {
	var	deferred = $.Deferred();

	geocoderService.geocode({'latLng': new google.maps.LatLng(coordinates.latitude, coordinates.longitude)}, function (results, status) {
		if (status == google.maps.GeocoderStatus.OK)
		{
			deferred.resolve(results);
		} else {
			console.warn('Address not found');
			deferred.reject(results);
		}
	});

	return deferred.promise();
}


function handleNoGeolocation(errorFlag){
	if (errorFlag) {
		console.log('Geolocation failed to initialize. Try to reload and allow Geolocation');
	} else {
		console.log('Your browser doesn\'t support HTML5 geolocation');
	}

	// Do something here
}


var notification = $('.notification'),
	notificationMsg = notification.find('.message');
// Notification
function notify(message, timeout) {
		timeout = timeout || 3000;

	if (message.trim().length > 0)
	{
		showNotification(message);

		setTimeout(function() {
			hideNotification();
		}, timeout);
	}

}

function showNotification(message) {
	notificationMsg.text(message);
	notification.slideDown();
}

function hideNotification() {
	notification.slideUp();
}
