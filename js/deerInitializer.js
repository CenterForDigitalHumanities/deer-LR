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
        let dob = `<lbl>Birth Date</lbl> <theval>${UTILS.getValue(obj.birthDate, [], "string")}</theval>`
     	  let email = `<lbl>Email</lbl> <theval>${UTILS.getValue(obj.email, [], "string")}</theval>`
      	let phone = `<lbl>Phone Number</lbl> <theval>${UTILS.getValue(obj.telephone, [], "string")}</theval>`
       	let religion = `<lbl>Religious Tradition</lbl> <theval>${UTILS.getValue(obj["religious_tradition"], [], "string")}</theval>`
        let depiction = `<lbl>Photo</lbl> <theval><img src="${UTILS.getValue(obj.depiction, [], "string")}"/></theval>`
     	  // let familyName = `<lbl>Family Name</lbl> <theval>${UTILS.getValue(obj.familyName, [], "string")}</theval>`
      	// let givenName = `<lbl>Given Name</lbl> <theval>${UTILS.getValue(obj.givenName, [], "string")}</theval>`
        let gender = `<lbl>Gender/Sexuality</lbl> <theval>${UTILS.getValue(obj.gender, [], "string")}</theval>`
        let edu  = `<lbl>Education</lbl> <theval>${UTILS.getValue(obj.education, [], "string")}</theval>`
        let nationality = `<lbl>National Origin</lbl> <theval>${UTILS.getValue(obj.nationality, [], "string")}</theval>`
        let description = `<lbl>Further Person Description</lbl> <theval>${UTILS.getValue(obj.description, [], "string")}</theval>`
        tmpl += (depiction+dob+email+phone+religion+gender+edu+nationality+description)
        return tmpl
    } catch (err) {
        return null
    }
}

DEER.TEMPLATES.survey= function(obj, options={}) {
    console.log("Survey template")
    try {
        let tmpl = `<h2>${UTILS.getLabel(obj)}</h2>`
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
initializeDeerForms(DEER)


