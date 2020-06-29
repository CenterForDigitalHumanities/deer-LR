/**
 * Lived Religions
 * @author Bryan Haberberger <bryan.j.haberberger@slu.edu>
 *
 */

const LR = {}
LR.VERSION = "0.7.0"
//LR.APPAGENT = "http://store.rerum.io/v1/id/5da8c165d5de6ba6e2028474"
LR.APPAGENT = "http://devstore.rerum.io/v1/id/5afeebf3e4b0b0d588705d90"

///For dev-01
LR.URLS = {
    LOGIN: "login",
    LOGOUT: "logout",
    BASE_ID: "http://devstore.rerum.io/v1",
    DELETE: "http://tinydev.rerum.io/app/delete",
    CREATE: "http://tinydev.rerum.io/app/create",
    UPDATE: "http://tinydev.rerum.io/app/update",
    OVERWRITE: "http://tinydev.rerum.io/app/overwrite",
    QUERY: "http://tinydev.rerum.io/app/query",
    SINCE: "http://devstore.rerum.io/v1/since"
}

//For prd-01
//LR.URLS = {
//    LOGIN: "login",
//    LOGOUT: "logout",
//    BASE_ID: "http://store.rerum.io/v1",
//    DELETE: "delete",
//    CREATE: "create",
//    UPDATE: "update",
//    OVERWRITE: "overwrite",
//    QUERY: "query",
//    SINCE: "http://store.rerum.io/v1/since"
//}

LR.INPUTS = ["input", "textarea", "dataset", "select"]

if (typeof(Storage) !== "undefined") {
    LR.localInfo = window.localStorage
} else {
    LR.err.generic_error("Please update your browser or use a different browser, this one is not supported. Sorry for the inconvenience.")
}
LR.err = {}
LR.ui = {}
LR.utils = {}

/** Various LR error handlers */
LR.err.generic_error = function(msg) {
    alert(msg)
}

LR.err.unhandled = function(error) {
    console.log("There was an unhandled error when using fetch")
    console.log(error)
    throw Error(error)
    return error
}

LR.err.handleHTTPError = function(response) {
    if (!response.ok) {
        let status = response.status;
        switch (status) {
            case 400:
                console.log("Bad Request")
                break;
            case 401:
                console.log("Request was unauthorized")
                break;
            case 403:
                console.log("Forbidden to make request")
                break;
            case 404:
                console.log("Not found")
                break;
            case 500:
                console.log("Internal server error")
                break;
            case 503:
                console.log("Server down time")
                break;
            default:
                console.log("unahndled HTTP ERROR")
        }
        throw Error("HTTP Error: " + response.statusText)
    }
    return response
}
    /** END Error handlers */

/**
 * A convention where area="xyz" will line up with tog="xyz" on some element(s) to toggle. 
 * @param {type} event
 * @return {undefined}
 */
LR.ui.toggleAreas = function(event){
    let area = event.target.getAttribute("area");
    let elems = document.querySelectorAll("div[tog='"+area+"']")
    for(let elem of elems){
        if(elem.classList.contains("is-hidden")){
            elem.classList.remove("is-hidden")
        }  
        else{
            elem.classList.add("is-hidden")
        }
    }
}

LR.ui.toggleFieldNotes = function(event){
    let floater = document.getElementById("fieldNotesFloater");
    if(floater.getAttribute("expanded") === "true"){
        floater.setAttribute("expanded", "false")
        floater.style.width = "40px"
        floater.style.height = "40px"
        floater.style["box-shadow"] = "none";
        document.querySelectorAll(".fieldNotesInnards").forEach(elem => elem.classList.add("is-hidden"))
    }
    else{
        floater.setAttribute("expanded", "true")
        floater.style.width = "550px"
        floater.style.height = "400px"
        floater.style["box-shadow"] = "1px 1px 18px black";
        document.querySelectorAll(".fieldNotesInnards").forEach(elem => elem.classList.remove("is-hidden"))
    }
    
}

/*
 * Proide a feedback message for users.  This is meant to encompas any generic feedback message.
 * @param {DOMEvent} The event triggering this feedback
 * @param {string} message The message to show as feedback
 
 */
LR.ui.globalFeedbackBlip = function(event, message, success){
    let feedbackMessageHTML = document.getElementById("globalFeedbackMessage")
    let feedbackAreaHTML = document.getElementById("globalFeedbackArea")
    feedbackMessageHTML.innerHTML = message
    feedbackAreaHTML.style.width="102%"
    feedbackAreaHTML.style.right="0"
    if(success){
        feedbackAreaHTML.style.backgroundColor = "14854f"
    }
    else{
        feedbackAreaHTML.style.backgroundColor = "red"
    }
    setTimeout(function(){ 
        //Give animation a couple seconds
        feedbackAreaHTML.style.right="-30px"
        feedbackAreaHTML.style.width="0px"
        LR.utils.broadcastEvent(event, "globalFeedbackFinished", feedbackMessageHTML, { message: message })
    }, 2150);
}

/**
 * Remove an item from one of the Lived Religion application collections.
 * @param {String} itemID : The ID of the annotation connecting the item to the collection.
 * @param {HTMLElement} itemElement : The HTML element representing the item that needs to be removed from the DOM.
 */
LR.utils.removeCollectionEntry = async function(event, itemID, itemElem, collectionName) {
    let historyWildcard = { "$exists": true, "$size": 0 }
    let name = event.target.previousElementSibling.text
    let queryObj = {
        $or: [{
            "targetCollection": collectionName
        }, {
            "body.targetCollection": collectionName
        }],
        "__rerum.history.next": historyWildcard,
        "__rerum.generatedBy": LR.APPAGENT,
        "target": itemID
    }
    fetch(LR.URLS.QUERY, {
        method: "POST",
        mode: "cors",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(queryObj)
    })
    .then(response => response.json())
    .then(pointers => {
        //Remember, there may be multiple annotations that place this item in the collection.  Get rid of all of them.
        let deleteList = []
        pointers.map(ta => {
            deleteList.push(
                fetch(LR.URLS.DELETE, {
                    method: "DELETE",
                    mode: "cors",
                    body: ta["@id"] || ta.id
                })
            )
        })
        return Promise.all(deleteList)
    }).then(deletedList => {
        //Can't seem to fall into the Promise.all().catch() on 4XX, and perhaps other, errors...
        let resultList = deletedList.filter(resp => { return resp.ok })
        if (deletedList.length === 0) {
            console.error("Could not find the annotation placing this item into the collection.  Could note remove this item.  Check your APPAGENT and annotation creator, they do not line up.")
            console.log(itemElem)
        } else {
            if (deletedList.length === resultList.length) {
                LR.utils.broadcastEvent(event, "lrCollectionItemDeleted", itemElem, { collection: collectionName, name:name })
                itemElem.remove()
                    // TODO: redraw() added to deer elements https://github.com/CenterForDigitalHumanities/deer/issues/34
            } else {
                //We could broadcast an event to say this failed, it depends what we want to trigger in interface.
                //This should suffice for now.
                console.error("There was an error removing an item from the collection")
                console.log(itemElem)
            }
        }
    }).catch(err => {
        //We could broadcast an event to say this failed, it depends what we want to trigger in interface.
        //This should suffice for now.
        console.error("There was an error gathering information to remove an item from the collection")
        console.log(itemElem)
    })
},

/**
 * Broadcast a message about some event
 * DO NOT collide with DEER events.  
 */
LR.utils.broadcastEvent = function(event = {}, type, element, obj = {}) {
    let e = new CustomEvent(type, { detail: Object.assign(obj, { target: event.target }), bubbles: true })
    element.dispatchEvent(e)
}

/**
 * Disassociate a particular object from the experience.  This means that the 'object' annotation on the experience needs alterations.  
 * @param {string} The @id of the particular object
 * @param {string} The @#id of the experience to disaasociate it from
 * @return {Promise}
 */
LR.utils.disassociateObject = function(event, objectID, experienceID){
    let trackedObjs = document.getElementById("objects").value
    let delim = document.getElementById("objects").hasAttribute("deer-array-delimeter") ? document.getElementById("objects").getAttribute("deer-array-delimeter") : ","
    let trackedArr = trackedObjs.split(delim)
    if(trackedArr.indexOf(objectID) > -1){
        trackedObjs =  trackedArr.filter(e => e !== objectID).join(delim)
        document.getElementById("objects").value = trackedObjs
        document.getElementById("objects").$isDirty = true //This DEER thing was tricky to know off hand.  3rd party developers may struggle to know to do this.
        document.getElementById("theExperience").$isDirty = true
        //NOTE form.submit() does not create/fire the submit event.  This is a problem for our 3rd party software, DEER.
        document.getElementById("theExperience").querySelector("input[type='submit']").click()
        //FIXME this should really only happen if the form submit seen above is successful
        event.target.parentNode.remove() //TODO feedback
        alert("Object Removed")//TODO feedback
    }
}

/**
 * Set the required fields for attribution to have a value of this user's @id.
 * This should apply to all <input>s that result in "creator" Annotations (user of this application)
 * It should also set all deer-creator attributes, for DEER.ATTRIBUTION
 * Any HTMLElement that should show the username must also be populated.
 * @param {object} userInfo A JSON object representing the user, the standard Lived Religion user object from event handlers.
 */
LR.utils.setUserAttributionFields = function(userInfo){
    let attributionInputs = ["[deer-key='creator']"] //For annotations that assert a creator
    let attributionFrameworkElems = ["[deer-creator]"] //For DEER framework elements that have deer-creator (DEER.ATTRIBUTION)
    attributionInputs.forEach(selector => document.querySelectorAll(selector).forEach(elem => elem.value = userInfo['@id']))
    document.querySelectorAll(attributionFrameworkElems).forEach(elem => elem.setAttribute("deer-creator",userInfo['@id']))
    //Populate anything that is supposed to know the username
    document.querySelectorAll(".theUserName").forEach(elem => elem.innerHTML = userInfo.name)
}

/**
 * Clear out all DEER attributes and input values of the form so that the next submission of this form creates a new object and new annotations.  
 * @param {HTMLElement} The form to perform this action on
 */
LR.utils.scrubForm = function(form){
    form.removeAttribute("deer-id")
    form.removeAttribute("deer-source")
    form.querySelectorAll(LR.INPUTS.join(",")).forEach(i => {
        //Anything you need to ignore should go here
        if(i.getAttribute("type") !== "submit" && i.getAttribute("deer-key") !== "creator"){
            i.value = ""
            i.removeAttribute("deer-source")
            i.removeAttribute("deeer-id")
        }
    })
    //Special primary type selector
    form.querySelectorAll("[data-rdf").forEach(el => {
        el.classList.remove("bg-light")
    })
}

/**
 * Remove a user from Session storage on the back end and localStorage on the front end. 
 * Broadcast the logout across tabs. 
 */
LR.utils.login = async function(loginWidget, data, submitEvent){
    let authenticatedUser = await fetch('login', {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            username: data.get("user"),
            password: data.get("pwd")
        })
    })
    .then(res =>{
        if(res.ok){
            return res.json()
        }
        else{
            //TODO maybe handle special?  
            throw new Error("There was a server error logging in.")
        }
    })
    .catch(err => {
        console.error(err)
        return {}
    })
    
    if (authenticatedUser && authenticatedUser["@id"]) {
        localStorage.setItem("lr-user", JSON.stringify(authenticatedUser))
        //There is an error in the sysend broadcaster because this CustomEvent cannot be cloned, so we cannot attach the lrUserKnown or similar events here.  Too bad, that would be neat.
        //local_socket.broadcast('loginFinished', {message:"Lived Religion Login", customEvent : new CustomEvent('lrUserKnown', { detail: { "user": authenticatedUser } })})
        
        //This simple object can be cloned and can be a part of the broadcast, so we can fire custom events in the local_socket event handlers
        local_socket.broadcast('loginFinished', {message:"Lived Religion Login", "user": authenticatedUser })
        //The socket does not fire on the page they are generated, so we are doing whatever UI logic is necessary here just like the socket handlers on the html pages
        document.location.reload() 
    } 
    else {
        localStorage.removeItem("lr-user")
        local_socket.broadcast('loginError', {message:"Login Error"})
        return null
    }
}



/**
 * Remove a user from Session storage on the back end and localStorage on the front end. 
 * Broadcast the logout across tabs. 
 */
LR.utils.logout = function(){
    fetch('logout', {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        headers: {
            'Content-Type': 'text/plain'
        }
    })
    .then(res =>{
        if(res.ok){
            localStorage.removeItem("lr-user")
            local_socket.broadcast('logoutFinished', {message:"Lived Religion Logout"})
        }
        else{
            //TODO maybe handle special?  Something didn't work right, but we can still clear them from localStorage
            localStorage.removeItem("lr-user")
            local_socket.broadcast('logoutFinished', {message:"Lived Religion Logout"})
        }
    })
    .catch(err =>{
        localStorage.removeItem("lr-user")
        local_socket.broadcast('logoutError', {message:err})
    })
    
}

/**
 * Populate the value of the <input> tracking the options selected in the <select multiple>.
 * @param {type} event A change in the options selected in a <select multipe>.
 * @param {type} fromTemplate Indicates this multi select is from a template and wrapped in a <deer-view> element.
 * @return None
 */
LR.utils.handleMultiSelect = function(event, fromTemplate){
    let sel = event.target
    let arr = Array.from(sel.selectedOptions).map(option=>option.value)
    let input = (fromTemplate) ? sel.parentElement.previousElementSibling : sel.previousElementSibling
    let delim = (input.hasAttribute("deer-array-delimeter")) ? input.getAttribute("deer-array-delimeter") : ","
    let str_arr = arr.join(delim)
    input.value=str_arr
    input.setAttribute("value", str_arr)
}

/**
 * 
 * Make sure not to select options outside the <form> and <select> involved here.  
 * @param {Object} annotationData The expanded containing all annotation data for a form.
 * @param {Array(String)} keys The specific annotations we are looking for in annotationData
 * @param {HTMLElement} form The completely loaded HTML <form> containing the <selects>s
 * @return None
 */
LR.utils.preSelectMultiSelects = function(annotationData, keys, form){
    keys.forEach(key =>{
        if(annotationData.hasOwnProperty(key)){
            let data_arr = annotationData[key].hasOwnProperty("value") ? annotationData[key].value.items : annotationData[key].items
            let input = form.querySelector("input[deer-key='"+key+"']")
            let sel = input.nextElementSibling //The view or select should always be just after the input tracking the values from it.
            if(sel.tagName !== "SELECT"){
                //Then it is a <deer-view> template and we need to get the child to have the <select>
                sel = sel.firstElementChild
            }
            data_arr.forEach(val => {
                let option = sel.querySelector("option[value='"+val+"']")
                if(option){
                    option.selected = true
                }
                else{
                    //The <option> is not available in the <select> HTML.
                }  
            })
        }
        else{
            //There is no annotation data for this key.
            console.warn("LR App tried to find '"+key+"' in this form data and could not.  A multi select may not be preselected.")
        }
        
    })
}

/**
 * 
 * Type and AdditionalType information has a custom UI around it, so DEER cannot prefill those pieces.
 * Here we have the object with the type  
 * @param {Object} annotationData The expanded containing all annotation data for a form.
 * @param {Array(String)} keys The specific annotations we are looking for in annotationData
 * @param {HTMLElement} form The completely loaded HTML <form> containing the <selects>s
 * @return None
 */
LR.utils.preSelectType = function(object, form){
    let type = object.hasOwnProperty("additionalType") ? object.additionalType : ""
    type = type[0] // It is saving twice right now, so this handles the bug for DEMO purposes.  TODO FIXME
    if(type){
        var data_key_elements = form.querySelectorAll("[data-rdf]")
        Array.from(data_key_elements).forEach(el => {
            el = el.closest("[data-rdf]")
            if (el.getAttribute("data-rdf") === type) {
                el.classList.add("bg-light")
            } 
            else {
                el.classList.remove("bg-light")
            }
        })
        form.querySelector(".otherPrimaryTypes").value = type
    }
    else{
        //There is no annotation data for this key.
        console.warn("This object did not have a primary type!")
        console.log(object)
    }
}

/**
 * 
 * Type and AdditionalType information has a custom UI around it, so DEER cannot prefill those pieces.
 * Here we have the object with the type  
 * @param {Object} annotationData The expanded containing all annotation data for a form.
 * @param {Array(String)} keys The specific annotations we are looking for in annotationData
 * @param {HTMLElement} form The completely loaded HTML <form> containing the <selects>s
 * @return None
 */
LR.utils.populateCoordinates = function(object, form){
    let geo = object.hasOwnProperty("geometry") ? object.geometry : {}
    let val = geo.hasOwnProperty("value") ? geo.value : {}
    let coords = val.hasOwnProperty("coordinates") ? val.coordinates : []
    if(coords.length){
        let long = coords[0]
        let lat = coords[1]
        leafLat.value = lat
        leafLong.value = long
        updateGeometry(null, lat, long)
    }
    else{
        //There is are no coordinates in this geometry object, or geometry was missing
        console.warn("The coordinates for this object are not stored correctly.  Investigate around ")
        console.log(object)
    }
}