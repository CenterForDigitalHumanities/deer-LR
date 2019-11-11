const UM = {}
    //Make sure these behave like DEER.URLS, AKA when it is deployed to dev, use sandbox, not lived-religion-dev or the internal back end
UM.URLS = {
    GETALLUSERS: "getUsers",
    GETROLES: "getUserRoles",
    GETSECRET: "getUserSecret",
    SETNAME: "setUserName",
    SETROLES: "setUserRoles"
    SETSECRET: "setUserSecret"
}

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
    .then(users => {
        
    })
    .catch(err => console.error(err))
    return allUsers
}

UM.action.drawUserManagement(){
    let what = this;
    let loggedInUser = localStorage.getItem("lr-user")
    if (user !== null) {
        try {
            user = JSON.parse(user)
            if (user.roles.administrator) {
                let users = await fetch(UM.URLS.GETALLUSERS, {
                    method: "GET",
                    mode: "cors",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + btoa('username:password')
                    }    
                })
                .then(response => response.json())
                .then(users => {
                    for (let user in users){
                        manamgementTemplate += `<li username=${user}> ${user} </li>`
                    }
                    document.getElementById("users").innerHTML = managementTemplate
                })
                .catch(err => document.getElementById("users").innerHTML = err)
            }
            else{
                alert("You must be a logged in administrator to use this page!")
            }
        } catch (err) {
            console.log("User identity reset; unable to parse ", localStorage.getItem("lr-user"))
            localStorage.removeItem("lr-user")
            alert("There was an error identifying you.  Please log in again.");
            document.location.reload()
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


