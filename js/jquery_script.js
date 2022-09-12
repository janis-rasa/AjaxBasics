"use strict"
import { makeApodRequest, getApodTemplate } from "./jquery_service.js"
const nasaApiKey = "DEMO_KEY"
const nasaFormId = "#formAPOD"
const datePickerClassName = ".datepicker"
const resultsApodId = "#resultsAPOD"

$(document).ready(function () {
	$(datePickerClassName).datepicker({
		format: "yyyy-mm-dd",
		endDate: "today",
		weekStart: 1,
		autoclose: true,
	})
})

$(nasaFormId).submit(function (event) {
	let dates = {}
	const formData = $(this).serializeArray()
	event.preventDefault()

	$.extend(dates, getDates(formData))

	if (
		new Date(dates.startDate).valueOf() <= new Date(dates.endDate).valueOf()
	) {
		createApodList(dates)
	} else {
		$(datePickerClassName).addClass("is-invalid")
	}
})

function getDates(formData) {
	let fields = {}
	$(resultsApodId).html("")
	$(datePickerClassName).removeClass("is-invalid")
	for (const formElement of formData) {
		fields[formElement.name] = formElement.value
	}
	return fields
}

$("#modalApod").on("show.bs.modal", function (event) {
	let button = $(event.relatedTarget)
	let recipient = button.data("img")
	let modal = $(this)
	if (recipient) {
		modal.find(".modal-text").text("").addClass("d-none")
		modal.find(".modal-title").text("").addClass("d-none")
		modal.find(".img-fluid").attr("src", recipient).removeClass("d-none")
	} else {
		recipient = button.data("text")
		modal.find(".img-fluid").attr("src", "").addClass("d-none")
		modal.find(".modal-text").text(recipient).removeClass("d-none")
		modal.find(".modal-title").text(button.data("title")).removeClass("d-none")
	}
})

function createCards(data, template) {
	let current
	for (const element of data) {
		if (element.media_type !== "image") {
			continue
		}
		current = $(template)
		$(current).find(".card-img-top").attr("src", element.url)
		$(current).find(".card-title").text(element.title)
		$(current).find(".card-text").text(element.explanation)
		$(current)
			.find(".card-img-wrapper[data-toggle='modal']")
			.data("img", element.hdurl)
		$(current)
			.find(".card-text[data-toggle='modal']")
			.data("text", element.explanation)
			.data("title", element.title)
		$(resultsApodId).append(current)
	}
}

function createApodList(dates) {
	$.when(
		makeApodRequest(dates.startDate, dates.endDate, nasaApiKey),
		getApodTemplate()
	).done(function (data, template) {
		if (data[1] === "success" && template[1] === "success") {
			createCards(data[0], template[0])
		} else {
			console.log(
				"APOD status code: " + data[2].statusText,
				"Template status code: " + template[2].statusText
			)
		}
	})
}
