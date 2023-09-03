// Je cible la div dans laquelle je veux afficher mes codes traitement
const container = document.querySelector('#codeTraitement');

// Je cible le container du menu déroulant de lots
const lotContainer = document.querySelector('.lotContainer');

// Je cible la div dans laquelle se trouve la liste des lots
const selectionLot = document.querySelector('#lot-select');


// Je commence par créer la 1ère li de la liste pour choisir un code traitement
let optionSelection = document.createElement('li');
optionSelection.classList.add('options');
optionSelection.textContent = "Choisir un code traitement";
optionSelection.style.display = "list-item";
selectionLot.append(optionSelection);

let codeTrClicked;
let offset = 0;
// Je crée creerListeDejaAppelee pour vérifier si la fonction creetListe a déjà été appelée ou non. Je crée également chargementEnCours pour contrôler si des lots sont déjà chargés ou non
let creerListeDejaAppelee = false;
let chargementEnCours = false;


const effacerListe = () => {
    selectionLot.innerHTML = '';
    optionSelection.style.backgroundColor = 'rgba(212, 247, 231, 0.7)';
    creerListeDejaAppelee = false;
    chargementEnCours = false;
    Object.assign(lotContainer.style, {
        height: "auto",
        zIndex: 50,
        border: "none",
        padding: 0
    });
};


// Je récupère grâce un appel fetch les codes traitement
const recuperationCodesTraitement = async () => {
	const dataResponse = await fetch("http://localhost:3000/visualisation/traitements");
	const data = await dataResponse.json();

	return data;
}
recuperationCodesTraitement();


// Je crée une fonction pour afficher les codes traitement
const afficherCodesEtLots = async () => {
	const data = await recuperationCodesTraitement();

	// Pour chaque code traitement, je crée une balise <p> qui contient le nom du code
	data.map((code) => {
		const p = document.createElement('p');
		p.classList.add('ListeCodeTraitement');
		p.textContent = code.codeTraitement;
		container.append(p);

		// Au clic sur un code de traitement, je stocke son nom dans le localStorage
		p.addEventListener('click', (e) => {

            // Empêcher l'exécution de requête si requête déjà en cours et qu'on change de code traitement
            if (chargementEnCours) {
                return;
            }

            effacerListe();

			codeTrClicked = e.target.innerText;
			localStorage.setItem('codeTraitementCliqueVJC', codeTrClicked);

            // j'ajoute une class highlight sur l'élèment cliqué
            const element = e.target;
            element.classList.add("highlight");
            const listeTraitement = document.querySelectorAll(".ListeCodeTraitement");

            // je réalise une bouble sur mes <p> qui ont la classe ListeCodeTraitement et j'utilise remove pour supprimer la class highlight de tous les éléments non cliqués
            listeTraitement.forEach(item => {
                if (item != element) {
                    item.classList.remove("highlight");
                }
            });

            // Je modifie la 1ère li de la liste pour indiquer "Choisir un lot" + je rajoute la flèche d'indication
            optionSelection.textContent = "Choisir un lot";
            optionSelection.style.display = "list-item";
            Object.assign(optionSelection.style, {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            })
            const fleche = document.createElement('img');
            fleche.setAttribute('src', '../images/arrow-left.png');
            optionSelection.append(fleche);
            selectionLot.append(optionSelection);
        });

    });
};

afficherCodesEtLots();


// Fonction pour créer la liste des options
const creerListe = async () => {

    await fetch("http://localhost:3000/visualisation/afficher-lots", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            codeTraitement: codeTrClicked,
            offset: offset
        })
    })
    .then(response => response.json())
    .then(result => {
    
        const lotsData = Object.values(result.dataLots);

        // Tri des lots de manière décroissante en fonction de numImportSource
        lotsData.sort((a, b) => b.lots.numImportSource - a.lots.numImportSource);
        
        for (let lot of lotsData) {
            let numImportSource = lot.lots.numImportSource;
            let dateImport = lot.lots.dateImport;
            let dateXRT;
            let exportPartTotal = lot.lots.exportPartTotal;
            let dateExport = lot.dateExport;
            let exportPartiel = lot.exportPartiel;

            // Format dateImport
            const year = dateImport.slice(0, 4);
            const month = dateImport.slice(4, 6) - 1;
            const day = dateImport.slice(6, 8);
            const dateImportObj = new Date(year, month, day);
            const formattedDateImport = dateImportObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric', year: 'numeric' });

            // Format dateXRT
            let formattedDateXRT="";

            if (lot.lots.dateXRT.length === 0) {  
                dateXRT ="";
            } else {
                dateXRT = lot.lots.dateXRT
                const dateXRTObj = new Date(dateXRT);
                formattedDateXRT = dateXRTObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric', year: 'numeric' });
            };

            // Format dateExport
            const dateString = dateExport;
            const dateParts = dateString.split(' ');
            const date = dateParts[0];
            const jour = date.substr(6, 2);
            const mois = date.substr(4, 2);
            const annee = date.substr(0, 4);
            const formattedDateExport = [jour, mois, annee].join('/');

            Object.assign(lotContainer.style, {
                height: "35vh",
                zIndex: 50,
                border: "1px solid var(--grey-color)",
                padding: 0
            });

            // Je modifie le texte de la li et je crée toutes les autres avec les lots
            const options = document.createElement('li');
            options.classList.add('options');
            options.style.display = "list-item";

            optionSelection.style.backgroundColor = "#fff";

            // J'impose une hauteur à la div qui contient la liste pour permettre l'ajout de l'ascenseur pour scroller
            lotContainer.style.height = "25vh";

            // Conditions si dateXRT n'est pas vide
            if (formattedDateXRT != "") {

                if (exportPartTotal == 1 && dateExport == "") {
                    options.textContent = `Lot n° ${numImportSource} du : ${formattedDateImport}, fichier source créé le ${formattedDateXRT}`;
                    selectionLot.appendChild(options);

                } else if (exportPartTotal == 1 && dateExport != "") {
                    options.textContent = `Lot n° ${numImportSource} du : ${formattedDateImport}, fichier source créé le ${formattedDateXRT} et fichier comptable créé le ${formattedDateExport}`;
                    selectionLot.appendChild(options);
                
                } else if (exportPartTotal != 1 && exportPartiel) {
                    options.textContent = `Lot n° ${numImportSource} du : ${formattedDateImport}, fichier source créé le ${formattedDateXRT} et fichier comptable créé le ${formattedDateExport} et exporté partiellement`;
                    selectionLot.appendChild(options);
                
                } else if (exportPartTotal != 1 && exportPartiel != "") {
                    options.textContent = `Lot n° ${numImportSource} du : ${formattedDateImport}, fichier source créé le ${formattedDateXRT} et fichier comptable créé le ${formattedDateExport}`;
                    selectionLot.appendChild(options);
                }

            } else {
                // Si dateXRT est vide
                if (exportPartTotal == 1 && dateExport == "") {
                    options.textContent = `Lot n° ${numImportSource} du : ${formattedDateImport}`;
                    selectionLot.appendChild(options);

                } else if (exportPartTotal == 1 && dateExport != "") {
                    options.textContent = `Lot n° ${numImportSource} du : ${formattedDateImport} et fichier comptable créé le ${formattedDateExport}`;
                    selectionLot.appendChild(options);
                
                } else if (exportPartTotal != 1) {
                    if (exportPartiel) {
                        options.textContent = `Lot n° ${numImportSource} du : ${formattedDateImport} et fichier comptable créé le ${formattedDateExport} et exporté partiellement`;
                        selectionLot.appendChild(options);
                    } else {
                        options.textContent = `Lot n° ${numImportSource} du : ${formattedDateImport} et fichier comptable créé le ${formattedDateExport}`;
                        selectionLot.appendChild(options);
                    }
                }
            }
            

            // Au clic sur un lot => stockage du contenu dans le localStorage + redirection
            options.addEventListener("click", (e) => {
                const lotSelectionneVJC = e.target.textContent;
                
                localStorage.setItem('lotSelectionneVJC', lotSelectionneVJC);
                window.location.assign("journal-comptable-1.html");
            });

        }
    })
};

// Lorsque je clique sur "Choisir un lot", j'appelle la fonction qui crée la liste en vérifiant qu'elle n'ait pas déjà été appelée avant et donc qu'il n'y a pas de requête en cours
optionSelection.addEventListener('click', async () => {
    // Je vérifie si la fonction a déjà été appelée, pour ne pas charger les mêmes lots plusieurs fois
    if (!creerListeDejaAppelee && !chargementEnCours) {
        creerListeDejaAppelee = true;
        chargementEnCours = false;
        offset = 0;
        await creerListe();
    }

    // J'ajoute un événement au défilement sur la div .lotContainer
    lotContainer.addEventListener('scroll', async () => {
        // Je stocke les variables me permettant de voir à quel moment on a atteint la fin de la liste
        const containerHeight = lotContainer.offsetHeight;
        const scrollTop = lotContainer.scrollTop;
        const scrollHeight = lotContainer.scrollHeight;
        
        // Ajout d'une marge d'erreur pour détecter la fin du scroll
        const scrollMargin = 5;
        
        // Si le défilement a atteint la fin de la liste, j'appelle la fonction pour charger plus de lots
        if (scrollTop >= scrollHeight - containerHeight - scrollMargin && !chargementEnCours) {

            chargementEnCours = true;
            offset += 15;
            await creerListe();
            chargementEnCours = false;
        }
    });
});

// Si l'utilisateur clique en-dehors de la liste, on ferme la liste
document.addEventListener('click', (event) => {
    const target = event.target;
    const options = document.querySelectorAll('.options:not(:first-child');

    options.forEach((op) => {

        if (target != op) {
            op.style.display = "none";
            lotContainer.style.height = "auto";
            lotContainer.style.border = "none";
            optionSelection.style.backgroundColor = "rgba(212, 247, 231, 0.7)";
        }
    })

    // Je repasse bien mes variables de contrôle à false pour pouvoir réexécuter la fonction creerListe() au nouveau clic sur "option1"
    creerListeDejaAppelee = false;
    chargementEnCours = false;
});