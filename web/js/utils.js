
export default { 
	/**
		*	Get the id out of an object.  @id and id fields need to be considered.  
		*	@return the id or blank if not found
		*	@param obj some JSON-LD object
	 */
	getObjID:function(obj){
		let id = obj["@id"] ? obj["@id"] : obj.id ? obj.id : ""
		return id
	},

	resolveForJSON: async function(id){

	}


}

