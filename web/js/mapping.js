/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


MAPPER = {}

MAPPER.mymap={}

MAPPER.URLS = {
    BASE_ID: "http://devstore.rerum.io/v1",
    DELETE: "http://tinydev.rerum.io/app/delete",
    CREATE: "http://tinydev.rerum.io/app/create",
    UPDATE: "http://tinydev.rerum.io/app/update",
    QUERY: "http://tinydev.rerum.io/app/query",
    OVERWRITE: "http://tinydev.rerum.io/app/overwrite"
}

MAPPER.init =  async function(){
    let latlong = [12, 12] //default starting coords
    let historyWildcard = {"$exists":true, "$size":0}
    let geoWildcard = {"$exists":true}
    let geos = []
    document.getElementById("leafLat").oninput = MAPPER.updateGeometry
    document.getElementById("leafLong").oninput = MAPPER.updateGeometry

    //for my LR app
    let LRDemoQueryObj = {
        "__rerum.history.next": {"$exists":true, "$size":0},
        "type"  : "Annotation",
        "body.geometry" : {"$exists":true}
    }
    let LRDemoGeos = await fetch(MAPPER.URLS.QUERY, {
        method: "POST",
        mode: "cors",
        body: JSON.stringify(LRDemoQueryObj)
    })
    .then(response => response.json())
    .then(geoMarkers => {
       return geoMarkers.filter(anno => {
           //Could also include those annos that have body and geometry, but geometry is the value, it is not further wrapped in value
           //So that it works for dev make sure you are at least including those made how this application made them.
           return anno.body.geometry.hasOwnProperty("value") && Object.keys(anno.body.geometry.value).length > 0
       })
    })
    .then(async function(annotations) {
        let targetObjDescription, targetObjLabel = ""
        let isIIIF = false
        let allGeos = await annotations.map(async function(annotation){ 
            let targetProps = {"label":"Target Label Unknown","description":"Target Description Unknown",  "madeByApp" : "Lived_Religion", "isIIIF":false}
            targetProps.targetID = annotation.target
            if(annotation.body.hasOwnProperty("properties") && (annotation.body.properties.label || annotation.body.properties.description) ){
                targetProps = annotation.properties
                targetProps.madeByApp = "Lived_Religion"
                targetProps.targetID = annotation.target
            }
            else{
                let targetObj = await fetch(annotation.target)
                .then(resp => resp.json())
                .catch(err => {return null})
                if(targetObj){
                    //This application created its annotations aa bit differently, so we have to shim the output here.  
                    isIIIF = MAPPER.checkForIIIF(targetObj)
                    targetObjDescription = targetObj.description ? targetObj.description : "Target Description Unknown"
                    targetObjLabel = targetObj.label ? targetObj.label : targetObj.name ? targetObj.name : "Target Label Unknown"
                    targetProps = {"targetID":annotation.target, "label":targetObjLabel, "description":targetObjDescription, "madeByApp":"Lived_Religion", "isIIIF":isIIIF}
                }
                else{
                    //alert("Target URI could not be resolved.  The annotationtation will still be created and target the URI provided, but certain information will be unknown.")
                }
            }
            return {"@id":annotation["@id"], "properties":targetProps, "type":"Feature", "geometry":annotation.body.geometry.value} 
        })
        return Promise.all(allGeos)
    })
    .catch(err => {
        console.error(err)
        return []
    })
    //Combine all the corrdinates recieved into one array
    MAPPER.initializeMap(latlong, LRDemoGeos)
}
    
MAPPER.initializeMap = async function(coords, geoMarkers){
    MAPPER.mymap = L.map('leafletInstanceContainer')   
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGhlaGFiZXMiLCJhIjoiY2pyaTdmNGUzMzQwdDQzcGRwd21ieHF3NCJ9.SSflgKbI8tLQOo2DuzEgRQ', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 100,
        id: 'mapbox.satellite', //mapbox.streets
        accessToken: 'pk.eyJ1IjoidGhlaGFiZXMiLCJhIjoiY2pyaTdmNGUzMzQwdDQzcGRwd21ieHF3NCJ9.SSflgKbI8tLQOo2DuzEgRQ'
    }).addTo(MAPPER.mymap);
    MAPPER.mymap.setView(coords,8);

    L.geoJSON(geoMarkers, {
        pointToLayer: function (feature, latlng) {
            let appColor = "#336699"
            let creating_app = feature.properties.madeByApp ? feature.properties.madeByApp : "Unknown"
            switch(creating_app){
                case "MapDemo":
                    appColor = "#336699"
                break
                case "Lived_Religion":
                    appColor = "#00cc00"
                break
                case "T-PEN":
                    appColor = "#ff9900"
                break
                case "Mirador":
                    appColor = "#ff3333"
                break
                case "IIIF_Coordinates_Annotator":
                    appColor = "#800060"
                break
                default:
                    appColor = "red"
            }
            return L.circleMarker(latlng, {
                radius: 8,
                fillColor: appColor,
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        onEachFeature: MAPPER.pointEachFeature
    }).addTo(MAPPER.mymap)
    leafletInstanceContainer.style.backgroundImage = "none"
    loadingMessage.classList.add("is-hidden")
}

MAPPER.pointEachFeature = function (feature, layer) {
    //@id, label, description
    layer.hasMyPoints = true
    layer.isHiding = false
    let popupContent = ""
    if (feature.properties) {
        if(feature.properties.isIIIF){
            popupContent += `<p class="color6 featureCompliance">IIIF Compliant Target</p>`
        }
        if(feature.properties.label) {
            popupContent += `<div class="featureInfo"><label>Target Label:</label>${feature.properties.label}</div>`
        }
        if(feature.properties.targetID || feature.properties["@id"]){
            let targetURI = feature.properties["@id"] ? feature.properties["@id"] : feature.properties.targetID ? feature.properties.targetID : ""
            popupContent += `<div class="featureInfo"><label> Target URI:</label><a target='_blank' href='${targetURI}'>See Target Data</a></div>`
        }
        if(feature.properties.description) {
            popupContent += `<div class="featureInfo"><label> Target Description:</label>${feature.properties.description}</div>`
        }
        if(feature.properties.madeByApp) {
            popupContent += `<div class="featureInfo"><label>Annotation Generated By</label>${feature.properties.madeByApp}</div>`
        }
        if(feature["@id"]) {
            popupContent += `<div class="featureInfo"><label>Annotation URI:</label><a target='_blank' href='${feature["@id"]}'>See Annotation Data</a></div>`
        }
    }
    layer.bindPopup(popupContent);
}

MAPPER.goToCoords = function(event){
    if(leafLat.value && leafLong.value){
        let coords = [leafLat.value, leafLong.value]
        MAPPER.mymap.flyTo(coords,8)
        document.getElementById("currentCoords").innerHTML = "["+coords.toString()+"]"
    }
}

MAPPER.filterMarkers = async function(event){
    let app = event.target.getAttribute("app")
    MAPPER.mymap.eachLayer(function(layer) {
        let skipCheck = false
        if ( layer.hasMyPoints ) {
            //remove [pomts nased pm a point.madeByApp property
            if(app === "isIIIF"){
                //Special handler to toggle on this property existing instead of basing it on the creating app (any aapp could have target a IIIF resource).
                if(layer.feature.properties && layer.feature.properties.isIIIF){
                    skipCheck = true
                }
            }
            if(skipCheck || (layer.feature.properties && layer.feature.properties.madeByApp && layer.feature.properties.madeByApp === app)){
                if(layer.isHiding){
                    layer.isHiding = false
                    let creating_app = layer.feature.properties.madeByApp ? layer.feature.properties.madeByApp : "Unknown"
                    let appColor = ""
                    switch(creating_app){
                        case "MapDemo":
                            appColor = "#336699"
                        break
                        case "Lived_Religion":
                            appColor = "#00cc00"
                        break
                        case "T-PEN":
                            appColor = "#ff9900"
                        break
                        case "Mirador":
                            appColor = "#ff3333"
                        break
                        case "IIIF_Coordinates_Annotator":
                            appColor = "#800060"
                        break
                        default:
                            appColor = "#b5a4a3"
                    }
                    layer.setStyle({
                        color: "#000",
                        fillColor : appColor
                    })
                }
                else{
                    layer.isHiding = true 
                    layer.setStyle({
                        color: 'rgba(0,0,0,0)',
                        fillColor : 'rgba(0,0,0,0)'
                    })
                }
            }
        }
    })
}
                      
MAPPER.getTargetProperties = async function(event){
    targetProps = {"label":"Unknown","description":"Unknown", "@id":"", "madeByApp":"IIIF_Coordinates_Annotator", "isIIIF":false}
    let target = document.getElementById('objURI').value
    let isIIIF = false
    targetProps["@id"] = target
    let targetObjDescription = "Unknown"
    let targetObjLabel = "Unknown"
    let targetObj = await fetch(target)
        .then(resp => resp.json())
        .catch(err => {return null})
    if(targetObj){
        if(targetObj["@context"]){
            if(Array.isArray(targetObj["@context"])){
                isIIIF = targetObj["@context"].includes("http://iiif.io/api/presentation/3/context.json") || targetObj["@context"].includes("http://iiif.io/api/presentation/2/context.json")
            }
            else if(typeof targetObj["@context"] === "string"){
               isIIIF = targetObj["@context"] === "http://iiif.io/api/presentation/3/context.json" || targetObj["@context"] === "http://iiif.io/api/presentation/2/context.json" 
            }

        }
        targetObjDescription = targetObj.description ? targetObj.description : "Unknown"
        targetObjLabel = targetObj.label ? targetObj.label : targetObj.name ? targetObj.name : "Unknown"
        targetProps = {"@id":target, "label":targetObjLabel, "description":targetObjDescription, "madeByApp":"T-PEN", "isIIIF":isIIIF}
        return targetProps
    }
    else{
        alert("Target URI could not be resolved.  The annotation will still be created and target the URI provided, but certain information will be unknown.")
        return targetProps
    }
} 





