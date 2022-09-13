"use strict"

import {
	fetchMarsPhotos,
	fetchCardTemplate,
	fetchRoverManifest,
	fetchNoPhotos,
} from "./vanilla_service.js"
import {
	opportunityCameras,
	curiosityCameras,
	spiritCameras,
} from "./vanilla_store.js"
const roverSelect = document.querySelector("#rover")
const cameraSelect = document.querySelector("#camera")
const dateInput = document.querySelector("#date")
const form = document.querySelector("#formMRP")
const submitButton = document.querySelector("#submitButton")
const results = document.querySelector("#resultsMars")
const carouselElement = document.querySelector("#carouselMars")
const modalElement = document.querySelector("#modalNasa")
const modalBody = modalElement.querySelector(".modal-body")
const getDatesButton = document.querySelector("#getDates")
const nasaApiKey = "DEMO_KEY"
let roverPhotosInfo = []

window.addEventListener("load", function () {
	roverSelect.addEventListener("change", roverOnChange)

	submitButton.addEventListener("click", submitForm)

	modalElement.addEventListener("show.bs.modal", showModal)

	getDatesButton.addEventListener("click", getDates)

	dateInput.addEventListener("blur", dateOnBlur)

	prepareCameras(roverSelect.value)
})

const datepicker = new Datepicker(dateInput, {
	format: "yyyy-mm-dd",
	maxDate: "today",
	weekStart: 1,
	autohide: true,
})

async function prepareCameras(rover) {
	await loadCameras(rover).then(() => {
		cameraSelect.removeAttribute("disabled")
	})
}

const loadCameras = (rover) => {
	return new Promise((resolve) => {
		roverOnChange({ target: { value: rover } })
		resolve("resolved")
	})
}

const roverOnChange = (event) => {
	getDatesButton.parentElement.classList.remove("d-none")
	dateInput.parentElement.classList.add("d-none")
	const optionElement = document.createElement("option")
	let optionClone
	let cameraList = []
	getDatesButton.removeAttribute("disabled")
	switch (event.target.value) {
		case "opportunity":
			cameraList = [...opportunityCameras]
			break
		case "curiosity":
			cameraList = [...curiosityCameras]
			break
		case "spirit":
			cameraList = [...spiritCameras]
			break
		default:
			cameraList = []
	}

	cameraSelect.innerHTML = ""
	cameraList.map((camera, index) => {
		optionClone = optionElement.cloneNode()
		if (index === 0) {
			optionClone.setAttribute("selected", true)
		}
		optionClone.setAttribute("value", camera.value)
		optionClone.textContent = camera.name
		cameraSelect.appendChild(optionClone)
	})

	getDates()
}

const submitForm = (event) => {
	event.preventDefault()
	let fields = {}
	const formData = new FormData(form)
	for (const [key, value] of formData) {
		fields[key] = value
	}
	if (!fields.date) {
		dateInput.classList.add("is-invalid")
		return
	}
	fetchData(fields)
}

const fetchData = (fields) => {
	Promise.all([fetchMarsPhotos(fields, nasaApiKey), fetchCardTemplate()]).then(
		(response) => createPhotoList(response)
	)
}

const dateOnBlur = (event) => {
	if (event.target.value) {
		event.target.classList.remove("is-invalid")
	}
}

const createPhotoList = (response) => {
	results.innerHTML = ""
	carouselElement.querySelector(".carousel-inner").innerHTML = ""
	if (Array.isArray(response[0].photos) && response[0].photos.length > 0) {
		const cardSelectors = {
			cardImageSelector: ".card-img-top",
			cardTitleSelector: ".card-title",
			cardModalButtonSelector: ".card-img-wrapper",
		}
		const cardTemplate = document.createElement("div")
		let carouselTemplate = prepareCarousel()
		response[0].photos.map((photo, index) => {
			processCards(photo, index, cardTemplate, cardSelectors, response[1])
			processCarousel(photo, index, carouselTemplate)
		})
	} else {
		fetchNoPhotos().then((response) => (results.innerHTML = response))
	}
}

const processCards = (photo, index, cardTemplate, cardSelectors, cardHTML) => {
	let currentCard = cardTemplate.cloneNode()
	currentCard.innerHTML = cardHTML.trim()
	currentCard
		.querySelector(cardSelectors.cardImageSelector)
		.setAttribute("src", photo.img_src)
	currentCard.querySelector(cardSelectors.cardTitleSelector).innerHTML =
		photo.camera.full_name
	currentCard.querySelector(
		cardSelectors.cardModalButtonSelector
	).dataset.slideIndex = index
	results.appendChild(currentCard.firstChild)
}

const prepareCarousel = () => {
	let carouselTemplate = document.createElement("div")
	carouselTemplate.classList.add("carousel-item", "text-center")
	let carouselImage = document.createElement("img")
	carouselImage.classList.add("img-fluid")
	carouselTemplate.appendChild(carouselImage)
	return carouselTemplate
}

const startCarousel = (event) => {
	modalBody.innerHTML = ""
	modalBody.appendChild(carouselElement)
	const slideIndex = event.relatedTarget.dataset.slideIndex
	const carousel = new bootstrap.Carousel(carouselElement, {
		interval: 10000,
	})
	carousel.to(slideIndex)
}

const processCarousel = (photo, index, carouselTemplate) => {
	let currentCarouselItem = carouselTemplate.cloneNode(true)
	if (index === 0) {
		currentCarouselItem.classList.add("active")
	}
	currentCarouselItem.querySelector("img").setAttribute("src", photo.img_src)
	carouselElement
		.querySelector(".carousel-inner")
		.appendChild(currentCarouselItem)
}

const getDates = () => {
	getDatesButton.setAttribute("disabled", true)
	const roverName = roverSelect.value
	fetchRoverManifest(roverName, nasaApiKey).then((response) => {
		roverPhotosInfo = response.photo_manifest.photos
		const disabledDates = getDisabledDates(roverPhotosInfo)
		datepicker.setOptions({
			minDate: roverPhotosInfo[0].earth_date,
			maxDate: roverPhotosInfo[roverPhotosInfo.length - 1].earth_date,
			datesDisabled: disabledDates,
		})
		getDatesButton.parentElement.classList.add("d-none")
		dateInput.parentElement.classList.remove("d-none")
		getDatesButton.removeAttribute("disabled")
	})
}

const showModal = (event) => {
	switch (event.relatedTarget.dataset.modalTarget) {
		case "carousel":
			startCarousel(event)
			break
		case "dates":
		default:
	}
}

const getDisabledDates = (photos) => {
	let disabledDates = [],
		date1,
		date2,
		missingDate,
		diffDates
	for (let i = 1; i < photos.length; i++) {
		date1 = new Date(photos[i - 1].earth_date)
		date2 = new Date(photos[i].earth_date)
		diffDates = (date2 - date1) / 86400000
		while (diffDates > 1) {
			diffDates--
			missingDate = new Date(date2)
			missingDate.setDate(missingDate.getDate() - diffDates)
			disabledDates = [...disabledDates, missingDate]
		}
	}
	return disabledDates
}
