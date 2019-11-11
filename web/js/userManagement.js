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

UM.action.getAllUsers = async function(){
    let allUsers = []
    return allUsers
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


