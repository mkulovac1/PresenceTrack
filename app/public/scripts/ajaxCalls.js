const AjaxCalls = (()=>{

 
    
    function impl_getSubject(naziv,fnCallback){
        var xtr = new XMLHttpRequest() // ajax  
        xtr.onreadystatechange = function() {
            if(xtr.status == 200 && xtr.readyState == 4)
                fnCallback(true, JSON.parse(xtr.responseText))
            else if(xtr.readyState == 4)
                fnCallback(false, null)
        }
        xtr.open("GET", "subject/" + naziv, true)
        xtr.send()
    }

    
    function impl_getSubjects(fnCallback){
        var xtr = new XMLHttpRequest() 
        xtr.onreadystatechange = function() {
            if(xtr.status == 200 && xtr.readyState == 4)
                fnCallback(true, JSON.parse(xtr.responseText))
            else if(xtr.readyState == 4)
                fnCallback(false, null)
        }
        xtr.open("GET", "subjects", true) //
        xtr.send()
    }

    function impl_postLogin(username,password,fnCallback){
        var xtr = new XMLHttpRequest() 
        xtr.onreadystatechange = function() {
            if(xtr.status == 200 && xtr.readyState == 4) // 200: "OK", 4: request finished and response is ready
                fnCallback(true, JSON.parse(xtr.responseText))
            else if(xtr.readyState == 2) // 2: request received
                fnCallback(false, null)
        }
        xtr.open("POST", "login", true)
        xtr.setRequestHeader("Content-Type", "application/json;charset=UTF-8") // 
        xtr.send(JSON.stringify({"username":username,"password":password})) 
    }

    function impl_postLogout(fnCallback){
        var xtr = new XMLHttpRequest();
        xtr.onreadystatechange = function() {
            if(xtr.readyState == 4 && xtr.status == 200)
                fnCallback(true, xtr.responseText)
            else if(xtr.readyState == 4)
                fnCallback(false, null)
        }
        xtr.open("POST", "logout", true)
        xtr.send()
    }

    
    function impl_postPresence(name,index,presence,fnCallback){
        var xtr = new XMLHttpRequest() 
        xtr.onreadystatechange = function() {
            if(xtr.readyState == 4 && xtr.status == 200)
                fnCallback(true, JSON.parse(xtr.responseText))
            else if(xtr.readyState == 4)
                fnCallback(false, null)
        }
        xtr.open("POST", "/presence/subject/" + name + "/student/" + index, true)
        xtr.setRequestHeader("Content-Type", "application/json;charset=UTF-8") // 
        xtr.send(JSON.stringify(presence))
    }

    return{
        postLogin: impl_postLogin,
        postLogout: impl_postLogout,
        getSubject: impl_getSubject,
        getSubjects: impl_getSubjects,
        postPresence: impl_postPresence
    };
})();
