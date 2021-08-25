/**
 * Lived Religions
 * @author Bryan Haberberger <bryan.j.haberberger@slu.edu>
 *
 */

const LR = {}
LR.VERSION = "1.0.1"
//LR.APPAGENT = "http://store.rerum.io/v1/id/5da8c165d5de6ba6e2028474"
LR.APPAGENT = "http://devstore.rerum.io/v1/id/5afeebf3e4b0b0d588705d90"

LR.CONTEXT = "http://lived-religion.rerum.io/deer-lr/vocab/context.json"

LR.PUBLIC_EXPERIENCE_LIST = "http://devstore.rerum.io/v1/id/6081ee59a0e7066822d87e6c"
//LR.PUBLIC_EXPERIENCE_LIST = "http://store.rerum.io/v1/id/60831f5811aeb54ed01e8ccb"
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
    SINCE: "http://devstore.rerum.io/v1/since",
}

//For prd-01
/*
LR.URLS = {
    LOGIN: "login",
    LOGOUT: "logout",
    BASE_ID: "http://store.rerum.io/v1",
    DELETE: "delete",
    CREATE: "create",
    UPDATE: "update",
    OVERWRITE: "overwrite",
    QUERY: "query",
    SINCE: "http://store.rerum.io/v1/since"
}
*/

LR.INPUTS = ["input", "textarea", "dataset", "select"]
if (typeof(Storage) !== "undefined") {
    LR.localInfo = window.localStorage
} else {
    alert("Please update your browser or use a different browser, this one is not supported. Sorry for the inconvenience.")
}
LR.ui = {}
LR.utils = {}

LR.utils.getAnnoValue = function (property, alsoPeek = [], asType) {
    // TODO: There must be a best way to do this...
    let prop;
    if (property === undefined || property === "") {
        console.error("Value of property to lookup is missing!")
        return undefined
    }
    if (Array.isArray(property)) {
        // It is an array of things, we can only presume that we want the array.  If it needs to become a string, local functions take on that responsibility.
        return property
    } else {
        if (typeof property === "object") {
            // TODO: JSON-LD insists on "@value", but this is simplified in a lot
            // of contexts. Reading that is ideal in the future.
            if (!Array.isArray(alsoPeek)) {
                alsoPeek = [alsoPeek]
            }
            alsoPeek = alsoPeek.concat(["@value", "value", "$value", "val"])
            for (let k of alsoPeek) {
                if (property.hasOwnProperty(k)) {
                    prop = property[k]
                    break
                } else {
                    prop = property
                }
            }
        } else {
            prop = property
        }
    }
    try {
        switch (asType.toUpperCase()) {
            case "STRING":
                prop = prop.toString();
                break
            case "NUMBER":
                prop = parseFloat(prop);
                break
            case "INTEGER":
                prop = parseInt(prop);
                break
            case "BOOLEAN":
                prop = !Boolean(["false", "no", "0", "", "undefined", "null"].indexOf(String(prop).toLowerCase().trim()));
                break
            default:
        }
    } catch (err) {
        if (asType) {
            throw new Error("asType: '" + asType + "' is not possible.\n" + err.message)
        } else {
            // no casting requested
        }
    } finally {
        return (prop.length === 1) ? prop[0] : prop
    }
}

LR.ui.togglePublic = (e) => {
    e.preventDefault()
    const elem = e.target.closest("li[deer-id]")
    if(!elem) return false

    const uri = elem.getAttribute("deer-id")
    const included = LR.ui.experiences.has(uri)
    elem.classList[included ? "remove" : "add"]("text-primary")
    LR.ui.experiences[included ? "delete" : "add"](uri)
    saveExperiences.classList.remove('is-hidden')
}
/**
 * Each interface has something triggered by user roles.  Implement contributor vs. admin
 * UI/UX here.  
 * @param {string} interface The name of the interface to draw
 * @param {object} user The user from localStorage or an event, parsed into JSON already
 * @param {string || null} entityID If ?id= was on the page, then there is an entity to load.
 * @return {undefined}
 */
LR.ui.setInterfaceBasedOnRole = function(interface, user, entityID){
    let heading = "";
    if(interface === "object"){
        heading = "Object"
    }
    else if(interface === "person"){
        heading = "Person"
    }
    else if(interface === "organization"){
        heading = "Organization"
    }
    else if(interface === "place"){
        heading = "Location"
    }
    switch(interface){
        case "experience":
            if (entityID) {
                if(user.roles.administrator){
                    document.getElementById("theExperience").setAttribute("deer-id", entityID)
                    document.getElementById("startExperience").classList.add("is-hidden")
                    document.getElementById("experienceReview").classList.remove("is-hidden")
                    document.getElementById("fieldNotesFloater").classList.remove("is-hidden")
                }
                else{
                    //Determine if the current user is the creator of this entity.  If so, they can view it.
                    //Note that if we need to do this elsewhere, this should become a helper function.
                    new Promise( resolve => {
                        resolve(LR.utils.isCreator(user["@id"], entityID))
                    })
                    .then(permitted => {
                        if(permitted){
                            document.getElementById("theExperience").setAttribute("deer-id", entityID)
                            document.getElementById("startExperience").classList.add("is-hidden")
                            document.getElementById("experienceReview").classList.remove("is-hidden")
                            document.getElementById("fieldNotesFloater").classList.remove("is-hidden")
                        }
                        else{
                            alert("Only an administrator can review this experience.  If this is your experience, contact an administrator.")
                            document.location.href = "dashboard.html"
                        }
                    })
                    .catch(err => {
                        console.error(err)
                        alert("There was an error checking permissions for this experience.  Try again.")
                        document.location.href = "dashboard.html"
                    }) 
                }
            }
        break
        case "object":
        case "person":
        case "organization":
        case "place":
            let entity_form = document.querySelector("form[deer-type]")
            if (entityID) {
                if (user.roles.administrator) {
                    entity_form.setAttribute("deer-id", entityID)
                    document.querySelector("h2.text-primary").innerHTML = "Update "+heading
                    document.querySelector("input[type='submit']").value = "Update"
                    let btn = document.createElement("a")
                    btn.href = window.location.pathname
                    btn.innerHTML = "Reset Page"
                    entity_form.append(btn)
                }
                else{
                    alert("Only administrators can review and edit entity details at this time.")
                    document.location.href="dashboard.html"
                }
            }
        break
        case "researcher":
            if (user.roles.administrator) {
                if (entityID) {
                    document.getElementById("researcherForm").setAttribute("deer-id", entityID)
                    document.querySelector("h2.text-primary").innerHTML = "Update Researcher"
                    document.querySelector("input[type='submit']").value = "Update"
                    let btn = document.createElement("a")
                    btn.href = window.location.pathname
                    btn.innerHTML = "Reset Page"
                    document.getElementById("researcherForm").append(btn)
                }
            }
            else{
                alert("You must be logged in as an administrator to use this!")
                document.location.href="dashboard.html"
            }
        break
        case "objects":
        case "people":
        case "organizations":
        case "places":
        case "researchers":
            if (user.roles.administrator) {
                for (let elem of event.target.querySelectorAll('.removeCollectionItem')) elem.style.display = 'inline-block'
            }
            else{
                alert("You must be logged in as an administrator to use this!")
                document.location.href="dashboard.html"
            }
        break
        case "userManagement":
            if (user.roles.administrator) {
                UM.interaction.drawUserManagement()
            }
            else{
                alert("You must be logged in as an administrator to use this!")
                document.location.href="dashboard.html"
            }    
        break
        case "adminUpgrade":
            if (user.roles.administrator) {
                document.querySelectorAll('.admin-only').forEach(el=>el.classList.remove('is-hidden'))
            }
            break
        case "experienceManagement":
            if (user.roles.administrator) {
                document.getElementById("experiences").classList.remove("is-hidden")
                fetch(LR.PUBLIC_EXPERIENCE_LIST).then(r=>r.json())
                .then(list=>{
                    LR.ui.experiences = new Set(list.itemListElement['@id'])
                    for (const elem of experiences.querySelectorAll('li')) {
                        elem.querySelector('a.removeCollectionItem').style.display = 'inline-block'
                        const include = LR.ui.experiences.has(elem.getAttribute("deer-id")) ? "add" : "remove"
                        elem.classList[include]("text-primary")
                        elem.insertAdjacentHTML('beforeend',`
                        <a onclick="LR.ui.togglePublic(event)" href="#" title="Toggle public visibility"> &#x1F441 </a>
                        `)
                    }
                })
            }
            else{
                alert("You must be logged in as an administrator to use this!")
                document.location.href="dashboard.html"
            }
        break
        case "dashboard":
            LR.ui.getUserEntries(user)
            if (user.roles.administrator) {
                let adminTabs = `<a href="users.html">Users</a>
                <a href="researchers.html">Researchers</a>
                <a href="all_experiences.html">Experiences</a>`
                document.querySelector('.tabs').innerHTML += adminTabs
            }
        break
        default:
            alert("This interface is not yet supported")
            document.location.href = "dashboard.html"
    }
}

/**
 * Get the experiences for this specific user to draw on the dashboard.
 * 
 * @param {JSONObject} user The user from localStorage
 * @return {undefined}
 */
LR.ui.getUserEntries = async function(user) {
    let historyWildcard = {"$exists":true, "$size":0}
    let experiences = await fetch(LR.URLS.QUERY, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "@type": "Event",
            "creator": user['@id'],
            "__rerum.generatedBy": LR.APPAGENT,
            "__rerum.history.next" : historyWildcard
        })
    })
    .then(response => response.json())
    .catch(err => {return []})
    previousEntries.innerHTML = (experiences.length) ? experiences.reduce((a, b) =>{
        let obj = (b.value) ? b.value : b
        let label = (obj.label) ? obj.label : (obj.name) ? obj.name : "Unlabeled Upload"
        let removeBtn = ``
        if(user.roles.administrator){
            removeBtn = `<a href="#" class="tag is-rounded is-small text-error removeCollectionItem" title="Delete This Entry"
            onclick="LR.utils.removeCollectionEntry(event, '${b["@id"]}', this.parentElement, 'LivedReligionExperiencesTest')">&#x274C</a>`
        }
        return a += `<li> <a target="_blank" title="View Item Details" href="experience.html?id=${b["@id"]}">${label}</a> ${removeBtn}</li>`               
    },``):`<p class="text-error">No experiences found for this user</p>`
}

/**
 * A specific toggle with multiple pieces of UI attached, so it does not fit the convention.
 * @param {type} event
 * @return {undefined}
 */
LR.ui.customToggles = function(event){
    let area = event.target.getAttribute("area")
    let elem = undefined
    switch(area){
        case "startExperience":
            document.getElementById("experienceReview").classList.add("is-hidden")
            document.getElementById("experienceArtifacts").classList.add("is-hidden")
            document.getElementById("startExperience").classList.remove("is-hidden")
            if(!document.getElementById("artifactContent").classList.contains("is-hidden")){
                document.getElementById("toggleArtifactArea").click()
            }
            if(!document.getElementById("experienceContent").classList.contains("is-hidden")){
                document.getElementById("toggleExpReviewContent").click()
            }
        break
        case "experienceContent":
            elem = document.querySelector("dl[tog='"+area+"']")
            if(elem.classList.contains("is-hidden")){
                elem.classList.remove("is-hidden")
                event.target.title = "Hide the details of the experience"
                event.target.innerHTML = "View Less"
            }  
            else{
                elem.classList.add("is-hidden")
                event.target.title = "Show the details of this experience"
                event.target.innerHTML = "Review "
            }
           
        break
        case "artifactArea":
            elem = document.querySelector("div[tog='"+area+"']")
            if(elem.classList.contains("is-hidden")){
                elem.classList.remove("is-hidden")
                event.target.title = "Hide the sensory information area"
                event.target.innerHTML = "Collapse Sensory Area"
            }  
            else{
                elem.classList.add("is-hidden")
                event.target.title = "Expand the area to add sensory information"
                event.target.innerHTML = "Add Sensory Information"
            }
        break
        case "practices":
            elem = document.querySelector("div[tog='"+area+"']")
            if(elem.classList.contains("is-hidden")){
                elem.classList.remove("is-hidden")
            }  
            else{
                elem.classList.add("is-hidden")
            }
            document.querySelector("div[tog='bodies']").classList.add("is-hidden")
        break
        case "bodies":
            elem = document.querySelector("div[tog='"+area+"']")
            if(elem.classList.contains("is-hidden")){
                elem.classList.remove("is-hidden")
            }  
            else{
                elem.classList.add("is-hidden")
            }
            document.querySelector("div[tog='practices']").classList.add("is-hidden")
        break
        
        default:
    }
}

/**
 * 
 * @param {type} event
 * @return {undefined}
 */
LR.ui.toggleFieldNotes = function(event){
    let floater = document.getElementById("fieldNotesFloater")
    if(floater.getAttribute("expanded") === "true"){
        floater.setAttribute("expanded", "false")
        floater.style.width = "40px"
        floater.style.height = "40px"
        floater.style["box-shadow"] = "none"
        document.querySelectorAll(".fieldNotesInnards").forEach(elem => elem.classList.add("is-hidden"))
    }
    else{
        floater.setAttribute("expanded", "true")
        floater.style.width = "550px"
        floater.style.height = "400px"
        floater.style["box-shadow"] = "1px 1px 18px black"
        document.querySelectorAll(".fieldNotesInnards").forEach(elem => elem.classList.remove("is-hidden"))
    }
    
}

LR.ui.toggleEntityAddition = function(event, areaToToggle){
    if(areaToToggle){
        if(areaToToggle.classList.contains("is-hidden")){
            areaToToggle.classList.remove("is-hidden")
            document.querySelector(".pageShade").classList.remove("is-hidden")
            areaToToggle.querySelector("input").value = ""
            //event.target.innerHTML = "&#8722;"
        }
        else{
            areaToToggle.classList.add("is-hidden")
            document.querySelector(".pageShade").classList.add("is-hidden")
            //event.target.innerHTML = "&#x2b;"
        }
    }
}

/*
 * Proide a feedback message for users.  This is meant to encompas any generic feedback message.
 * @param {DOMEvent} The event triggering this feedback
 * @param {string} message The message to show as feedback
 
 */
LR.ui.globalFeedbackBlip = function(event, message, success){
    globalFeedback.innerText = message
    globalFeedback.classList.add("show")
    if(success){
        globalFeedback.classList.add("bg-success")
    } else {
        globalFeedback.classList.add("bg-error")
    }
    setTimeout(function(){ 
        globalFeedback.classList.remove("show")
        globalFeedback.classList.remove("bg-error")
        // backup to page before the form
        LR.utils.broadcastEvent(event, "globalFeedbackFinished", globalFeedback, { message: message })
    }, 3000)
}

LR.ui.showPopover = function(which, event){
    console.error("Sorry, these popovers are not ready yet :(")
}


/**
 * A helper function to get the entity ID from the URLs with ?id= parameter.
 * @return {string || null}
 */
LR.utils.getEntityIdFromURL = function(){
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('id') ? urlParams.get('id') : null
}

/**
 * An abstract method to handle which interface to trigger.  Each interface needs to know the user and which interface.
 * Either local storage or the event that triggered this will know the user.  If not, then don't pretend to.
 * @param {object} event LRUserKnown or deer-loaded event
 * @param {string} interface The name of the interface to load. 
 * @return {undefined}
 */
LR.utils.drawInterface = function (event, interface){
    let user = localStorage.getItem("lr-user") ? localStorage.getItem("lr-user") : (event.detail && event.detail.user) ? event.detail.user : null
    if(typeof user === "string"){
        try{
            user = JSON.parse(user)
        }
        catch(err){
            console.error(err)
            user = null
        }
    }
    if (user !== null) {
        LR.utils.setUserAttributionFields(user)
        LR.ui.setInterfaceBasedOnRole(interface, user, LR.utils.getEntityIdFromURL())
    }
    else {
        console.log("User identity reset; user is null. ")
        document.location.href = "logout.html"
    }
}

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
LR.utils.disassociate = function(event, objectID, experienceID, which){
    let inpt = document.querySelector("input[deer-key='"+which+"']")
    let trackedObjs = inpt.value
    let delim = inpt.hasAttribute("deer-array-delimeter") ? inpt.getAttribute("deer-array-delimeter") : ","
    let trackedArr = trackedObjs.split(delim)
    if(trackedArr.indexOf(objectID) > -1){
        trackedObjs =  trackedArr.filter(e => e !== objectID).join(delim)
        inpt.value = trackedObjs
        inpt.$isDirty = true //This DEER thing was tricky to know off hand.  3rd party developers may struggle to know to do this.
        document.getElementById("theExperience").$isDirty = true
        //NOTE form.submit() does not create/fire the submit event.  This is a problem for our 3rd party software, DEER.
        document.getElementById("theExperience").querySelector("input[type='submit']").click()
        //FIXME this should really only happen if the form submit seen above is successful
        event.target.parentNode.remove()
        LR.ui.globalFeedbackBlip(event,`'${event.detail.name||"Item"}' dropped from list`,true)
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
    let selectedTagsArea = sel.nextElementSibling
    selectedTagsArea.innerHTML = ""
    let arr_id = Array.from(sel.selectedOptions).map(option=>option.value)
    let arr_names = Array.from(sel.selectedOptions).map(option=>option.text)
    let input = (fromTemplate) ? sel.parentElement.previousElementSibling : sel.previousElementSibling
    let delim = (input.hasAttribute("deer-array-delimeter")) ? input.getAttribute("deer-array-delimeter") : ","
    let str_arr = arr_id.join(delim)
    arr_names.forEach(selection => {
       let tag = `<span class="tag is-small">${selection}</span>` 
       selectedTagsArea.innerHTML += tag
    })
    input.value=str_arr
    input.setAttribute("value", str_arr)
}

/**
 * A hidden input is tracking a select or multi select. It is hidden and it is not a primitive, so DEER does not handle the value.
 * Make sure to set the value of this hidden input.  The value is a string, that string contains a delimiter to join on for cases of multiple values.
 * 
 * @param {Object} annotationData Expanded data that is all annotation data for a form.
 * @param {Array(String)} keys The specific annotations we are looking for in annotationData. 
 * @param {HTMLElement} form The completely loaded HTML <form> containing the <selects>s
 * @return None
 */
LR.utils.setTrackedHiddenValues = function(annotationData, keys, form){
    keys.forEach(key =>{
        let data_arr = 
        (annotationData[key].hasOwnProperty("value") && annotationData[key].value.hasOwnProperty("items")) ? annotationData[key].value.items : annotationData[key].hasOwnProperty("items") ? annotationData[key].items : [ LR.utils.getAnnoValue(annotationData[key]) ]
        let input = form.querySelector("input[deer-key='"+key+"']")
        //Set the value of the hidden input that tracks this for DEER
        //Check if we need a different delimeter.  The input will tell us.
        let delim = (input.hasAttribute("deer-array-delimeter")) ? input.getAttribute("deer-array-delimeter") : ","
        //Generate the value for the input that DEER supports - "uri,uri..."
        let str_arr = (data_arr.length > 1) ? data_arr.join(delim) : (data_arr.length === 1 ) ? data_arr[0] : ""
        input.value = str_arr
    })
}

/**
 * 
 * Make sure not to select options outside the <form> and <select> involved here.  
 * This may be for a basic <select>, it may be for a <select multiple>
 * These are dynamic selects built with custom UI and so DEER cannot preselect these.  We have to do it after the form loads.
 * For dynamic selects, we follow a convention where there is a hidden input at this.parentElement.previousElementSibling with the deer-key
 * Make sure to select the appropriate <options>
 * 
 * How about we do this with optional chaining.  This should work to pre select simple dropdowns AND multi selects (always at least an array of 1).
 * 
 * @param {Object} annotationData Expanded data that is all annotation data for a form.
 * @param {Array(String)} keys The specific annotations we are looking for in annotationData. 
 * @param {HTMLElement} form The completely loaded HTML <form> containing the <selects>s
 * @return None
 */
LR.utils.preSelectSelects = function(annotationData, keys, form){
    keys.forEach(key =>{
        if(annotationData.hasOwnProperty(key)){
            let data_arr = 
            (annotationData[key].hasOwnProperty("value") && annotationData[key].value.hasOwnProperty("items")) ? annotationData[key].value.items : annotationData[key].hasOwnProperty("items") ? annotationData[key].items : [ LR.utils.getAnnoValue(annotationData[key]) ]
            //let data_arr = annotationData[key]?.value?.items ?? annotationData[key]?.items ?? [ LR.utils.getAnnoValue(annotationData[key]) ]
            let input = form.querySelector("input[deer-key='"+key+"']")
            let area = input.nextElementSibling //The view or select should always be just after the input tracking the values from it.
            let selectElemExists = true
            let sel
            if(area.tagName === "DEER-VIEW"){
                //Then it is a <deer-view> template and we need to find <select>
                sel = area.querySelector("select")
            }
            else if(area.tagName === "SELECT"){
                sel = area
            }
            else{
                //We did not expect this and it is an error.  Perhaps the <select> does not exist at all.
                // Rememeber: the <input> with deer key tracking the select must come immediately before the select. 
                console.warn("There is no select related to "+key+" to pre-select.")
            }
            let arr_names = []
            if(sel && sel.tagName === "SELECT"){
                data_arr.forEach(val => {
                    let option = sel.querySelector("option[value='"+val+"']")
                    if(option){
                        option.selected = true
                        //There should always be some kind of text here.
                        arr_names.push(option.text ? option.text :  "")
                        //arr_names.push(option?.text ?? "")
                    }
                    else{
                        //The <option> is not available in the <select> HTML.
                    }  
                })
                
                //Now build the little tags, only for multi selects.
                if(sel.hasAttribute("multiple")){
                    let selectedTagsArea = sel.nextElementSibling
                    selectedTagsArea.innerHTML = ""
                    arr_names.forEach(selection => {
                        let tag = `<span class="tag is-small">${selection}</span>` 
                        selectedTagsArea.innerHTML += tag
                    })
                }
            }
            else{
                //This is disconcerting.  The deer-view either didn't load or the DOM didn't draw it fast enough...
                console.warn("Could not pre-select multi selects.  The deer-view either didn't load or the DOM didn't draw it fast enough!"
                        +"  A multi select may not be preselected.")
            }
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

/**
 * Helper to populate the widget tracking field notes with the value gathered by expand() functionality.
 * @param {type} experienceLabel
 * @param {type} fieldNotesFromData
 * @return {undefined}
 */
LR.utils.prePopulateFieldNotes = function(fieldNotesFromData){
    if(fieldNotesFromData !== undefined){
        let notes_str = LR.utils.getAnnoValue(fieldNotesFromData, [], "string")
        document.getElementById("fieldNotesEntry").value = notes_str
    }
}

/**
 * A helper function that saves the field notes from the field notes widget as a fieldNotes annotation on the experiences.  
 * @param {type} event
 * @return {undefined}
 */
LR.utils.saveFieldNotesInExperience = function(event){
    let notesSoFar = document.getElementById("experienceFieldNotes").value
    let newNotes = document.getElementById("fieldNotesEntry").value
    if(newNotes !== notesSoFar){
        document.getElementById("experienceFieldNotes").value = newNotes
        let inputEvent = new Event('input', {
            bubbles: false,
            cancelable: true
        })
        document.getElementById("experienceFieldNotes").dispatchEvent(inputEvent)
    }
     //NOTE form.submit() does not create/fire the submit event.  This is a problem for our 3rd party software, DEER.
    document.getElementById("theExperience").querySelector("input[type='submit']").click() //Experience form has a new value for field notes, trigger the update.            
}

/**
 * Whenever a drop-down or multi-select is built from a collection, those views have to option to quickly add a new entity by label.
 * We need to take that label and make an entity for the collection by creating the new entity, then supplying the targetCollection annotation for it. 
 * Pagination must also occur, since reload() is not an option.  
 * @param {type} event Event from clicking the 'Add' button
 * @param {string} collectionName  Name of the collection this item is being added into
 * @param {HTMLElement}  selectedTagsArea The area that the tag UI goes for showing selected items
 * @param {string} type The @type of the entity going into the collection
 */
LR.utils.quicklyAddToCollection = async function(event, collectionName, multiOrDropdown, type){
    if(collectionName){
        let labelText = event.target.previousElementSibling.value
        let user = localStorage.getItem("lr-user")
        let userID
        if (user !== null) {
            try {
                user = JSON.parse(user)
                userID = user["@id"] ? user["@id"] : null
            } catch (err) {
                console.log("User identity reset; unable to parse ", localStorage.getItem("lr-user"))
                document.location.href="logout.html"
                return false
            }
        }
        if(labelText){
            let entity = {
                "@context" : LR.CONTEXT,
                "type" : type,
                "creator" : userID
            }
            if(type === "Event"){ 
                // or maybe additionType === ExperienceUpload, depends on how many Event upload types we end up with.
                entity.label = labelText
            }
            else{
                entity.name = labelText
            }
            fetch(LR.URLS.CREATE, {
                method: "POST",
                mode: "cors",
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(entity)
            })
            .then(response => response.json())
            .then(newEntity => {
                let collectionAnno = {
                    "@context" : LR.CONTEXT,
                    "body": {targetCollection: collectionName},
                    "target": newEntity.new_obj_state["@id"],
                    "creator": userID,
                    "type": "Annotation"
                }
                fetch(LR.URLS.CREATE, {
                    method: "POST",
                    mode: "cors",
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(collectionAnno)
                })
                .then(response => response.json())
                .then(newAnno => {
                    let op = document.createElement('option')
                    op.value = newEntity.new_obj_state["@id"]
                    op.text = labelText
                    op.classList.add("deer-view")
                    op.setAttribute("deer-template", "label")
                    op.setAttribute("deer-id", newEntity.new_obj_state["@id"])
                    op.selected = true
                    //op.click() does not work, so we have to produce the result programatically
                    let input = event.target.closest("deer-view").previousElementSibling
                    if(multiOrDropdown){
                        //A dropdown, not a multi select, and there are no tags.  Deselect any selected option, then add this selected one in.
                        let dropdown = event.target.closest("deer-view").querySelector("select")
                        op.setAttribute("oninput", "this.parentElement.previousElementSibling.value=this.options[this.selectedIndex].value")
                        for ( let i = 0; i < dropdown.options.length; i++ ) {
                           if (dropdown.options[i].selected ) {
                                dropdown.options[i].selected = false
                                break
                           }
                        }
                        dropdown.appendChild(op)
                        //Write to deer-key input, as if that option had been clicked
                        input.value = newEntity.new_obj_state["@id"]
                    }
                    else{
                        // A multi select
                        let multiSelect = event.target.closest("deer-view").querySelector("select[multiple]")
                        let selectedTagsArea = event.target.parentElement.nextElementSibling.nextElementSibling
                        op.setAttribute("oninput", "LR.utils.handleMultiSelect(event,true)")
                        let delim = (input.hasAttribute("deer-array-delimeter")) ? input.getAttribute("deer-array-delimeter") : ","
                        let tag = `<span class="tag is-small">${labelText}</span>` 
                        multiSelect.querySelector("optgroup").appendChild(op)
                        selectedTagsArea.innerHTML += tag
                        //Write to deer-key input, as if that option had been clicked
                        if(input.value){
                            //There is already a string here, so we presume entries have already beed added.  Append, with delimiter.
                            input.value += (delim+newEntity.new_obj_state["@id"])
                        }
                        else{
                            //Blank or null.  This is the first value.  No delimeter.  
                            input.value = newEntity.new_obj_state["@id"]
                        }
                    }
                    //Give feedback
                    LR.ui.globalFeedbackBlip(event, `Added '${labelText}' successfully!`, true)
                    //Now toggle hide this quick add area.
                    event.target.parentElement.previousElementSibling.click()
                })
                .catch(err =>{
                    alert("There was a problem trying to create the Annotation that puts the entity into the collection.  Please check the network panel.")
                    console.error("There was a problem trying to create the Annotation that puts the entity into the collection.  Please check the network panel.")
                })
            })
            .catch(err =>{
                alert("There was a problem trying to add the entity to the collection.  Please check the network panel.")
                console.error("There was a problem trying to add the entity to the collection.  Please check the network panel.")
            })
        }
        else{
            alert("You must supply something as a label to add an entity to the collection.")
            console.warn("You must supply something as a label to add an entity to the collection.")
        }
    }
    else{
        alert("The name of the collection to add to was not provided.  Check the button below and see if it knows the collection name or not.")
        console.warn("The name of the collection to add to was not provided.  Check the button below and see if it knows the collection name or not.")
    }
}

/**
 * Remove an item from one of the Lived Religion application collections.
 * @param {String} itemID : The ID of the annotation connecting the item to the collection.
 * @param {HTMLElement} itemElement : The HTML element representing the item that needs to be removed from the DOM.
 */
LR.utils.removeCollectionEntry = async function(event, itemID, itemElem, collectionName) {
    let historyWildcard = { "$exists": true, "$size": 0 }
    //We want to get rid of the view and remove buttons from this text.  Could probably do this more elegantly, but works for now.
    let name = itemElem.innerText.substring(0, itemElem.innerText.length - 3)
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
                itemElem.remove()
                LR.ui.globalFeedbackBlip(event, `'${itemElem.firstElementChild.innerText||"Item"}' removed!`, false)
                //LR.utils.broadcastEvent(event, "lrCollectionItemDeleted", itemElem, { collection: collectionName, name:name })
            } else {
                //We could broadcast an event to say this failed, it depends what we want to trigger in interface.
                //This should suffice for now.
                alert("There was an error removing an item from the collection")
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
}

/**
 * Check if the user from session is the creator of some given Linked Data node or URI.
 * 
 * Note that we control the parameter for item.  In cases where possible, we should preferences passing
 * the object so that we don't need to perform the fetch.
 * 
 * @param {string} user The agent ID of the user in session
 * @param {object || string} item A Linked Data node or URI.  Lived Religion has the option to use either.
 * @return {Boolean}
 */
LR.utils.isCreator = async function(agentID, item){
    let creatorID
    if(typeof item === "string"){
        //It is probably just a URI.  We need to fetch the object and perhaps expand it
        item = await fetch(item).then(response => response.json()).catch(err => {
            console.error(err)
            return {}
        })
    }
    // Now item is an object and we expect it to have creator on it.
    if(item.creator){
        // This is a string URI, because this app uses the URI as the value for creator.
        creatorID = item.creator
    }
    else{
        //This is bad data that does not note the creator correctly.  Fail the check.
        return false
    }
    return ((agentID && creatorID) && agentID === creatorID)
}
