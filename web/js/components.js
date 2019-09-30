class LrFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<small>&copy;2019 Walter J. Ong, S.J. Center for Digital Humanities</small>
        <img class="brand" src="https://www.slu.edu/marcom/tools-downloads/imgs/logo/left-aligned/slu_logoleftaligned_rgb.png">
        <img class="brand" src="https://blog.ongcdh.org/blog/wp-content/uploads/2018/05/logo-dark.png">
        <img class="brand" src="https://www.hluce.org/static/images/logo-hluce.png">`
        this.classList.add('nav', 'nav-center', 'text-primary', 'is-fixed', 'is-full-width')
        this.style.bottom = 0
        this.style.backgroundColor = "#FFF"
    }
}
customElements.define("lr-footer", LrFooter)

class LrNav extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<div class="nav-left">
        <a class="brand" href="./dashboard.html"><img src="http://religioninplace.org/blog/wp-content/uploads/2019/04/LRDA-Logo.jpg"></a>
        <div class="tabs">
            <a class="active">Dashboard</a>
            <a>Locations</a>
            <a>Stories</a>
        </div>
    </div>
    <div class="nav-right">
        <a class="button outline">Logout</a>
    </div>`
        this.classList.add('nav')
    }
}
customElements.define("lr-nav", LrNav)