export const fetchMarsPhotos = (fields, nasaApiKey) => {
	return fetch(
		"https://api.nasa.gov/mars-photos/api/v1/rovers/" +
			fields.rover +
			"/photos?earth_date=" +
			fields.date +
			"&api_key=" +
			nasaApiKey +
			(!fields.camera ? "" : "&camera=" + fields.camera)
	).then((response) => response.json())
}

export const fetchCardTemplate = () => {
	return fetch("templates/roverTemplate.html").then((response) =>
		response.text()
	)
}

export const fetchRoverManifest = (roverName, nasaApiKey) => {
	return fetch(
		"https://api.nasa.gov/mars-photos/api/v1/manifests/" +
			roverName +
			"?api_key=" +
			nasaApiKey
	).then((response) => response.json())
}

export const fetchNoPhotos = () => {
	return fetch("templates/noPhotos.html").then((response) => response.text())
}

export const fetchCarouselSlide = () => {
	return fetch("templates/carouselSlideTemplate.html").then((response) =>
		response.text()
	)
}
