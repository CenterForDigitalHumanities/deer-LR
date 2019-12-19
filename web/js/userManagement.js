const UM = {}

/**
 * URLS for the available User Management back end servlets.
 */
UM.URLS = {
    GETUSERFILE: "getUsers",
    SETUSERNAME: "setUsername",
    SETROLES: "setUserRoles",
    SETSECRET: "setUserSecret",
    ADDUSER : "addUser",
    REMOVEUSER : "removeUser",
    CREATE : "http://tinydev.rerum.io/app/create"
}

/**
 * For the interactions with the user file that require servlets
 */
UM.interaction = {}

/**
 * For UI/UX around HTML elements
 */
UM.ui = {}

/**
 * Use the endpoint available to get the user file. Only fire if the logged in user is an administrator. 
 * @returns {Object} The user file as a json object.
 */
UM.interaction.getAllUsers = async function(){
    let allUsers = {}
    let loggedInUser = localStorage.getItem("lr-user")
    if(loggedInUser !== null && loggedInUser !== undefined){
        loggedInUser = JSON.parse(loggedInUser)
        if (loggedInUser.roles.administrator) {
            allUsers = await fetch(UM.URLS.GETUSERFILE, {
                method: "GET",
                mode: "cors" 
            })
            .then(response => {
                if(response.ok){
                    return response.json()
                }
                else if(response.status === 403){
                    console.log("User identity reset; user session ended. ", localStorage.getItem("lr-user"))
                    localStorage.removeItem("lr-user")
                    alert("Please log in again.")
                    document.location.reload()
                }
                else{
                    alert("Failed to add user")
                    console.error("Failed to add user to file.")    
                    return
                }
            })
            .catch(err => console.error(err))
        }
    }
    return allUsers
}

/**
 * Draw the user management page with the information from the Users file.
 * Ensure the logged in user is an administrator.
 */
UM.interaction.drawUserManagement = async function(){
    let loggedInUser = localStorage.getItem("lr-user")
    let managementTemplate = ``
    if (loggedInUser !== null && loggedInUser !== undefined) {
        try {
            loggedInUser = JSON.parse(loggedInUser)
            if (loggedInUser.roles.administrator) {
                await this.getAllUsers()
                .then(users => {
                    for (let user in users){
                        //Here the top level keys are the name we want
                        let role = (users[user].roles.administrator) ? "admin" : "contributor"
                        let buttons = `
                            <a role="${role}" class="button default" onclick="UM.ui.showRolesEditor('${user}', event)"> Change Roles </a>
                            <a class="button primary" onclick="UM.ui.showSecEditor('${user}')">Change Password</a>
                            <a class="button secondary" onclick="UM.ui.showNameEditor('${user}')">Change Name</a>
                            <a class="button error" onclick="UM.ui.confirmRemove('${user}')">Remove</a>
                        `
                        managementTemplate += `<li class="${role}" username="${user}"> ${user} &nbsp;&nbsp; ${buttons} </li>`
                    }
                    document.getElementById("users").innerHTML = managementTemplate
                })
                .catch(err => document.getElementById("users").innerHTML = err)
            }
            else{
                alert("You must be logged in as an administrator to use this!")
            }
        } catch (err) {
            console.log("User identity reset; unable to parse ", localStorage.getItem("lr-user"))
            localStorage.removeItem("lr-user")
            alert("There was an error identifying you.  Please log in again.")
            document.location.reload()
            
        }
    }
    else{
        alert("You must be a logged in as an administrator to use this page!")
    }
}

/**
 * Add a user to the users file and provide feedback for success/failure.
 * Remember that each user has an agent associated with it.
 * TODO: This should only work for administrators
 */
UM.interaction.addUser = async function(){
    let name = document.getElementById("name").value
    let username = document.getElementById("username").value
    let email =  document.getElementById("email").value
    let pass =  document.getElementById("sec").value
    let roles = {administrator:document.getElementById("adminRole").checked, contributor:document.getElementById("contributorRole").checked}
    if(!(username && pass && name && email) || (!roles.administrator && !roles.contributor)){
        alert("You must provide all the information.  Make sure to assign at least one role.")
    }
    else{
        let agentObj = {
            "@type" : "Agent",
            "@context" : "http://devstore.rerum.io/v1/contex.json",
            "mbox" : email,
            "label" : username,
            "name" : name
        }
        let newAgent = await UM.interaction.generateAgent(agentObj)
        if(newAgent !== null && newAgent !== undefined){
            newAgent = newAgent["new_obj_state"]
            let userbody = {
                "@id":newAgent["@id"],
                "roles":roles,
                "sec" : pass
            }
            let servletBody = {"username":username, "userbody":userbody}
            fetch(UM.URLS.ADDUSER, {
                method: "POST",
                mode: "cors",
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },   
                body: JSON.stringify(servletBody)
            })
            .then(response => {
                if(response.ok){
                    return response.text()
                }
                else if(response.status === 403){
                    console.log("User identity reset; user session ended. ", localStorage.getItem("lr-user"))
                    localStorage.removeItem("lr-user")
                    alert("Please log in again.")
                    document.location.reload()
                }
                else{
                    alert("Failed to add user")
                    console.error("Failed to add user to file.")    
                    return
                }
            })
            .then(text => {
                alert(text)
                this.closeCard("addUser")
                this.drawUserManagement()
            })
            .catch(err => {
               alert("Failed to add user")
               console.error(err)         
            })
        }
        else{
            //alert("Failed to add user.  Could not create AGENT.")
        }
    }
}

/**
 * Remove a user from the users file.  Povide feedback for success/failure
 * TODO: This should only work for administrators
 * @param {String} user
 */
UM.interaction.removeUser = async function(user){
    fetch(UM.URLS.REMOVEUSER, {
        method: "POST",
        mode: "cors",
        headers: {
            'Content-Type': 'charset=utf-8'
        },
        body: user
    })
    .then(response => {
        if(response.ok){
            return response.text()
        }
        else if(response.status === 403){
            console.log("User identity reset; user session ended. ", localStorage.getItem("lr-user"))
            localStorage.removeItem("lr-user")
            alert("Please log in again.")
            document.location.reload()
        }
        else{
            alert("Failed to remove user")
            console.error("Failed to remove user")
            return
        }
    })
    .then(text => {
        alert(text)
        this.closeCard("removeUserConfirm")
        this.drawUserManagement()
    })
    .catch(err => {
       alert("Failed to remove user")
       console.error(err)         
    })   
}

/**
 * Generate an agent in RERUM so you can add the @id to the user JSON for the users file.
 * TODO: This should only work for administrators
 * @param {JSONObject} agentObj
 * @return Promise for agent creation
 */
UM.interaction.generateAgent = async function(agentObj){
    return await fetch(UM.URLS.CREATE, {
        method: "POST",
        mode: "cors",
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(agentObj)
    })
    .then(response => {
        if(response.ok){
            return response.json()
        }
        else{
            alert("There was an error saving the AGENT for the user.")
            console.error("There was an error saving the AGENT for the user.")
            return
        }
    })
    .catch(err => {
        //alert("Error generating agent for user.  Could not add user.")
        console.error(err)
        return {}
    })
}

/**
 * Change the roles for a user in the users file.  Porvide feedback for success/failure
 * TODO: This should only work for administrators
 * @param {string} user
 */
UM.interaction.setUserRoles = function(user){
    let servletBody = {username:user, roles:{"administrator":false, "contributor":false}}
    servletBody.roles.administrator = document.getElementById("newAdminRole").checked
    servletBody.roles.contributor = document.getElementById("newContributorRole").checked
    if(!servletBody.roles.administrator && !servletBody.roles.contributor){
        alert("You must select at least one role!");
    }
    else{
        fetch(UM.URLS.SETROLES, {
            method: "POST",
            mode: "cors",
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(servletBody)
        })
        .then(response => {
            if(response.ok){
                return response.text()
            }
            else if(response.status === 403){
                console.log("User identity reset; user session ended. ", localStorage.getItem("lr-user"))
                localStorage.removeItem("lr-user")
                alert("Please log in again.")
                document.location.reload()
            }
            else{
                alert("There was an error setting the roles.")
                console.error("There was an error setting the roles.")
                return
            }
        })
        .then(text =>{
            alert(text)
            this.closeCard("rolesEditor")
            this.drawUserManagement()
        })
        .catch(err => {
            alert("There was an error setting the roles.")
            console.error(err)
        })
    }  
}

/**
 * Change the username for a user in the users file.  Provide feedback for success/failure.
 * TODO: This should only work for administrators
 * @param {string} user
 */
UM.interaction.setUsername = async function(user){
    let newUsername = document.getElementById("newName").value
    if(newUsername){
        let servletBody = {"username":user, "newname":newUsername}
        fetch(UM.URLS.SETUSERNAME, {
            method: "POST",
            mode: "cors",
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(servletBody)
        })
        .then(response => {
            if(response.ok){
                return response.text()
            }
            else if(response.status === 403){
                console.log("User identity reset; user session ended. ", localStorage.getItem("lr-user"))
                localStorage.removeItem("lr-user")
                alert("Please log in again.")
                document.location.reload()
            }
            else{
                alert("There was an error setting the username.")
                console.error("There was an error setting the username.")
                return
            }
        })
        .then(text =>{
            alert(text)
            this.closeCard("nameEditor")
            this.drawUserManagement()
        })
        .catch(err => {
            alert("There was an error setting the roles.")
            console.error(err)
        })
    }
    else{
        alert("You must provide some kind of name!")
    }
}

/**
 * Change the passsword for a user in the users file.  Provide feedback for success/failure.
 * TODO: This should only work for administrators
 * @param {string} user
 */
UM.interaction.setUserSec = async function(user){
    let newSecret = document.getElementById("newSec").value
    if(newSecret){
        let servletBody = {"username":user, "newsec":newSecret}
        fetch(UM.URLS.SETSECRET, {
            method: "POST",
            mode: "cors",
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(servletBody)
        })
        .then(response => {
            if(response.ok){
                return response.text()
            }
            else if(response.status === 403){
                console.log("User identity reset; user session ended. ", localStorage.getItem("lr-user"))
                localStorage.removeItem("lr-user")
                alert("Please log in again.")
                document.location.reload()
            }
            else{
                alert("There was an error updating the password.")
                console.error("There was an error updating the password.")
                return
            }
        })
        .then(text =>{
            alert(text)
            this.closeCard("secEditor")
            this.drawUserManagement()
        })
        .catch(err => {
            alert("There was an error updating the password.")
            console.error(err)
        })
    }
    else{
        alert("You must provide some kind of password!")
    }
}

/**
 * Hide and empty the inputs inside of an HTML Element.
 * @param {string} htmlID  The ID of the HTML Element to interact with.
 */
UM.interaction.closeCard = function(htmlID){
    document.getElementById(htmlID).classList.add("is-hidden")
    document.getElementById("popoverShade").classList.add("is-hidden")
    document.getElementById(htmlID).querySelector(".action").setAttribute("onclick", "")
    document.getElementById(htmlID).querySelector(".dynamicUser").innerHTML = ""
    document.getElementById(htmlID).querySelectorAll("input").forEach(function(el) {
        el.value= ''
        el.selected = false
        el.checked = false
    })
    document.getElementById(htmlID).querySelectorAll("textarea").forEach(function(el) {
        el.value= ''
    })
    document.getElementById(htmlID).querySelectorAll(".dynamicUser").forEach(function(el) {
        el.innerHTML= '{{USER}}'
    })
}

/**
 * Show the role editing HTML.  Set the onlick functions and user to show based on the provided user
 * @param user {string} The user this HTML will interact with
 */
UM.ui.showRolesEditor = function(user, event){
    let role = event.target.getAttribute("role")
    document.getElementById("popoverShade").classList.remove("is-hidden")
    document.getElementById("rolesEditor").classList.remove("is-hidden")
    document.getElementById("usernameRole").innerHTML = user
    document.getElementById("rolesEditor").querySelector(".action").setAttribute("onclick", "UM.interaction.setUserRoles('"+user+"')")
    if(role === "admin"){
        document.getElementById("newAdminRole").checked = true
        document.getElementById("newContributorRole").checked = true
    }
    else{
        document.getElementById("newContributorRole").checked = true
    }
}

/**
 * Show the name editing HTML.  Set the onlick functions and user to show based on the provided user
 * @param user {string} The user this HTML will interact with
 */
UM.ui.showNameEditor = function(user){
    document.getElementById("popoverShade").classList.remove("is-hidden")
    document.getElementById("nameEditor").classList.remove("is-hidden")
    document.getElementById("usernameName").innerHTML = user
    document.getElementById("nameEditor").querySelector(".action").setAttribute("onclick", "UM.interaction.setUsername('"+user+"')")
}

/**
 * Show the password editing HTML.  Set the onlick functions and user to show based on the provided user
 * @param user {string} The user this HTML will interact with
 */
UM.ui.showSecEditor = function(user){
    document.getElementById("popoverShade").classList.remove("is-hidden")
    document.getElementById("secEditor").classList.remove("is-hidden")
    document.getElementById("usernameSec").innerHTML = user
    document.getElementById("secEditor").querySelector(".action").setAttribute("onclick", "UM.interaction.setUserSec('"+user+"')")
}

/**
 * Show the user addition HTML
 */
UM.ui.showUserAddition = function(){
    document.getElementById("popoverShade").classList.remove("is-hidden")
    document.getElementById("addUser").classList.remove("is-hidden")
    document.getElementById("addUser").style.top = "15%"
}

/**
 * Show the removal confirmation HTML.  Set the onlick functions and user to show based on the provided user
 * @param user {string} The user this HTML will interact with
 */
UM.ui.confirmRemove = function(user){
    document.getElementById("popoverShade").classList.remove("is-hidden")
    document.getElementById("removeUserConfirm").classList.remove("is-hidden")
    document.getElementById("usernameRemove").innerHTML = user 
    document.getElementById("removeUserConfirm").querySelector(".action").setAttribute("onclick", "UM.interaction.removeUser('"+user+"')")
}


