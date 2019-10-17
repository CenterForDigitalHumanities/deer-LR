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
DEER.TEMPLATES.sense = function(obj, options = {}) {
    console.log("sense template")
    try {
        // let kind = DEER.TEMPLATES.prop(obj, {key:"kind", label:"Type"}) || ``
        //    let location = DEER.TEMPLATES.prop(obj, {key:"location", label:"Where"}) || ``
        //    let religiousTradition = DEER.TEMPLATES.prop(obj, {key:"religious_tradition", label:"Religion"}) || ``
        //    let gender = DEER.TEMPLATES.prop(obj.demographic, {key:"gender", label:"Gender"}) || ``
        //    let age = DEER.TEMPLATES.prop(obj.demographic, {key:"age", label:"Age"}) || ``
        //       let use = DEER.TEMPLATES.prop(obj, {key:"use", label:"Use"}) || ``
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
DEER.TEMPLATES.person = function(obj, options = {}) {
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
        let edu = `<entry-line><lbl>Education</lbl> <theval>${UTILS.getValue(obj.education, [], "string")}</theval></entry-line/>`
        let nationality = `<entry-line><lbl>National Origin</lbl> <theval>${UTILS.getValue(obj.nationality, [], "string")}</theval></entry-line/>`
        let description = `<entry-line><lbl>Further Person Description</lbl> <theval>${UTILS.getValue(obj.description, [], "string")}</theval></entry-line/>`
        tmpl += (depiction + dob + email + phone + religion + gender + edu + nationality + description)
        return tmpl
    } catch (err) {
        return null
    }
}

/**
 * Create a select dropdown containing Places.  
 * @param {type} obj
 * @param {type} options
 * @return {tmpl}
 */
DEER.TEMPLATES.locationsAsDropdown = function(obj, options = {}) {
    try {
        //<h5>${UTILS.getLabel(obj)} Collection</h5> 
        let tmpl = `<select oninput="document.getElementById('loc').value=this.selectedOptions[0].value" deer-key-x="location">`
        let allPlacesInCollection = UTILS.getValue(obj.itemListElement)
        for (let place of allPlacesInCollection) {
            tmpl += `<option deer-id="${place['@id']}" value="${place['@id']}">${UTILS.getLabel(place)}</option>`
        }
        tmpl += `</select>`
        return tmpl
    } catch (err) {
        return null
    }
}

/**
 * Create a select area that is populated by some set or list of people.
 * @param {type} obj
 * @param {type} options
 * @return {tmpl}
 */
DEER.TEMPLATES.personMulti = function(obj, options = {}) {
    try {
        let allPeopleInCollection = UTILS.getValue(obj.itemListElement)
        //let tmpl = `<h5>${UTILS.getLabel(obj)} Collection</h5>`
        let tmpl = ``
        tmpl += `<select deer-key-x="contributor" multiple="" disabled oninput="this.previousElementSibling.value=JSON.stringify(Array.from(this.selectedOptions).map(e=>e.value))">
            <optgroup label="Researchers"> `
        for (let person of allPeopleInCollection) {
            tmpl += `<option deer-id="${person['@id']}" value="${person['@id']}">${UTILS.getLabel(person)}</option>`
        }
        tmpl += `</optgroup></select>`
        return tmpl
    } catch (err) {
        return null
    }
}

/**
 * TODO Really this is the "data submission" template.  As far as it goes, this is the only "Event" recorded so far.  
 * This is very basic and does not contain the information describing the Event.  It needs to be built out as we begin to #14
 * describe an experience.  
 * 
 * @param {type} obj
 * @param {type} options
 * @return {default.TEMPLATES.Event.tmpl, String}
 */
DEER.TEMPLATES.Event = function(obj, options = {}) {
    let tmpl = `<h2>${UTILS.getValue(obj.label)}</h2>`
    let list = ``
    for (let key in obj) {
        if (DEER.SUPPRESS.indexOf(key) > -1) { continue }
        let label = key
        let value = UTILS.getValue(obj[key], key)
        try {
            if ((value.image || value.trim()).length > 0) {
                list += `<dt deer-source="${obj[key].source}">${label}</dt><dd>${value}</dd>`
            }
        } catch (err) {
            // Some object maybe or untrimmable somesuch
            list += `<dt>${label}</dt>`
            if (Array.isArray(value)) {
                value.forEach((val, index) => {
                    let name = UTILS.getLabel(val, (val.type || val['@type'] || label + index))
                    list += (val["@id"]) ? `<dd><a href="#${val["@id"]}">${name}</a></dd>` : `<dd>${name}</dd>`
                })
            } else {
                //This is an object containing an array.  In this case, it is most likely contributor
                let v = UTILS.getValue(value)
                if (typeof v === "object") { v = UTILS.getArrayFromObj(v) }
                list += (value['@id']) ? `<dd><a href="${options.link||""}#${value['@id']}">${v}</a></dd>` : `<dd>${v}</dd>`
            }
        }
    }
    tmpl += (list.includes("<dd>")) ? `<dl>${list}</dl>` : ``
    return tmpl
}
//
DEER.URLS = {
    CREATE: "create",
    UPDATE: "update",
    QUERY:  "query",
    OVERWRITE: "overwrite",
    DELETE: "delete",
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