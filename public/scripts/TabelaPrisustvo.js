let TabelaPrisustvo = function (divRef, givenData) {
    //privatni atributi modula
    
    if(divRef == null || givenData == null) 
        return null;

    let uspjesnaValidacija = true;
    let postojiStudent = true;

    for(let i = 0; i < givenData["students"].length; i++) {
        for(let j = i + 1; j < givenData["students"].length; j++) {
            if(givenData["students"][i]["index"] == givenData["students"][j]["index"]) {
                uspjesnaValidacija = false;
                break;
            }
        }
    }

    if(givenData["presences"].length <= 0)
        uspjesnaValidacija = false;

    for(let i = 0; i < givenData["presences"].length; i++) {
            if(givenData["presences"][i]["lectures"] > givenData["numberOfLecturesPerWeek"] || givenData["presences"][i]["labs"] > givenData["numberOfLabsPerWeek"]) {
                uspjesnaValidacija = false;
                break;
            }

        if(givenData["presences"][i]["week"] <= 0 || givenData["presences"][i]["lectures"] < 0 || givenData["presences"][i]["labs"] < 0) {
            uspjesnaValidacija = false;
            break;
        }
    }

    // potrebno je naći početni redni broj sedmice i krajni redni broj sedmice jer prisustvo ne mora početi od 1. sedmice ?!
    let min = Math.min(...givenData["presences"].map(item => item.week));
    let max = Math.max(...givenData["presences"].map(item => item.week));

    
    for(let i = 0; i < givenData["presences"].length; i++) {
        for(let j = i + 1; j < givenData["presences"].length; j++) {
            if(givenData["presences"][i]["week"] == givenData["presences"][j]["week"] && givenData["presences"][i]["index"] == givenData["presences"][j]["index"]) {
                uspjesnaValidacija = false;
                break;
            }
        }
        if(!uspjesnaValidacija)
            break;
    }


    const indexiPredmeti1 = new Set();
    for(let i = 0; i < givenData["presences"].length; i++) {
        indexiPredmeti1.add(givenData["presences"][i]["index"]);
    }
    console.log(indexiPredmeti1)
    const indexiStudenti1 = new Set();
    for(let i = 0; i < givenData["students"].length; i++) {
        indexiStudenti1.add(givenData["students"][i]["index"]);
    }
    console.log(indexiStudenti1)
    if(indexiPredmeti1.size != indexiStudenti1.size)
        postojiStudent = false;
    

    // uslov 6 iz postavke spirale: Postoji sedmica, između dvije sedmice za koje je uneseno prisustvo bar jednom studentu, u kojoj nema unesenog prisustva. Npr. uneseno je prisustvo za sedmice 1 i 3 ali nijedan student nema prisustvo za sedmicu 2
    const sedmiceZaUslov = new Set([]);
    for(let i = 0; i < givenData["presences"].length; i++) {
        sedmiceZaUslov.add(givenData["presences"][i]["week"]);
    }
    for(let i = min; i <= max; i++) {
        if(!sedmiceZaUslov.has(i) && i > min && i < max) {
            var prije = i - 1;
            var poslije = i + 1;
            if(sedmiceZaUslov.has(prije) && sedmiceZaUslov.has(poslije)) {
                uspjesnaValidacija = false;
                break;
            }
        }
        if(!uspjesnaValidacija)
            break;
    }


    // ako neki uslov nije ispunjen:
    if(!uspjesnaValidacija || !postojiStudent) {
        divRef.innerHTML = "givenData o prisustvu nisu validni!"
        return null;
    }


    // potrebno je redne brojeve sedmica pretvoriti u RIMSKE BROJEVE (za to ćemo koristiti funkciju jer postoji više sedmica):
    function pretvoriURimskiBroj(broj) {
        var akronimi = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1}, rimskiBroj = '';
        for ( var i in akronimi) {
          while ( broj >= akronimi[i] ) {
            rimskiBroj += i;
            broj -= akronimi[i];
          }
        }
        return rimskiBroj;
    }

    function vratiIndexTrenutneSedmice(broj, sedmice) {
        for(let i = 0; i < sedmice.length; i++) {
            if(sedmice[i]["week"] == broj)
                return i;
        }
    }


    // bolje je napisati posebnu funkciju za ispis tabele jer će koristiti button za prethodnu i sljedeću sedmicu odnosno potrebno je omogućiti detaljan prikaz za sedmicu u zavisnosti koja je upitanju:
    function napraviTabeluPrisustvo(trenutnaSedmica) {
        // zastita ukoliko nesto postoji u divu:
        divRef.innerHTML = "";

        let noviHtmlKod = "";
        noviHtmlKod += '<h3> Predmet: ' + givenData["subject"] + '<br> Smjer: Računarstvo i informatika <br> <br>'; 

         // glavni red:
         noviHtmlKod += '<table id="tabela"> <tr> <th>Ime i prezime</th> <th>Index</th>';
         let x;
         for(x = min; x <= max; x++)
            if(x == trenutnaSedmica) {
                let s = parseInt(givenData["numberOfLecturesPerWeek"]) + parseInt(givenData["numberOfLabsPerWeek"]);
                noviHtmlKod += '<th colspan="' + s + '" class = "trenutnaSedmica">' + pretvoriURimskiBroj(x) + '</th>';
            }
            else
                noviHtmlKod += '<th>' + pretvoriURimskiBroj(x) + '</th>';
        noviHtmlKod += '<th class="neodrzaneSedmice">' + pretvoriURimskiBroj(x) + '-XV </th> </tr>'


        // sad se ubacuju givenData za svakog studenta odnosno red za svakog studenta:

            for(let i = 0; i < givenData["students"].length; i++) {
                
                noviHtmlKod += '<tr class="red"> <td rowspan="2">' + givenData["students"][i]["name"] + '</td> <td rowspan="2">' + givenData["students"][i]["index"] + '</td>';

                // sad je potrebno dodati prisustvo po sedmicama:
                const sedmicaPrisustvaZaStudenta = givenData["presences"].filter(prisustvo => {
                    return prisustvo.index == givenData["students"][i]["index"];
                })
                
                const sedmiceStudenta = [];
                for(let pozicija = 0; pozicija < sedmicaPrisustvaZaStudenta.length; pozicija++) {
                    sedmiceStudenta.push(sedmicaPrisustvaZaStudenta[pozicija]["week"]);
                }

                let nijeUnesenaSedmicaZaStudenta = false;
                if(!sedmiceStudenta.includes(trenutnaSedmica))
                    nijeUnesenaSedmicaZaStudenta = true;

                for(let j = 1; j <= max; j++) {
                    if(j != 0 && j == trenutnaSedmica) {
                        for(let k = 0; k < givenData["numberOfLecturesPerWeek"]; k++)
                            noviHtmlKod += '<td>P<br>' + (k + 1) + '</td>';
                        for(let k = 0; k < givenData["numberOfLabsPerWeek"]; k++)
                            noviHtmlKod += '<td>V<br>' + (k + 1) + '</td>';
                    }
                    else if(j != 0 && !sedmiceStudenta.includes(j)) {
                        noviHtmlKod += '<td rowspan="2">Nije <br> uneseno</td>';
                    }
                    else {
                        let postotakZaSedmicu = Math.round(((sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(j, sedmicaPrisustvaZaStudenta)]["lectures"] + sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(j, sedmicaPrisustvaZaStudenta)]["labs"]) / (givenData["numberOfLecturesPerWeek"] + givenData["numberOfLabsPerWeek"])) * 100);
                        noviHtmlKod += '<td rowspan="2">' + postotakZaSedmicu + '%</td>';
                    }
                }
                

            // kolone koje nisu prisutne trebaju se dodati i trebaju biti prazne:
            noviHtmlKod += '<td rowspan="2"></td> <tr class="red">';
            

            // stilizacija trenutneSedmice: Prvo popunite prisustvo (onoliko kvadrata koliko ima casova na kojima je student prisustvovao), a preostale kvadrate (ako ih ima) popunite kao odsustvo (piazza)
            for(let j = 1; j <= max; j++) {
                if(j == trenutnaSedmica && !nijeUnesenaSedmicaZaStudenta) {
                    for(let l = 0; l < givenData["numberOfLecturesPerWeek"]; l++) {
                        if(l < sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(trenutnaSedmica, sedmicaPrisustvaZaStudenta)]["lectures"]) /// losa pozicija indexa za trenutnusedmicu tj ne pristupa acnom dijelu
                        noviHtmlKod += '<td class="predavanja prisutan" data-subject-name="' + givenData["subject"] + '" data-student-index="' + givenData["students"][i]["index"] + '" data-student-week="' + trenutnaSedmica
                        + '" data-student-lectures="' + (Number(sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(trenutnaSedmica, sedmicaPrisustvaZaStudenta)]["lectures"]) - 1) +
                        '" data-student-labs="' + (sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(trenutnaSedmica, sedmicaPrisustvaZaStudenta)]["labs"]) + '"><br> </td>';
                        
                        // noviHtmlKod += '<td class="predavanja prisutan"> <br> </td>';
                        else
                            // noviHtmlKod += '<td class="predavanja odsutan"> <br> </td>';
                            noviHtmlKod += '<td class="predavanja odsutan" data-subject-name="' + givenData["subject"] + '" data-student-index="' + givenData["students"][i]["index"] + '" data-student-week="' + trenutnaSedmica
                            + '" data-student-lectures="' + (Number(sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(trenutnaSedmica, sedmicaPrisustvaZaStudenta)]["lectures"]) + 1) +
                            '" data-student-labs="' + (sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(trenutnaSedmica, sedmicaPrisustvaZaStudenta)]["labs"]) + '"><br> </td>';


                            // noviHtmlKod += '<td class="predavanja odsutan"> <br> </td>';
                    }
                }
                else if(j == trenutnaSedmica && nijeUnesenaSedmicaZaStudenta) {
                    for(let l = 0; l < givenData["numberOfLecturesPerWeek"]; l++)
                        noviHtmlKod += '<td class="predavanja nije-uneseno" data-subject-name="' + givenData["subject"] + '" data-student-index="' + givenData["students"][i]["index"] + '" data-student-week="' + trenutnaSedmica + '" data-student-lectures="' + 1 + 
                        '" data-student-labs="' + 0 + '"> <br> </td>';
                }
            }
            for(let j = 1; j <= max; j++) {
                if(j == trenutnaSedmica && !nijeUnesenaSedmicaZaStudenta) {
                    for(let l = 0; l < givenData["numberOfLabsPerWeek"]; l++) {
                        if(l < sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(trenutnaSedmica, sedmicaPrisustvaZaStudenta)]["labs"]) // ide trenutnaSedmica-1 jer je prva sedmica u sedmicaPrisutvaStudenta na indexu 0!
                            noviHtmlKod += '<td class="vjezbe prisutan" data-subject-name="' + givenData["subject"] + '" data-student-index="' + givenData["students"][i]["index"] + '" data-student-week="' + trenutnaSedmica
                            + '" data-student-lectures="' + (sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(trenutnaSedmica, sedmicaPrisustvaZaStudenta)]["lectures"]) +
                            '" data-student-labs="' + (Number(sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(trenutnaSedmica, sedmicaPrisustvaZaStudenta)]["labs"]) - 1) + '"><br> </td>';
                            
                        else
                            noviHtmlKod += '<td class="vjezbe odsutan" data-subject-name="' + givenData["subject"] + '" data-student-index="' + givenData["students"][i]["index"] + '" data-student-week="' + trenutnaSedmica
                            + '" data-student-lectures="' + (sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(trenutnaSedmica, sedmicaPrisustvaZaStudenta)]["lectures"]) +
                            '" data-student-labs="' + (Number(sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(trenutnaSedmica, sedmicaPrisustvaZaStudenta)]["labs"]) + 1) + '"><br> </td>';
                            
                            // noviHtmlKod += '<td class="vjezbe odsutan"> <br> </td>';
                    }
                }
                else if(j == trenutnaSedmica && nijeUnesenaSedmicaZaStudenta) {
                    for(let l = 0; l < givenData["numberOfLabsPerWeek"]; l++)
                        noviHtmlKod += '<td class="vjezbe nije-uneseno" data-subject-name="' + givenData["subject"] + '" data-student-index="' + givenData["students"][i]["index"] + '" data-student-week="' + trenutnaSedmica + '" data-student-lectures="' + 0 + 
                        '" data-student-labs="' + 1 + '"> <br> </td>';
                        // noviHtmlKod += '<td class="vjezbe nije-uneseno"> <br> </td>';
                }
            } 
            noviHtmlKod += '</tr>';
        }

        noviHtmlKod += '</table>'

        // dodavanje button-a:
        noviHtmlKod += '<button onclick="prethodnaSedmica()"> <i class="fa-solid fa-arrow-left" style="font-size:50px;"></i> </button> <button onclick="sljedecaSedmica()" style="margin: 10px;"> <i class="fa-solid fa-arrow-right" style="font-size:50px;"></i> </button>';
        divRef.innerHTML = noviHtmlKod;
        promjeniPrisustvoOnClick() // omogucujemo s ovim izmjenu prisustva
    }

    // po defaultu zadnja sedmica treba da bude trenutna odnosno detaljan prikaz za nju pa imamo:
    
    if(!window.trenutnaSedmica)
        window.trenutnaSedmica = max; //
    
    // let trenutnaSedmicaPrisustva = max;
    napraviTabeluPrisustvo(trenutnaSedmica);        
    
    //implementacija metoda
    let sljedecaSedmica = function () {
        if(trenutnaSedmica == max)
            return;
        trenutnaSedmica += 1;
        napraviTabeluPrisustvo(trenutnaSedmica);
    }
    
    let prethodnaSedmica = function () {
        if(trenutnaSedmica == min)
            return;
        trenutnaSedmica -= 1;
        napraviTabeluPrisustvo(trenutnaSedmica);
    }
    
    return {
        sljedecaSedmica: sljedecaSedmica,
        prethodnaSedmica: prethodnaSedmica
    }
};
