
import {DEER as MYDEER} from "../deer-lr-working/deer.js" 
//Note that deer.js contained deer-utils, deer-record and deer-render.  They are all a part of this DEER
//Note that deer.js fired initializeDeerViews(DEER) and initializeDeerForms(DEER)
import {default as MYUTILS} from "./utils.js" 
Object.assign(MYDEER.UTILS, MYUTILS); //Be careful, if your own utils have the same name as a DEER util it will be overwritten
//Note we should handle this by name scope DEER urtils with DU_ or something ridiculous.  
window.onload = function(){MYDEER.UTILS.myFirst()}
