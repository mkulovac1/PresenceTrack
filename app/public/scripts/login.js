window.onload = function() {
    document.getElementById("login").onclick = function() {
        AjaxCalls.postLogin(document.getElementById("username").value, document.getElementById("password").value, function(status, data) {
            if(status && data["message"] == "Login successful") 
                window.location.replace("subjects.html") 
            else
                alert("Error: " + data["message"])
        })
    }
}