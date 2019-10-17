class LrFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<small>&copy;2019 Walter J. Ong, S.J. Center for Digital Humanities</small>
        <img class="brand" src="https://www.slu.edu/marcom/tools-downloads/imgs/logo/left-aligned/slu_logoleftaligned_rgb.png">
        <img class="brand" src="https://blog.ongcdh.org/blog/wp-content/uploads/2018/05/logo-dark.png">
        <img class="brand" src="https://www.hluce.org/static/images/logo-hluce.png">`
        this.classList.add('nav', 'nav-center', 'text-primary', 'is-fixed', 'is-full-width', 'is-vertical-align')
        this.style.bottom = 0
        this.style.backgroundColor = "#FFF"
        let spacer = document.createElement('div')
        spacer.style.position = "relative"
        spacer.style.display = "block"
        spacer.style.height = this.offsetHeight * 1.2 + "px"
        this.parentElement.insertBefore(spacer, this)
    }
}
customElements.define("lr-footer", LrFooter)

class LrNav extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<div class="nav-left">
        <a class="brand" href="index.html"><img src="http://religioninplace.org/blog/wp-content/uploads/2019/04/LRDA-Logo.jpg"></a>
        <div class="tabs">
            <a class="active" href="dashboard.html">Dashboard</a>
            <a href="places.html">Locations</a>
            <a href="stories.html">Stories</a>
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
                document.dispatchEvent(new CustomEvent('lr-user-known', { detail: user }))
            } catch (err) {
                console.log("User identity reset; unable to parse ", localStorage.getItem("lr-user"))
                localStorage.removeItem("lr-user")
            }
        }
        var shadow = this.attachShadow({ mode: "open" })
        if (this.hasAttribute("lr-user")) {
            shadow.innerHTML = `<span>
                Logged in as ${user.name}
                <a href="logout">Logout</a>
            </span>`
        } else {
            shadow.innerHTML = `
            <link rel="stylesheet" href="https://unpkg.com/chota@latest">
            <style>
            backdrop {
                position: fixed;
                top: 0;
                left: 0;
                z-index: 9000;
                background-color: rgba(7,42,12,.7);
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
        let shadow = this.shadowRoot
        shadow.querySelector('FORM').onsubmit = async function(event) {
            event.preventDefault()
            let data = new FormData(this)
            console.log(data, data.user, data.pwd)
            let authenticatedUser = await fetch('login', {
                method: "POST",
                mode: "cors",
                cache: "no-cache",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: data.get("user"),
                    password: data.get("pwd")
                })
            }).then(res => res.json()).catch(err => console.error(err))
            if (authenticatedUser && authenticatedUser["@id"]) {
                document.body.style.overflowY = ''
                shadow.innerHTML = `<span>
                Logged in as <strong>${authenticatedUser.name}</strong>
                <a href="/logout">Logout</a>
                </span>`
                this.closest('BACKDROP').remove()
            } else {
                let error = document.createElement('P')
                error.classList.add('bg-error')
                error.textContent = `Login failed.`
                this.querySelector('fieldset').insertBefore(error, this.querySelector('legend'))
            }
        }
    }
}
customElements.define("lr-login", LrLogin)