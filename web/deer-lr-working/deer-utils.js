/**
 * @module DEER Data Encoding and Exhibition for RERUM
 * @author Patrick Cuba <cubap@slu.edu>
 * @author Bryan Haberberger <bryan.j.haberberger@slu.edu>
 * @version 0.7

 * This code should serve as a basis for developers wishing to
 * use TinyThings as a RERUM proxy for an application for data entry,
 * especially within the Eventities model.
 * @see tiny.rerum.io
 */

import { default as DEER } from './deer-config.js'

export default {
    listFromCollection: function (collectionId) {
        let queryObj = {
            body: {
                targetCollection: collectionId
            }
        }
        return fetch(DEER.URLS.QUERY, {
            method: "POST",
            body: JSON.stringify(queryObj)
        }).then(response => response.json())
            .then(function (pointers) {
                let list = []
                pointers.map(tc => list.push(fetch(tc.target).then(response => response.json())))
                return Promise.all(list)
            })
            .then(function (list) {
                return list
            })
    },
    listFromContainer: function () { },

    //TODO
    //Write a helper to getArrayFromContainerObj(obj, asType)

    getValue: function (property, alsoPeek = [], asType) {
        // TODO: There must be a best way to do this...
        let prop;
        if (property === undefined || property === "") {
            console.error("Value of property to lookup is missing!")
            return undefined
        }
        if (Array.isArray(property)) {
            prop = property.map(this.getValue.bind(this))
        } else {
            if (typeof property === "object") {
                // TODO: JSON-LD insists on "@value", but this is simplified in a lot
                // of contexts. Reading that is ideal in the future.
                if (!Array.isArray(alsoPeek)) {
                    alsoPeek = [alsoPeek]
                }
                alsoPeek = alsoPeek.concat(["@value", "value", "$value", "val"])
                for (let k of alsoPeek) {
                    if (property.hasOwnProperty(k)) {
                        prop = property[k]
                        break
                    }
                    else {
                        prop = property
                    }
                }
            }
            else {
                prop = property
            }
        }
        try {
            switch (asType.toUpperCase()) {
                case "STRING":
                    prop = prop.toString();
                    break
                case "NUMBER":
                    prop = parseFloat(prop);
                    break
                case "INTEGER":
                    prop = parseInt(prop);
                    break
                case "BOOLEAN":
                    prop = !Boolean(["false", "no", "0", "", "undefined", "null"].indexOf(String(prop).toLowerCase().trim()));
                    break
                default:
            }
        } catch (err) {
            if (asType) {
                throw new Error("asType: '" + asType + "' is not possible.\n" + err.message)
            } else {
                // no casting requested
            }
        } finally {
            return (prop.length === 1) ? prop[0] : prop
        }
    },
    /**
     * Attempt to discover a readable label from the object
     */
    get getLabel() {
        return (obj, noLabel = "[ unlabeled ]", options = {}) => {
            if (typeof obj === "string") { return obj }
            let label = obj[options.label] || obj.name || obj.label || obj.title
            if(Array.isArray(label)) {
                label = [...new Set(label.map(l => this.getValue(this.getLabel(l))))]

            }
            return label || noLabel
        }
    },
    /**
     * Take a known object with an id and query for annotations targeting it.
     * Discovered annotations are attached to the original object and returned.
     * @param {Object} entity Target object to search for description
     */
    async expand(entity) {
        let findId = entity["@id"] || entity.id || entity
        if (typeof findId !== "string") {
            console.warn("Unable to find URI in object:",entity)
            return entity
        }
        let getValue = this.getValue
        return fetch(findId).then(response => response.json())
            .then(obj => this.findByTargetId(findId)
                .then(function (annos) {
                    for (let i = 0; i < annos.length; i++) {
                        let body
                        try {
                            body = annos[i].body
                        } catch (err) { continue }
                        if (!body) { continue }
                        if (!Array.isArray(body)) {
                            body = [body]
                        }
                        Leaf: for (let j = 0; j < body.length; j++) {
                            if (body[j].evidence) {
                                obj.evidence = (typeof body[j].evidence === "object") ? body[j].evidence["@id"] : body[j].evidence;
                            }
                            else {
                                try {
                                    let val = body[j];
                                    let k = Object.keys(val)[0];
                                    if (!val.source) {
                                        // include an origin for this property, placehold madsrdf:Source
                                        let aVal = getValue(val[k]);
                                        val[k] = {
                                            value: aVal,
                                            source: {
                                                citationSource: annos[i]["@id"],
                                                citationNote: annos[i].label || "Composed object from DEER",
                                                comment: "Learn about the assembler for this object at https://github.com/CenterForDigitalHumanities/TinyThings"
                                            }
                                        };
                                    }
                                    if (obj[k] !== undefined && annos[i].__rerum && annos[i].__rerum.history.next.length) {
                                        // this is not the most recent available
                                        // TODO: maybe check generator, etc.
                                        continue Leaf;
                                    }
                                    else {
                                        // Assign this to the main object.
                                        if(obj[k]) {
                                            // It may be already there as an Array with some various labels
                                            if (Array.isArray(obj[k])){
                                                let deepMatch = false
                                                for(const e of obj[k]) {
                                                    if(e.name===val.name){
                                                        deepMatch = true
                                                        break
                                                    }
                                                }
                                                if(!deepMatch) { obj[k].push(val) }
                                            } else if (obj[k].name !== val.name) { // often undefined
                                                obj[k] = [obj[k],val]
                                            }
                                        } else {
                                            // or just tack it on
                                            obj = Object.assign(obj, val);
                                        }
                                    }
                                }
                                catch (err_1) { }
                            }
                        }
                    }
                    return obj
                })).catch(err => {
                    console.log("Error expanding object:" + err)
                    return err
                })
    },
    /**
     * Execute query for any annotations in RERUM which target the
     * id passed in. Promise resolves to an array of annotations.
     * @param {String} id URI for the targeted entity
     * @param [String] targetStyle other formats of resource targeting.  May be null
     */
    findByTargetId: async function (id, targetStyle=[]) {
        let everything = Object.keys(localStorage).map(k => JSON.parse(localStorage.getItem(k)))
        if (!Array.isArray(targetStyle)) {
            targetStyle = [targetStyle]
        }
        targetStyle = targetStyle.concat(["target", "target.@id", "target.id"]) //target.source?
        let obj = {"$or":[]}
        for (let target of targetStyle) {
            //Entries that are not strings are not supported.  Ignore those entries.  
            //TODO: should we we let the user know we had to ignore something here?
            if(typeof target === "string"){
                let o = {}
                o[target] = id
                obj["$or"].push(o)
            }
        }
        let matches = await fetch(DEER.URLS.QUERY, {
            method: "POST",
            body: JSON.stringify(obj),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(response => response.json())
            .catch((err) => console.log(err))
        let local_matches = everything.filter(o => o.target === id)
        matches = local_matches.concat(matches)
        return matches
    },

    /**
     * An error handler for various HTTP traffic scenarios
     */
    handleHTTPError: function (response) {
        if (!response.ok) {
            let status = response.status
            switch (status) {
                case 400:
                    console.log("Bad Request")
                    break
                case 401:
                    console.log("Request was unauthorized")
                    break
                case 403:
                    console.log("Forbidden to make request")
                    break
                case 404:
                    console.log("Not found")
                    break
                case 500:
                    console.log("Internal server error")
                    break
                case 503:
                    console.log("Server down time")
                    break
                default:
                    console.log("unahndled HTTP ERROR")
            }
            throw Error("HTTP Error: " + response.statusText)
        }
        return response
    },

    /**
     * Broadcast a message about DEER
     */
    broadcast: function (event = {}, type, element, obj = {}) {
        let e = new CustomEvent(type, { detail: Object.assign(obj, { target: event.target }), bubbles: true })
        element.dispatchEvent(e)
    },
    /**
     * The body.value of an annotation was an array value.  We will eventually turn that into a string to show as the value of
     * some input area.  We have decided to ignore any array value that is an object or array.  We do not simply want to
     * filter() the array.  We want to show a soft error or warning when we come across an entry we are intentionally ignoring.  
    */
    cleanArrayForString:function(arr){
        let cleanArray = []
        for (const v of arr) {
            if((["string","number"].indexOf(typeof v)>-1)){
                cleanArray.push(v)
            }
            else if(typeof v === "object") {
                //TODO how should we handle?
                console.warn("An annotation body value array contained an object.  We ignored it.")
                console.log(v)
            }
            else if(Array.isArray(v)){
                console.warn("An annotation body value array contained an array.  We ignored it.")
                console.log(v)
            }
        }
        return cleanArray
    },
    /**
     * The body.value of an annotation is an object.  Normally we would ignore objects as values, but container objects
     * may contain a list or set of things meant to represent the value as per web standards.  We should check for known/supported
     * container objects.  If this object is not a supported object, an empty array will be returned indicating a failure
     * to find any value.  
    */
    getArrayFromContainerObj:function(containerObj){
        let cleanArray = []
        let objType = containerObj.type || containerObj["@type"] || ""
        if(Array.isArray(objType)){
            //Grab the first type DEER supports from the obj type array
            objType = objType.reduce((acc, curVal, ind, arr) => {
                if(DEER.CONTAINERS.indexOf(curVal) > -1){
                    return curVal
                }
            } ,"")
            //If none match, objType is undefined.
        }
        //The array we want to return will be in obj.items or obj.
        if(DEER.CONTAINERS.indexOf(objType) > -1){
            if(["List", "Set", "set","list", "@set", "@list"].indexOf(objType) > -1){
                cleanArray = this.cleanArrayForString(containerObj.items)
            }
            else if(["ItemList"].indexOf(objType > -1)){
                cleanArray = this.cleanArrayForString(containerObj.itemListElement)
            }
        }
        return cleanArray
    }
}