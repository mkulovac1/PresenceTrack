window.onload = function() {
    document.getElementById("login").onclick = function() {
        AjaxCalls.postLogin(document.getElementById("username").value, document.getElementById("password").value, function(status, data) {
            if(status && data["poruka"] == "Uspješna prijava") //&& data["poruka"] == "Uspješna prijava!"
                window.location.replace("predmeti.html") // prema uputama spirale nakon login-a nastavnik se treba preusmjeriti na stranicu koja će prikazati meni sa predmetima na kojima je on predavač
            else
                alert("Greška: " + data["poruka"])
        }) // metoda koja je data već u spirali
    }
}