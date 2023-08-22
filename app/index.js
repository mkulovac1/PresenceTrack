const express = require('express')
const fs = require('fs');
const app = express() // kreiranje app
const bcrypt = require('bcrypt') // za hash
const session = require('express-session')

function updatePresence(subject, index, { week, lectures, labs }) { 
    let presenceForSubject = JSON.parse(fs.readFileSync('data/presences.json')).find(dataPresence => dataPresence["subject"] == subject)
    
    let weekExists = false;
    for(let i = 0; i < presenceForSubject["presences"].length; i++) {
        if(presenceForSubject["presences"][i]["index"] == index && presenceForSubject["presences"][i]["week"] == week) {
            presenceForSubject["presences"][i]["lectures"] = Number(lectures)
            presenceForSubject["presences"][i]["labs"] = Number(labs)
            weekExists = true;
        }
    } 

    // console.log(weekExists)

    if(!weekExists)
        presenceForSubject["presences"].push({"week":Number(week), "lectures":Number(lectures), "labs":Number(labs), "index":Number(index)})

    // console.log("Poslije:\n" + presenceForSubject)

    const buffer = fs.readFileSync('data/presences.json')
    let presence = JSON.parse(buffer);

    presence[presence.findIndex(findSubject => findSubject["subject"] == subject)] = presenceForSubject /
    fs.writeFileSync('data/presences.json', JSON.stringify(presence, null, 4)) 
    return presenceForSubject
}


app.use(express.static('public')) // middleware 

app.use(session({
    secret: 'sifraSesije?!',
    resave: true,
    saveUninitialized: true
    // cookie: {secure: true}
})) 

app.use(express.json()) 

// LOGIN:
app.post('/login', function(req, res) {
    let login = req.body; // {"username": username, "password": password}
    
    let professors = JSON.parse(fs.readFileSync('data/professors.json'))
    for(let i = 0; i < professors.length; i++) {
        if(professors[i]["professor"]["username"] == login["username"]
        && bcrypt.compareSync(login["password"], professors[i]["professor"]["password_hash"])) {
            req.session.data = Object() 
            req.session.data["logged"] = true
            req.session.data["username"] = login["username"]
            req.session.data["subjects"] = professors[i]["subjects"]
        }
    }

    if(req.session.data) {
        return res.send(JSON.stringify({"message": "Login successful"}))
    }
    else {
        res.status(400).send(JSON.stringify({"message": "Login unsuccessful"})) 
    }
})

// LOGOUT:
app.post('/logout', function(req, res) {
    req.session.destroy()
    res.send()
})


app.get('/subjects', function(req, res) { //
    if(req.session.data && req.session.data["logged"]) {
        res.send(JSON.stringify(req.session.data["subjects"]))
    }
    else {
        res.status(403).send(JSON.stringify({"error": "Professor is not logged in"}))
    }
})
app.get('/subject/:name', function(req, res) {
    if(req.session.data && req.session.data["logged"] && req.session.data.subjects.includes(req.params.name)) {
        res.send(JSON.stringify(JSON.parse(fs.readFileSync('data/presences.json')).find(dataPresence => dataPresence["subject"] == req.params.name)))
    }
    else {
        res.status(403).send() // 403 - forbidden
    }
})


app.post('/presence/subject/:name/student/:index', function(req, res) {
    if(req.session.data && req.session.data["logged"] && req.session.data.subjects.includes(req.params.name)) {
        res.send(updatePresence(req.params.name, req.params.index, req.body));
    }
    else {
        res.status(403).end()
    }
})

app.listen(3000) 