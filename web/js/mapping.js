/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

MAPPER = {}

//For dev-01
MAPPER.URLS = {
    BASE_ID: "http://devstore.rerum.io/v1",
    DELETE: "http://tinydev.rerum.io/app/delete",
    CREATE: "http://tinydev.rerum.io/app/create",
    UPDATE: "http://tinydev.rerum.io/app/update",
    QUERY: "http://tinydev.rerum.io/app/query",
    OVERWRITE: "http://tinydev.rerum.io/app/overwrite"
}

MAPPER.goToCoords = function(event){
    if(!MAPPER.mymap){
        //This should have been set by mapInitializer.js
        MAPPER.mymap = L.map('leafletInstanceContainer')
    }
    if(leafLat.value && leafLong.value){
        let coords = [leafLat.value, leafLong.value]
        MAPPER.mymap.flyTo(coords,8)
        document.getElementById("currentCoords").innerHTML = "["+coords.toString()+"]"
    }
}

MAPPER.filterMarkers = async function(event){
    if(!MAPPER.mymap){
        //This should have been set by mapInitializer.js
        MAPPER.mymap = L.map('leafletInstanceContainer')
    }
    let app = event.target.getAttribute("app")
    MAPPER.mymap.eachLayer(function(layer) {
        let skipCheck = false
        if ( layer.hasMyPoints ) {
            if(layer.feature.properties && layer.feature.properties.madeByApp && layer.feature.properties.madeByApp === app){
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

