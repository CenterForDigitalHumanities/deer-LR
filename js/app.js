
import {DEER as MYDEER} from "../deer-lr-working/deer.js" 
//Note that deer.js contained deer-utils, deer-record and deer-render.  They are all a part of this DEER
//Note that deer.js fired initializeDeerViews(DEER) and initializeDeerForms(DEER)
import {default as MYUTILS} from "./utils.js" 
Object.assign(MYDEER.UTILS, MYUTILS); //Be careful, if your own utils have the same name as a DEER util it will be overwritten
//Note we should handle this by name scope DEER urtils with DU_ or something ridiculous. 

//Add one of my own templates
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

//Overwrite the internal person template with a more robust one
MYDEER.TEMPLATES.person= function(obj, options={}) {
    console.log("person template")
    try {
        let tmpl = `<h2>${MYDEER.UTILS.getLabel(obj)}</h2>`
        let dob = `<lbl>Birth Date</lbl> <theval>${MYDEER.UTILS.getValue(obj.birthDate, [], "string")}</theval>`
     	let cod = `<lbl>Cause of Death</lbl> <theval>${MYDEER.UTILS.getValue(obj.causeOfDeath, [], "string")}</theval>`
      	let aad = `<lbl>Age at Death</lbl> <theval>${MYDEER.UTILS.getValue(obj.deathAge, [], "string")}</theval>`
       	let dod = `<lbl>Date of Death</lbl> <theval>${MYDEER.UTILS.getValue(obj.deathDeate, [], "number")}</theval>`
        let depiction = `<lbl>Photo</lbl> <theval>${MYDEER.UTILS.getValue(obj.depiction, [], "string")}</theval>`
     	let familyName = `<lbl>Family Name</lbl> <theval>${MYDEER.UTILS.getValue(obj.familyName, [], "string")}</theval>`
      	let givenName = `<lbl>Given Name</lbl> <theval>${MYDEER.UTILS.getValue(obj.givenName, [], "string")}</theval>`
        let gender = `<lbl>Gender</lbl> <theval>${MYDEER.UTILS.getValue(obj.gender, [], "string")}</theval>`
        let url = `<lbl>Identity Link</lbl> <theval>http://cemetery.rerum.io/mcelwee/annotationPage.html${MYDEER.UTILS.getValue(obj.myURL, [], "string")}</theval>`
        tmpl += (depiction+dob+dod+aad+cod+familyName+givenName+gender+url)
        return tmpl
    } catch (err) {
        return null
    }

}

