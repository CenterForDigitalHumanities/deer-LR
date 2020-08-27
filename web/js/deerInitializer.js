/**
 * @module DEER Data Encoding and Exhibition for RERUM (DEER)
 * @author Patrick Cuba <cubap@slu.edu>

 * This code should serve as a basis for developers wishing to
 * use TinyThings as a RERUM proxy for an application for data entry,
 * especially within the Eventities model.
 * @see tiny.rerum.io
 */

// Identify an alternate config location or only overwrite some items below.
import { default as DEER } from 'https://centerfordigitalhumanities.github.io/deer/releases/alpha-.11/deer-config.js'

// Identify a UTILS package
import { default as UTILS } from 'https://centerfordigitalhumanities.github.io/deer/releases/alpha-.11/deer-utils.js'

// Overwrite or add certain values to the configuration to customize.

//Add one of my own templates
DEER.TEMPLATES.Sense = function(obj, options = {}) {
    try {
        let label = `<h3>${UTILS.getLabel(obj)}</h3>`
        let location = `<dd>Location:${UTILS.getValue(obj.location)}</dd>`
        let religiousTradition = `<dd>Religion:${UTILS.getValue(obj.religious_tradition)}</dd>`
        let gender = `<dd>Gender:${UTILS.getValue(obj.demographic.gender)}</dd>`
        let age = `<dd>Age:${UTILS.getValue(obj.demographic.age)}</dd>`
        let use = `<dd>Use:${UTILS.getValue(obj.typical_use)}</dd>`
        let senseTemplate = `<div>`
        senseTemplate += `<div>${label}</div>`
        senseTemplate += `<div>${location}</div>`
        senseTemplate += `<div>${religiousTradition}</div>`
        senseTemplate += `<div>${gender}</div>`
        senseTemplate += `<div>${age}</div>`
        senseTemplate += `<div>${use}</div>`
        senseTemplate += `</div>`
        return senseTemplate
    } catch (err) {
        console.log("Could not build Sense template.")
        console.error(err)
        return null
    }
}

/**
 * Represent a collection as a <select> HTML dropdown.  
 * Include the ability to quickly add an item to the collection, which will then be selected.
 * @param {type} obj
 * @param {type} options
 * @return {tmpl}
 */
DEER.TEMPLATES.itemsAsDropdown = function(obj, options = {}) {
    try {
        let whichCollection = UTILS.getLabel(obj) ? UTILS.getLabel(obj) : ""
        let type = ""
        if(whichCollection){
            let check = whichCollection.replace("Test", "")
            switch(check){
                case "LivedReligionLocations":
                    type = "Place"
                break
                case "LivedReligionObjects":
                    type = "Thing"
                break
                case "LivedReligionExperiences":
                    type = "Event"
                break
                case "LivedReligionResearchers":
                    type = "Researcher"
                break
                case "LivedReligionPeople":
                    type = "Person"
                break
                default :
                    console.error("This is an unknown collection: "+whichCollection+".")
                    return null
            }
        }
        else{
            console.error("Could not find collection label on provided object.  This is an unknown collection.  See object below.")
            console.log(obj)
            return null
        }
        let quickAddTmpl = `<a title="Click here to add a new entity by name to this collection." class="quick tag bg-primary text-white is-small pull-right" onclick="LR.ui.toggleEntityAddition(event, this.nextElementSibling)">&#x2b;</a>
        <div class="card quickAddEntity bg-light is-hidden">
            <label>Supply a name or label for this entity</label>
            <a class="closeQuickAdd quick tag bg-primary text-white is-small pull-right" onclick="LR.ui.toggleEntityAddition(event, this.parentElement)"> &#8722; </a>
            <input class="" type="text" />
            <a class="tag bg-primary text-white" onclick="LR.utils.quicklyAddToCollection(event, '${whichCollection}', null, 'Place')">Add</a>
        </div>`
        let tmpl = `${quickAddTmpl}<select class="locDropdown" oninput="this.parentElement.previousElementSibling.value=this.options[this.selectedIndex].value">`
        tmpl += `<option disabled selected value> Not Supplied </option>`
        let allPlacesInCollection = obj.itemListElement ? UTILS.getValue(obj.itemListElement) : []
        for (let place of allPlacesInCollection) {
            tmpl += `<option class="deer-view" deer-template="label" deer-id="${place['@id']}" value="${place['@id']}">${UTILS.getLabel(place)}</option>`
        }
        tmpl += `</select>`
        return tmpl
    } catch (err) {
        console.log("Could not build collection dropdown template.")
        console.error(err)
        return null
    }
}



/**
 * Represent a collection as a <select multiple> HTML multi-select.  
 * Include the ability to quickly add an item to the collection, which will then be selected.
 * @param {type} obj
 * @param {type} options
 * @return {tmpl}
 */
DEER.TEMPLATES.itemsAsMultiSelect = function(obj, options = {}) {
    try {
        let whichCollection = UTILS.getLabel(obj) ? UTILS.getLabel(obj) : ""
        let type = ""
        if(whichCollection){
            let check = whichCollection.replace("Test", "")
            switch(check){
                case "LivedReligionLocations":
                    type = "Place"
                break
                case "LivedReligionObjects":
                    type = "Thing"
                break
                case "LivedReligionExperiences":
                    type = "Event"
                break
                case "LivedReligionResearchers":
                    type = "Researcher"
                break
                case "LivedReligionPeople":
                    type = "Person"
                break
                default :
                    console.error("This is an unknown collection: "+whichCollection+".")
                    return null
            }
        }
        else{
            console.error("Could not find collection label on provided object.  This is an unknown collection.  See object below.")
            console.log(obj)
            return null
        }
        let quickAddTmpl = `<a title="Click here to add a new entity by name to this collection." class="quick tag bg-primary text-white is-small pull-right" onclick="LR.ui.toggleEntityAddition(event, this.nextElementSibling)">&#x2b;</a>
        <div class="card quickAddEntity bg-light is-hidden">
            <label>Supply a name or label for this entity</label>
            <a class="closeQuickAdd quick tag bg-primary text-white is-small pull-right" onclick="LR.ui.toggleEntityAddition(event, this.parentElement)"> &#8722; </a>
            <input class="" type="text" />
            <a class="tag bg-primary text-white" onclick="LR.utils.quicklyAddToCollection(event, '${whichCollection}', null, 'Place')">Add</a>
        </div>`
        let selected = `<div class="selectedEntities"></div>`
        let allLocationsInCollection = obj.itemListElement ? UTILS.getValue(obj.itemListElement) : []
        let tmpl = `${quickAddTmpl}`
        tmpl += `<select multiple oninput="LR.utils.handleMultiSelect(event,true)">
            <optgroup label="${type}s"> `
        for (let loc of allLocationsInCollection) {
            tmpl += `<option class="deer-view" deer-template="label" deer-id="${loc['@id']}" value="${loc['@id']}">${UTILS.getLabel(loc)}</option>`
        }
        tmpl += `</optgroup></select>${selected}`
        return tmpl
    } catch (err) {
        console.log("Could not build collection multi select template.")
        console.error(err)
        return null
    }
}

DEER.TEMPLATES.Event = function(experienceData, options = {}) {
    try {
        let tmpl = `<h2>${UTILS.getLabel(experienceData)}</h2> <a class="button primary pull-right" area="startExperience" onclick="LR.ui.toggleAreas(event)" title="Edit the base information about this experience.">Edit</a><dl>`
        let contributors = experienceData.contributor ? UTILS.getValue(experienceData.contributor) : {"items":[]}
        let people = experienceData.attendee ? UTILS.getValue(experienceData.attendee) : {"items":[]}
        let relatedObjects = experienceData.object ? UTILS.getValue(experienceData.object) : {"items":[]}
        let relatedSenses = experienceData.relatedSenses ? UTILS.getValue(experienceData.relatedSenses) : {"items":[]}
        let relatedPractices = experienceData.relatedPractices ? UTILS.getValue(experienceData.relatedPractices) : {"items":[]}
        let place = experienceData.location ? UTILS.getValue(experienceData.location) : ""
        let fieldNotes = experienceData.fieldNotes ? UTILS.getValue(experienceData.fieldNotes) : ""
        let date = experienceData.startDate ? UTILS.getValue(experienceData.startDate) : ""
        let description = experienceData.description ? UTILS.getValue(experienceData.description) : ""
       
        //experienceData.location is most likely a String that is a URI, we want the label
        let placeLabelHTML = ""
        if(typeof place === "object"){
            //Then the URI is the value
            let placeURI = UTILS.getValue(place)
            if(placeURI.indexOf("http://") > -1 || placeURI.indexOf("https://") > -1){
                placeLabelHTML = `<deer-view deer-id="${placeURI}" deer-template="label"></deer-view>`
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
                placeLabelHTML = `<deer-view deer-id="${place}" deer-template="label"></deer-view>`
            }
            else{
                //We know it is just a string of some kind, probably the label they want to display, so just use it.
                placeLabelHTML = place
            }
        }
        
        //experienceData.contributors is probably a Set or List of URIs and we want their labels
        let contributorsByName = ``
        contributors.items.forEach((val)=>{
            let name = ""
            if(typeof val === "object"){
                let itemURI = UTILS.getValue(val)
                if(itemURI.indexOf("http://") > -1 || itemURI.indexOf("https://") > -1){
                    //item.value is a string and it is a URI value, as expected.
                    name = `<li><deer-view deer-id="${itemURI}" deer-template="label"></deer-view></li>`
                }
                else{
                    //We know it is just a string of some kind, probably the label they want to display, so just use it.
                    //TODO what should we do here?
                    name =  `<li> ${itemURI} </li>`
                }
            }
            else{
                if(val.indexOf("http://") > -1 || val.indexOf("https://") > -1){
                    //item is a string and it is a URI value, as expected.
                    name = `<li><deer-view deer-id="${val}" deer-template="label"></deer-view></li>`
                }
                else{
                    //We know it is just a string of some kind, probably the label they want to display, so just use it.
                    //TODO what should we do here?
                    name = `<li> ${val} </li>`
                }
            }
            contributorsByName += name
        })
        
        //experienceData.contributors is probably a Set or List of URIs and we want their labels
        let peopleByName = ``
        people.items.forEach((val)=>{
            let name = ""
            if(typeof val === "object"){
                let itemURI = UTILS.getValue(val)
                if(itemURI.indexOf("http://") > -1 || itemURI.indexOf("https://") > -1){
                    //item.value is a string and it is a URI value, as expected.
                    name = `<li><deer-view deer-id="${itemURI}" deer-template="label"></deer-view></li>`
                }
                else{
                    //We know it is just a string of some kind, probably the label they want to display, so just use it.
                    //TODO what should we do here?
                    name =  `<li> ${itemURI} </li>`
                }
            }
            else{
                if(val.indexOf("http://") > -1 || val.indexOf("https://") > -1){
                    //item is a string and it is a URI value, as expected.
                    name = `<li><deer-view deer-id="${val}" deer-template="label"></deer-view></li>`
                }
                else{
                    //We know it is just a string of some kind, probably the label they want to display, so just use it.
                    //TODO what should we do here?
                    name = `<li> ${val} </li>`
                }
            }
            peopleByName += name
        })
        //Gather relatedObjects, an array of URIs
        let relatedObjectsByName = ``
        //experienceData.relatedObjects is probably a Set or List of String URIs, we want their label
        relatedObjects.items.forEach((val)=>{
            let name = ""
            if(typeof val === "object"){
                //See if the value is the URI we want
                let itemURI = UTILS.getValue(val)
                if(itemURI.indexOf("http://") > -1 || itemURI.indexOf("https://") > -1){
                    name = `
                    <li>
                        <deer-view deer-id="${itemURI}" deer-template="label"></deer-view>
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
                        <deer-view deer-id="${val}" deer-template="label"></deer-view>
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
            relatedObjectsByName += name
        })
        let objectsHTML = `
            <h4>Objects at Experience "${UTILS.getLabel(experienceData)}"</h4>
            <p>Objects you add will appear here and can be removed, but not edited.</p>
            <ul id="objectsInExperience">
                ${relatedObjectsByName}
            </ul>
        `
        
        //Gather relatedPractices, an array of URIs
        let relatedPracticesByName = ``
        //experienceData.relatedPractices is probably a Set or List of String URIs, we want their label
        relatedPractices.items.forEach((val)=>{
            let name = ""
            if(typeof val === "object"){
                //See if the value is the URI we want
                let itemURI = UTILS.getValue(val)
                if(itemURI.indexOf("http://") > -1 || itemURI.indexOf("https://") > -1){
                    name = `
                    <li>
                        <deer-view deer-id="${itemURI}" deer-template="label"></deer-view>
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
                        <deer-view deer-id="${val}" deer-template="label"></deer-view>
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
            relatedPracticesByName += name
        })
        let practicesHTML = `
            <h4>Practices at Experience "${UTILS.getLabel(experienceData)}"</h4>
            <p>Practices you add will appear here and can be removed, but not edited.</p>
            <ul id="practicesInExperience">
                ${relatedPracticesByName}
            </ul>
        `
        
        //Gather relatedSenses, an array of URIs
        let relatedSensesByName = ``
        //experienceData.relatedSenses is probably a Set or List of String URIs, we want their label
        relatedSenses.items.forEach((val)=>{
            let name = ""
            if(typeof val === "object"){
                //See if the value is the URI we want
                let itemURI = UTILS.getValue(val)
                if(itemURI.indexOf("http://") > -1 || itemURI.indexOf("https://") > -1){
                    name = `
                    <li>
                        <deer-view deer-id="${itemURI}" deer-template="mostUpToLabelHelper"></deer-view>
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
                        <deer-view deer-id="${val}" deer-template="label"></deer-view>
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
            relatedSensesByName += name
        })
        let sensesHTML = `
            <h4>Senses at Experience "${UTILS.getLabel(experienceData)}"</h4>
            <p>Senses you add will appear here and can be removed, but not edited.</p>
            <ul id="sensesInExperience">
                ${relatedSensesByName}
            </ul>
        `     
        let researchersHTML = `<dt>LRDA Researchers Involved</dt><dd><ul id="researchersInExperience">${contributorsByName}</ul></dd>`
        let peopleHTML = `<dt>People Involved</dt><dd><ul id="peopleInExperience">${peopleByName}</ul></dd>`
        let placeHTML = `<dt>Location</dt><dd>${placeLabelHTML}</dd>`
        let dateHTML = `<dt>Associated Date</dt><dd>${date}</dd>`
        let descriptionHTML = `<dt>Description</dt><dd>${description}</dd>`
        let artifactsHTML = objectsHTML + practicesHTML + sensesHTML

        tmpl += placeHTML + dateHTML + researchersHTML + peopleHTML + descriptionHTML + artifactsHTML
        return tmpl
    } catch (err) {
        console.log("Could not build Event or ExperienceUpload template.")
        console.error(err)
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
    try{
        let tmpl = ``
        if(options.list){
            tmpl += `<ul>`
            obj[options.list].forEach((val,index)=>{
                let currentKnownLabel = UTILS.getLabel(val,(val.type || val['@type'] || "")) //May not be the most recent.  
                let name = `<deer-view deer-id="${val["@id"]}" deer-template="completeLabel">${currentKnownLabel}</deer-view>`
                let removeBtn = `<a href="#" class="tag is-rounded is-small text-error removeCollectionItem" title="Delete This Entry"
                onclick="LR.utils.removeCollectionEntry(event, '${val["@id"]}', this.parentElement, '${UTILS.getLabel(obj)}')">&#x274C</a>`
                let viewBtn = (val["@id"] && options.link) ? `<a target="_blank" class="tag is-rounded is-small viewCollectionItem" title="View Item Details" href="${options.link}${val["@id"]}">&#x1F441</a>` : ``
                tmpl+= val["@id"] ? `<li ${DEER.ID}="${val["@id"]}">${name}${viewBtn}${removeBtn}</li>` : `<li>${name}</li>`
            })
            tmpl += `</ul>`
        }
        else{
            console.log("There are no items in this list to draw.")
            console.log(obj)
        }
        return tmpl
    } catch (err) {
        console.log("Could not build list template.")
        console.error(err)
        return null
    }

}

DEER.TEMPLATES.completeLabel = function(obj, options = {}) {
    try{
        let key = options.key || "@id"
        let prop = obj[key] || "[ undefined ]"
        let label = options.label || UTILS.getLabel(obj, prop)
        let isDescribed = obj["@type"]==="Researcher" || Object.keys(obj).some(i=>["description","geometry","email","fieldNotes"].includes(i))
        return isDescribed ? `${label}` : `<span class="needs-more" title="This entry may require more details">${label}</span>`
    } catch (err) {
        console.log("Could not build complete label template.")
        console.error(err)
        return null
    }
}


/**
 * Ensure the most up to date additionalType annotation is gathered.  Often used when rendering collection items.
 * Using a template ensures that expand(obj) has happened, so we have all up to date annotations in obj.
 * @param {Object} obj some obj  containing some label annotating it.
 */
DEER.TEMPLATES.mostUpToDateAdditionalTypeHelper = function (obj, options = {}) {
    try {
        let at = options.additionalType ?  UTILS.getValue(options.additionalType) : obj.additionalType ?  UTILS.getValue(obj.additionalType) : ""
        return at
    } catch (err) {
        console.log("Could not build most up to date additional type template.")
        console.error(err)
        return null
    }
}

/**
 * What a practiced is named is based off of its AdditionalType.  This is a template for the dropdowns and functionality to apply a "name"
 * based off of the AdditionalType selection
 * @param {Object} obj some obj  containing some label annotating it.
 */
DEER.TEMPLATES.practiceNameHelper = function (obj, options = {}) {
    try {
        let tmpl = `<select class="additionalTypeDropdown" oninput="this.parentElement.previousElementSibling.value=this.options[this.selectedIndex].text">`
        tmpl += `
            <option disabled selected value> Required </option>
            <option value="None">None Noted</option>
            <option value="EatAction">Eating</option>
            <option value="DrinkAction">Drinking</option>
            <option value="PlayAction">Playing</option>
            <option value="ClotheAction">Clothing</option>
            <option value="SingAction">Singing</option>
            <option value="MoveAction">Moving</option>
            <option value="SitAction">Sitting</option>
            <option value="StandAction">Standing</option>
            <option value="KneelAction">Kneeling</option>
            <option value="TravelAction">Traveling</option>
            <option value="DanceAction">Dancing</option>
            <option value="CookAction">Cooking</option>
            <option value="WorkAction">Working</option>
            <option value="ListenAction">Listening</option>
            <option value="WatchAction">Watching</option>
            <option value="WriteAction">Writing</option>
            <option value="TradeAction">Trading</option>
            <option value="GiveAction">Donating</option>
            <option value="Other">Other</option>
        `
        tmpl += "</select>"
        return tmpl
    } catch (err) {
        console.log("Could not build practice name helper template.")
        console.error(err)
        return null
    }
}

let LR_primitives = ["additionalType"]
//let LR_experience_primitives = ["startDate", "location", "event", "relatedSenses", "relatedPractices", "relatedObjects"]
let DEERprimitives = DEER.PRIMITIVES
DEER.PRIMITIVES = [...DEERprimitives, ...LR_primitives]

//Comment this out for dev-01 deploys
DEER.URLS = {
    BASE_ID: "http://store.rerum.io/v1",
    CREATE: "create",
    UPDATE: "update",
    QUERY: "query",
    OVERWRITE: "overwrite",
    DELETE: "delete",
    SINCE: "http://store.rerum.io/v1/since"
}

// Render is probably needed by all items, but can be removed.
// CDN at https://centerfordigitalhumanities.github.io/deer/releases/
import { default as renderer, initializeDeerViews } from 'https://centerfordigitalhumanities.github.io/deer/releases/alpha-.11/deer-render.js'

// Record is only needed for saving or updating items.
// CDN at https://centerfordigitalhumanities.github.io/deer/releases/
import { default as record, initializeDeerForms } from 'https://centerfordigitalhumanities.github.io/deer/releases/alpha-.11/deer-record.js'

// fire up the element detection as needed
/**
 * Note that VIEWS can be building blocks of FORMS.  VIEWS may also be the FORM in its entirety.
 * It follows that VIEWS must finish populating to the DOM before initializing forms which interact with the
 * elements in the DOM to do things like pre-filling or pre-select values, which much exist in the DOM for such interaction.
 * We seek to streamline the logic around these threads in the near future.  Make sure these remain treated as asyncronous.
 */
initializeDeerViews(DEER).then(() => initializeDeerForms(DEER))
