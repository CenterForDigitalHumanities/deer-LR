class LrFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<small>&copy;2022 Research Computing Group</small>
        <img class="brand" src="https://www.slu.edu/marcom/tools-downloads/imgs/logo/left-aligned/slu_logoleftaligned_rgb.png">
        <img class="brand" src="https://centerfordigitalhumanities.github.io/media-assets/logos/rcg-logo.png">
        `
        this.classList.add('nav', 'nav-center', 'text-primary', 'is-fixed', 'is-full-width', 'is-vertical-align')
        this.style.bottom = 0
        this.style.backgroundColor = "#FFF"
        this.style.zIndex = 1
        let spacer = document.createElement('div')
        spacer.style.position = "relative"
        spacer.style.display = "block"
        spacer.style.height = this.offsetHeight * 1.2 + "px"
        this.parentElement.insertBefore(spacer, this)
    }
}
customElements.define("lr-footer", LrFooter)

class LrNav extends HTMLElement {
    constructor() {
        super()
        addEventListener('lrUserKnown', event => {
            let user = event.detail.user
            if(user !== null){
                this.querySelector('.tabs').innerHTML = `
                <a href="dashboard.html">Dashboard</a>
                <a href="places.html">Locations</a>
                <a href="objects.html">Objects</a>
                <a href="people.html">People</a>
                <a href="organizations.html">Organizations</a>
                <a href="map.html">Map View</a>
                `
                if(user.roles.administrator){
                    let adminTabs = `<a href="users.html">Users</a>
                    <a href="researchers.html">Researchers</a>
                    <a href="all_experiences.html">Experiences</a>`
                    this.querySelector('.tabs').innerHTML += adminTabs
                }
            }
            // setTimeout(()=>document.querySelector(`.tabs [href*="${location.href.split('/').pop()}"]`)?.classList.add("active"),0)
            setTimeout(()=>{
                const thisTab = document.querySelector(`.tabs [href*="${location.href.split('/').pop()}"]`)
                if(thisTab) {
                    thisTab.classList.add("active")
                }
            },0)
        })
    }
    connectedCallback() {
        this.innerHTML = `<div class="nav-left">
        <a class="brand" href="index.html"><img src="https://upload.wikimedia.org/wikipedia/commons/3/3d/Meuble_h%C3%A9raldique_Fleur_de_lis.svg"></a>
        <div class="tabs">
            <a href="places.html">Locations</a>
            <a href="objects.html">Objects</a>
            <a href="people.html">People</a>
            <a href="organizations.html">Organizations</a>
            <a href="map.html">Map View</a>
        </div>
    </div>
    <div class="nav-right">
        <lr-login></lr-login>
    </div>`
        this.classList.add('nav')
    }
}
customElements.define("lr-nav", LrNav)

class LrLogin extends HTMLElement {
    constructor() {
        super()
        let user = localStorage.getItem("lr-user")
        if (user !== null) {
            try {
                user = JSON.parse(user)
                this.setAttribute("lr-user", user["@id"])
                dispatchEvent(new CustomEvent('lrUserKnown', { detail: { user: user }, composed: true, bubbles: true }))
            } catch (err) {
                console.log("User identity reset; unable to parse ", localStorage.getItem("lr-user"))
                document.location.href="logout.html"
            }
        }
        if (this.hasAttribute("lr-user")) {
            //<a>${user.name}</a>
            this.innerHTML = `<div class="tabs">
                <a title="${user.name}" href="logout.html">Logout</a>
            </div>`
        } else {
            this.innerHTML = `
            <style>
            backdrop {
                position: fixed;
                top: 0;
                left: 0;
                z-index: 9000;
                background-color: rgba(7,42,12,1);
            }
            fieldset {
                background: #FFF;
                box-shadow: 0 0 0 2rem #FFF, .25rem .25rem 2rem 2rem #000;
                top: 15vh;
                position: relative;
            }

            </style>
            <backdrop class="is-full-screen">
            <form class="is-vertical-align is-horizontal-align">
            <fieldset>
            <legend>Enter User Details</legend>
            Username
            <input type="text" name="user" /> Password
            <input type="password" name="pwd" />
            <input type="submit" value="Login" />
            <input type="button" value="Forgot" disabled />    
            </fieldset>
            </form>
            </backdrop>`
            document.body.style.overflowY = 'hidden'
        }
    }
    connectedCallback() {
        try {
            let lrLogin = this
            lrLogin.querySelector('FORM').onsubmit = async function(event) {
                event.preventDefault()
                let data = new FormData(this)
                let userData = await LR.utils.login(lrLogin, data, event)
                
            }
        } catch (err) {
            // already logged in or other error
            // TODO: focus this catch
        }
    }
}
customElements.define("lr-login", LrLogin)

class LrGlobalFeedback extends HTMLElement {
    constructor() {
        super()
            this.innerHTML = `
            <div id="globalFeedback" class="bg-success text-white card"> Welcome! </div>
        `
    }
}
customElements.define("lr-global-feedback", LrGlobalFeedback)

class FieldNotes extends HTMLElement {
    constructor() {
        super()
        let entityName = location.pathname.split("/").pop().replace(".html", "")
        if(entityName){
            entityName = entityName[0].toUpperCase() + entityName.substring(1)
        }
        else{
            entityName = "Entity"
        }
        this.innerHTML = `
        <div class="card" id="fieldNotesFloater" expanded="false">
            <div class="card_body">
                <h6 id="notesTitle" class="fieldNotesInnards is-hidden" >Field Notes for This ${entityName}</h6>
                <img id="notesIcon" src="https://icongr.am/material/note-text-outline.svg?size=40" title="Field Notes" alt="Field Notes" onclick="LR.ui.toggleFieldNotes(event)"/>
                <p id="notesInfoShort" class="fieldNotesInnards is-hidden">
                    Enter field notes for this ${entityName}.  You must submit the form for the field notes to be recorded, just like filling out any other piece of the form.
                </p>
                <p id="notesInfoLong" class="fieldNotesInnards is-hidden">
                    Enter field notes for this ${entityName}.  You can continue to update these as you upload more information.
                    You must submit the form for the field notes to be recorded, just like filling out any other piece of the form.
                    During Experience review, you can click 'Save Notes' to record the notes without submitting the form.
                </p>
                <div id="fieldNotes" class="fieldNotesInnards is-hidden" >
                    <textarea id="fieldNotesEntry" type="text">Please Wait.  Loading...</textarea>
                    <div id="fieldNotesSaveBtn" class="row is-hidden">
                        <input class="button primary" type="submit" value="Save Notes" onclick="LR.utils.saveFieldNotes(event)" />
                    </div>
                </div>
            </div>
        </div>
        `
    }
    connectedCallback() {
        //Need to take the text from this textarea and put it into the hidden deer input for fieldNotes
        //That deer-input needs to fire an input event for $isDirty
        this.querySelector('textarea').addEventListener("input",event=>{
            let notesSoFar = document.querySelector("input[deer-key='fieldNotes']").value
            let newNotes = this.querySelector('textarea').value
            if(newNotes !== notesSoFar){
                document.querySelector("input[deer-key='fieldNotes']").value = newNotes
                let inputEvent = new Event('input', {
                    bubbles: false,
                    cancelable: true
                })
               document.querySelector("input[deer-key='fieldNotes']").dispatchEvent(inputEvent)
            }
        })
        
        if(!LR.utils.getEntityIdFromURL()){
            this.querySelector("textarea").value = ""
        }
    }
}
customElements.define("lr-field-notes", FieldNotes)

class LrMediaUpload extends HTMLElement {
    constructor() {
        super()
       let dk = this.getAttribute("media-key")
       this.innerHTML = `
        <input type="hidden" deer-input-type="Set" deer-key="${dk}" >
        <div class="supplyURI" >
            <header class="text-primary">Provide Media URI</header>
            <input type="text" class="mediaURI"/>
            <input type="button" class="button secondary" onclick="LR.media.addMediaURI(event)" value="Add" />
            <div class="uristatus"></div>
        </div>
        <div class="mediaUploadForm" >
            <header class="text-primary">Select a File to Upload</header>
            <input type="file" name="file" onchange="LR.media.fileSelected(event)"/>
            <div class="fileName"></div>
            <div class="fileSize"></div>
            <div class="fileType"></div>
            <input type="button" class="button secondary" onclick="LR.media.uploadFile(event)" value="Upload" />
            <div class="mediastatus"></div>
        </div>
        <header class="text-primary">Connected Media</header>
       `
        //Make sure to put <ul media-key="{dk}" class="connectedMedia"></ul> after the lr-media element.
        //It will show the file names for the list of connected media.
    }
    connectedCallback() {
        //When a file upload is complete, add it to the list of files attached to this entity.
        this.addEventListener("fileUploadSuccess",event=>{
            let media_component = event.target
            let mediaList = media_component.nextElementSibling
            let mediaFileName = event.detail.uri.split('/').pop()
            mediaList.innerHTML += `<li><a target="_blank" href="${event.detail.uri}">${mediaFileName}</a> <b>(MUST submit!)</b></li>`
        })
        
        //When a file upload is complete, add it to the list of files attached to this entity.
        this.addEventListener("addMediaURISuccess",event=>{
            let media_component = event.target
            let mediaList = media_component.nextElementSibling
            let mediaFileName = event.detail.uri.split('/').pop()
            mediaList.innerHTML += `<li><a target="_blank" href="${event.detail.uri}">${mediaFileName}</a> <b>(MUST submit!)</b></li>`
        })
    }
}
customElements.define("lr-media-upload", LrMediaUpload)
