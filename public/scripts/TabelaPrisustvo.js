let TabelaPrisustvo = function (divRef, podaci) {
    //privatni atributi modula
    
    if(divRef == null || podaci == null) // osiguranje ako se proslijedi null i null u testovima
        return null;

    // najpametnije je odmah uraditi validaciju podataka:
    
    let uspjesnaValidacija = true;
    let postojiStudent = true;

    // postoje dva ili više studenata sa istim indexom u listi studenata
    // if(podaci["prisustva"].length !== new Set(podaci["prisustva"]).length)
    // uspjesnaValidacija = false;
    // uslov 4 iz postavke spirale
    for(let i = 0; i < podaci["studenti"].length; i++) {
        for(let j = i + 1; j < podaci["studenti"].length; j++) {
            if(podaci["studenti"][i]["index"] == podaci["studenti"][j]["index"]) {
                uspjesnaValidacija = false;
                break;
            }
        }
    }


    // broj prisustva je manji od nule, uslov 2 iz postavke spirale
    if(podaci["prisustva"].length <= 0)
        uspjesnaValidacija = false;

    for(let i = 0; i < podaci["prisustva"].length; i++) {
        // provjera da li je broj prisustva na predavanju/vježbi veći od broja predavanja/vježbi sedmično, uslov 1 iz postavke spirale
            if(podaci["prisustva"][i]["predavanja"] > podaci["brojPredavanjaSedmicno"] || podaci["prisustva"][i]["vjezbe"] > podaci["brojVjezbiSedmicno"]) {
                uspjesnaValidacija = false;
                break;
            }
        
        // sta ako je broj prisustva na predavanju/vježbi namjerno negativan - VALIDACIJA PADA!
        // sta ako je broj sedmice manji ili jednak 0? - VALIDACIJA PADA!
        if(podaci["prisustva"][i]["sedmica"] <= 0 || podaci["prisustva"][i]["predavanja"] < 0 || podaci["prisustva"][i]["vjezbe"] < 0) {
            uspjesnaValidacija = false;
            break;
        }
    }

    // potrebno je naći početni redni broj sedmice i krajni redni broj sedmice jer prisustvo ne mora početi od 1. sedmice ?!
    let min = Math.min(...podaci["prisustva"].map(item => item.sedmica));
    let max = Math.max(...podaci["prisustva"].map(item => item.sedmica));

    
    // Isti student ima dva ili više unosa prisustva za istu sedmicu, uslov 3 iz postavke spirale, OVO NIJE RADILO PA JE POPRAVLJENO SADA U SPIRALI 3
    /* let brojac = 0; // najlakse je prema maksu porediti jer svaki student mora imati prisustva <= max (trenutnoj sedmici tj. zadnjoj sedmici koja ima prisustvo)
    for(let i = 0; i < podaci["studenti"].length; i++) {
        brojac = 0;
        for(let j = 0; j < podaci["prisustva"].length; j++) {
            if(podaci["studenti"][i]["index"] == podaci["prisustva"][j]["index"])
                brojac++;
        }
        if(brojac > max) {
            uspjesnaValidacija = false;
            break;
        }
    } */
    for(let i = 0; i < podaci["prisustva"].length; i++) {
        for(let j = i + 1; j < podaci["prisustva"].length; j++) {
            if(podaci["prisustva"][i]["sedmica"] == podaci["prisustva"][j]["sedmica"] && podaci["prisustva"][i]["index"] == podaci["prisustva"][j]["index"]) {
                uspjesnaValidacija = false;
                break;
            }
        }
        if(!uspjesnaValidacija)
            break;
    }

    // izvlacimo indexe iz liste studenta i poredimo sa sedmicama prisustva, uslov 5 iz postavke spirale, OVO NIJE RADILO PA JE POPRAVLJENO SADA U SPIRALI 3
    /* const indexiStudenata = [];
    for(let i = 0; i < podaci["studenti"].length; i++) {
        indexiStudenata.push(podaci["studenti"][i]["index"]);
    }
    for(let i = 0; i < indexiStudenata.length; i++) {
        postojiStudent = false;
        for(let j = 0; j < podaci["prisustva"].length; j++) {
            if(indexiStudenata[i] == podaci["prisustva"][j]["index"]) {
                postojiStudent = true;
                break;
            }
        }
    } */
    const indexiPredmeti1 = new Set();
    for(let i = 0; i < podaci["prisustva"].length; i++) {
        indexiPredmeti1.add(podaci["prisustva"][i]["index"]);
    }
    console.log(indexiPredmeti1)
    const indexiStudenti1 = new Set();
    for(let i = 0; i < podaci["studenti"].length; i++) {
        indexiStudenti1.add(podaci["studenti"][i]["index"]);
    }
    console.log(indexiStudenti1)
    if(indexiPredmeti1.size != indexiStudenti1.size)
        postojiStudent = false;
    

    // uslov 6 iz postavke spirale: Postoji sedmica, između dvije sedmice za koje je uneseno prisustvo bar jednom studentu, u kojoj nema unesenog prisustva. Npr. uneseno je prisustvo za sedmice 1 i 3 ali nijedan student nema prisustvo za sedmicu 2
    const sedmiceZaUslov = new Set([]);
    for(let i = 0; i < podaci["prisustva"].length; i++) {
        sedmiceZaUslov.add(podaci["prisustva"][i]["sedmica"]);
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
        divRef.innerHTML = "Podaci o prisustvu nisu validni!"
        return null;
    }

    // ukoliko su svi uslovi ispunjeni onda se treba ispisati tabela:

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
            if(sedmice[i]["sedmica"] == broj)
                return i;
        }
    }


    // bolje je napisati posebnu funkciju za ispis tabele jer će koristiti button za prethodnu i sljedeću sedmicu odnosno potrebno je omogućiti detaljan prikaz za sedmicu u zavisnosti koja je upitanju:
    function napraviTabeluPrisustvo(trenutnaSedmica) {
        // zastita ukoliko nesto postoji u divu:
        divRef.innerHTML = "";

        let noviHtmlKod = "";
        noviHtmlKod += '<h3> Predmet: ' + podaci["predmet"] + '<br> Smjer: Računarstvo i informatika <br> <br>'; 

         // glavni red:
         noviHtmlKod += '<table id="tabela"> <tr> <th>Ime i prezime</th> <th>Index</th>';
         let x;
         for(x = min; x <= max; x++)
            if(x == trenutnaSedmica) {
                let s = parseInt(podaci["brojPredavanjaSedmicno"]) + parseInt(podaci["brojVjezbiSedmicno"]);
                noviHtmlKod += '<th colspan="' + s + '" class = "trenutnaSedmica">' + pretvoriURimskiBroj(x) + '</th>';
            }
            else
                noviHtmlKod += '<th>' + pretvoriURimskiBroj(x) + '</th>';
        noviHtmlKod += '<th class="neodrzaneSedmice">' + pretvoriURimskiBroj(x) + '-XV </th> </tr>'


        // sad se ubacuju podaci za svakog studenta odnosno red za svakog studenta:

            for(let i = 0; i < podaci["studenti"].length; i++) {
                
                noviHtmlKod += '<tr class="red"> <td rowspan="2">' + podaci["studenti"][i]["ime"] + '</td> <td rowspan="2">' + podaci["studenti"][i]["index"] + '</td>';
                
                /* let imeStudenta = podaci["studenti"][i]["ime"]
                let indeksStudneta = Number(podaci["studenti"][i]["index"])
                let nazivPredmeta = podaci["predmet"]
                let brojPredavanjaSedmicno = Number(podaci["brojPredavanjaSedminco"])
                let brojVjezbiSedmicno = Number(podaci["brojVjezbiSedmicno"]) */

                // sad je potrebno dodati prisustvo po sedmicama:
                const sedmicaPrisustvaZaStudenta = podaci["prisustva"].filter(prisustvo => {
                    return prisustvo.index == podaci["studenti"][i]["index"];
                })
                
                const sedmiceStudenta = [];
                for(let pozicija = 0; pozicija < sedmicaPrisustvaZaStudenta.length; pozicija++) {
                    sedmiceStudenta.push(sedmicaPrisustvaZaStudenta[pozicija]["sedmica"]);
                }

                let nijeUnesenaSedmicaZaStudenta = false;
                if(!sedmiceStudenta.includes(trenutnaSedmica))
                    nijeUnesenaSedmicaZaStudenta = true;

                for(let j = 1; j <= max; j++) {
                    if(j != 0 && j == trenutnaSedmica) {
                        for(let k = 0; k < podaci["brojPredavanjaSedmicno"]; k++)
                            noviHtmlKod += '<td>P<br>' + (k + 1) + '</td>';
                        for(let k = 0; k < podaci["brojVjezbiSedmicno"]; k++)
                            noviHtmlKod += '<td>V<br>' + (k + 1) + '</td>';
                    }
                    else if(j != 0 && !sedmiceStudenta.includes(j)) {
                        noviHtmlKod += '<td rowspan="2">Nije <br> uneseno</td>';
                    }
                    else {
                        /*let a = sedmicaPrisustvaZaStudenta[j]["predavanja"];
                        let b = sedmicaPrisustvaZaStudenta[j]["vjezbe"];
                        let c = podaci["brojPredavanjaSedmicno"];
                        let d = podaci["brojVjezbiSedmicno"];*/
                        let postotakZaSedmicu = Math.round(((sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(j, sedmicaPrisustvaZaStudenta)]["predavanja"] + sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(j, sedmicaPrisustvaZaStudenta)]["vjezbe"]) / (podaci["brojPredavanjaSedmicno"] + podaci["brojVjezbiSedmicno"])) * 100);
                        noviHtmlKod += '<td rowspan="2">' + postotakZaSedmicu + '%</td>';
                    }
                }
                

            // kolone koje nisu prisutne trebaju se dodati i trebaju biti prazne:
            noviHtmlKod += '<td rowspan="2"></td> <tr class="red">';
            

            // stilizacija trenutneSedmice: Prvo popunite prisustvo (onoliko kvadrata koliko ima casova na kojima je student prisustvovao), a preostale kvadrate (ako ih ima) popunite kao odsustvo (piazza)
            for(let j = 1; j <= max; j++) {
                if(j == trenutnaSedmica && !nijeUnesenaSedmicaZaStudenta) {
                    for(let l = 0; l < podaci["brojPredavanjaSedmicno"]; l++) {
                        if(l < sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(trenutnaSedmica, sedmicaPrisustvaZaStudenta)]["predavanja"]) /// losa pozicija indexa za trenutnusedmicu tj ne pristupa acnom dijelu
                        noviHtmlKod += '<td class="predavanja prisutan" data-predmet-ime="' + podaci["predmet"] + '" data-student-index="' + podaci["studenti"][i]["index"] + '" data-student-sedmica="' + trenutnaSedmica
                        + '" data-student-predavanja="' + (Number(sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(trenutnaSedmica, sedmicaPrisustvaZaStudenta)]["predavanja"]) - 1) +
                        '" data-student-vjezbe="' + (sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(trenutnaSedmica, sedmicaPrisustvaZaStudenta)]["vjezbe"]) + '"><br> </td>';
                        
                        // noviHtmlKod += '<td class="predavanja prisutan"> <br> </td>';
                        else
                            // noviHtmlKod += '<td class="predavanja odsutan"> <br> </td>';
                            noviHtmlKod += '<td class="predavanja odsutan" data-predmet-ime="' + podaci["predmet"] + '" data-student-index="' + podaci["studenti"][i]["index"] + '" data-student-sedmica="' + trenutnaSedmica
                            + '" data-student-predavanja="' + (Number(sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(trenutnaSedmica, sedmicaPrisustvaZaStudenta)]["predavanja"]) + 1) +
                            '" data-student-vjezbe="' + (sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(trenutnaSedmica, sedmicaPrisustvaZaStudenta)]["vjezbe"]) + '"><br> </td>';


                            // noviHtmlKod += '<td class="predavanja odsutan"> <br> </td>';
                    }
                }
                else if(j == trenutnaSedmica && nijeUnesenaSedmicaZaStudenta) {
                    for(let l = 0; l < podaci["brojPredavanjaSedmicno"]; l++)
                        /*noviHtmlKod += '<td class="predavanja nije-uneseno data-predmet-ime="' + podaci["predmet"] + '" data-student-index="' + podaci["studenti"][i]["index"] + '" data-student-sedmica="' + trenutnaSedmica
                        + '" data-student-predavanja="' + (+sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(trenutnaSedmica, sedmicaPrisustvaZaStudenta)]["predavanja"]) +
                        '" data-student-vjezbe="' + (sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(trenutnaSedmica, sedmicaPrisustvaZaStudenta)]["vjezbe"]) + '"> <br> </td>';*/
                        
                        noviHtmlKod += '<td class="predavanja nije-uneseno" data-predmet-ime="' + podaci["predmet"] + '" data-student-index="' + podaci["studenti"][i]["index"] + '" data-student-sedmica="' + trenutnaSedmica + '" data-student-predavanja="' + 1 + 
                        '" data-student-vjezbe="' + 0 + '"> <br> </td>';

                        // noviHtmlKod += '<td class="predavanja nije-uneseno"> <br> </td>';
                }
            }
            for(let j = 1; j <= max; j++) {
                if(j == trenutnaSedmica && !nijeUnesenaSedmicaZaStudenta) {
                    for(let l = 0; l < podaci["brojVjezbiSedmicno"]; l++) {
                        if(l < sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(trenutnaSedmica, sedmicaPrisustvaZaStudenta)]["vjezbe"]) // ide trenutnaSedmica-1 jer je prva sedmica u sedmicaPrisutvaStudenta na indexu 0!
                            noviHtmlKod += '<td class="vjezbe prisutan" data-predmet-ime="' + podaci["predmet"] + '" data-student-index="' + podaci["studenti"][i]["index"] + '" data-student-sedmica="' + trenutnaSedmica
                            + '" data-student-predavanja="' + (sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(trenutnaSedmica, sedmicaPrisustvaZaStudenta)]["predavanja"]) +
                            '" data-student-vjezbe="' + (Number(sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(trenutnaSedmica, sedmicaPrisustvaZaStudenta)]["vjezbe"]) - 1) + '"><br> </td>';
                            
                            // noviHtmlKod += '<td class="vjezbe prisutan"> <br> </td>';
                        else
                            noviHtmlKod += '<td class="vjezbe odsutan" data-predmet-ime="' + podaci["predmet"] + '" data-student-index="' + podaci["studenti"][i]["index"] + '" data-student-sedmica="' + trenutnaSedmica
                            + '" data-student-predavanja="' + (sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(trenutnaSedmica, sedmicaPrisustvaZaStudenta)]["predavanja"]) +
                            '" data-student-vjezbe="' + (Number(sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(trenutnaSedmica, sedmicaPrisustvaZaStudenta)]["vjezbe"]) + 1) + '"><br> </td>';
                            
                            // noviHtmlKod += '<td class="vjezbe odsutan"> <br> </td>';
                    }
                }
                else if(j == trenutnaSedmica && nijeUnesenaSedmicaZaStudenta) {
                    for(let l = 0; l < podaci["brojVjezbiSedmicno"]; l++)
                        /*noviHtmlKod += '<td class="vjezbe nije-uneseno data-predmet-ime="' + podaci["predmet"] + '" data-student-index="' + podaci["studenti"][i]["index"] + '" data-student-sedmica="' + trenutnaSedmica
                        + '" data-student-predavanja="' + (sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(trenutnaSedmica, sedmicaPrisustvaZaStudenta)]["predavanja"]) +
                        '" data-student-vjezbe="' + (+sedmicaPrisustvaZaStudenta[vratiIndexTrenutneSedmice(trenutnaSedmica, sedmicaPrisustvaZaStudenta)]["vjezbe"]) + '"> <br> </td>';*/
                        
                        noviHtmlKod += '<td class="vjezbe nije-uneseno" data-predmet-ime="' + podaci["predmet"] + '" data-student-index="' + podaci["studenti"][i]["index"] + '" data-student-sedmica="' + trenutnaSedmica + '" data-student-predavanja="' + 0 + 
                        '" data-student-vjezbe="' + 1 + '"> <br> </td>';
                        // noviHtmlKod += '<td class="vjezbe nije-uneseno"> <br> </td>';
                }
            } 
            noviHtmlKod += '</tr>';
        }

        noviHtmlKod += '</table>'

        // dodavanje button-a:
        // noviHtmlKod += '</table> <button class="button-prethodna-sedmica" onclick="prethodnaSedmica()"></button> <button class="button-sljedeca-sedmica" onclick="sljedecaSedmica()"></button>';
        noviHtmlKod += '<button onclick="prethodnaSedmica()"> <i class="fa-solid fa-arrow-left" style="font-size:50px;"></i> </button> <button onclick="sljedecaSedmica()" style="margin: 10px;"> <i class="fa-solid fa-arrow-right" style="font-size:50px;"></i> </button>';
        // var html = new DOMParser().parseFromString(noviHtmlKod, "text/html");
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
