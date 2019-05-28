/**
 * Lived Religions
 * @author Bryan Haberberger <bryan.j.haberberger@slu.edu>
 *
 */

const LR = {}
LR.local = {}
LR.crud = {}
LR.err = {}
LR.tricks = {}
LR.ui = {}

/** Various LR error handlers */
LR.err.generic_error = function (msg){
    alert(msg)
}


LR.err.unhandled = function(error){
    console.log("There was an unhandled error when using fetch")
    console.log(error)
    throw Error(error)
    return error
}

LR.err.handleHTTPError = function(response){
    if (!response.ok){
        let status = response.status;
        switch(status){
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
        throw Error("HTTP Error: "+response.statusText)
    }
    return response
}
/** END Error handlers */

/**
 * 
 * @param {type} id
 * @return {unresolved}
 */
LR.tricks.resolveForJSON = async function(id){
    let j = {}
    if(id){
        await fetch(id)
            .then(LR.handleHTTPError)
            .then(resp => j = resp.json())
            .catch(error => LR.err.unhandled(error))
    }
    else{
        LR.err.generic_error("No id provided to resolve for JSON.  Make sure you have an id.")
    }
    return j
}

LR.tricks.getURLVariable = function (variable){
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            if(pair[0] == variable){return pair[1];}
    }
    return(false);
}

LR.tricks.replaceURLVariable = function (variable, value){
       var query = window.location.search.substring(1)
       var location = window.location.origin + window.location.pathname
       var vars = query.split("&");
       var variables = ""
       for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=")
        if(pair[0] == variable){
            var newVar = pair[0]+"="+value;
            vars[i] = newVar;
            break;
        }
       }
       variables = vars.toString()
       variables = variables.replace(/,/g, "&")
       return(location + "?"+variables)
}





/** LR -> RERUM proxy calls */

/**
 * Call to the LR proxy API into RERUM API to create this object in the data store
 * @param {type} obj
 * @return {JSON of the object created}
 */
LR.crud.create = async function (obj){
    let url = "create"
    let jsonReturn = {}
    await fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(obj) // body data type must match "Content-Type" header
    })
    .then(LR.handleHTTPError)
    .then(resp => jsonReturn = resp.json().new_obj_state)
    .catch(error => LR.err.unhandled(error))
    return jsonReturn
}

/**
 * Call to the LR proxy API into RERUM API to PUT update this object in the data store
 * Note this means the entire object will be represented under this new body.  
 * @param {type} obj
 * @return {JSON representing the new state of the object updated}
 */
LR.crud.putUpdate = async function (obj){
    let url = "update"
    let jsonReturn = {};
    await fetch(url, {
        method: "PUT", 
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(obj) // body data type must match "Content-Type" header
    })
    .then(LR.handleHTTPError)
    .then(resp => jsonReturn = resp.json().new_obj_state)
    .catch(error => LR.err.unhandled(error))
    return jsonReturn;
}

/**
 * Call to the LR proxy API into RERUM API to PATCH update this object in the data store
 * Note only keys that match keys in this body will be updated.  All other parts of the body
 * will be ignored.  
 * @param {type} obj
 * @return {JSON representing the new state of the object updated}
 */
LR.crud.patchUpdate = async function (obj){
    let url = "patch"
    let jsonReturn = {}
    await fetch(url, {
        method: "PATCH", 
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(obj) // body data type must match "Content-Type" header
    })
    .then(LR.handleHTTPError)
    .then(resp => jsonReturn = resp.json().new_obj_state)
    .catch(error => LR.err.unhandled(error))
    return jsonReturn
}

/**
 * Call to the LR proxy API into RERUM API to mark this object as deleted in RERUM.
 * @param {type} obj
 * @return {JSON representing the new state of the object updated}
 */
LR.crud.delete = async function (obj){
    let url = "delete"
    let jsonReturn = {};
    await fetch(url, {
        method: "DELETE", 
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(obj) // body data type must match "Content-Type" header
    })
    .then(LR.handleHTTPError)
    .then(resp => jsonReturn = resp.json())
    .catch(error => LR.err.unhandled(error))
    return jsonReturn
}

/**
 * Call to the LR proxy API into RERUM API to query for objecrts in the data store. 
 * Note all objects that have matching key:val pairs in the query will be returned,
 * including history.  
 * @param {type} obj
 * @return {JSON representing the new state of the object updated}
 */
LR.crud.query = async function (obj){
    let url = "query"
    let jsonReturn = {}
    await fetch(url, {
        method: "POST", 
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(obj) // body data type must match "Content-Type" header
    })
    .then(LR.handleHTTPError)
    .then(resp => jsonReturn = resp.json())
    .catch(error => LR.err.unhandled(error))
    return jsonReturn
}

LR.crud.createOrUpdate = async function(conversation){
    //A conversation will have Questions, Answers and ReplyActions that all need updating
    //Once complete, if there has been a create or update, the conversation needs created/updated. otherwise, do nothing. 
    let mustUpdateConvo = false
    let isnew = true
    let hasChanged = false
    let convo = JSON.parse(JSON.stringify(conversation))
    //we are just waiting for them all to complete, each one isn't waiting on the last. 
    for(item in convo.hasPart){
        let QAorRA = convo.hasPart[item]
        if(isnew){
            let createdObj = await LR.crud.create(QAorRA)
            convo.hasPart[item] = createObj.new_obj_state
            mustUpdateConvo = true
        }
        else{
            if(hasChanged){
                let updatedObj = await LR.crud.update(QAorRA)
                convo.hasPart[item] = updateObj.new_obj_state
                mustUpdateConvo = true
            }
        }
    }
    if(mustUpdateConvo){
        Promise.all(convo.hasPart).then(function(){
            let updatedConvo = await LR.crud.update(convo)
            convo = updatedConvo.new_obj_state    
        })
        
    }
    else{
        //There was no change or nothing happened or the convo was malformed or empty...
    }
    return convo
}


LR.ui.submitSurvey = async function(){
     //Question
    //Is a schema.org JSON-LD Question and/or AskAction
    let conversation - {};
    conversation = gatherMetadataAboutConversation()
    let questions = makeTheQuestions(); //Or we don't have to track these individually, maybe solely existing in a Reply Action directly is good nuff.
    let answers = makeTheAnswers(); //Or we don't have to track these individually, maybe solely existing in a Reply Action directly is good nuff.
    let qaSet = makeReplyActionsFrom(questions, answers)
    conversation.hasPart = qaSet;

    let a={
      "id":"http://example.org/Question1",
      "@context": "https://schema.org",
      "@type":"Question",
      "text":"Do you feel having the event at the Vatican made any extra impact?",
      "about/isPartOf":"http://example.org/Event1",
      "contentLocation":"http://example.org/Location1", //Although the Event would know this, it may make querying easier
      "author/creator":"http://example.org/Person1", //Perhaps the interviewer
      "contributor":"http://example.org/Person2", //Perhaps the interviewee
      "editor":"Some other person",
      "inLanguage":"en"
    }

    //Answer
    //Is a schema.org JSON-LD Answer or ReplyAction
    let b = {
      "id":"http://example.org/Answer1",
      "@context": "https://schema.org",
      "@type":"Answer",
      "text":"Being able to connect with the artifacts was really important for my experience.",
      "parentItem":"http://example.org/Question1",
      "about/isPartOf":"http://example.org/Event1",
      "contentLocation":"http://example.org/Location1", //Although the Event would know this, it may make querying easier
      "author/creator":"http://example.org/Person2", 
      "contributor":"http://example.org/Person1", //Perhaps the interviewee
      "editor":"Some other person",
      "inLanguage":"en"
    }

    //ReplyAction :: Aggregation technique
    //Patrick replies to Bryan's question during a survey about Religion in Place at the Vatican
    let c={
      "id":"http://example.org/QA01",
      "@context": "https://schema.org",
      "@type": "ReplyAction",
      "agent": {
        "@type": "Person",
        "id": "http://example.org/Person1"
      },
      "recipient": {
        "@type": "Person",
        "id": "http://example.org/Person2"
      },
      "resultComment": {
        "@type":"Answer",
        "id":"http://example.org/Answer1",
        "parentItem":{
           "@type":"Question",
           "id":"http://example.org/Question1",
           "text":"You can cheat and put the text content of the question here"
        }   
      },
      "text":"You can cheat and put the text content of the answer here"
    }

    //Is a Survey a https://schema.org/Conversation/ ?  I think that would be fair to say.  A conversation aggregates Comments like
    let d={
      "id":"http://example.org/Survey1",
      "@context": "https://schema.org/",
      "@type": "Conversation",
      "name": "Lived Religion First Event Survey",
       //Can I cheat and reference the people involved in Q/A without digging into 'hasPart' objs?
       //I am thinking of queries like "Give me conversation from Event1 involving Bryan"
      "hasPart/itemListElem":[ //If the conversation has all the metadata descriptors, then these can be super simple.  
           "http://example.org/Question1",
           "http://example.org/Answer1"
                  //OR
           "http://example.org/AskAction1",
           "http://example.org/ReplyAction1"
                //OR MAYBE
           "http://example.org/QA01",
           "http://example.org/QA02"
      ],
      "about/isPartOf":"http://example.org/Event1",
      "contentLocation":"http://example.org/Location1",
      "author":"http://example.org/Person1", //Perhaps the interviewer?
      "contributor":"http://example.org/Person2", //Perhaps the interviewee?
      "editor":"http://example.org/Person13321aee454",
      "inLanguage":"en"
    }

    let newConversation = await LR.crud.createOrUpdate(conversation)
    return newConversation 
}

LR.ui.loadUp = async function(event){
    let id = document.getElementById("iid_val").value
    if(typeof id !== "string" || "" === id){
        return false
    }
    let questions = document.getElementsByClassName("question")
    for(let elem=0; elem<questions.length; elem++){
        questions[elem].style.display = "block"
    }
    document.getElementById("interviewee").classList.remove("hidden")
    document.getElementById("noInterviewee").classList.add("hidden")
    document.getElementById("iid").setAttribute("my-id", id)
    // let forms = document.querySelectorAll("form[my-type]")
    // for(let form =0; form<forms.length; form++){
    //     forms[form].setAttribute("my-id", id)
    // }
    // let targets = document.querySelectorAll("input[my-key='target']")
    // for(let target =0; target<targets.length; target++){
    //     targets[target].setAttribute("value", id)
    // }
    return true
}





