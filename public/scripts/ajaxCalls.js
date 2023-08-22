const AjaxCalls = (()=>{

    // fnCallback u svim metodama se poziva kada stigne odgovor sa servera putem Ajax-a
    // svaki callback kao parametre ima error i data, error je null ako je status 200 i data je tijelo odgovora
    // ako postoji greška poruka se prosljeđuje u error parametar callback-a, a data je tada null
    
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

    // vraća listu predmeta za loginovanog nastavnika ili grešku da nastavnik nije loginovan
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
        var xtr = new XMLHttpRequest() // standardna deklaracija za ajax
        xtr.onreadystatechange = function() {
            if(xtr.status == 200 && xtr.readyState == 4) // 200: "OK", 4: request finished and response is ready
                fnCallback(true, JSON.parse(xtr.responseText))
            else if(xtr.readyState == 2) // 2: request received
                fnCallback(false, null)
        }
        xtr.open("POST", "login", true)
        xtr.setRequestHeader("Content-Type", "application/json;charset=UTF-8") // 
        xtr.send(JSON.stringify({"username":username,"password":password})) // slanje zahtjeva serveru preko ajax-a
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

    // prisustvo ima oblik {sedmica:N,predavanja:P,vjezbe:V}
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
