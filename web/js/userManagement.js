const UM = {}
    //Make sure these behave like DEER.URLS, AKA when it is deployed to dev, use sandbox, not lived-religion-dev or the internal back end
UM.URLS = {
    GETALLUSERS: "getUsers",
    GETROLES: "getUserRoles",
    GETSECRET: "getUserSecret",
    SETNAME: "setUserName",
    SETROLES: "setUserRoles",
    SETSECRET: "setUserSecret",
    ADDUSER : "addUser",
    REMOVEUSER : "removeUser"
}

UM.action = {}

/**
 * Use the endpoint available to get the user file.  
 * @returns {Object} The user file as a json object.
 */
UM.action.getAllUsers = async function(){
    let allUsers = await fetch(UM.URLS.GETALLUSERS, {
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
 * @returns {undefined}
 */
UM.action.drawUserManagement = async function(){
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
                        let buttons = `
                            <input class="button primary" type="button" value="Change Password" onclick="UM.ui.showRolesEditor('${user}')" />
                            <input class="button secondary" type="button" value="Change Name" onclick="UM.ui.showNameEditor('${user}')" />
                            <input class="button error" type="button" value="Remove" onclick="UM.ui.confirmRemove('${user}')" />
                        `
                        if(user !== "admin_list"){
                            managementTemplate += `<li username=${user}> ${user} &nbsp;&nbsp; ${buttons} </li>`
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

UM.action.getUserRoles = async function(user){
    let roles = []
    return roles;
}


UM.action.setUserRoles = async function(user, roles){
    
    
}

UM.action.addUser = function(username, password, roles){
    //Remember they need a RERUM agent...
}

UM.action.removeUser = async function(user){
    
    this.drawUserManagement()
}

UM.action.setUserName = async function(user, name){
    
    this.drawUserManagement()
}

UM.action.setUserSecret = async function(user, sec){
    
}

UM.ui.showRolesEditor = function(user){
    
}

UM.ui.showNameEditor = function(user){
    
}

UM.ui.confirmRemove = function(user){
    
    this.drawUserManagement()
}
