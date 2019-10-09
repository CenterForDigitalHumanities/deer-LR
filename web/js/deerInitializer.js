/**
 * @module DEER Data Encoding and Exhibition for RERUM (DEER)
 * @author Patrick Cuba <cubap@slu.edu>

 * This code should serve as a basis for developers wishing to
 * use TinyThings as a RERUM proxy for an application for data entry,
 * especially within the Eventities model.
 * @see tiny.rerum.io
 */

// Identify an alternate config location or only overwrite some items below.
import { default as DEER } from '../deer-lr-working/deer-config.js'

// Identify a UTILS package
import { default as UTILS } from '../deer-lr-working/deer-utils.js'


// Overwrite or add certain values to the configuration to customize.

// new template
DEER.TEMPLATES.cat = (obj) => `<h5>${obj.name}</h5><img src="http://placekitten.com/300/150" style="width:100%;">`

//Add one of my own templates
DEER.TEMPLATES.sense = function(obj, options={}){
    console.log("sense template")
    try {
    	// let kind = DEER.TEMPLATES.prop(obj, {key:"kind", label:"Type"}) || ``
     //    let location = DEER.TEMPLATES.prop(obj, {key:"location", label:"Where"}) || ``
     //    let religiousTradition = DEER.TEMPLATES.prop(obj, {key:"religious_tradition", label:"Religion"}) || ``
     //    let gender = DEER.TEMPLATES.prop(obj.demographic, {key:"gender", label:"Gender"}) || ``
     //    let age = DEER.TEMPLATES.prop(obj.demographic, {key:"age", label:"Age"}) || ``
     //	   let use = DEER.TEMPLATES.prop(obj, {key:"use", label:"Use"}) || ``
     //if I use key that doesn't exist, I get a blank, which is better than a breaking error 
     	let kind = `<h3>${UTILS.getValue(obj.kind)}</h3>`
        let location = `<dd>Location:${UTILS.getValue(obj.location)}</dd>`
        let religiousTradition = `<dd>Religion:${UTILS.getValue(obj.religious_tradition)}</dd>`
        let gender = `<dd>Gender:${UTILS.getValue(obj.demographic.gender)}</dd>`
        let age = `<dd>Age:${UTILS.getValue(obj.demographic.age)}</dd>`
        let use = `<dd>Use:${UTILS.getValue(obj.typical_use)}</dd>`
        //If I use a obj.xyz that doesn't exist a breaking error occurs...

        let senseTemplate = `<div>`

        senseTemplate += `<div>${kind}</div>`
        senseTemplate += `<div>${location}</div>`
        senseTemplate += `<div>${religiousTradition}</div>`
        senseTemplate += `<div>${gender}</div>`
        senseTemplate += `<div>${age}</div>`
        senseTemplate += `<div>${use}</div>`

        senseTemplate += `</div>`
        return senseTemplate
    } catch (err) {
        return null
    }
    return null
}

//Overwrite the internal person template with a more robust one
DEER.TEMPLATES.person= function(obj, options={}) {
    console.log("person template")
    try {
        let tmpl = `<h2>${UTILS.getLabel(obj)}</h2>`
        let dob = `<entry-line><lbl>Birth Date</lbl> <theval>${UTILS.getValue(obj.birthDate, [], "string")}</theval></entry-line/>`
     	  let email = `<entry-line><lbl>Email</lbl> <theval>${UTILS.getValue(obj.email, [], "string")}</theval></entry-line/>`
      	let phone = `<entry-line><lbl>Phone Number</lbl> <theval>${UTILS.getValue(obj.telephone, [], "string")}</theval></entry-line/>`
       	let religion = `<entry-line><lbl>Religious Tradition</lbl> <theval>${UTILS.getValue(obj["religious_tradition"], [], "string")}</theval></entry-line/>`
        let depiction = `<entry-line><lbl>Photo</lbl> <theval><img src="${UTILS.getValue(obj.depiction, [], "string")}"/></theval></entry-line/>`
     	  // let familyName = `<lbl>Family Name</lbl> <theval>${UTILS.getValue(obj.familyName, [], "string")}</theval>`
      	// let givenName = `<lbl>Given Name</lbl> <theval>${UTILS.getValue(obj.givenName, [], "string")}</theval>`
        let gender = `<entry-line><lbl>Gender/Sexuality</lbl> <theval>${UTILS.getValue(obj.gender, [], "string")}</theval></entry-line/>`
        let edu  = `<entry-line><lbl>Education</lbl> <theval>${UTILS.getValue(obj.education, [], "string")}</theval></entry-line/>`
        let nationality = `<entry-line><lbl>National Origin</lbl> <theval>${UTILS.getValue(obj.nationality, [], "string")}</theval></entry-line/>`
        let description = `<entry-line><lbl>Further Person Description</lbl> <theval>${UTILS.getValue(obj.description, [], "string")}</theval></entry-line/>`
        tmpl += (depiction+dob+email+phone+religion+gender+edu+nationality+description)
        return tmpl
    } catch (err) {
        return null
    }
}

DEER.TEMPLATES.locationsAsDropdown= function(obj, options={}) {
    try {
        let tmpl = `<h5>${UTILS.getLabel(obj)} Collection</h5> <select oninput="document.getElementById('loc').value=this.selectedOptions[0].value" deer-key="location">`
        let allPlacesInCollection = UTILS.getValue(obj.itemListElement)
        for(let place of allPlacesInCollection){
            tmpl += `<option deer-id="${place['@id']}" value="${place['@id']}">${UTILS.getLabel(place)}</option>`
        }
        tmpl += `</select>`
        return tmpl
    } catch (err) {
        return null
    }
}

DEER.TEMPLATES.personMulti= function(obj, options={}) {
    try {
        let allPeopleInCollection = UTILS.getValue(obj.itemListElement)
        let tmpl = `<h5>${UTILS.getLabel(obj)} Collection</h5>`
        tmpl += `<select multiple="" disabled oninput="this.previousElementSibling.value=JSON.stringify(Array.from(this.selectedOptions).map(e=>e.value))">
            <optgroup label="Researchers"> `
        for(let person of allPeopleInCollection){
            tmpl += `<option deer-id="${person['@id']}" value="${person['@id']}">${UTILS.getLabel(person)}</option>`
        }
        tmpl += `</optgroup></select>`
        return tmpl
    } catch (err) {
        return null
    }
}

//TODO Really this is the "data submission" template.  As far as it goes, this is the only "Event" recorded so far.  
DEER.TEMPLATES.Eventx = function(obj, options={}) {
    try {
        let tmpl = `<h5>${UTILS.getLabel(obj)}</h5>`
        let researchers = UTILS.getValue(obj.contributor)
        let date = UTILS.getValue(obj.startDate, [], "string")
        let place = UTILS.getValue(obj.location, [], "string")
        //TODO and all the arttifacts with their annotations...
        tmpl += place+date+researchers
        return tmpl
    } catch (err) {
        return null
    }
}
// sandbox repository URLS
DEER.URLS = {
    BASE_ID: "http://devstore.rerum.io/v1",
    CREATE: "http://tinydev.rerum.io/app/create",
    UPDATE: "http://tinydev.rerum.io/app/update",
    QUERY: "http://tinydev.rerum.io/app/query",
    SINCE: "http://devstore.rerum.io/v1/since"
}
// Render is probably needed by all items, but can be removed.
// CDN at https://centerfordigitalhumanities.github.io/deer/releases/
import { default as renderer, initializeDeerViews } from '../deer-lr-working/deer-render.js'

// Record is only needed for saving or updating items.
// CDN at https://centerfordigitalhumanities.github.io/deer/releases/
import { default as record, initializeDeerForms } from '../deer-lr-working/deer-record.js'

// fire up the element detection as needed
initializeDeerViews(DEER)
//Need to make the form initializer wait on view initializer, these cannot run syncronously.  
initializeDeerForms(DEER)



