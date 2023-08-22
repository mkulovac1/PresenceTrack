window.onload = function() {
    document.getElementById("logout").onclick = function() { 
        AjaxCalls.postLogout(function (status, data){
            if(status)
                window.location.replace("login.html")
            else
                alert("Unsuccessful logout!")
        })
    };
}


let meniDiv = document.getElementById("meniDiv")

function showTableToProfessor(data) {
    let presence = PresenceTable(document.getElementById("divSadrzaj"), data)
    if(presence) {
        window.nextWeek = presence.nextWeek
        window.previousWeek = presence.previousWeek
    }
}

window.changePresenceOnClick = changePresenceOnClick;

function changePresenceOnClick() {
    document.querySelectorAll('.predavanja, .vjezbe').forEach(function(givenData) {
        givenData.onclick = function() {
            AjaxCalls.postPresence(givenData.dataset.subjectName, givenData.dataset.studentIndex, {"week": givenData.dataset.studentWeek,"lectures": givenData.dataset.studentLectures,"labs": givenData.dataset.studentLabs}, function(status, data) {
                // console.log(givenData.dataset.subjectName + " " + givenData.dataset.studentIndex + " " + givenData.dataset.studentWeek + " " + givenData.dataset.studentLectures + " " + givenData.dataset.studentLabs)
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
            meniDiv.innerHTML += '<a href="#" class="predmet">' + data[i] + '</a>' 
        }
        setSubjectsOnClick() 
    }
    else {
        alert("Data from server are not in correct format!")
    }
})