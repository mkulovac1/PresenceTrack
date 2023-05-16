// standardni modeli koji dolaze uz nodejs i express
const express = require('express')
const fs = require('fs');
const app = express() // kreiranje app
const bcrypt = require('bcrypt') // za hash
const session = require('express-session')

function azurirajPrisustvaZaPS(predmet, index, {sedmica, predavanja, vjezbe}) { // P - predmet, S - student
    // PRIMJENA RASPAKIVANJA NAD TRECIM ELEMENTOM U ZAGLAVLJU METODE, ovo je ustvari req.body, ali zbog lakseg razumijevanja koristeno je raspakivanje
    let prisustvaZaPredmet = JSON.parse(fs.readFileSync('data/prisustva.json')).find(podatak => podatak["predmet"] == predmet)

    // console.log("Prije:\n" + prisustvaZaPredmet)
    
    let postojiSedmica = false;
    for(let i = 0; i < prisustvaZaPredmet["prisustva"].length; i++) {
        if(prisustvaZaPredmet["prisustva"][i]["index"] == index && prisustvaZaPredmet["prisustva"][i]["sedmica"] == sedmica) {
            prisustvaZaPredmet["prisustva"][i]["predavanja"] = Number(predavanja)
            prisustvaZaPredmet["prisustva"][i]["vjezbe"] = Number(vjezbe)
            postojiSedmica = true;
        }
    } // lakse ovdje for nego foreach

    // console.log(postojiSedmica)

    if(!postojiSedmica) // ovo se koristi ukoliko prisustvo nije upisano za studenta za odredjenu sedmicu
        prisustvaZaPredmet["prisustva"].push({"sedmica":Number(sedmica), "predavanja":Number(predavanja), "vjezbe":Number(vjezbe), "index":Number(index)})

    // console.log("Poslije:\n" + prisustvaZaPredmet)

    const buffer = fs.readFileSync('data/prisustva.json')
    let prisustva = JSON.parse(buffer);

    prisustva[prisustva.findIndex(potrazi => potrazi["predmet"] == predmet)] = prisustvaZaPredmet // lista se mora azurirati u ukupnom fajlu tj jsonu
    fs.writeFileSync('data/prisustva.json', JSON.stringify(prisustva, null, 4)) // json se mora azurirati
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
    
    let nastavnici = JSON.parse(fs.readFileSync('data/nastavnici.json'))
    for(let i = 0; i < nastavnici.length; i++) {
        if(nastavnici[i]["nastavnik"]["username"] == login["username"]
        && bcrypt.compareSync(login["password"], nastavnici[i]["nastavnik"]["password_hash"])) {
            // ukoliko su podaci validni, kreira se sesija i nastavniku se prikazuje stranica predmeti.html
            req.session.data = Object() // kreiranje objekta sesije
            req.session.data["logged"] = true
            req.session.data["username"] = login["username"]
            req.session.data["predmeti"] = nastavnici[i]["predmeti"]
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
app.get('/predmeti', function(req, res) { //
    if(req.session.data && req.session.data["logged"]) {
        res.send(JSON.stringify(req.session.data["predmeti"]))
    }
    else {
        res.status(403).send(JSON.stringify({"greska":"Nastavnik nije loginovan"}))
    }
})
app.get('/predmet/:naziv', function(req, res) {
    if(req.session.data && req.session.data["logged"] && req.session.data.predmeti.includes(req.params.naziv)) {
        // pomocu params-a omogucavamo da imamo npr pristup "predmet/mlti ili predmet/rma" bez hardkod-a
        res.send(JSON.stringify(JSON.parse(fs.readFileSync('data/prisustva.json')).find(podatak => podatak["predmet"] == req.params.naziv)))
        // stringify pretvara u json objekat, json.parse pretvara json u string, fs.readFileSync cita json fajl, algoritamska f-ja find trazi niz podataka koji odgovara nazivu predmeta u request zahtjevu
    }
    else {
        res.status(403).send() // 403 - forbidden
    }
})

//PREDMETI I PRISUSTVO:
app.post('/prisustvo/predmet/:naziv/student/:index', function(req, res) {
    if(req.session.data && req.session.data["logged"] && req.session.data.predmeti.includes(req.params.naziv)) {
        // console.log(req.params.naziv)
        // console.log(req.params.index)
        // console.log(req.body) // provjera da li vraća dobro raspakovani body
        res.send(azurirajPrisustvaZaPS(req.params.naziv, req.params.index, req.body));
        // prema postavci spirale post ruta je {sedmica:N,predavanja:P,vjezbe:V} i to je req.body
        // zbog ovog oblika post rute koristeno je raspakivanje u metodi azurirajPrisustva
    }
    else {
        res.status(403).end()
    }
})

app.listen(3000) // prema postavci spirale server osluškuje na portu 3000