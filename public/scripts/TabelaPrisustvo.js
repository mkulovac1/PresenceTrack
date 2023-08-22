let TabelaPrisustvo = function (divRef, givenData) {
    //privatni atributi modula
    
    if(divRef == null || givenData == null) 
        return null;

    let successfulValidation = true;
    let studentExists = true;

    for(let i = 0; i < givenData["students"].length; i++) {
        for(let j = i + 1; j < givenData["students"].length; j++) {
            if(givenData["students"][i]["index"] == givenData["students"][j]["index"]) {
                successfulValidation = false;
                break;
            }
        }
    }

    if(givenData["presences"].length <= 0)
        successfulValidation = false;

    for(let i = 0; i < givenData["presences"].length; i++) {
            if(givenData["presences"][i]["lectures"] > givenData["numberOfLecturesPerWeek"] || givenData["presences"][i]["labs"] > givenData["numberOfLabsPerWeek"]) {
                successfulValidation = false;
                break;
            }

        if(givenData["presences"][i]["week"] <= 0 || givenData["presences"][i]["lectures"] < 0 || givenData["presences"][i]["labs"] < 0) {
            successfulValidation = false;
            break;
        }
    }

    // potrebno je naći početni redni number sedmice i krajni redni number sedmice jer prisustvo ne mora početi od 1. sedmice ?!
    let min = Math.min(...givenData["presences"].map(item => item.week));
    let max = Math.max(...givenData["presences"].map(item => item.week));

    
    for(let i = 0; i < givenData["presences"].length; i++) {
        for(let j = i + 1; j < givenData["presences"].length; j++) {
            if(givenData["presences"][i]["week"] == givenData["presences"][j]["week"] && givenData["presences"][i]["index"] == givenData["presences"][j]["index"]) {
                successfulValidation = false;
                break;
            }
        }
        if(!successfulValidation)
            break;
    }


    const indexesSubjectsNew = new Set();
    for(let i = 0; i < givenData["presences"].length; i++) {
        indexesSubjectsNew.add(givenData["presences"][i]["index"]);
    }
    // console.log(indexesSubjectsNew)
    const indexesStudentsNew = new Set();
    for(let i = 0; i < givenData["students"].length; i++) {
        indexesStudentsNew.add(givenData["students"][i]["index"]);
    }
    // console.log(indexesStudentsNew)
    if(indexesSubjectsNew.size != indexesStudentsNew.size)
        studentExists = false;
    

    // uslov 6 iz postavke spirale: Postoji sedmica, između dvije sedmice za koje je uneseno prisustvo bar jednom studentu, u kojoj nema unesenog prisustva. Npr. uneseno je prisustvo za sedmice 1 i 3 ali nijedan student nema prisustvo za sedmicu 2
    const weeksForCondition = new Set([]);
    for(let i = 0; i < givenData["presences"].length; i++) {
        weeksForCondition.add(givenData["presences"][i]["week"]);
    }
    for(let i = min; i <= max; i++) {
        if(!weeksForCondition.has(i) && i > min && i < max) {
            var beforeWeek = i - 1;
            var afterWeek = i + 1;
            if(weeksForCondition.has(beforeWeek) && weeksForCondition.has(afterWeek)) {
                successfulValidation = false;
                break;
            }
        }
        if(!successfulValidation)
            break;
    }


    // ako neki uslov nije ispunjen:
    if(!successfulValidation || !studentExists) {
        divRef.innerHTML = "givenData o prisustvu nisu validni!"
        return null;
    }


    // potrebno je redne numbereve sedmica pretvoriti u RIMSKE numberEVE (za to ćemo koristiti funkciju jer postoji više sedmica):
    function convertInRomanNumber(number) {
        var acronyms = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1}, romanNumber = '';
        for ( var i in acronyms) {
          while ( number >= acronyms[i] ) {
            romanNumber += i;
            number -= acronyms[i];
          }
        }
        return romanNumber;
    }

    function getCurrentWeekIndex(number, sedmice) {
        for(let i = 0; i < sedmice.length; i++) {
            if(sedmice[i]["week"] == number)
                return i;
        }
    }


    // bolje je napisati posebnu funkciju za ispis tabele jer će koristiti button za prethodnu i sljedeću sedmicu odnosno potrebno je omogućiti detaljan prikaz za sedmicu u zavisnosti koja je upitanju:
    function makePresenceTable(currentWeek) {
        // zastita ukoliko nesto postoji u divu:
        divRef.innerHTML = "";

        let newHtmlCode = "";
        newHtmlCode += '<h3> Subject: ' + givenData["subject"] + '<br> Department: Computer Science and Informatics <br> <br>'; 

         // glavni red:
         newHtmlCode += '<table id="tabela"> <tr> <th> Name </th> <th>Index</th>';
         let x;
         for(x = min; x <= max; x++)
            if(x == currentWeek) {
                let s = parseInt(givenData["numberOfLecturesPerWeek"]) + parseInt(givenData["numberOfLabsPerWeek"]);
                newHtmlCode += '<th colspan="' + s + '" class = "currentWeek">' + convertInRomanNumber(x) + '</th>';
            }
            else
                newHtmlCode += '<th>' + convertInRomanNumber(x) + '</th>';
        
                newHtmlCode += '<th class="neodrzaneSedmice">' + convertInRomanNumber(x) + '-XV </th> </tr>'



            for(let i = 0; i < givenData["students"].length; i++) {
                
                newHtmlCode += '<tr class="red"> <td rowspan="2">' + givenData["students"][i]["name"] + '</td> <td rowspan="2">' + givenData["students"][i]["index"] + '</td>';

                const presenceWeekForStudent = givenData["presences"].filter(presenceWeek => {
                    return presenceWeek.index == givenData["students"][i]["index"];
                })
                
                const studentWeeks = [];
                for(let position = 0; position < presenceWeekForStudent.length; position++) {
                    studentWeeks.push(presenceWeekForStudent[position]["week"]);
                }

                let notEnteredWeekForStudenta = false;
                if(!studentWeeks.includes(currentWeek))
                    notEnteredWeekForStudenta = true;

                for(let j = 1; j <= max; j++) {
                    if(j != 0 && j == currentWeek) {
                        for(let k = 0; k < givenData["numberOfLecturesPerWeek"]; k++)
                            newHtmlCode += '<td>P<br>' + (k + 1) + '</td>';
                        for(let k = 0; k < givenData["numberOfLabsPerWeek"]; k++)
                            newHtmlCode += '<td>V<br>' + (k + 1) + '</td>';
                    }
                    else if(j != 0 && !studentWeeks.includes(j)) {
                        newHtmlCode += '<td rowspan="2">Nije <br> uneseno</td>';
                    }
                    else {
                        let percentageForWeek = Math.round(((presenceWeekForStudent[getCurrentWeekIndex(j, presenceWeekForStudent)]["lectures"] + presenceWeekForStudent[getCurrentWeekIndex(j, presenceWeekForStudent)]["labs"]) / (givenData["numberOfLecturesPerWeek"] + givenData["numberOfLabsPerWeek"])) * 100);
                        newHtmlCode += '<td rowspan="2">' + percentageForWeek + '%</td>';
                    }
                }
                

            // kolone koje nisu prisutne trebaju se dodati i trebaju biti prazne:
            newHtmlCode += '<td rowspan="2"></td> <tr class="red">';
            

            // stilizacija trenutneSedmice: Prvo popunite prisustvo (onoliko kvadrata koliko ima casova na kojima je student prisustvovao), a preostale kvadrate (ako ih ima) popunite kao odsustvo (piazza)
            for(let j = 1; j <= max; j++) {
                if(j == currentWeek && !notEnteredWeekForStudenta) {
                    for(let l = 0; l < givenData["numberOfLecturesPerWeek"]; l++) {
                        if(l < presenceWeekForStudent[getCurrentWeekIndex(currentWeek, presenceWeekForStudent)]["lectures"]) /// losa position indexa za trenutnusedmicu tj ne pristupa acnom dijelu
                        newHtmlCode += '<td class="predavanja prisutan" data-subject-name="' + givenData["subject"] + '" data-student-index="' + givenData["students"][i]["index"] + '" data-student-week="' + currentWeek
                        + '" data-student-lectures="' + (Number(presenceWeekForStudent[getCurrentWeekIndex(currentWeek, presenceWeekForStudent)]["lectures"]) - 1) +
                        '" data-student-labs="' + (presenceWeekForStudent[getCurrentWeekIndex(currentWeek, presenceWeekForStudent)]["labs"]) + '"><br> </td>';
                        
                        // newHtmlCode += '<td class="predavanja prisutan"> <br> </td>';
                        else
                            // newHtmlCode += '<td class="predavanja odsutan"> <br> </td>';
                            newHtmlCode += '<td class="predavanja odsutan" data-subject-name="' + givenData["subject"] + '" data-student-index="' + givenData["students"][i]["index"] + '" data-student-week="' + currentWeek
                            + '" data-student-lectures="' + (Number(presenceWeekForStudent[getCurrentWeekIndex(currentWeek, presenceWeekForStudent)]["lectures"]) + 1) +
                            '" data-student-labs="' + (presenceWeekForStudent[getCurrentWeekIndex(currentWeek, presenceWeekForStudent)]["labs"]) + '"><br> </td>';


                            // newHtmlCode += '<td class="predavanja odsutan"> <br> </td>';
                    }
                }
                else if(j == currentWeek && notEnteredWeekForStudenta) {
                    for(let l = 0; l < givenData["numberOfLecturesPerWeek"]; l++)
                        newHtmlCode += '<td class="predavanja nije-uneseno" data-subject-name="' + givenData["subject"] + '" data-student-index="' + givenData["students"][i]["index"] + '" data-student-week="' + currentWeek + '" data-student-lectures="' + 1 + 
                        '" data-student-labs="' + 0 + '"> <br> </td>';
                }
            }
            for(let j = 1; j <= max; j++) {
                if(j == currentWeek && !notEnteredWeekForStudenta) {
                    for(let l = 0; l < givenData["numberOfLabsPerWeek"]; l++) {
                        if(l < presenceWeekForStudent[getCurrentWeekIndex(currentWeek, presenceWeekForStudent)]["labs"]) // ide currentWeek-1 jer je prva sedmica u sedmicaPrisutvaStudenta na indexu 0!
                            newHtmlCode += '<td class="vjezbe prisutan" data-subject-name="' + givenData["subject"] + '" data-student-index="' + givenData["students"][i]["index"] + '" data-student-week="' + currentWeek
                            + '" data-student-lectures="' + (presenceWeekForStudent[getCurrentWeekIndex(currentWeek, presenceWeekForStudent)]["lectures"]) +
                            '" data-student-labs="' + (Number(presenceWeekForStudent[getCurrentWeekIndex(currentWeek, presenceWeekForStudent)]["labs"]) - 1) + '"><br> </td>';
                            
                        else
                            newHtmlCode += '<td class="vjezbe odsutan" data-subject-name="' + givenData["subject"] + '" data-student-index="' + givenData["students"][i]["index"] + '" data-student-week="' + currentWeek
                            + '" data-student-lectures="' + (presenceWeekForStudent[getCurrentWeekIndex(currentWeek, presenceWeekForStudent)]["lectures"]) +
                            '" data-student-labs="' + (Number(presenceWeekForStudent[getCurrentWeekIndex(currentWeek, presenceWeekForStudent)]["labs"]) + 1) + '"><br> </td>';
                            
                            // newHtmlCode += '<td class="vjezbe odsutan"> <br> </td>';
                    }
                }
                else if(j == currentWeek && notEnteredWeekForStudenta) {
                    for(let l = 0; l < givenData["numberOfLabsPerWeek"]; l++)
                        newHtmlCode += '<td class="vjezbe nije-uneseno" data-subject-name="' + givenData["subject"] + '" data-student-index="' + givenData["students"][i]["index"] + '" data-student-week="' + currentWeek + '" data-student-lectures="' + 0 + 
                        '" data-student-labs="' + 1 + '"> <br> </td>';
                        // newHtmlCode += '<td class="vjezbe nije-uneseno"> <br> </td>';
                }
            } 
            newHtmlCode += '</tr>';
        }

        newHtmlCode += '</table>'

        // dodavanje button-a:
        newHtmlCode += '<button onclick="previousWeek()"> <i class="fa-solid fa-arrow-left" style="font-size:50px;"></i> </button> <button onclick="nextWeek()" style="margin: 10px;"> <i class="fa-solid fa-arrow-right" style="font-size:50px;"></i> </button>';
        divRef.innerHTML = newHtmlCode;
        changePresenceOnClick() // omogucujemo s ovim izmjenu prisustva
    }

    // po defaultu zadnja sedmica treba da bude trenutna odnosno detaljan prikaz za nju pa imamo:
    
    if(!window.currentWeek)
        window.currentWeek = max; //
    
    // let currentWeekPrisustva = max;
    makePresenceTable(currentWeek);        
    
    //implementacija metoda
    let nextWeek = function () {
        if(currentWeek == max)
            return;
        currentWeek += 1;
        makePresenceTable(currentWeek);
    }
    
    let previousWeek = function () {
        if(currentWeek == min)
            return;
        currentWeek -= 1;
        makePresenceTable(currentWeek);
    }
    
    return {
        nextWeek: nextWeek,
        previousWeek: previousWeek
    }
};
