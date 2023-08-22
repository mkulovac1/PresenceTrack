window.onload = function() {
    document.getElementById("logout").onclick = function() { 
        AjaxCalls.postLogout(function (status, data){
            if(status)
                window.location.replace("prijava.html")
            else
                alert("Unsuccessful logout!")
        })
    };
}


let meniDiv = document.getElementById("meniDiv")

function showTableToProfessor(data) {
    let presence = TabelaPrisustvo(document.getElementById("divSadrzaj"), data)
    if(presence) {
        window.nextWeek = presence.nextWeek
        window.previousWeek = presence.previousWeek
    }
}

window.changePresenceOnClick = changePresenceOnClick;

function changePresenceOnClick() {
    // f-ja, metoda koja omogucava nastavniku da klikom na celiju na raspakovanoj sedmici mijenja prisustvo studenta 
    document.querySelectorAll('.predavanja, .vjezbe').forEach(function(givenData) {
        givenData.onclick = function() {
            AjaxCalls.postPresence(givenData.dataset.subjectName, givenData.dataset.studentIndex, {"week": givenData.dataset.studentWeek,"lectures": givenData.dataset.studentLectures,"labs": givenData.dataset.studentLabs}, function(status, data) {
                console.log(givenData.dataset.subjectName + " " + givenData.dataset.studentIndex + " " + givenData.dataset.studentWeek + " " + givenData.dataset.studentLectures + " " + givenData.dataset.studentLabs)
                if(status) {
                    showTableToProfessor(data)
                }
                else {
                    alert("Data about presence for subject are not successfully updated!")
                }
            })
        }
    })
}


function setSubjectsOnClick() { 
    // f-ja, metoda koja omogucava da se iscrta tabela za kliknuti predmet, .predmet se nalazi u predmeti.html
    document.querySelectorAll('.predmet').forEach(function(givenData) {
        givenData.onclick = function() {
            AjaxCalls.getSubject(this.text, function(status, data) {
                if(status) {
                    showTableToProfessor(data)
                }
                else {
                    alert("Data about presence for subject are not successfully downloaded!")
                }
            })
        }
    })
}

meniDiv.innerHTML = ""

AjaxCalls.getSubjects(function(status, data) {
    if(status) {
        for(let i = 0; i < data.length; i++) {
            meniDiv.innerHTML += '<a href="#" class="predmet">' + data[i] + '</a>' // stavljamo nazive predmeta u meni horizontalno (ovo je opcionalno, moglo bi biti i vertiklano ispod jedno drugog)
        }
        setSubjectsOnClick() // ovim je omoguceno da se klikom na naziv predmeta (href) prikaze tabela za taj predmet
    }
    else {
        alert("Data from server are not in correct format!")
    }
})