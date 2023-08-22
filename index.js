// standardni modeli koji dolaze uz nodejs i express
const express = require('express')
const fs = require('fs');
const app = express() // kreiranje app
const bcrypt = require('bcrypt') // za hash
const session = require('express-session')

function azurirajPrisustvaZaPS(subject, index, { week, lectures, labs }) { // P - predmet, S - student
    // PRIMJENA RASPAKIVANJA NAD TRECIM ELEMENTOM U ZAGLAVLJU METODE, ovo je ustvari req.body, ali zbog lakseg razumijevanja koristeno je raspakivanje
    let prisustvaZaPredmet = JSON.parse(fs.readFileSync('data/presences.json')).find(podatak => podatak["subject"] == subject)

    // console.log("Prije:\n" + prisustvaZaPredmet)
    
    let postojiSedmica = false;
    for(let i = 0; i < prisustvaZaPredmet["presences"].length; i++) {
        if(prisustvaZaPredmet["presences"][i]["index"] == index && prisustvaZaPredmet["presences"][i]["week"] == week) {
            prisustvaZaPredmet["presences"][i]["lectures"] = Number(lectures)
            prisustvaZaPredmet["presences"][i]["labs"] = Number(labs)
            postojiSedmica = true;
        }
    } // lakse ovdje for nego foreach

    // console.log(postojiSedmica)

    if(!postojiSedmica) // ovo se koristi ukoliko prisustvo nije upisano za studenta za odredjenu sedmicu
        prisustvaZaPredmet["presences"].push({"week":Number(week), "lectures":Number(lectures), "labs":Number(labs), "index":Number(index)})

    // console.log("Poslije:\n" + prisustvaZaPredmet)

    const buffer = fs.readFileSync('data/presences.json')
    let prisustva = JSON.parse(buffer);

    prisustva[prisustva.findIndex(potrazi => potrazi["subject"] == subject)] = prisustvaZaPredmet // lista se mora azurirati u ukupnom fajlu tj jsonu
    fs.writeFileSync('data/presences.json', JSON.stringify(prisustva, null, 4)) // json se mora azurirati
    return prisustvaZaPredmet
}

// PUTANJA: http://localhost:3000/nazivStranice.html
// server osluskuje na portu 3000 prema postavci spirale

app.use(express.static('public')) // middleware metode

app.use(session({
    secret: 'sifraSesije?!',
    resave: true,
    saveUninitialized: true
    // cookie: {secure: true}
})) // potrebno za uspostavljanje sesije

app.use(express.json()) // middleware f-ja koja se koristi za lakse manipulisanje json-om

// LOGIN:
app.post('/login', function(req, res) {
    let login = req.body; // u obliku {"username": username, "password": password}
    
    let nastavnici = JSON.parse(fs.readFileSync('data/professors.json'))
    for(let i = 0; i < nastavnici.length; i++) {
        if(nastavnici[i]["professor"]["username"] == login["username"]
        && bcrypt.compareSync(login["password"], nastavnici[i]["professor"]["password_hash"])) {
            // ukoliko su podaci validni, kreira se sesija i nastavniku se prikazuje stranica predmeti.html
            req.session.data = Object() // kreiranje objekta sesije
            req.session.data["logged"] = true
            req.session.data["username"] = login["username"]
            req.session.data["subjects"] = nastavnici[i]["subjects"]
        }
    }

    // mora se vratiti poruka o logovanju - prema postavci spirale oblik ovakav:
    if(req.session.data) {
        return res.send(JSON.stringify({"poruka":"Uspješna prijava"}))
    }
    else {
        res.status(400).send(JSON.stringify({"poruka":"Neuspješna prijava"})) // ili je 401 kod?!
    }
})

// LOGOUT:
app.post('/logout', function(req, res) {
    // u spirali 3 je receno da se prilikom logout-a brise sesija:
    req.session.destroy()
    res.send()
})

// NASTAVNIK:
app.get('/subjects', function(req, res) { //
    if(req.session.data && req.session.data["logged"]) {
        res.send(JSON.stringify(req.session.data["subjects"]))
    }
    else {
        res.status(403).send(JSON.stringify({"greska":"Nastavnik nije loginovan"}))
    }
})
app.get('/subject/:name', function(req, res) {
    if(req.session.data && req.session.data["logged"] && req.session.data.subjects.includes(req.params.name)) {
        res.send(JSON.stringify(JSON.parse(fs.readFileSync('data/presences.json')).find(podatak => podatak["subject"] == req.params.name)))
    }
    else {
        res.status(403).send() // 403 - forbidden
    }
})

//subjects I PRISUSTVO:
app.post('/presence/subject/:name/student/:index', function(req, res) {
    if(req.session.data && req.session.data["logged"] && req.session.data.subjects.includes(req.params.name)) {
        res.send(azurirajPrisustvaZaPS(req.params.name, req.params.index, req.body));
    }
    else {
        res.status(403).end()
    }
})

app.listen(3000) // prema postavci spirale server osluškuje na portu 3000