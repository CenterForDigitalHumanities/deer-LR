/**
 * @module DEER Data Encoding and Exhibition for RERUM (DEER)
 * @author Patrick Cuba <cubap@slu.edu>

 * This code should serve as a basis for developers wishing to
 * use TinyThings as a RERUM proxy for an application for data entry,
 * especially within the Eventities model.
 * @see tiny.rerum.io
 */

// Identify an alternate config location or only overwrite some items below.
import { default as DEER } from 'https://centerfordigitalhumanities.github.io/deer/releases/alpha-.10/deer-config.js'

// Identify a UTILS package
import { default as UTILS } from 'https://centerfordigitalhumanities.github.io/deer/releases/alpha-.10/deer-utils.js'

// Overwrite or add certain values to the configuration to customize.

//Add one of my own templates
DEER.TEMPLATES.sense = function(obj, options = {}) {
    try {
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
        try {
            let tmpl = `<h2>${UTILS.getLabel(obj)}</h2>`
            let depiction = UTILS.getValue(obj.depiction) || "https://via.placeholder.com/200?text=No+photo+available"
            let dob = ["Date of birth", UTILS.getValue(obj.birthDate) || "unrecorded"]
            let email = ["Email", UTILS.getValue(obj.email) || "unrecorded"]
            let phone = ["Telephone Number", UTILS.getValue(obj.telephone) || "unrecorded"]
            let religion = ["Religion", UTILS.getValue(obj["religious_tradition"]) || "unrecorded"]
            let gender = ["Gender", UTILS.getValue(obj.gender) || "unrecorded"]
            let edu = ["Education", UTILS.getValue(obj.education) || "unrecorded"]
            let nationality = ["Nationality", UTILS.getValue(obj.nationality) || "unrecorded"]
            let description = ["Description", UTILS.getValue(obj.description) || "unrecorded"]
            tmpl += `<img src=${depiction} alt='portrait' class="pull-right">
            <dl>
            ${[dob,email,phone,religion,gender,edu,nationality,description].reduce((a,b)=>a+=`<dt>${b[0]}<dt>
            <dd>${b[1]}</dd>
            </dl>`,``)}`
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
        //TODO NONE or NEW Location should be a choice
        let tmpl = `<select class="locDropdown" oninput="this.parentElement.previousElementSibling.value=this.options[this.selectedIndex].value">`
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
 * Create a select dropdown containing Objects.  
 * @param {type} obj
 * @param {type} options
 * @return {tmpl}
 */
DEER.TEMPLATES.objectsAsDropdown = function(obj, options = {}) {
    try {
         //TODO NONE or NEW Object should be a choice
        let tmpl = `<select class="objDropdown" oninput="this.parentElement.previousElementSibling.value=this.options[this.selectedIndex].value">`
        let allObjectsInCollection = UTILS.getValue(obj.itemListElement)
        for (let o of allObjectsInCollection) {
            tmpl += `<option deer-id="${o['@id']}" value="${o['@id']}">${UTILS.getLabel(o)}</option>`
        }
        tmpl += `</select>`
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
DEER.TEMPLATES.locationsMulti = function(obj, options = {}) {
    try {
        let allLocationsInCollection = UTILS.getValue(obj.itemListElement)
        let tmpl = ``
        tmpl += `<select multiple oninput="LR.utils.handleMultiSelect(event,true)">
            <optgroup label="Locations"> `
        for (let loc of allLocationsInCollection) {
            tmpl += `<option deer-id="${loc['@id']}" value="${loc['@id']}">${UTILS.getLabel(loc)}</option>`
        }
        tmpl += `</optgroup></select>`
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
        let tmpl = ``
        tmpl += `<select multiple oninput="LR.utils.handleMultiSelect(event, true)">
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
 * Create a select area that is populated by some set or list of Objects.
 * @param {type} obj
 * @param {type} options
 * @return {tmpl}
 */
DEER.TEMPLATES.objectMulti = function(obj, options = {}) {
    try {
        let allObjectsInCollection = UTILS.getValue(obj.itemListElement)
        let tmpl = ``
        tmpl += `<select multiple oninput="LR.utils.handleMultiSelect(event, true)">
            <optgroup label="Objects"> `
        for (let obj of allObjectsInCollection) {
            tmpl += `<option deer-id="${obj['@id']}" value="${obj['@id']}">${UTILS.getLabel(obj)}</option>`
        }
        tmpl += `</optgroup></select>`
        return tmpl
    } catch (err) {
        return null
    }
}

DEER.TEMPLATES.Event = function(experienceData, options = {}) {
    try {
        let tmpl = `<h2>${UTILS.getLabel(experienceData)}</h2><dl>`
        
        let contributors = UTILS.getValue(experienceData.contributor)
        let place = UTILS.getValue(experienceData.location) //Most likely a single URI for a Place
        let relatedObjects = UTILS.getValue(experienceData.relatedObjects)
        let relatedSenses = UTILS.getValue(experienceData.relatedSenses)
        let relatedPractices = UTILS.getValue(experienceData.relatedPractices)
        let fieldNotes = UTILS.getValue(experienceData.fieldNotes)
       
        //experienceData.location is most likely a String that is a URI, we want the label
        let placeLabelHTML = ""
        if(typeof place === "object"){
            //Then the URI is the value
            let placeURI = UTILS.getValue(place)
            if(placeURI.indexOf("http://") > -1 || placeURI.indexOf("https://") > -1){
                placeLabelHTML = `<deer-view deer-id="${placeURI}" deer-template="mostUpToDateLabelHelper"></deer-view>`
            }
            else{
                //We know it is just a string of some kind, probably the label they want to display, so just use it.
                //TODO what should we do here?
                placeLabelHTML = placeURI
            }
        }
        else{
            // The URI is this string, probably
            if(place.indexOf("http://") > -1 || place.indexOf("https://") > -1){
                //Gamble that it is a resolvable ID...
                placeLabelHTML = `<deer-view deer-id="${place}" deer-template="mostUpToDateLabelHelper"></deer-view>`
            }
            else{
                //We know it is just a string of some kind, probably the label they want to display, so just use it.
                placeLabelHTML = place
            }
        }
        
        //experienceData.contributors is probably a Set or List of URIs and we want their labels
        let contr_people = []
        contributors.items.forEach((val)=>{
            let name = ""
            if(typeof val === "object"){
                let itemURI = UTILS.getValue(val)
                if(itemURI.indexOf("http://") > -1 || itemURI.indexOf("https://") > -1){
                    //item.value is a string and it is a URI value, as expected.
                    name = `<deer-view deer-id="${itemURI}" deer-template="mostUpToDateLabelHelper"></deer-view>`
                }
                else{
                    //We know it is just a string of some kind, probably the label they want to display, so just use it.
                    //TODO what should we do here?
                    name = itemURI
                }
            }
            else{
                if(val.indexOf("http://") > -1 || val.indexOf("https://") > -1){
                    //item is a string and it is a URI value, as expected.
                    name = `<deer-view deer-id="${val}" deer-template="mostUpToDateLabelHelper"></deer-view>`
                }
                else{
                    //We know it is just a string of some kind, probably the label they want to display, so just use it.
                    //TODO what should we do here?
                    name = val
                }
            }
            contr_people.push(name)
        })
        
        //Gather relatedObjects, an array of URIs
        let relatedObjectsByName = []
        //experienceData.relatedObjects is probably a Set or List of String URIs, we want their label
        relatedObjects.items.forEach((val)=>{
            let name = ""
            if(typeof val === "object"){
                //See if the value is the URI we want
                let itemURI = UTILS.getValue(val)
                if(itemURI.indexOf("http://") > -1 || itemURI.indexOf("https://") > -1){
                    name = `
                    <li>
                        <deer-view deer-id="${itemURI}" deer-template="mostUpToDateLabelHelper"></deer-view>
                        <a class="tag is-rounded is-small text-error" onclick="LR.utils.disassociateObject(event, '${itemURI}', '${experienceData["@id"]}')">Remove</a>
                    </li>
                    `
                }
                else{
                    //We know it is just a string of some kind.  Just use it.
                    //TODO what should we do here?
                    name = `
                    <li>
                        ${itemURI}
                    </li>
                    `
                }
            }
            else{
                if(val.indexOf("http://") > -1 || val.indexOf("https://") > -1){
                    //We expect this is item entry is the URI we were looking for
                    name = `
                    <li>
                        <deer-view deer-id="${val}" deer-template="mostUpToDateLabelHelper"></deer-view>
                        <a class="tag is-rounded is-small text-error" onclick="LR.utils.disassociateObject(event, '${val}', '${experienceData["@id"]}')">Remove</a>
                    </li>
                    `
                }
                else{
                    //We know it is just a string of some kind and not the URI, so we can show this string.  
                    //TODO what should we do here?
                    name = `
                    <li>
                        ${val}
                    </li>
                    `
                }
            }
            relatedObjectsByName.push(name)
        })
        let objectsHTML = `
            <h4>Objects at Experience "${UTILS.getLabel(experienceData)}"</h4>
            <p>Objects you add will appear here and can be removed, but not edited.</p>
            <ul id="objectsInExperience">
                ${relatedObjectsByName}
            </ul>
        `
        
        //Gather relatedPractices, an array of URIs
        let relatedPracticesByName = []
        //experienceData.relatedPractices is probably a Set or List of String URIs, we want their label
        relatedPractices.items.forEach((val)=>{
            let name = ""
            if(typeof val === "object"){
                //See if the value is the URI we want
                let itemURI = UTILS.getValue(val)
                if(itemURI.indexOf("http://") > -1 || itemURI.indexOf("https://") > -1){
                    name = `
                    <li>
                        <deer-view deer-id="${itemURI}" deer-template="mostUpToDateLabelHelper"></deer-view>
                        <a class="tag is-rounded is-small text-error" onclick="LR.utils.disassociateObject(event, '${itemURI}', '${experienceData["@id"]}')">Remove</a>
                    </li>
                    `
                }
                else{
                    //We know it is just a string of some kind.  Just use it.
                    //TODO what should we do here?
                    name = `
                    <li>
                        ${itemURI}
                    </li>
                    `
                }
            }
            else{
                if(val.indexOf("http://") > -1 || val.indexOf("https://") > -1){
                    //We expect this is item entry is the URI we were looking for
                    name = `
                    <li>
                        <deer-view deer-id="${val}" deer-template="mostUpToDateLabelHelper"></deer-view>
                        <a class="tag is-rounded is-small text-error" onclick="LR.utils.disassociateObject(event, '${val}', '${experienceData["@id"]}')">Remove</a>
                    </li>
                    `
                }
                else{
                    //We know it is just a string of some kind and not the URI, so we can show this string.  
                    //TODO what should we do here?
                    name = `
                    <li>
                        ${val}
                    </li>
                    `
                }
            }
            relatedPracticesByName.push(name)
        })
        let practicesHTML = `
            <h4>Practices at Experience "${UTILS.getLabel(experienceData)}"</h4>
            <p>Practices you add will appear here and can be removed, but not edited.</p>
            <ul id="practicesInExperience">
                ${relatedPracticesByName}
            </ul>
        `
        
        //Gather relatedSenses, an array of URIs
        let relatedSensesByName = []
        //experienceData.relatedSenses is probably a Set or List of String URIs, we want their label
        relatedSenses.items.forEach((val)=>{
            let name = ""
            if(typeof val === "object"){
                //See if the value is the URI we want
                let itemURI = UTILS.getValue(val)
                if(itemURI.indexOf("http://") > -1 || itemURI.indexOf("https://") > -1){
                    name = `
                    <li>
                        <deer-view deer-id="${itemURI}" deer-template="mostUpToDateLabelHelper"></deer-view>
                        <a class="tag is-rounded is-small text-error" onclick="LR.utils.disassociateObject(event, '${itemURI}', '${experienceData["@id"]}')">Remove</a>
                    </li>
                    `
                }
                else{
                    //We know it is just a string of some kind.  Just use it.
                    //TODO what should we do here?
                    name = `
                    <li>
                        ${itemURI}
                    </li>
                    `
                }
            }
            else{
                if(val.indexOf("http://") > -1 || val.indexOf("https://") > -1){
                    //We expect this is item entry is the URI we were looking for
                    name = `
                    <li>
                        <deer-view deer-id="${val}" deer-template="mostUpToDateLabelHelper"></deer-view>
                        <a class="tag is-rounded is-small text-error" onclick="LR.utils.disassociateObject(event, '${val}', '${experienceData["@id"]}')">Remove</a>
                    </li>
                    `
                }
                else{
                    //We know it is just a string of some kind and not the URI, so we can show this string.  
                    //TODO what should we do here?
                    name = `
                    <li>
                        ${val}
                    </li>
                    `
                }
            }
            relatedSensesByName.push(name)
        })
        let sensesHTML = `
            <h4>Senses at Experience "${UTILS.getLabel(experienceData)}"</h4>
            <p>Senses you add will appear here and can be removed, but not edited.</p>
            <ul id="sensesInExperience">
                ${relatedSensesByName}
            </ul>
        `
        let researchersHTML = `<dt>Researchers Involved</dt><dd>${contr_people}</dd>`
        let placeHTML = `<dt>Location</dt><dd>${placeLabelHTML}</dd>`
        let dateHTML = `<dt>Associated Date</dt><dd>${UTILS.getValue(experienceData.startDate, [], "string")}</dd>`
        let descriptionHTML = `<dt>Description</dt><dd>${UTILS.getValue(experienceData.description, [], "string")}</dd>`
        let artifactsHTML = objectsHTML + practicesHTML + sensesHTML
        let fieldNotesHTML = `
            <h4><a onclick="LR.ui.toggleFieldNotes()">Field Notes</a> from experience ${UTILS.getLabel(experienceData)}</h4>
            <ul id="fieldNotesInExperience">
                <li>${fieldNotes}</li>
            </ul>
        `
        tmpl += placeHTML + dateHTML + researchersHTML + descriptionHTML + artifactsHTML + fieldNotesHTML
        return tmpl
    } catch (err) {
        return null
    }
}

/**
 * This is to override the normal behavior for drawing collection types.  
 * We need the targetCollection annotation ID exposed for removal
 * We need all eleemtns that cause removal to be classed so we can hide/show them.  
 * We need the most up to date label/name to appear.
 * @param {type} obj
 * @param {type} options
 * @return {tmpl}
 */    
DEER.TEMPLATES.list= function(obj, options={}) {
    let tmpl = ``
    if(options.list){
        tmpl += `<ul>`
        obj[options.list].forEach((val,index)=>{
            let currentKnownLabel = UTILS.getLabel(val,(val.type || val['@type'] || "")) //May not be the most recent.  
            let name = `<deer-view deer-id="${val["@id"]}" deer-template="mostUpToDateLabelHelper">${currentKnownLabel}</deer-view>`
            let removeBtn = `<a href="#" class="tag is-rounded is-small text-error removeCollectionItem"
            onclick="LR.utils.removeCollectionEntry(event, '${val["@id"]}', this.parentElement, '${UTILS.getLabel(obj)}')">×</a>`
            tmpl+= (val["@id"] && options.link) ? `<li ${DEER.ID}="${val["@id"]}"><a href="${options.link}${val["@id"]}">${name}</a>${removeBtn}</li>` : `<li ${DEER.ID}="${val["@id"]}">${name} ${removeBtn}</li>`
        })
        tmpl += `</ul>`
    }
    return tmpl
}

/**
 * Override list item behavior by ensuring the most up to date label is gathered for the list item.
 * This is done using a separate template to invoke the functionality of expand() to gather the most up to date assertion. 
 * @param {Object} obj some obj  containing some label annotating it.
 */
DEER.TEMPLATES.mostUpToDateLabelHelper = function (obj, options = {}) {
    let label = options.label || UTILS.getLabel(obj,(obj.type || obj['@type'] || ""))
    try {
        return label
    } catch (err) {
        return null
    }
}

let LRprimitives = ["additionalType", "startDate", "location", "event", "relatedSenses", "relatedPractices", "relatedObjects"]
let DEERprimitives = DEER.PRIMITIVES
DEER.PRIMITIVES = [...DEERprimitives, ...LRprimitives]

//Comment this out for dev-01 deploys
//DEER.URLS = {
//    BASE_ID: "http://store.rerum.io/v1",
//    CREATE: "create",
//    UPDATE: "update",
//    QUERY: "query",
//    OVERWRITE: "overwrite",
//    DELETE: "delete",
//    SINCE: "http://store.rerum.io/v1/since"
//}

// Render is probably needed by all items, but can be removed.
// CDN at https://centerfordigitalhumanities.github.io/deer/releases/
import { default as renderer, initializeDeerViews } from 'https://centerfordigitalhumanities.github.io/deer/releases/alpha-.10/deer-render.js'

// Record is only needed for saving or updating items.
// CDN at https://centerfordigitalhumanities.github.io/deer/releases/
import { default as record, initializeDeerForms } from 'https://centerfordigitalhumanities.github.io/deer/releases/alpha-.10/deer-record.js'

// fire up the element detection as needed
/**
 * Note that VIEWS can be building blocks of FORMS.  VIEWS may also be the FORM in its entirety.
 * It follows that VIEWS must finish populating to the DOM before initializing forms which interact with the
 * elements in the DOM to do things like pre-filling or pre-select values, which much exist in the DOM for such interaction.
 * We seek to streamline the logic around these threads in the near future.  Make sure these remain treated as asyncronous.
 */
initializeDeerViews(DEER).then(() => initializeDeerForms(DEER))
