"use strict"

import { fetchMarsPhotos, fetchCardTemplate } from "./vanilla_service.js"
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
const nasaApiKey = "DEMO_KEY"

window.addEventListener("load", function () {
	new Datepicker(dateInput, {
		format: "yyyy-mm-dd",
		maxDate: "today",
		weekStart: 1,
		autohide: true,
	})

	roverSelect.addEventListener("change", setCameraList)

	submitButton.addEventListener("click", submitForm)

	modalElement.addEventListener("show.bs.modal", startCarousel)
})

const setCameraList = (event) => {
	const optionElement = document.createElement("option")
	let optionClone
	let cameraList = []
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
}

const submitForm = (event) => {
	event.preventDefault()
	let fields = {}
	const formData = new FormData(form)
	for (const [key, value] of formData) {
		fields[key] = value
	}
	fetchData(fields)
}

const fetchData = (fields) => {
	Promise.all([fetchMarsPhotos(fields, nasaApiKey), fetchCardTemplate()]).then(
		(response) => createPhotoList(response)
	)
}

const createPhotoList = (response) => {
	results.innerHTML = ""
	carouselElement.querySelector(".carousel-inner").innerHTML = ""
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
