/**
 * Lived Religions
 * @author Bryan Haberberger <bryan.j.haberberger@slu.edu>
 *
 */

const LR = {}
LR.APPAGENT = "http://store.rerum.io/v1/id/5da8c165d5de6ba6e2028474"
LR.URLS = {
    LOGIN: "login",
    LOGOUT: "logout",
    BASE_ID: "http://store.rerum.io/v1",
    CREATE: "create",
    UPDATE: "update",
    QUERY: "query",
    OVERWRITE: "overwrite",
    DELETE: "delete",
    SINCE: "http://store.rerum.io/v1/since"
}
if (typeof(Storage) !== "undefined") {
    LR.localInfo = window.localStorage
} else {
    LR.err.generic_error("Please update your browser or use a different browser, this one is not supported. Sorry for the inconvenience.")
}
LR.err = {}
LR.ui = {}

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
