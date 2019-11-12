const UM = {}

/**
 * URLS for the available User Management back end servlets.
 */
UM.URLS = {
    GETUSERFILE: "getUsers",
    GETROLES: "getUserRoles",
    GETSECRET: "getUserSecret",
    SETNAME: "setUserName",
    SETROLES: "setUserRoles",
    SETSECRET: "setUserSecret",
    ADDUSER : "addUser",
    REMOVEUSER : "removeUser"
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
 * Use the endpoint available to get the user file.  
 * @returns {Object} The user file as a json object.
 */
UM.interaction.getAllUsers = async function(){
    let allUsers = await fetch(UM.URLS.GETUSERFILE, {
        method: "GET",
        mode: "cors",
        headers: {
            'Content-Type': 'application/json'
        }    
    })
    .then(response => response.json())
    .catch(err => console.error(err))
    return allUsers
}

/**
 * Should only be able to see buttons that fire this function if user is an administrator.
 * Double down and only allow the function to fire if the user is known and is an administrator.  The server does not do this right now.  
 * 
 */
UM.interaction.drawUserManagement = async function(){
    let loggedInUser = localStorage.getItem("lr-user")
    let managementTemplate = ``
    if (loggedInUser !== null) {
        try {
            loggedInUser = JSON.parse(loggedInUser)
            if (loggedInUser.roles.administrator) {
                await this.getAllUsers()
                .then(users => {
                    for (let user in users){
                        //We only need to know their name, so walk the top level keys, which are the name.  Ignore admin_list.
                        let role = (users[user].roles.administrator) ? "admin" : "contributor"
                        let buttons = `
                            <input class="button primary" type="button" value="Change Password" onclick="UM.ui.showSecEditor('${user}')" />
                            <input class="button secondary" type="button" value="Change Name" onclick="UM.ui.showNameEditor('${user}')" />
                            <input class="button error" type="button" value="Remove" onclick="UM.ui.confirmRemove('${user}')" />
                        `
                        if(user !== "admin_list"){
                            managementTemplate += `<li class="${role}" username="${user}"> ${user} &nbsp;&nbsp; ${buttons} </li>`
                        }
                    }
                    document.getElementById("users").innerHTML = managementTemplate
                })
                .catch(err => document.getElementById("users").innerHTML = err)
            }
            else{
                alert("You must be a logged in administrator to use this function!")
            }
        } catch (err) {
            console.log("User identity reset; unable to parse ", localStorage.getItem("lr-user"))
            localStorage.removeItem("lr-user")
            alert("There was an error identifying you.  Please log in again.");
        }
    }
    else{
        alert("You must be a logged in administrator to use this page!")
    }
}

UM.interaction.addUser = function(username, password, roles){
    //Remember they need a RERUM agent...
    
    this.closeCard("newUser")
    this.drawUserManagement()
}

UM.interaction.removeUser = async function(user){
    
    this.closeCard("removeUserConfirm")
    this.drawUserManagement()
}

UM.interaction.getUserRoles = async function(user){
    let roles = {"admin":false, "contributor":false}
    
    return roles;
}

UM.interaction.setUserRoles = async function(user){
    let roles = {administrator:false, contributor:false}
    roles.administrator = document.getElementById("adminRole").value
    roles.contributor = document.getElementById("contributorRole").value
    alert("Roles updated for "+user)
    this.closeCard("rolesEditor")
}

UM.interaction.setUsername = async function(user){
    let newUsernmae = document.getElementById("newName").value
    this.closeCard("nameEditor")
    this.drawUserManagement()
}

UM.interaction.setUserSecret = async function(user){
    let newSecret = document.getElementById("newSec").value
    this.closeCard("secEditor")
    alert("Password updated for "+user)
}

UM.interaction.closeCard = function(htmlID){
    document.getElementById(htmlID).classList.add("hidden")
    document.getElementById("popoverShade").classList.add("hidden")
    document.getElementById(htmlID).querySelector(".action").setAttribute("onlick", "")
    document.getElementById(htmlID).querySelector(".dynamicUser").innerHTML = ""
    document.getElementById(htmlID).querySelectorAll("input").forEach(function(el) {
        el.value= ''
    })
    document.getElementById(htmlID).querySelectorAll("textarea").forEach(function(el) {
        el.value= ''
    })
    document.getElementById(htmlID).querySelectorAll(".dynamicUser").forEach(function(el) {
        el.innerHTML= '{{USER}}'
    })
}

UM.ui.showRolesEditor = function(user){
    document.getElementById("popoverShade").classList.remove("hidden")
    document.getElementById("rolesEditor").classList.remove("hidden")
    document.getElementById("usernameRole").innerHTML = user
    document.getElementById("rolesEditor").querySelector(".action").setAttribute("onlick", "UM.action.setUserRoles('"+user+"')")
}

UM.ui.showNameEditor = function(user){
    document.getElementById("popoverShade").classList.remove("hidden")
    document.getElementById("nameEditor").classList.remove("hidden")
    document.getElementById("usernameName").innerHTML = user
    document.getElementById("nameEditor").querySelector(".action").setAttribute("onlick", "UM.action.setUsername('"+user+"')")
}

UM.ui.showSecEditor = function(user){
    document.getElementById("popoverShade").classList.remove("hidden")
    document.getElementById("secEditor").classList.remove("hidden")
    document.getElementById("usernameSec").innerHTML = user
    document.getElementById("secEditor").querySelector(".action").setAttribute("onlick", "UM.action.setUserSec('"+user+"')")
}

UM.ui.confirmRemove = function(user){
    document.getElementById("popoverShade").classList.remove("hidden")
    document.getElementById("removeUserConfirm").classList.remove("hidden")
    document.getElementById("usernameRemove").innerHTML = user 
    document.getElementById("removeUserConfirm").querySelector(".action").setAttribute("onlick", "UM.action.removeUser('"+user+"')")
}


