class LrFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<small>&copy;2020 Walter J. Ong, S.J. Center for Digital Humanities</small>
        <img class="brand" src="https://www.slu.edu/marcom/tools-downloads/imgs/logo/left-aligned/slu_logoleftaligned_rgb.png">
        <img class="brand" src="https://blog.ongcdh.org/blog/wp-content/uploads/2018/05/logo-dark.png">
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
                <a href="map.html">Map View</a>
                `
                if(user.roles.administrator){
                    let adminTabs = `<a href="users.html">Users</a>
                    <a href="researchers.html">Researchers</a>
                    <a href="all_experiences.html">Experiences</a>`
                    this.querySelector('.tabs').innerHTML += adminTabs
                }
            }
            setTimeout(()=>document.querySelector(`.tabs [href*="${location.href.split('/').pop()}"]`).classList.add("active"),0)
        })
    }
    connectedCallback() {
        this.innerHTML = `<div class="nav-left">
        <a class="brand" href="index.html"><img src="https://upload.wikimedia.org/wikipedia/commons/3/3d/Meuble_h%C3%A9raldique_Fleur_de_lis.svg"></a>
        <div class="tabs">
            <a href="places.html">Locations</a>
            <a href="objects.html">Objects</a>
            <a href="people.html">People</a>
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
