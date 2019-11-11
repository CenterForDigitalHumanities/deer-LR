const UM = {}
    //Make sure these behave like DEER.URLS, AKA when it is deployed to dev, use sandbox, not lived-religion-dev or the internal back end
UM.URLS = {
    GETALLUSERS: "getUsers",
    GETROLES: "getUserRoles",
    GETSECRET: "getUserSecret",
    SETNAME: "setUserName",
    SETROLES: "setUserRoles",
    SETSECRET: "setUserSecret"
}

UM.action = {}

//Unused at the moment, since it is a helper for other helpers.
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
                        if(user !== "admin_list"){
                            managementTemplate += `<li username=${user}> ${user} </li>`
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

UM.action.getUserSecret = async function(user){
    
}

UM.action.setUserRoles = async function(user, roles){
    
}

UM.action.setUserName = async function(user, name){
    
}

UM.action.setUserSecret = async function(user, sec){
    
}


