
import {DEER} from "../deer-lr-working/deer.js" 
//This will already contain 

export default { 
	myFirst:function(){
		console.log("Hello world");
		return "Hello World"
	},

	/**
		Get the id out of an object.  @id and id fields need to be considered.  
		return the id or blank if not found
	 */
	getObjID:function(obj){
		let id = obj["@id"] ? obj["@id"] : obj.id ? obj.id : ""
		return id
	}
}

