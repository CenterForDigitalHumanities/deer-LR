/**
 * Lived Religions
 * @author Bryan Haberberger <bryan.j.haberberger@slu.edu>
 *
 */

const LR = {}
LR.VERSION = "0.2.0"
LR.APPAGENT = "http://devstore.rerum.io/v1/id/5da8c04ae4b0a6b3a23849af"
LR.URLS = {
    LOGIN: "login",
    LOGOUT: "logout",
    BASE_ID: "http://devstore.rerum.io/v1",
    CREATE: "create",
    UPDATE: "update",
    QUERY: "query",
    OVERWRITE: "overwrite",
    DELETE: "delete",
    SINCE: "http://devstore.rerum.io/v1/since"
}
if (typeof(Storage) !== "undefined") {
    LR.localInfo = window.localStorage
} else {
    LR.err.generic_error("Please update your browser or use a different browser, this one is not supported. Sorry for the inconvenience.")
}
LR.err = {}
LR.ui = {}
LR.utils = {}

/** Various LR error handlers */
LR.err.generic_error = function(msg) {
    alert(msg)
}


LR.err.unhandled = function(error) {
    console.log("There was an unhandled error when using fetch")
    console.log(error)
    throw Error(error)
    return error
}

LR.err.handleHTTPError = function(response) {
        if (!response.ok) {
            let status = response.status;
            switch (status) {
                case 400:
                    console.log("Bad Request")
                    break;
                case 401:
                    console.log("Request was unauthorized")
                    break;
                case 403:
                    console.log("Forbidden to make request")
                    break;
                case 404:
                    console.log("Not found")
                    break;
                case 500:
                    console.log("Internal server error")
                    break;
                case 503:
                    console.log("Server down time")
                    break;
                default:
                    console.log("unahndled HTTP ERROR")
            }
            throw Error("HTTP Error: " + response.statusText)
        }
        return response
    }
    /** END Error handlers */

LR.ui.loginFail = function() {
    LR.sessionInfo.removeItem("authorized")
    alert("The username and/or password you provided is not correct.")
}

LR.utils.removeCollectionEntry = async function(itemID, itemElem){
    let historyWildcard = {"$exists":true, "$size":0}
    let queryObj = {
        $or: [{
            "targetCollection": this.collection
        }, {
            "body.targetCollection": this.collection
        }],
        "__rerum.history.next": historyWildcard,
        "__rerum.generatedBy":LR.APPAGENT,
        "target" : itemID
    }
    fetch(LR.URLS.QUERY, {
        method: "POST",
        mode: "cors",
        body: JSON.stringify(queryObj)
    }).then(response => response.json())
    .then(pointers => {
        let deleteList = []
        pointers.map(tc => {
            deleteList.push(
                fetch(LR.URLS.DELETE, {
                    method: "DELETE",
                    mode: "cors",
                    body: tc.target || tc["@id"] || tc.id
                })
            )
        })
        return Promise.all(deleteList)
    })
    .then(deletedList => {
        LR.utils.broadcastEvent(undefined, "collectionItemDeleted", itemElem)
        itemElem.remove()

    })
    .catch(err => {
        console.error("There was an error removing an item from the collection")
        console.log(itemElem)
    })
},
        
 /**
* Broadcast a message about some event
*/
LR.utils.broadcastEvent = function(event = {}, type, element, obj = {}) {
   let e = new CustomEvent(type, { detail: Object.assign(obj, { target: event.target }), bubbles: true })
   element.dispatchEvent(e)
}