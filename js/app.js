
import {DEER as MYDEER} from "../deer-lr-working/deer.js" 
//Note that deer.js contained deer-utils, deer-record and deer-render.  They are all a part of this DEER
//Note that deer.js fired initializeDeerViews(DEER) and initializeDeerForms(DEER)
import {default as MYUTILS} from "./utils.js" 
Object.assign(MYDEER.UTILS, MYUTILS); //Be careful, if your own utils have the same name as a DEER util it will be overwritten
//Make you own template
MYDEER.TEMPLATES.sense = function(obj){
    console.log("sense template")
    try {
    	// let kind = MYDEER.TEMPLATES.prop(obj, {key:"kind", label:"Type"}) || ``
     //    let location = MYDEER.TEMPLATES.prop(obj, {key:"location", label:"Where"}) || ``
     //    let religiousTradition = MYDEER.TEMPLATES.prop(obj, {key:"religious_tradition", label:"Religion"}) || ``
     //    let gender = MYDEER.TEMPLATES.prop(obj.demographic, {key:"gender", label:"Gender"}) || ``
     //    let age = MYDEER.TEMPLATES.prop(obj.demographic, {key:"age", label:"Age"}) || ``
     //	   let use = MYDEER.TEMPLATES.prop(obj, {key:"use", label:"Use"}) || ``
     //if I use key that doesn't exist, I get a blank, which is better than a breaking error 
     	let kind = `<h3>${MYDEER.UTILS.getValue(obj.kind)}</h3>`
        let location = `<dd>Location:${MYDEER.UTILS.getValue(obj.location)}</dd>`
        let religiousTradition = `<dd>Religion:${MYDEER.UTILS.getValue(obj.religious_tradition)}</dd>`
        let gender = `<dd>Gender:${MYDEER.UTILS.getValue(obj.demographic.gender)}</dd>`
        let age = `<dd>Age:${MYDEER.UTILS.getValue(obj.demographic.age)}</dd>`
        let use = `<dd>Use:${MYDEER.UTILS.getValue(obj.typical_use)}</dd>`
        //If I use a obj.xyz that doesn't exist a breaking error occurs...

        let senseTemplate = `<div>`

        senseTemplate += `<div>${kind}</div>`
        senseTemplate += `<div>${location}</div>`
        senseTemplate += `<div>${religiousTradition}</div>`
        senseTemplate += `<div>${gender}</div>`
        senseTemplate += `<div>${age}</div>`
        senseTemplate += `<div>${use}</div>`

        senseTemplate += `</div>`
        return senseTemplate
    } catch (err) {
        return null
    }
    return null
}

//Note we should handle this by name scope DEER urtils with DU_ or something ridiculous.  
window.onload = function(){MYDEER.UTILS.myFirst()}
