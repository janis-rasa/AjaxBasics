"use strict"

// APOD request
export function makeApodRequest(startDate, endDate, nasaApiKey) {
	return $.ajax(
		"https://api.nasa.gov/planetary/apod?start_date=" +
			startDate +
			"&end_date=" +
			endDate +
			"&api_key=" +
			nasaApiKey
	)
}

// Get template
export function getApodTemplate() {
	return $.ajax("templates/apodTemplate.html")
}
