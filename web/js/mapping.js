/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

MAPINTERACTION = {}

MAPINTERACTION.goToCoords = function(event){
    if(!MAPINTERACTION.mymap){
        //This should have been set by mapInitializer.js
        MAPINTERACTION.mymap = L.map('leafletInstanceContainer')
    }
    if(leafLat.value && leafLong.value){
        let coords = [leafLat.value, leafLong.value]
        MAPINTERACTION.mymap.flyTo(coords,8)
        document.getElementById("currentCoords").innerHTML = "["+coords.toString()+"]"
    }
}

MAPINTERACTION.filterMarkers = async function(event){
    if(!MAPINTERACTION.mymap){
        //This should have been set by mapInitializer.js
        MAPINTERACTION.mymap = L.map('leafletInstanceContainer')
    }
    let app = event.target.getAttribute("app")
    MAPINTERACTION.mymap.eachLayer(function(layer) {
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

