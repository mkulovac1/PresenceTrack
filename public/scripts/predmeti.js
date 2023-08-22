window.onload = function() {
    document.getElementById("logout").onclick = function() { 
        AjaxCalls.postLogout(function (status, data){
            if(status)
                window.location.replace("prijava.html")
            else
                alert("Neuspješan logout!")
        })
    };
}


let meniDiv = document.getElementById("meniDiv")

function prikaziTabeluNastavniku(data) {
    let prisustvo = TabelaPrisustvo(document.getElementById("divSadrzaj"), data)
    if(prisustvo) {
        window.sljedecaSedmica = prisustvo.sljedecaSedmica
        window.prethodnaSedmica = prisustvo.prethodnaSedmica
    }
}

window.promjeniPrisustvoOnClick = promjeniPrisustvoOnClick;

function promjeniPrisustvoOnClick() {
    // f-ja, metoda koja omogucava nastavniku da klikom na celiju na raspakovanoj sedmici mijenja prisustvo studenta 
    document.querySelectorAll('.predavanja, .vjezbe').forEach(function(givenData) {
        givenData.onclick = function() {
            AjaxCalls.postPresence(givenData.dataset.subjectName, givenData.dataset.studentIndex, {"week": givenData.dataset.studentWeek,"lectures": givenData.dataset.studentLectures,"labs": givenData.dataset.studentLabs}, function(status, data) {
                console.log(givenData.dataset.subjectName + " " + givenData.dataset.studentIndex + " " + givenData.dataset.studentWeek + " " + givenData.dataset.studentLectures + " " + givenData.dataset.studentLabs)
                if(status) {
                    prikaziTabeluNastavniku(data)
                }
                else {
                    alert("Podaci o prisustvu se ne mogu azurirati!")
                }
            })
        }
    })
}


function postaviOnClickPredmete() { 
    // f-ja, metoda koja omogucava da se iscrta tabela za kliknuti predmet, .predmet se nalazi u predmeti.html
    document.querySelectorAll('.predmet').forEach(function(givenData) {
        givenData.onclick = function() {
            AjaxCalls.getSubject(this.text, function(status, data) {
                if(status) {
                    prikaziTabeluNastavniku(data)
                }
                else {
                    alert("Podaci o prisustvu za predmet nisu uspjesno preuzeti!")
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
        postaviOnClickPredmete() // ovim je omoguceno da se klikom na naziv predmeta (href) prikaze tabela za taj predmet
    }
    else {
        alert("Podaci preuzeti sa servera nisu u validnom obliku!")
    }
})