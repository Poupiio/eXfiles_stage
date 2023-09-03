// ------------------------------------------------------------------------------------------------------ //
// -------------------------------- CODES TRAITEMENT + AFFICHAGE DES LOTS ------------------------------- //
// ------------------------------------------------------------------------------------------------------ //

// Je cible la div dans laquelle je veux afficher mes codes traitement
const container = document.querySelector('#codeTraitement');

// Je cible le container du menu déroulant de lots
const lotContainer = document.querySelector('.lotContainer');

// Je cible la div dans laquelle se trouve la liste des lots
const selectionLot = document.querySelector('#lot-select');
selectionLot.style.fontSize = "0.7rem";

// Je récupère mon lot sélectionné précédemment ainsi que le code traitement associé
const lotSelectionneVJC = localStorage.getItem('lotSelectionneVJC');
let codeTraitementVJC = localStorage.getItem('codeTraitementCliqueVJC');

// J'affiche en 1ère option de la liste le lot sélectionné sur la page précédente et la flcèhe pour indiquer que le menu est déroulant ("visualisation-journal-home.html")
let option1 = document.createElement('li');
    option1.classList.add('options');
    option1.textContent = lotSelectionneVJC;
    Object.assign(option1.style, {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    })
    const fleche = document.createElement('img');
    fleche.setAttribute('src', '../images/arrow-left.png');
    option1.append(fleche);
selectionLot.append(option1);

// J'initialise mes variables pour gérer l'affichage de la liste des lots
let creerListeDejaAppelee = false;      // Pour gérer l'appel de la fonction creerListe() pour son appel multiple (par exemple si on clique 2 fois sur un même élément qui l'appelle)
let chargementEnCours = false;      // Pour ne pas charger plusieurs fois les mêmes lots et qu'ils soient dans le désordre

let offset = 0;     // Pour exécuter la fonction creerListe() au scroll dans la liste, afin d'avoir les lots chargés de puis le début
// let listeOuverte = false;       // Gérer l'affichage de la liste de lots

// Pour envoyer au serveur
let numImport;      
let formattedDate;

let isOptionsClicked = false;       // Gestion du clic sur l'event au scroll

const effacerListe = () => {
    const options = document.querySelectorAll('.options');
    options.forEach((option) => option.style.display = "none");
    option1.style.backgroundColor = 'rgba(212, 247, 231, 0.7)';
    Object.assign(option1.style, {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    })
    const fleche = document.createElement('img');
    fleche.setAttribute('src', '../images/arrow-left.png');
    option1.append(fleche);

    creerListeDejaAppelee = false;
    chargementEnCours = false;
    Object.assign(lotContainer.style, {
        height: "auto",
        zIndex: 50,
        border: "none",
        padding: 0
    });
};


// ------------------------------------------------------------------------------------------------------ //
// ------------------------------------------ TABLEAU ECRITURE ------------------------------------------ //
// ------------------------------------------------------------------------------------------------------ //

// Je cible les éléments du tableau Ecriture
const thead = document.querySelector('#thead-ecriture');
const tbody = document.querySelector('#tbody-ecriture');
const tableauEcriture = document.querySelector('.tableau-ecriture-container');
const apresTableau = document.querySelector('.table-after');
const divJournalComptable = document.querySelector('.journal-comptable');

// Je cible les span qui affichent les montants Crédit et débit
const debitTotal = document.querySelector('#debit-total');
const creditTotal = document.querySelector('#credit-total');

const iconeTh = document.querySelector('#iconeTh');
const iconeTd = document.querySelector('#iconeTd');

let numeroLigneEcriture;
let numeroLotEcriture;
let supLigne = false;

// Je déclare des variables de portée globales pour les utiliser dans plusieurs fonctions
let numeroDeLigne = "";
let numeroImportSource = "";
let lignesSupprimees = [];


// ------------------------------------------------------------------------------------------------------ //
// ---------------------------------------- TABLEAU LIGNE SOURCE ---------------------------------------- //
// ------------------------------------------------------------------------------------------------------ //

// Je sélectionne le tableau Ligne Source
const tbodySource = document.querySelector('#ligneSource');

// Je cibles les td du tableau ligne source :
const id = document.querySelector('#id');
const societe = document.querySelector('#societe');
const banque = document.querySelector('#banque');
const rib = document.querySelector('#rib');
const codeCompteTd = document.querySelector('#codeCompte');
const fluxTd = document.querySelector('#flux');
const codeBudget = document.querySelector('#codeBudget');
const dateValeurTd = document.querySelector('#dateValeur');
const dateOperationTd = document.querySelector('#dateOperation');
const libelleTdSource = document.querySelector('#libelle');
const referenceTd = document.querySelector('#reference');
const montantTdSource = document.querySelector('#montant');

// Fonction qui vide le contenu du tableau "Ligne Source"
const viderLigneSource = () => {
    id.textContent = "";
    societe.textContent = "";
    banque.textContent = "";
    rib.textContent = "";
    codeCompteTd.textContent = "";
    fluxTd.textContent = "";
    codeBudget.textContent = "";
    dateValeurTd.textContent = "";
    dateOperationTd.textContent = "";
    libelleTdSource.textContent = "";
    referenceTd.textContent = "";
    montantTdSource.textContent = "";
};


// ------------------------------------------------------------------------------------------------------ //
// --------------------------------------- POPUP DETAIL ECRITURES --------------------------------------- //
// ------------------------------------------------------------------------------------------------------ //

// Je cible les td du tableau de la popUp Détail Ecriture
const user = document.querySelector('#user');
const numeroImportDE = document.querySelector('#numImport');
const dateImportDE = document.querySelector('#dateImport');
const nomFichierSource = document.querySelector('#nomFichierSource');
const numeroLigneDE = document.querySelector('#numeroLigne');
const codeEnregistrement = document.querySelector('#codeEnregistrement');
const codeBanqueDE = document.querySelector('#codeBanque');
const ZR1 = document.querySelector('#ZR1');
const ZR2 = document.querySelector('#ZR2');
const ZR3 = document.querySelector('#ZR3');
const ZR4 = document.querySelector('#ZR4');
const ZR5 = document.querySelector('#ZR5');
const codeGuichet = document.querySelector('#codeGuichet');
const codeDeviseCompte = document.querySelector('#codeDeviseCompte');
const codeDeviseMvt = document.querySelector('#codeDeviseMvt');
const nbDecimSolde = document.querySelector('#nbDecimSolde');
const numCompteDE = document.querySelector('#numCompte');
const dateSoldeInit = document.querySelector('#dateSoldeInit');
const montantSoldeInit = document.querySelector('#montantSoldeInit');
const codeOperationInterne = document.querySelector('#codeOperationInterne');
const codeGuichetCompteOuvert = document.querySelector('#codeGuichetCompteOuvert');
const codeOpeInterban = document.querySelector('#codeOpeInterban');
const dateComptaOperat = document.querySelector('#dateComptaOperat');
const codeMotifRejet = document.querySelector('#codeMotifRejet');
const dateValeurDE = document.querySelector('#dateValeurDE');
const libelleDE = document.querySelector('#libelleDE');
const numeroEcriture = document.querySelector('#numeroEcriture');
const indiceExonerationMVT = document.querySelector('#indiceExonerationMVT');
const indiceIndisponibilite = document.querySelector('#indiceIndisponibilite');
const montantMVT = document.querySelector('#montantMVT');
const nbDecimMontantMVT = document.querySelector('#nbDecimMontantMVT');
const qualifiantZoneIC = document.querySelector('#qualifiantZoneIC');
const infosCompl = document.querySelector('#infosCompl');
const dateSoldeFinal = document.querySelector('#dateSoldeFinal');
const montantSolideFinal = document.querySelector('#montantSolideFinal');
const codeFlux = document.querySelector('#codeFlux');
const refDE = document.querySelector('#refDE');
const codeBudgetDE = document.querySelector('#codeBudgetDE');
const nombre = document.querySelector('#nombre');
const frais = document.querySelector('#frais');
const numeroJournalTreso = document.querySelector('#numeroJournalTreso');
const numeroSite = document.querySelector('#numeroSite');
const numeroLog = document.querySelector('#numeroLog');
const dateFin = document.querySelector('#dateFin');
const montantCVal = document.querySelector('#montantCVal');
const sensDE = document.querySelector('#sensDE');
const suppression = document.querySelector('#suppression');
const numEcritERP = document.querySelector('#numEcritERP');
const IC1 = document.querySelector('#IC1');
const IC2 = document.querySelector('#IC2');
const IC3 = document.querySelector('#IC3');
const IC4 = document.querySelector('#IC4');
const IC5 = document.querySelector('#IC5');
const IC6 = document.querySelector('#IC6');
const IC7 = document.querySelector('#IC7');
const IC8 = document.querySelector('#IC8');
const IC9 = document.querySelector('#IC9');
const IC10 = document.querySelector('#IC10');
const IC11 = document.querySelector('#IC11');
const IC12 = document.querySelector('#IC12');
const IC13 = document.querySelector('#IC13');
const IC14 = document.querySelector('#IC14');
const IC15 = document.querySelector('#IC15');
const IC16 = document.querySelector('#IC16');
const IC17 = document.querySelector('#IC17');
const IC18 = document.querySelector('#IC18');
const IC19 = document.querySelector('#IC19');
const IC20 = document.querySelector('#IC20');
const IC21 = document.querySelector('#IC21');
const IC22 = document.querySelector('#IC22');
const IC23 = document.querySelector('#IC23');
const IC24 = document.querySelector('#IC24');
const ZU1 = document.querySelector('#ZU1');
const ZU2 = document.querySelector('#ZU2');
const ZU3 = document.querySelector('#ZU3');
const ZU4 = document.querySelector('#ZU4');
const ZU5 = document.querySelector('#ZU5');
const codeDossierDE = document.querySelector('#codeDossier');
const codeTrDE = document.querySelector('#codeTraitementDE');
const codeSocieteDE = document.querySelector('#codeSocieteDE');
const codeCompteDE = document.querySelector('#codeCompteDE');
const codeJournalDE = document.querySelector('#codeJournalDE');
const codeEtablissementDE = document.querySelector('#codeEtablissementDE');
const idCompte = document.querySelector('#idCompte');
const natureFlux = document.querySelector('#natureFlux');
const dateGeneration = document.querySelector('#dateGeneration');

// Stockage des filtres appliqués
let filtresAppliques = [];

// ------------------------------------------------------------------------------------------------------ //
// ----------------------------------- POPUP ATTENTION TOUT SUPPRIMER ----------------------------------- //
// ------------------------------------------------------------------------------------------------------ //

// Je cible le bouton Poubelle pour tout supprimer
const toutSupprimer = document.querySelector('.toutSupprimer');

// Je cible la popup "Attention (div.popupToutSupprimer)" et ses boutons 'Ok' et 'Annuler"
const attentionToutSupprimer = document.querySelector(".popupToutSupprimer");
const validerToutSupprimer = document.querySelector('#validerToutSupprimer');
const annulerToutSupprimer = document.querySelector('#annulerToutSupprimer');


// ------------------------------------------------------------------------------------------------------ //
// ----------------------------------- POPUP ATTENTION SUPPRIMER LIGNE ---------------------------------- //
// ------------------------------------------------------------------------------------------------------ //

// Je cible la popup "Attention (div.popupSupprimerLigne)" et ses boutons 'Ok' et 'Annuler"
const attentionSupprimerLigne = document.querySelector(".popupSupprimerLigne");
const validerSupprimerLigne = document.querySelector('#validerSupprimerLigne');
const annulerSupprimerLigne = document.querySelector('#annulerSupprimerLigne');

let numLotASupprimer;
let numLigneASupprimer;


// ------------------------------------------------------------------------------------------------------ //
// -------------------------- FONCTIONS TYPE DE FICHIER CAMT054 / FRP / AFB120  ------------------------- //
// ------------------------------------------------------------------------------------------------------ //
// Je déclare les variables qui vont me servir à récupérer les résultats de requête et modifier les données
let detailEcriture;
let nombreLignesTotal;
let numeroLigne = 1;


// ------------------------------------------------------------------------------------------------------ //
// --------------------------------- POPUP MODIFICATION LIGNE D'ECRITURE -------------------------------- //
// ------------------------------------------------------------------------------------------------------ //

// Je cible les inputs correspondants à ma popup #popUpEdit
const libLigneEdit = document.querySelector('#inputLibelle');
const D = document.querySelector('#D');
const C = document.querySelector('#C');
const compteSelection = document.querySelector('#compteOptions');
const inputCompte = document.querySelector('#compteSelection');
const montantEdit = document.querySelector('#montantEdit');
const libEdit = document.querySelector('#libEdit');
const codeJournalEdit = document.querySelector('#journalOptions');
const inputJournal = document.querySelector('#codeJournalEdit');
const libExfilesEdit = document.querySelector('#libExfiles');
const referenecEdit = document.querySelector('#refEdit');
const za1Edit = document.querySelector('#za1');
const za2Edit = document.querySelector('#za2');
const za3Edit = document.querySelector('#za3');
const za4Edit = document.querySelector('#za4');
const za5Edit = document.querySelector('#za5');
const za6Edit = document.querySelector('#za6');
const za7Edit = document.querySelector('#za7');
const za8Edit = document.querySelector('#za8');
const za9Edit = document.querySelector('#za9');
const za10Edit = document.querySelector('#za10');

// Nouvelles td après modifications :
let statutModifie;
let libelleLigneModifie;
let compteDebitModifie;
let compteCreditModifie;
let montantModifie;
let sensEcritureModifie;
let libelleEcritureModifie;
let codeJournalModifie;
let exfilesModifie ;
let referenceModifiee;
let za1Modifiee;
let za2Modifiee;
let za3Modifiee;
let za4Modifiee;
let za5Modifiee;
let za6Modifiee;
let za7Modifiee;
let za8Modifiee;
let za9Modifiee;
let za10Modifiee;

let nouveauTotalDebit;
let nouveauTotalCredit;


// Récupération des comptes paramétrés / codes journaux
const listeCompteParametres = async () => {
    const dataResponse = await fetch("http://localhost:3000/visualisation/donnees-parametrees");
	const data = await dataResponse.json();

    const listeComptes = data.listeComptes;
    const listeCodesJournaux = data.listeCodesJournaux;
    
    // Je concatène les résultats de listeComptes sous la forme "numéro compte - libelle du compte"
    const comptesParam = listeComptes.map(liste => `${liste.numCptCompta.trim()} - ${liste.libelleCptCompta.trim()}`);
    const codesJournaux = listeCodesJournaux.map(codes => codes.codeJournal.trim());


    return { comptesParam, codesJournaux };
};


// Je cible le bouton "Editer" pour générer le fichier Excel
const editer = document.querySelector('#editer');



// Je récupère les codes traitement
const recuperationCodesTraitement = async () => {
	const dataResponse = await fetch("http://localhost:3000/visualisation/traitements");
	const data = await dataResponse.json();

    // J'affiche les codes traitement sur la gauche
	data.forEach((code) => {
        const p = document.createElement('p');
        p.classList.add('ListeCodeTraitement');
        p.textContent = code.codeTraitement.trim();

        tbody.innerHTML = "";

        // 1. Si le code traitement de la page précédente est égal à un des codes affichés ET que la valeur d'un des p corespond à ce code, alors je lui attribue la class hightlight
        // 2. J'affiche la liste des lots
        // 3. J'affiche la ligne source au clic sur un lot
        if (codeTraitementVJC === code.codeTraitement.trim() && p.textContent === codeTraitementVJC) {
            p.classList.add("highlight");

            // Je récupère la chaîne de caractère qui correspond au numImportSource
            numImport = lotSelectionneVJC.split(' ')[2];

            // Je récupère la date au format JJ/MM/YY
            const regex = /(\d{2}\/\d{2}\/\d{4})/;
            const dateImportVJC = lotSelectionneVJC.match(regex)[1];

            // Je récupère la date d'import et je la convertis au format YYYYMMJJ pour que la requête en BDD puisse se faire
            formattedDate = dateImportVJC.split('/').reverse().join('');

            creationEcritures(numImport, formattedDate);
        }

        container.append(p);


         // Au clic sur un autre code traitement, je stocke sa valeur, je vide la liste déroulante, et je gère le style
        p.addEventListener('click', (e) => {
            // Je réinitialise la liste des lots, la ligne source et le tableau d'écritures
            effacerListe();
            viderLigneSource();
            tableauEcriture.style.visibility = "hidden";
            apresTableau.style.visibility = "hidden";
            

            // Je réinitialise le titre "Ecriture" et j'enlève le bouton "Retour"
            const h5 = document.querySelector('#title-ecriture');
            h5.textContent = "Ecriture";
            const retourModif = document.querySelector('.retourModif');
            retourModif.classList.add('invisible');

            // Je réinitialise également le contenu des montants
            creditTotal.textContent = "";
            debitTotal.textContent = "";

            let codeClique = e.target.innerText;
            localStorage.setItem('nouveauCodeClique', codeClique);
            
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
            option1.textContent = "Choisir un lot";
            option1.style.display = "list-item";
            Object.assign(option1.style, {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            })
            const fleche = document.createElement('img');
            fleche.setAttribute('src', '../images/arrow-left.png');
            option1.append(fleche);
            selectionLot.append(option1);

            // Je change la valeur du code traitement pour le côté serveur
            codeTraitementVJC = codeClique;
        })
    });
};
recuperationCodesTraitement();


const creationEcritures = async (numImport, formattedDate) => {
    tableauEcriture.style.visibility = "visible";
    apresTableau.style.visibility = "visible";

    fetch("http://localhost:3000/visualisation/lotsdetails", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            codeTraitement: codeTraitementVJC,
            numImportSource: numImport,
            dateImport: formattedDate
        })
    })
    .then(response => response.json())
    .then(result => {

        let montantTotalCredit = 0;
        let montantTotalDebit = 0;

        for (let lot of result) {
            let formattedDateEcriture;
            let numLigneSource = lot.numLigneSource;
            let numLot = lot.numImportSource;
            let regleAppliquee = lot.regleAppliquee.trim();
            let flux = lot.Flux.trim();
            let numCompte = lot.NumCompte;

            if (lot.DateValeur) {
                const dateStr = lot.DateValeur;
                formattedDateEcriture = dateStr.slice(0, 2) + "/" + dateStr.slice(2, 4) + "/" + dateStr.slice(4);
            } else {
                formattedDateEcriture = "";
            }

            let dateOperation = lot.DateComptaOperat;
            let statut = lot.statut.trim();
            let numLigne = lot.idEcriture;
            let libelleLigne = lot.libelleEcriture.trim();
            let compteDebite = lot.compteDebite.trim();
            let compteCredite = lot.compteCredite.trim();
            let montant = lot.montant.trim();
            let sensEcriture = lot.sensEcriture.trim();
            let libelle = lot.libelle.trim();
            let codeJournal = lot.journal.trim();
            let libelleExfiles = lot.LIBEXFILES.trim();
            let reference = lot.reference.trim();
            let ZA1 = lot.ZA1.trim();
            let ZA2 = lot.ZA2.trim();
            let ZA3 = lot.ZA3.trim();
            let ZA4 = lot.ZA4.trim();
            let ZA5 = lot.ZA5.trim();
            let ZA6 = lot.ZA6.trim();
            let ZA7 = lot.ZA7.trim();
            let ZA8 = lot.ZA8.trim();
            let ZA9 = lot.ZA9.trim();
            let ZA10 = lot.ZA10.trim();

            const dateString = dateOperation;
            const formattedDateOperation = dateString.slice(0, 2) + "/" + dateString.slice(2, 4) + "/" + dateString.slice(4);

            // CONSTRUCTION DES LIGNES D'ECRITURE
            const tr = document.createElement('tr');
            tr.classList.add('passage');
            tbody.append(tr);

            const tdLinks = document.createElement('td');
            tdLinks.classList.add('flex', 'nonFiltrable');

            // 1er bouton pour modifier
            const update = document.createElement('i');
            update.classList.add('fa-regular', 'fa-pen-to-square', 'modifierEcriture');

            // 2ème bouton pour supprimer
            const remove = document.createElement('i');
            remove.classList.add('fa-solid', 'fa-trash', 'supprimerLigne');
            
            tdLinks.append(update, remove);
            tr.append(tdLinks);

            const numL = document.createElement('td');
            numL.draggable = true;
            numL.classList.add('nonFiltrable', 'numLigneSourceEcriture');
            numL.textContent = numLigneSource;

            const numeroLot = document.createElement('td');
            numeroLot.draggable = true;;
            numeroLot.classList.add('nonFiltrable', 'numLotEcriture');
            numeroLot.textContent = numLot;

            const regle = document.createElement('td');
            regle.classList.add('regleAppliqueeEcriture');
            regle.draggable = true;
            regle.textContent = regleAppliquee;

            const tdFlux = document.createElement('td');
            tdFlux.classList.add('fluxEcriture');
            tdFlux.draggable = true;
            tdFlux.textContent = flux;

            const codeCompte = document.createElement('td');
            codeCompte.classList.add('codeCompteEcriture');
            codeCompte.draggable = true;
            codeCompte.textContent = numCompte;

            const dateEcrit = document.createElement('td');
            dateEcrit.classList.add('dateEcritureEcriture');
            dateEcrit.draggable = true;
            dateEcrit.textContent = formattedDateEcriture;

            const dateOp = document.createElement('td');
            dateOp.classList.add('nonFiltrable', 'dateOperationEcriture');
            dateOp.draggable = true;
            dateOp.textContent = formattedDateOperation;

            const status = document.createElement('td');
            status.classList.add('status', 'nonFiltrable', 'statutEcriture');
            status.draggable = true;
            status.textContent = statut;
            if (statut != "V") {
                status.style.color = "orange";
                status.style.fontWeight = "bold";
            }

            const numeroLigne = document.createElement('td');
            numeroLigne.classList.add('nonFiltrable', 'numeroLigneEcriture');
            numeroLigne.draggable = true;
            numeroLigne.textContent = numLigne;

            const libelle_Ligne = document.createElement('td');
            libelle_Ligne.classList.add('libelleLigneEcriture');
            libelle_Ligne.textContent = libelleLigne;
            
            const debit = document.createElement('td');
            debit.classList.add('compteDebitEcriture');
            debit.textContent = compteDebite;
            if (compteDebite == "?") {
                debit.style.color = "orange";
                debit.style.fontWeight = "bold";
            }

            const credit = document.createElement('td');
            credit.classList.add('compteCreditEcriture');
            credit.draggable = true;
            credit.textContent = compteCredite;
            if (compteCredite == "?") {
                credit.style.color = "orange";
                credit.style.fontWeight = "bold";
            }

            const montantTd = document.createElement('td');
            montantTd.classList.add('montantEcriture');
            montantTd.draggable = true;
            montantTd.textContent = montant;
            montantTd.style.textAlign = "right";
            if (montant == "?") {
                montantTd.style.color = "orange";
                montantTd.style.fontWeight = "bold";
            }
            
            const sens = document.createElement('td');
            sens.draggable = true;
            sens.classList.add('nonFiltrable', 'sensEcriture');
            sens.textContent = sensEcriture;
            
            const libelleTd = document.createElement('td');
            libelleTd.classList.add('libelleEcriture');
            libelleTd.draggable = true;
            libelleTd.textContent = libelle;

            const journal = document.createElement('td');
            journal.classList.add('journalComptableEcriture');
            journal.draggable = true;
            journal.textContent = codeJournal;

            const libExfiles = document.createElement('td');
            libExfiles.classList.add('libelleExfilesEcriture');
            libExfiles.draggable = true;
            libExfiles.textContent = libelleExfiles;

            const ref = document.createElement('td');
            ref.classList.add('referenceEcriture');
            ref.draggable = true;
            ref.textContent = reference;

            const za1 = document.createElement('td');
            za1.classList.add('za1Ecriture');
            za1.draggable = true;
            za1.textContent = ZA1;

            const za2 = document.createElement('td');
            za2.classList.add('za2Ecriture');
            za2.draggable = true;
            za2.textContent = ZA2;

            const za3 = document.createElement('td');
            za3.classList.add('za3Ecriture');
            za3.draggable = true;
            za3.textContent = ZA3;

            const za4 = document.createElement('td');
            za4.classList.add('za4Ecriture');
            za4.draggable = true;
            za4.textContent = ZA4;

            const za5 = document.createElement('td');
            za5.classList.add('za5Ecriture');
            za5.draggable = true;
            za5.textContent = ZA5;

            const za6 = document.createElement('td');
            za6.classList.add('za6Ecriture');
            za6.draggable = true;
            za6.textContent = ZA6;

            const za7 = document.createElement('td');
            za7.classList.add('za7Ecriture');
            za7.draggable = true;
            za7.textContent = ZA7;

            const za8 = document.createElement('td');
            za8.classList.add('za8Ecriture');
            za8.draggable = true;
            za8.textContent = ZA8;

            const za9 = document.createElement('td');
            za9.classList.add('za9Ecriture');
            za9.draggable = true;
            za9.textContent = ZA9;

            const za10 = document.createElement('td');
            za10.classList.add('za10Ecriture');
            za10.draggable = true;
            za10.textContent = ZA10;

            tr.append(numL, numeroLot, regle, tdFlux, codeCompte, dateEcrit, dateOp, status, numeroLigne, libelle_Ligne, debit, credit, montantTd, sens, libelleTd, journal, libExfiles, ref, za1, za2, za3, za4, za5, za6, za7, za8, za9, za10);

            // Si le sens est D et que le montant est différent de "?", j'affiche le montant avec 2 chiffres après la virgule
            if (sensEcriture == "D" && montant != "?") {
                montantTotalDebit += parseFloat(montant.replace(",", "."));
                debitTotal.textContent = montantTotalDebit.toFixed(2);
            } else if (sensEcriture == "C" && montant != "?") {
                montantTotalCredit += parseFloat(montant.replace(",", "."));
                creditTotal.textContent = montantTotalCredit.toFixed(2);
            };

            // Si montant Crédit != montant Débit
            if (montantTotalCredit != montantTotalDebit) {
                creditTotal.style.color = "red";
                creditTotal.style.fontWeight = "bold";
                debitTotal.style.color = "red";
                debitTotal.style.fontWeight = "bold";
            } else {
                creditTotal.style.color = "";
                creditTotal.style.fontWeight = "";
                debitTotal.style.color = "";
                debitTotal.style.fontWeight = "";
            }


//------------------------------------------------------------------------------------------------ //
// ------------------------------------ LIGNE SOURCE --------------------------------------------- //
//------------------------------------------------------------------------------------------------ //
            // Je cible les lignes
            let lignes = document.querySelectorAll('tr.passage');

            // Je parcours chaque ligne du tableau Ecriture
            lignes.forEach((ligne) => {
                
                // Je crée un évènement au clic pour chaque ligne
                ligne.addEventListener('click', async () => {

                    iconeTh.style.display = "table-cell";
                    iconeTd.style.display = "table-cell";

                    // Je récupère la valeur du numéro de ligne et du numéro d'import source pour faire ma requête en back en suivant
                    numeroDeLigne = ligne.cells[1].innerText;
                    numeroImportSource = ligne.cells[2].innerText;

                    await fetch("http://localhost:3000/visualisation/lignesource", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ 
                            codeTraitement: codeTraitementVJC,
                            numImportSource: numeroImportSource,
                            numeroDeLigne: numeroDeLigne
                        })
                    })
                    .then(response => response.json())
                    .then(result => {
                        // result me retourne mes 2 objets entete (avec les données de la ligne source) et detailEcriture avec les données de la popUp Détail Ecriture

                        // Partie Ligne source
                        let TypeFichSource = result.entete.TypeFichSource;

                        let dateVal = result.entete.DateValeur;
                        let dateOpLS = result.entete.DateComptaOperat;

                        id.textContent = result.entete.NumLigne;
                        societe.textContent = result.entete.eXfilesCodeSociete;
                        banque.textContent = result.entete.eXfilesCodeBanque;

                        // Format DateValeur
                        const dateString = dateVal;
                        const j = dateString.substr(0, 2);
                        const m = dateString.substr(2, 2);
                        const a = dateString.substr(4, 2);
                        const newDateValeur = `${j}/${m}/${a}`;

                        // Format DateComptaOperat
                        const dateStr = dateOpLS;
                        const d = dateStr.substr(0, 2);
                        const month = dateStr.substr(2, 2);
                        const y = dateStr.substr(4, 2);
                        const newDateOperat = `${d}/${month}/${y}`;

                        // Si TypeFichSource = AFB120 ou CAMT056
                        if (TypeFichSource.trim() === "AFB120" || TypeFichSource.trim() === "CAMT054") {
                            rib.textContent = `${result.entete.CodeBanque}${result.entete.NumCompte}${result.entete.CodeGuichetCompteOuvert}`;
                            codeCompteTd.textContent = "";
                            fluxTd.textContent = result.entete.CodeOperatInterban;
                            montantTdSource.textContent = result.entete.MontantMouvement.toFixed(2);

                        // Si TypeFichSource = FRP
                        } else if (TypeFichSource.trim() === "FRP") {
                            rib.textContent = "";
                            codeCompteTd.textContent = result.entete.NumCompte;
                            fluxTd.textContent = result.entete.Flux;
                            montantTdSource.textContent = result.entete.MontantCVal;
                        }
                        
                        codeBudget.textContent = result.entete.CodeBudget;
                        dateValeurTd.textContent = newDateValeur;
                        dateOperationTd.textContent = newDateOperat;
                        libelleTdSource.textContent = result.entete.Libelle;
                        referenceTd.textContent = result.entete.Reference;
                    })

                    // Si montant Crédit != montant Débit
                    if (montantTotalCredit != montantTotalDebit) {
                        creditTotal.style.color = "red";
                        creditTotal.style.fontWeight = "bold";
                        debitTotal.style.color = "red";
                        debitTotal.style.fontWeight = "bold";
                    };
                })
            })
        };


//------------------------------------------------------------------------------------------------ //
//------------------------------------- POPUP FILTRER LES ÉCRITURES ------------------------------ //
//------------------------------------------------------------------------------------------------ //

        const lignes = document.querySelectorAll('tr.passage');
        const checkboxes = document.querySelectorAll('input[name="filtres"]');
        const statutT = document.querySelector('#tous');
        const filtrer = document.querySelector('.filtrerEcritures');
        const appliquer = document.querySelector('.appliquerFiltres');
        
        // J'initialise un tableau pour stocker les valeurs des cellules statut
        const statusValues = [];
        // J'initialise un tableau avec les valeurs des td de chaque ligne
        const lignesData = [];
        
        lignes.forEach((ligne) => {
            const tds = ligne.querySelectorAll('td');
            lignesData.push(tds);
            
            const statutTd = tds[8];
            const valeurStatut = statutTd.textContent;
            statusValues.push(valeurStatut);
        });
        
        statutT.addEventListener('click', () => {
            if (statutT.checked) {
                checkboxes.forEach((checkbox) => {
                    if (checkbox != statutT) {
                        checkbox.checked = false;
                    }
                });
            }
            appliquerFiltres();
        });
        
        checkboxes.forEach((checkbox) => {
            if (checkbox != statutT) {
                checkbox.addEventListener('click', () => {
                    if (statutT.checked) {
                        checkboxes.forEach((otherCheckbox) => {
                            if (otherCheckbox != statutT && otherCheckbox != checkbox) {
                                otherCheckbox.checked = false;
                                statutT.checked = false;
                                appliquerFiltres();
                            }
                        });
                    }
                });
            }
        });
        
        filtrer.addEventListener('click', () => {
            appliquerFiltres();
        });
        
        function appliquerFiltres() {
            const checkedValues = Array.from(checkboxes)
            .filter(checkbox => checkbox.checked && checkbox != statutT)
            .map(checkbox => checkbox.value);

            let auMoinsUneLigneAffichee = false;

            lignes.forEach((ligne, index) => {
                const statutTd = lignesData[index][8];
                const valeurStatut = statutTd.textContent.trim();
                const numeroLigneSourceModif = ligne.querySelector('.numLigneSourceEcriture').innerText;

                if ((checkedValues.length == 0 || checkedValues.includes(valeurStatut) || statutT.checked) && !lignesSupprimees.includes(numeroLigneSourceModif)) {
                    ligne.style.display = "table-row";
                    auMoinsUneLigneAffichee = true;
                } else {
                    ligne.style.display = "none";
                }
            });

            // Mise à jour des filtres appliqués
            filtresAppliques = checkedValues;

            if (!auMoinsUneLigneAffichee) {
                filtrer.style.display = "block";
                filtrer.textContent = "Aucune ligne trouvée";
                tableauEcriture.style.visibility = "hidden";
                apresTableau.style.visibility = "hidden";
            } else if (checkedValues.length == 0 || statutT.checked) {
                filtrer.style.display = "block";
                filtrer.textContent = "Filtre(s) des écritures appliqué(s) : Tous";
                tableauEcriture.style.visibility = "visible";
                apresTableau.style.visibility = "visible";
            } else {
                filtrer.style.display = "block";
                filtrer.textContent = "Filtre(s) des écritures appliqué(s) : " + checkedValues;
                tableauEcriture.style.visibility = "visible";
                apresTableau.style.visibility = "visible";
            }

            mettreAJourTotaux();
        };
        
        appliquer.addEventListener('click', () => {
            for (let i = 0; i < lignes.length; i++) {
                lignes[i].style.display = "table-row";
            }
            appliquerFiltres();
        });


//------------------------------------------------------------------------------------------------ //
//-------------------------------- RECHERCHE DANS LES ÉCRITURES ---------------------------------- //
//------------------------------------------------------------------------------------------------ //

        // Je cible l'input de recherche et l'icone de recherche
        const chercherEcriture = document.querySelector('#chercherEcriture');
        const iconeRecherche = document.querySelector('.iconeRecherche');
        let popupFiltre = document.querySelector(".popup-filtre");
        let mainJournalComptable = document.querySelector(".journal-comptable");

        // Lorsque je clique sur l'input pour écrire dedans, j'enlève la loupe
        chercherEcriture.addEventListener('focus', () => {
            iconeRecherche.style.display = "none";
        })

        // Lorsqu'on appuie sur la touche 'Entrée' la pop-up se ferme
        chercherEcriture.addEventListener('keydown', (e) => {
            if (e.keyCode === 13) {
                popupFiltre.classList.add('invisible');
                mainJournalComptable.style.opacity = "1";
            }
        })

        // J'utilise l'évènement "change" pour capturer ce qui est saisi dans l'input
        chercherEcriture.addEventListener('change', (e) => {

            // J'utilise la méthode toLowerCase() pour convertir la chaîne de caractères saisie de façon à bien récupérer la donnée, que l'utilisateur écrive en majuscules ou en minuscules
            const recherche = e.target.value.trim().toLowerCase();

            // Je sélectionne tous les td du tableau écriture
            let tds = document.querySelectorAll('.table-ecriture td');

            // Je sélectionne tous les tr du tableau écriture
            let trs = document.querySelectorAll('.table-ecriture tbody tr');


            // Réinitialisation des styles pour les td qui ont été cherchées précédemment
            tds.forEach(td => {
                td.style.color = "";
                td.style.fontWeight = "";
            });

            // Je filtre les td qui contiennent ce que l'utilisateur a saisi dans l'input
            // Array.from(tds) me retourne un tableau pour chaque td et je filtre le contenu de chaque td
            let tdsRecherchees = Array.from(tds).filter(td => td.textContent.toLowerCase().includes(recherche));

            // Si la recherche est vide ou effacée, je réinitialise les styles et j'affiche toutes les lignes
            if (recherche === "") {
                tds.forEach(td => {
                    td.style.color = "";
                    td.style.fontWeight = "";
                });

                // J'affiche toutes les lignes
                Array.from(trs).forEach(tr => tr.style.display = "table-row");

            } else {

                // Je masque toutes les lignes pour éviter qu'elles restent affichées si l'utilisateur fait une nouvelle recherche
                Array.from(trs).forEach(tr => tr.style.display = "none");
    
                // Je parcours les td correspondant au résultat de recherche et je réaffiche leur tr correspondante
                tdsRecherchees.forEach(td => {
                    let tr = td.parentNode;
    
                    td.style.color = "black";
                    td.style.fontWeight = "bold";
    
                    // Si aucun tr et td n'a la class nonFiltrable, j'affiche le tableau filtré
                    if (!tr.classList.contains('nonFiltrable') && !td.classList.contains('nonFiltrable')) {
                        tr.style.display = "table-row";
                        td.style.display = "table-cell";

                        // Récupération de la valeur de la td #numLigneSourceEcriture pour la tr retournée
                        const numLigneAffiche = tr.querySelector('.numLigneSourceEcriture').innerText;
                        
                        // Je parcours toutes les lignes initiales de mon tableau, et pour chaque td #numLigneSourceEcriture qui correspond à numLigneAffiche, j'affiche la ligne
                        for (lig of lignes) {
                            const numLigneSourceEcritureTd = lig.querySelector(".numLigneSourceEcriture").innerText;
                            
                            if (numLigneSourceEcritureTd === numLigneAffiche) {
                                lig.style.display = "table-row";
                            }
                        }
                        
                    } else {
                        tr.style.display = "none";
                    }
                });
            }

        });


// ---------------------------------------------------------------------------------------------------------- //
// -------------------------------- SUPPRIMER UN GROUPE DE LIGNES D'ECRITURES ------------------------------- //
// ---------------------------------------------------------------------------------------------------------- //

        // J'affiche la popup de validation pour les poubelles de chaque ligne
        let supprimerLigne = document.querySelectorAll('.supprimerLigne');

        // Pour chaque poubelle, je récupère les numéros d'import source et de ligne
        supprimerLigne.forEach((suppr) => {
            suppr.addEventListener('click', () => {
                attentionSupprimerLigne.classList.remove("invisible");

                numLotASupprimer = suppr.closest('tr.passage').querySelector('.numLotEcriture').innerText;
                numLigneASupprimer = suppr.closest('tr.passage').querySelector('.numLigneSourceEcriture').innerText;
            })
        });
        
        // Fonction pour supprimer le groupe de lignes d'écriture sélectionné
        const supprimerLignesEcritures = async () => {
            const response = await fetch("http://localhost:3000/visualisation/suppression-ligne", {
                method: 'POST',
                    headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    numImportSource: numLotASupprimer,
                    numeroDeLigne: numLigneASupprimer
                })
            });

            if (response.ok) {
                // Je supprime les lignes qui ont le même numLigneASupprimer
                lignes.forEach(ligne => {
                    if (ligne.querySelector('.numLigneSourceEcriture').innerText == numLigneASupprimer) {
                        ligne.style.display = "none";
                        
                        // J'informe l'utilisateur de la suppression en enlevant le tableau et en lui ajoutant un texte
                        tableauEcriture.style.visibility = "hidden";
                        apresTableau.style.visibility = "hidden";
                        const groupeEcrituresText = document.createElement('p');
                        groupeEcrituresText.id = 'groupeEcrituresText';
                        groupeEcrituresText.textContent = "Le groupe d'écritures a été supprimé.";
                        divTitre.insertAdjacentElement('afterend', groupeEcrituresText);
                        
                        viderLigneSource();
                    }
                });

                mettreAJourTotaux();
                // J'ajoute le numéro de ligne supprimée au tableau des lignes supprimées
                lignesSupprimees.push(numLigneASupprimer);
            }
        };

        annulerSupprimerLigne.addEventListener('click', () => {
            attentionSupprimerLigne.classList.add('invisible');
        });

        validerSupprimerLigne.addEventListener('click', async () => {
            attentionSupprimerLigne.classList.add('invisible');

            supprimerLignesEcritures();
        });

        

//------------------------------------------------------------------------------------------------ //
//----------------------------- AFFICHAGE POPUP DÉTAIL ÉCRITURE ---------------------------------- //
//------------------------------------------------------------------------------------------------ //

        // Au clic sur l'oeil
        iconeTd.addEventListener('click', async () => {
            afficherFichiersFRPouCAMT054();
            afficherFichiersAFB120();
        })


//------------------------------------------------------------------------------------------------ //
//----------------------------- AFFICHAGE POPUP MODIFIER ÉCRITURE -------------------------------- //
//------------------------------------------------------------------------------------------------ //

        const popupEdit = document.querySelector('#popUpEdit');
        const confirmationModif = document.querySelector('.confirmationModif');     // Popup d'alerte
        const modifierEcriture = document.querySelectorAll('.modifierEcriture');
        const annulerModification = document.querySelector('#annulerModification');     // Bouton "Annuler" de la popup Modification
        const validerModification = document.querySelector('#validerModification');     // Bouton "Valider" de la popup Modification
        // Je cibles les boutons de la popup de confirmation de modification :
        const validationModif = document.querySelector('#validationModif');         // Bouton "Ok" de la popup d'alerte
        const annulationModif = document.querySelector('#annulationModif');         // Bouton "Annuler" de la popup d'alerte
        const h5 = document.querySelector('#title-ecriture');
        const modifTitre = document.querySelector('#modifTitre');
        const retourModif = document.querySelector('.retourModif');
        let dejaClique = false;
        let numeroLigneSourceModif;       // = numLigneSource en BDD et td #numLigneSourceEcriture
        let numeroLotModif;         // = numImportSource en BDD et td #numLotEcriture
        let regleModif;            // = regleAppliquee en BDD et td #regleAppliqueeEcriture
        let numeroLigneModif;      // = idEcriture en BDD et td #numeroLigneEcriture
        let compteDebiteTd;
        let compteCrediteTd;
        let statutEcriture;
        let lignesAModifier;

        retourModif.addEventListener('click', () => {
            // Je réinitialise la variable afin de réinitialiser les évènements au clic
            dejaClique = false;

            // Réinitialisation du h5 et enlèvement du bouton "Retour"
            h5.textContent = "Ecriture";
            retourModif.classList.add('invisible');

            tableauEcriture.style.visibility = "visible";
            apresTableau.style.visibility = "visible";
            
            const groupeEcrituresText = document.querySelector('#groupeEcrituresText');
            if (groupeEcrituresText) {
                groupeEcrituresText.remove();
            }

            inputCompte.style.color = "";
            montantEdit.style.color = "";

            // Vérifiez si des filtres ont été appliqués
            if (filtresAppliques.length > 0) {
                // Je réaffiche les lignes filtrées en fonction des filtres appliqués
                lignes.forEach((ligne, index) => {
                    const statutTd = lignesData[index][8];
                    const valeurStatut = statutTd.textContent.trim();
                    const numeroLigneSourceModif = ligne.querySelector('.numLigneSourceEcriture').innerText;
            
                    if ((filtresAppliques.includes(valeurStatut) || statutT.checked) && !lignesSupprimees.includes(numeroLigneSourceModif)) {
                        ligne.style.display = "table-row";
                    } else {
                        ligne.style.display = "none";
                    }
            
                    viderLigneSource();
                });
            
                mettreAJourTotaux();
            } else {
                // Je réaffiche toutes les lignes du tableau
                lignes.forEach((ligne) => {
                    const numeroLigneSourceModif = ligne.querySelector('.numLigneSourceEcriture').innerText;
            
                    // Si le numéro de ligne est dans le tableau des numéros de ligne supprimées, je n'affiche pas la ligne
                    if (lignesSupprimees.includes(numeroLigneSourceModif)) {
                        ligne.style.display = "none";
                    } else {
                        ligne.style.display = "table-row";
                    }
            
                    viderLigneSource();
                });
            
                mettreAJourTotaux();
            }
        });

        annulerModification.addEventListener('click', (e) => {
            e.preventDefault();
            popupEdit.classList.add('invisible');
            mettreAJourTotaux();
        });

        // Au clic sur "Annuler" pour la confirmation, je ferme la popup d'alerte
        annulationModif.addEventListener('click', () => {
            confirmationModif.classList.add('invisible');
            mettreAJourTotaux();
        });

        let validerModificationClicked = false;
        let confirmation = false;
        
        const clicModifierEcriture = (e) => {
            const target = e.target;

            // ----------------------------------------------------------------------- //
            // --- PARTIE 1 : code à exécuter pour le deuxième clic sur "modifier" --- //
            // ----------------------------------------------------------------------- //

            // Si l'icône a déjà été cliquée, cela signifique qu'on se trouve sur la page avec le groupe d'écriture sélectionné
            if (dejaClique) {

                montantEdit.style.color = "";
                debitTotal.textContent = "";
                creditTotal.textContent = "";
                
                popupEdit.classList.remove('invisible');
                popupEdit.style.zIndex = 200;

                // Je récupère les données dont j'ai besoin pour les insérer dans les inputs de la popup par la suite
                numeroLigneModif = target.closest('tr.passage').querySelector('.numeroLigneEcriture').textContent;
                numeroLotModif = document.querySelector('.numLotEcriture').textContent;
                regleModif = document.querySelector('.regleAppliqueeEcriture').textContent;
                statutEcriture = target.closest('tr.passage').querySelector('.statutEcriture').textContent;
                compteDebiteTd = target.closest('tr.passage').querySelector('.compteDebitEcriture').textContent;
                compteCrediteTd = target.closest('tr.passage').querySelector('.compteCreditEcriture').textContent;
                let libLigneModif = target.closest('tr.passage').querySelector('.libelleLigneEcriture').textContent;
                let sensEcritureModif = target.closest('tr.passage').querySelector('.sensEcriture').textContent;
                let montantModif = target.closest('tr.passage').querySelector('.montantEcriture').textContent;
                let libelleModif = target.closest('tr.passage').querySelector('.libelleEcriture').textContent;
                let libExModif = target.closest('tr.passage').querySelector('.libelleExfilesEcriture').textContent;
                let za1Modif = target.closest('tr.passage').querySelector('.za1Ecriture').textContent;
                let za2Modif = target.closest('tr.passage').querySelector('.za2Ecriture').textContent;
                let za3Modif = target.closest('tr.passage').querySelector('.za3Ecriture').textContent;
                let za4Modif = target.closest('tr.passage').querySelector('.za4Ecriture').textContent;
                let za5Modif = target.closest('tr.passage').querySelector('.za5Ecriture').textContent;
                let za6Modif = target.closest('tr.passage').querySelector('.za6Ecriture').textContent;
                let za7Modif = target.closest('tr.passage').querySelector('.za7Ecriture').textContent;
                let za8Modif = target.closest('tr.passage').querySelector('.za8Ecriture').textContent;
                let za9Modif = target.closest('tr.passage').querySelector('.za9Ecriture').textContent;
                let za10Modif = target.closest('tr.passage').querySelector('.za10Ecriture').textContent;

                // Je récupère les td de la ligne sélectionnée pour réattribuer les valeurs après la modification :
                statutModifie = target.closest('tr.passage').querySelector('.statutEcriture');
                libelleLigneModifie = target.closest('tr.passage').querySelector('.libelleLigneEcriture');
                compteDebitModifie = target.closest('tr.passage').querySelector('.compteDebitEcriture');
                compteCreditModifie = target.closest('tr.passage').querySelector('.compteCreditEcriture');
                montantModifie = target.closest('tr.passage').querySelector('.montantEcriture');
                sensEcritureModifie = target.closest('tr.passage').querySelector('.sensEcriture');
                libelleEcritureModifie = target.closest('tr.passage').querySelector('.libelleEcriture');
                codeJournalModifie = target.closest('tr.passage').querySelector('.journalComptableEcriture');
                exfilesModifie = target.closest('tr.passage').querySelector('.libelleExfilesEcriture');
                referenceModifiee = target.closest('tr.passage').querySelector('.referenceEcriture');
                za1Modifiee = target.closest('tr.passage').querySelector('.za1Ecriture');
                za2Modifiee = target.closest('tr.passage').querySelector('.za2Ecriture');
                za3Modifiee = target.closest('tr.passage').querySelector('.za3Ecriture');
                za4Modifiee = target.closest('tr.passage').querySelector('.za4Ecriture');
                za5Modifiee = target.closest('tr.passage').querySelector('.za5Ecriture');
                za6Modifiee = target.closest('tr.passage').querySelector('.za6Ecriture');
                za7Modifiee = target.closest('tr.passage').querySelector('.za7Ecriture');
                za8Modifiee = target.closest('tr.passage').querySelector('.za8Ecriture');
                za9Modifiee = target.closest('tr.passage').querySelector('.za9Ecriture');
                za10Modifiee = target.closest('tr.passage').querySelector('.za10Ecriture');

                // Génération du titre de la popup
                modifTitre.textContent = `eXfiles - N° Ligne source : ${numeroLigneSourceModif}, N° Import : ${numeroLotModif}, Règle ${regleModif}, N° Ligne : ${numeroLigneModif}`;

                // Je récupère la liste des comptes paramétrés et je crée mes options pour la balise <datalist> Compte Sélection / Je fais la même chose pour les codes journaux
                const donneesParametrees = async () => {
                    const data = await listeCompteParametres();
                    const comptesParam = data.comptesParam;
                    const codesJournaux = data.codesJournaux;
                    
                    // Création de la liste des codes comptes dans la datalist #compteOptions
                    comptesParam.map((compte) => {
                        const codeCompte = document.createElement('option');
                        codeCompte.value = compte;
                        codeCompte.textContent = compte;
                        compteSelection.append(codeCompte);
                    })
                    
                    // Création de la liste des codes journaux dans la datalist #journalOptions
                    codesJournaux.map((code) => {
                        const codeJournal = document.createElement('option');
                        codeJournal.value = code;
                        codeJournal.textContent = code;
                        codeJournalEdit.append(codeJournal);
                    })
                };
                donneesParametrees();

                const gestionInputCompte = () => {
                    const texteSaisi = inputCompte.value.toLowerCase();
                    const options = compteOptions.options;

                    // Si l'utilisateur saisit quelque chose qui correspond avec un élément de la liste retournée, j'affiche le texte en noir et je lui affiche également les options correspondantes
                    for (let i = 0; i < options.length; i++) {
                        const optionValue = options[i].value.toLowerCase();
                        if (optionValue.includes(texteSaisi)) {
                            inputCompte.style.color = "";
                            return;
                        }
                    }

                    // Si l'utilisateur saisi un code compte qui n'existe pas dans la liste je lui affiche en rouge
                    if (inputCompte.classList.contains('listeRouge')) {
                        inputCompte.style.color = "red";
                    }
                };

                // Afficher le numéro de compte dans le champ "Compte" de popupEdit en fonction de la ligne choisie
                // Si la case "Compte Débité" n'est pas vide, j'attribue sa valeur à l'input Compte de la popup, ainsi qu'à la case modifiée correspondante
                if (compteDebiteTd != "") {
                    inputCompte.value = compteDebiteTd;
                    compteDebitModifie.textContent = compteDebiteTd;
                    compteCreditModifie.textContent = "";
                } else if (compteCrediteTd != "") {
                    inputCompte.value = compteCrediteTd;
                    compteCreditModifie.textContent = compteCrediteTd;
                    compteDebitModifie.textContent = "";
                }

                const gestionInputJournal = () => {
                    const texteSaisi = inputJournal.value.toLowerCase();
                    const options = codeJournalEdit.options;

                    // Si l'utilisateur saisit quelque chose qui correspond avec un élément de la liste retournée, j'affiche le texte en noir et je lui affiche également les options correspondantes
                    for (let i = 0; i < options.length; i++) {
                        const optionValue = options[i].value.toLowerCase();
                        if (optionValue.includes(texteSaisi)) {
                            inputJournal.style.color = "";
                            return;
                        } else if (optionValue == '?') {
                            inputJournal.style.backgroundColor = "red";
                            return;
                        }
                    }

                    // Si l'utilisateur saisi un code journal qui n'existe pas dans la liste je lui affiche en rouge
                    if (inputJournal.classList.contains('listeRouge')) {
                        inputJournal.style.color = "red";
                    }
                };

                inputCompte.addEventListener('input', gestionInputCompte);
                inputJournal.addEventListener('input', gestionInputJournal);


                // ----------------------------------------------------------------------------------------------- //
                // Attribution des données de la ligne dans les inputs correspondants de la fenêtre "Modification" //
                // ----------------------------------------------------------------------------------------------- //
                libLigneEdit.value = libLigneModif;

                // Attribution de la valeur à l'input radio coché : si la case "Sens" est "D" ou "C"
                if (sensEcritureModif.toLowerCase() == 'd') {
                    D.checked = true;
                    C.checked = false;
                } else if (sensEcritureModif.toLowerCase() == 'c') {
                    D.checked = false;
                    C.checked = true;
                }

                libEdit.value = libelleModif;
                libExfilesEdit.value = libExModif;
                
                za1Edit.value = za1Modif;
                za2Edit.value = za2Modif; 
                za3Edit.value = za3Modif; 
                za4Edit.value = za4Modif; 
                za5Edit.value = za5Modif; 
                za6Edit.value = za6Modif; 
                za7Edit.value = za7Modif; 
                za8Edit.value = za8Modif; 
                za9Edit.value = za9Modif; 
                za10Edit.value = za10Modif;


                // Je cible les inputs de la popup Modification afin d'attribuer les styles correspondants en fonction du contenu
                const inputs = document.querySelectorAll('.inputModifiable');
                inputs.forEach((input) => {
                    // Si le contenu d'un des inputs est un "?", je mets en surbrillance rouge
                    if (input.value == "?") {
                        input.style.backgroundColor = "rgb(255, 90, 90)";
                        input.style.fontWeight = "bold";
                        input.style.color = "red";
                    } else {
                        input.style.backgroundColor = "#fff";
                        input.style.fontWeight = "";
                    }

                    // Si l'utilisateur veut modifier un input dont le fond est en rouge, je lui passe le fond en blanc et je remets ce qu'il saisit en noir
                    input.addEventListener('input', () => {
                        if (input.value.trim() == '') {
                            input.style.backgroundColor = "#fff";
                            input.style.fontWeight = "";
                            input.style.color = "";
                        }
                    });
                });

                // Attribution du montant et conditions s'il est modifié par l'utilisateur
                montantEdit.value = montantModif;
                let nouveauMontant;
                montantEdit.addEventListener('input', (e) => {
                    nouveauMontant = e.target.value;
                    
                    if (nouveauMontant != montantModif) {
                        montantEdit.value = nouveauMontant;
                        montantEdit.style.color = "red";
                    } else {
                        montantEdit.style.color = "";
                    }
                })

                validerModificationClicked = false;
                confirmation = false;

                validerModification.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (!validerModificationClicked && !confirmation && montantEdit.value != montantModif) {
                        confirmation = true;
                        validerModificationClicked = true;
                        afficherConfirmationModif();
                    }

                }, { once: true })

                // Je vérifie si les montants Crédit et Débit sont égaux ET que le montant de la td "Montant" est différent de "?"
                if (creditTotal.textContent == debitTotal.textContent) {

                    validerModificationClicked = false;
                    validerModification.addEventListener('click', (e) => {
                        e.preventDefault();
                    
                        if (!validerModificationClicked) {
                            // Je définis la variable de contrôle à true pour indiquer que le clic sur "Valider" de la fenêtre Modification a été effectué
                            validerModificationClicked = true;
                            executerModification();
                        }
                    // J'utilise  { once: true } pour ne pas avoir d'exécutions multiples de la requête par la suite à la modification d'autres lignes
                    }, { once: true });

                    
                // Je vérifie si les montants Crédit et Débit sont égaux OU que le montant de la td "Montant" est différent de "?"
                } else if (montantTotalCredit != montantTotalDebit || montantModif == "?") {
                    validerModificationClicked = false;
                    confirmation = false;

                    validerModification.addEventListener('click', (e) => {
                        e.preventDefault();
                        if (!validerModificationClicked && !confirmation) {
                            confirmation = true;
                            validerModificationClicked = true;
                            afficherConfirmationModif();
                        }
                    }, { once: true });
                }

                // Fonction pour afficher la fenêtre de confirmation et exécuter si besoin la requête
                function afficherConfirmationModif() {
                    confirmationModif.classList.remove('invisible');
                    confirmationModif.style.width = "fit-content";

                    validationModif.addEventListener('click', (e) => {
                        e.preventDefault();
                        confirmationModif.classList.add('invisible');
                        popupEdit.classList.add('invisible');
                        
                        executerModification();
                    }, { once: true });
                }
                                    

                // Je sors de la fonction pour éviter de répéter le filtrage
                return;
            }

            // Je passe dejaClique à true pour éviter d'exécuter à nouveau le même code si l'icône est cliquée plusieurs fois
            dejaClique = true;
            
            // Je désactive temporairement le gestionnaire d'événements (tant que je suis sur le groupe d'écriture, j'enlève le clic sur la première icône)
            modifierEcriture.forEach((modif) => {
                modif.removeEventListener('click', clicModifierEcriture);
            });

            
            // ----------------------------------------------------------------------- //
            // ---- PARTIE 2 : code à exécuter pour le premier clic sur "modifier" --- //
            // ----------------------------------------------------------------------- //
  
            let montantDebitLigne = 0;
            let montantCreditLigne = 0;

            
            // Dans un premier temps je masque toutes les lignes
            lignes.forEach((ligne) => {
                ligne.style.display = "none";
            });

            // Je récupère le numéro de ligne source correspond à l'icone cliquée
            numeroLigneSourceModif = e.currentTarget.closest('tr.passage').querySelector('.numLigneSourceEcriture').textContent;

            // Puis je filtre toutes les lignes pour garder seulement celles avec le même numéro de ligne
            lignesAModifier = Array.from(lignes)
                .filter(ligne => ligne.querySelector('.numLigneSourceEcriture')
                .textContent == numeroLigneSourceModif);

            // Et je les affiche. J'affiche également le bouton "Retour" pour pouvoir revenir en arrière
            lignesAModifier.forEach((ligne) => {
                ligne.style.display = "table-row";
                h5.textContent = "Modifier une écriture";
                retourModif.classList.remove('invisible');
            });


            // Calcul des totaux
            lignesAModifier.forEach((ligne) => {
                const sensLigne = ligne.querySelector(".sensEcriture").textContent.trim();
                const montantLigne = ligne.querySelector(".montantEcriture").textContent.trim();

                if (sensLigne == "D" && montantLigne != "?") {
                    montantDebitLigne += parseFloat(montantLigne.replace(",", "."));
                    nouveauTotalDebit = montantDebitLigne.toFixed(2);
                } else if (sensLigne == "C" && montantLigne != "?") {
                    montantCreditLigne += parseFloat(montantLigne.replace(",", "."));
                    nouveauTotalCredit = montantCreditLigne.toFixed(2);
                }
            });

            debitTotal.textContent = nouveauTotalDebit;
            creditTotal.textContent = nouveauTotalCredit;

            if (montantCreditLigne != montantDebitLigne) {
                creditTotal.style.color = "red";
                creditTotal.style.fontWeight = "bold";
                debitTotal.style.color = "red";
                debitTotal.style.fontWeight = "bold";
            } else {
                creditTotal.style.color = "";
                creditTotal.style.fontWeight = "";
                debitTotal.style.color = "";
                debitTotal.style.fontWeight = "";
            }

            // Réactiver l'évènement au clic après avoir exécuter le code de la partie 2
            modifierEcriture.forEach((modif) => {
                modif.addEventListener('click', clicModifierEcriture);
            });
        };


        async function executerModification() {
            // Fermer la fenêtre popup
            popupEdit.classList.add('invisible');
                                
            // Envoi des données saisies au serveur
            // Je récupère le bouton radio choisi, le compte et le code journal
            const radioChecked = document.querySelector('input[name="sensEcriture"]:checked').value;
            const inputJournal = document.querySelector('input[list="journalOptions"]');
            const valeurJournal = inputJournal.value;
            const lotEnCours = option1.textContent;
            const numImportSource = lotEnCours.split(' ')[2];

            let valeurEnvoyeeCredit = "";
            let valeurEnvoyeeDebit = "";

            // Si la case "Compte Débité" n'est pas vide, cela signifie que la valeur entrée dans le champ "Compte" devra être attribuée à cette case, et la case "Compte Crédité" devra être vide
            if (compteDebiteTd != "") {
                valeurEnvoyeeDebit = inputCompte.value;
                valeurEnvoyeeCredit = "";
            } else if (compteCrediteTd != "") {
                valeurEnvoyeeCredit = inputCompte.value;
                valeurEnvoyeeDebit = "";
            }

            // Conditions si l'utilisateur change de bouton radio (j'inverse le contenu)
            if (radioChecked == "D") {
                if (compteCrediteTd != "") {
                    valeurEnvoyeeCredit = "";
                    valeurEnvoyeeDebit = inputCompte.value;
                }
            } else if (radioChecked == "C") {
                if (compteDebiteTd != "") {
                    valeurEnvoyeeDebit = "";
                    valeurEnvoyeeCredit = inputCompte.value;
                }
            };

            fetch("http://localhost:3000/visualisation/modifier-ecriture", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    statut: statutEcriture,
                    libelleLigne: libLigneEdit.value,
                    sensEcriture: radioChecked,
                    compteDebite: valeurEnvoyeeDebit,
                    compteCredite: valeurEnvoyeeCredit,
                    codeJournal: valeurJournal,
                    reference: referenecEdit.value,
                    libelle: libEdit.value,
                    montant: montantEdit.value,
                    ZA1 : za1Edit.value,
                    ZA2 : za2Edit.value,
                    ZA3 : za3Edit.value,
                    ZA4 : za4Edit.value,
                    ZA5 : za5Edit.value,
                    ZA6 : za6Edit.value,
                    ZA7 : za7Edit.value,
                    ZA8 : za8Edit.value,
                    ZA9 : za9Edit.value,
                    ZA10 : za10Edit.value,
                    libelleExfiles: libExfilesEdit.value,
                    numLigneSource: numeroLigneSourceModif,
                    numImportSource: numImportSource,
                    idEcriture: numeroLigneModif,
                    codeTraitement: codeTraitementVJC
                })
            })
            .then(response => response.json())
            .then(result => {

                statutModifie.textContent = result[0].statut.trim();
                libelleLigneModifie.textContent = result[0].libelleEcriture.trim();

                if (result[0].compteDebite.trim() != "") {
                    compteDebitModifie.textContent = result[0].compteDebite.trim();
                    compteCreditModifie.textContent = "";

                    // Si la case contenait un "?" et que l'utilisateur la modifie, je repasse le contenu en noir
                    if (result[0].compteDebite.trim() != "?") {
                        compteDebitModifie.style.color = "black";
                        compteDebitModifie.style.fontWeight = "";
                    }
                } else if (result[0].compteCredite.trim() != "") {
                    compteCreditModifie.textContent = result[0].compteCredite.trim();
                    compteDebitModifie.textContent = "";

                    if (result[0].compteCredite.trim() != "?") {
                        compteCreditModifie.style.color = "black";
                        compteCreditModifie.style.fontWeight = "";
                    }
                }

                montantModifie.textContent = result[0].montant.trim();

                if (result[0].sensEcriture.trim() == "C") {
                    sensEcritureModifie.textContent = result[0].sensEcriture.trim();
                    compteCreditModifie.textContent = result[0].compteCredite.trim();
                    compteDebitModifie.textContent = "";
                } else if (result[0].sensEcriture.trim() == "D") {
                    sensEcritureModifie.textContent = result[0].sensEcriture.trim();
                    compteDebitModifie.textContent = result[0].compteDebite.trim();
                    compteCreditModifie.textContent = "";
                }

                libelleEcritureModifie.textContent = result[0].libelle.trim();
                codeJournalModifie.textContent = result[0].journal.trim();
                exfilesModifie.textContent = result[0].LIBEXFILES.trim();
                referenceModifiee.textContent = result[0].reference.trim();
                za1Modifiee.textContent = result[0].ZA1.trim();
                za2Modifiee.textContent = result[0].ZA2.trim();
                za3Modifiee.textContent = result[0].ZA3.trim();
                za4Modifiee.textContent = result[0].ZA4.trim();
                za5Modifiee.textContent = result[0].ZA5.trim();
                za6Modifiee.textContent = result[0].ZA6.trim();
                za7Modifiee.textContent = result[0].ZA7.trim();
                za8Modifiee.textContent = result[0].ZA8.trim();
                za9Modifiee.textContent = result[0].ZA9.trim();
                za10Modifiee.textContent = result[0].ZA10.trim();

                verifierCellules();
                
            });

            // Fonction pour vérifier les valeurs des cellules après chaque modification de ligne
            function verifierCellules() {
                const lignesAffichees = document.querySelectorAll('tr.passage');
                let toutesLesLignesValides = true;

                lignesAffichees.forEach((ligne) => {
                    
                    if (ligne.offsetParent != null) {
                        const tds = ligne.querySelectorAll('td');
                        let contenuTds = '';

                        tds.forEach((td) => {
                            // J'ajoute le contenu de la cellule à la variable contenuTds
                            contenuTds += td.innerText + ' ';
                        });

                        // Si une cellule de la ligne affichée contient "?", alors cette ligne n'est pas valide
                        if (contenuTds.includes("?")) {
                            toutesLesLignesValides = false;
                        }
                    }
                });

                // Si toutes les lignes sont valides, changez le statut de chaque ligne en "V"
                if (toutesLesLignesValides) {
                    lignesAffichees.forEach((ligne) => {
                        if (ligne.offsetParent != null) {
                            const statutModifie = ligne.querySelector('.statutEcriture');

                            if (statutModifie.textContent != "V") {
                                statutModifie.textContent = "V";
                                statutModifie.style.color = "";
                                statutModifie.style.fontWeight = "";
                            }
                        }
                    });
                }

                mettreAJourTotaux();

            };

        };

        function mettreAJourTotaux() {
            // Je cible les lignes affichées au moment où cette fonction est appelée
            const lignesAffichees = Array.from(document.querySelectorAll('tr.passage')).filter(ligne => ligne.offsetParent != null);
            let montantTotalDebit = 0;
            let montantTotalCredit = 0;
        
            lignesAffichees.forEach((ligne) => {
                const sens = ligne.querySelector('.sensEcriture');
                const montant = ligne.querySelector('.montantEcriture');
        
                if (sens.textContent == "D" && montant.textContent != "?") {
                    montantTotalDebit += parseFloat(montant.textContent.replace(",", "."));
                } else if (sens.textContent == "C" && montant.textContent != "?") {
                    montantTotalCredit += parseFloat(montant.textContent.replace(",", "."));
                }
            });
        
            debitTotal.textContent = montantTotalDebit.toFixed(2);
            creditTotal.textContent = montantTotalCredit.toFixed(2);
        
            // Vérification de l'égalité entre montant Crédit et montant Débit
            if (montantTotalCredit != montantTotalDebit) {
                creditTotal.style.color = "red";
                debitTotal.style.color = "red";
            } else {
                creditTotal.style.color = "";
                debitTotal.style.color = "";
            }
        };

        modifierEcriture.forEach((modif) => {
            modif.addEventListener('click', clicModifierEcriture);
        });

    })
};


// ------------------------------------------------------------------------------------------------------ //
// -------------------------------------- GESTION AFFICHAGE DES LOTS ------------------------------------ //
// ------------------------------------------------------------------------------------------------------ //

const creerListe = async () => {

    const response = await fetch("http://localhost:3000/visualisation/afficher-lots", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            codeTraitement: codeTraitementVJC,
            offset: offset
        })
    });

    const result = await response.json();
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

        if (lot.lots.dateXRT.length == 0) {  
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


        // Je modifie le texte de la li et je crée toutes les autres avec les lots
        Object.assign(lotContainer.style, {
            height: "35vh",
            zIndex: 50,
            border: "1px solid var(--grey-color)",
            padding: 0,
        });

        
        const options = document.createElement('li');
        options.classList.add('options');
        options.style.display = "list-item";
        
        option1.style.backgroundColor = "#fff";

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
    
        // Au clic sur une des <li> de la liste, je réinitialise tous les titres qui doivent l'être, je ferme la liste et j'attribue les nouvelles valeurs à option1
        options.addEventListener('click', (e) => {
          
            // Si une requête est déjà en cours, j'empêche le clic
            if (chargementEnCours) {
                return;
            }

            numLotASupprimer = '';
            numLigneASupprimer = '';
            filtresAppliques = '';

            // Réinitialisation de la partie "Filtrer les écritures"
            const filtrer = document.querySelector('.filtrerEcritures');
            const checkboxes = document.querySelectorAll('input[name="filtres"]');
            // Je réinitialise les checkbox
            checkboxes.forEach((checkbox) => {
                checkbox.checked = false;
            });
            filtrer.textContent = "Filtrer les écritures";
            
            isOptionsClicked = true;
            tbody.innerHTML = "";

            const nouveauLot = e.target.innerText;

            option1.textContent = nouveauLot;

            // Paramétrage des valeurs à envoyer au serveur (numImportSource & date format BDD)
            nouveauNumImport = nouveauLot.split(' ')[2];
            localStorage.setItem('nouveauNumImport', nouveauNumImport);
            // Je récupère la date au format JJ/MM/YY
            const regex = /(\d{2}\/\d{2}\/\d{4})/;
            const nouvelleDateImport = nouveauLot.match(regex)[1];
            // Je convertis cette date au format BDD pour l'envoyer au serveur
            let nouvelleDate = nouvelleDateImport.split('/').reverse().join('');

            numImport = nouveauNumImport;
            formattedDate = nouvelleDate;

            creationEcritures(nouveauNumImport, nouvelleDate);
            
            effacerListe();

            // Je réinitialise les valeurs de numeroLotEcriture et numeroLigneEcriture pour la fonctionnalité "Supprimer groupe d'écritures"
            numeroLotEcriture = localStorage.getItem('nouveauNumImport');
            numeroLigneEcriture = '';

            // Je cible les titres "Toutes les écritures ont été supprimées." et "Modofier une écriture" + le bouton de retour, et s'ils sont affichés, je les réinitialise correctement
            const pasEcritures = document.querySelector('.ecrituresSupprimees');
            if (pasEcritures) {
                pasEcritures.remove();
            }
            // Je réinitialise également le titre "Ecriture"
            const h5 = document.querySelector('#title-ecriture');
            const retourModif = document.querySelector('.retourModif');
            if (h5.textContent == "Modifier une écriture" && retourModif) {
                h5.textContent = "Ecriture";
                retourModif.classList.add('invisible');
            }
            
            // Je récupère la valeur du numImportSource stocké dans le localStorage dans la fonction recuperationCodesTraitement()
            newNum = localStorage.getItem('nouveauNumImport');

            // Je stoppe l'évènement de clic pour ne pas qu'il se propage vers les éléments parents
            e.stopPropagation();

        });

    }

};


// J'ajoute un évènement au clic sur l'option affichée afin de simuler la liste déroulante
option1.addEventListener('click', async () => {
    offset = 0;

    // Je vérifie si la fonction a déjà été appelée, pour ne pas charger les mêmes lots plusieurs fois
    if (!creerListeDejaAppelee && !chargementEnCours) {
        creerListeDejaAppelee = true;
        chargementEnCours = false;
        await creerListe();
    }
})

// J'ajoute également un évènement au scroll sur le container pour adapter le chargement de la liste des lots
lotContainer.addEventListener('scroll', async () => {

    // Si une <li>> est cliquée dans la liste, je passe isOptionsClicked à false pour ne pas redéclencher l'appel à creerListe() avant le prochain clic sur "option1"
    if (isOptionsClicked) {
        isOptionsClicked = false;
        return;
    }


    // Je stocke les variables me permettant de voir à quel moment on a atteint la fin de la liste
    const containerHeight = lotContainer.offsetHeight;
    const scrollTop = lotContainer.scrollTop;
    const scrollHeight = lotContainer.scrollHeight;
    
    // Ajout d'une marge d'erreur pour détecter la fin du scroll (pour éviter d'arriver à la fin de la liste et que ce ne soit pas correctement détecté)
    const scrollMargin = 5;
    
    // Si le défilement a atteint la fin de la liste, j'appelle la fonction pour charger plus de lots en augmentant l'offset de 15 pour bien charger les lots 15 par 15
    if (scrollTop >= scrollHeight - containerHeight - scrollMargin && !chargementEnCours) {
        
        chargementEnCours = true;
        creerListeDejaAppelee = false;
        
        offset += 15;

        await creerListe();

        chargementEnCours = false;
        creerListeDejaAppelee = true;
    };
});

// Si l'utilisateur clique en-dehors de la liste, on ferme la liste mais on laisse "option1" affichée
document.addEventListener('click', (event) => {
    const target = event.target;
    const options = document.querySelectorAll('.options:not(:first-child)');
    const listeCodesTr = Array.from(document.querySelectorAll('.ListeCodeTraitement'));

    if (!listeCodesTr.includes(target)) {
        options.forEach((op) => {
            if (op != option1) {
                op.style.display = "none";
            }

            lotContainer.style.height = "auto";
            lotContainer.style.border = "none";
            option1.style.backgroundColor = 'rgba(212, 247, 231, 0.7)';
        });
    }

    // Je repasse bien mes variables de contrôle à false pour pouvoir réexécuter la fonction creerListe() au nouveau clic sur "option1"
    creerListeDejaAppelee = false;
    chargementEnCours = false;
});


//------------------------------------------------------------------------------------------------ //
//-----------------------------------  POPUP DÉTAIL ÉCRITURE ------------------------------------- //
//------------------------------------------------------------------------------------------------ //

const afficherFichiersFRPouCAMT054 = async () => {

    await fetch("http://localhost:3000/visualisation/lignesource", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            codeTraitement: codeTraitementVJC,
            numImportSource: numeroImportSource,
            numeroDeLigne: numeroDeLigne
        })
    })
    .then(response => response.json())
    .then(result => {

        let TypeFichSource = result.entete.TypeFichSource;
        let dateComptaOpe = result.entete.DateComptaOperat;
        let finDate = result.entete.DateFin;

        // • DateImport
        const yearDI = result.entete.DateImport.slice(0, 4);
        const moisDI = result.entete.DateImport.slice(4, 6) - 1;
        const dayDI = result.entete.DateImport.slice(6, 8);
        const dateImportObjDI = new Date(yearDI, moisDI, dayDI);
        const newDateImport = dateImportObjDI.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric', year: 'numeric' });

        // • DateComptaOperat
        const jourComptaOp = dateComptaOpe.substr(0, 2);
        const moisComptaOp = dateComptaOpe.substr(2, 2);
        const anneeComptaOp= dateComptaOpe.substr(4, 2);
        const newDateOperat = `${jourComptaOp}/${moisComptaOp}/${anneeComptaOp}`;

        // • DateValeur
        const dateVal = result.entete.DateValeur;
        const jourVal = dateVal.substr(0, 2);
        const moisVal = dateVal.substr(2, 2);
        const anneeVal = dateVal.substr(4, 2);
        const newDateValeur = `${jourVal}/${moisVal}/${anneeVal}`;

        //  • dateFin
        const dayF = finDate.substring(0, 2);
        const monthF = finDate.substring(2, 4);
        const yearF = finDate.substring(4, 8);
        const dateF = new Date(`${yearF}-${monthF}-${dayF}`);
        const newDateFin = dateF.toLocaleDateString("fr-FR");
        
        // • dateXRT
        let dateXRT = result.entete.dateXRT;
        const dateXRTObj = new Date(dateXRT);
        const newDateXRT = dateXRTObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric', year: 'numeric' });

        if (TypeFichSource.trim() === "FRP" || TypeFichSource.trim() === "CAMT054") {

            user.textContent = result.entete.UserImport;
            numeroImportDE.textContent = numeroImportSource;
            dateImportDE.textContent = newDateImport;
            nomFichierSource.textContent = result.entete.NomFichSource;
            numeroLigneDE.textContent = numeroDeLigne;
            codeEtablissementDE.textContent = result.entete.CodeEnreg;
            codeBanqueDE.textContent = result.entete.CodeBanque;
            ZR1.textContent = result.entete.ZoneReservee1;
            codeGuichet.textContent = result.entete.CodeGuichet;
            codeDeviseCompte.textContent = result.entete.CodeDeviseCompte;
            codeDeviseMvt.textContent = result.entete.CodeDeviseMVT;
            nbDecimSolde.textContent = result.entete.NbDecimSolde;
            ZR2.textContent = result.entete.ZoneReservee2;
            ZR3.textContent = result.entete.ZoneReservee3;
            ZR4.textContent = result.entete.ZoneReservee4;
            ZR5.textContent = result.entete.ZoneReservee5;
            numCompteDE.textContent = result.entete.NumCompte;
            dateSoldeInit.textContent = result.entete.DateSoldeInit;
            montantSoldeInit.textContent = result.entete.montantSoldeInit;
            codeOperationInterne.textContent = result.entete.CodeOpeInterne;
            codeGuichetCompteOuvert.textContent = result.entete.CodeGuichetCompteOuvert;
            codeOpeInterban.textContent = result.entete.CodeOperatInterban;
            dateComptaOperat.textContent = newDateOperat;
            codeMotifRejet.textContent = result.entete.CodeMotifRejet;
            dateValeurDE.textContent = newDateValeur;
            libelleDE.textContent = result.entete.Libelle;
            numeroEcriture.textContent = result.entete.NumEcriture;
            indiceExonerationMVT.textContent = result.entete.IndiceExoneMouv;
            indiceIndisponibilite.textContent = result.entete.IndiceIndispo;
            montantMVT.textContent = result.entete.MontantMouvement;
            nbDecimMontantMVT.textContent = result.entete.NBDecimMontantMouv;
            qualifiantZoneIC.textContent = result.entete.QualifiantZoneInfoCompl;
            infosCompl.textContent = result.entete.InfosComplem;
            dateSoldeFinal.textContent = result.entete.DateSoldeFinal;
            montantSolideFinal.textContent = result.entete.MontantSoldeFinal;
            codeFlux.textContent = result.entete.Flux;
            refDE.textContent = result.entete.Reference;
            codeBudgetDE.textContent = result.entete.CodeBudget;
            nombre.textContent = result.entete.Nombre;
            frais.textContent = result.entete.Frais;
            numeroJournalTreso.textContent = result.entete.NumJournalTreso;
            numeroSite.textContent = result.entete.NumSite;
            numeroLog.textContent = result.entete.NumLog;
            dateFin.textContent = newDateFin;
            montantCVal.textContent = result.entete.MontantCVal;
            sensDE.textContent = result.entete.Sens;
            suppression.textContent = result.entete.Supp;
            numeroEcriture.textContent = result.entete.NumEcritERP;
            IC1.textContent = result.entete.InfoComp1;
            IC2.textContent = result.entete.InfoComp2;
            IC3.textContent = result.entete.InfoComp3;
            IC4.textContent = result.entete.InfoComp4;
            IC5.textContent = result.entete.InfoComp5;
            IC6.textContent = result.entete.InfoComp6;
            IC7.textContent = result.entete.InfoComp7;
            IC8.textContent = result.entete.InfoComp8;
            IC9.textContent = result.entete.InfoComp9;
            IC10.textContent = result.entete.InfoComp10;
            IC11.textContent = result.entete.InfoComp11;
            IC12.textContent = result.entete.InfoComp12;
            IC13.textContent = result.entete.InfoComp13;
            IC14.textContent = result.entete.InfoComp14;
            IC15.textContent = result.entete.InfoComp15;
            IC16.textContent = result.entete.InfoComp16;
            IC17.textContent = result.entete.InfoComp17;
            IC18.textContent = result.entete.InfoComp18;
            IC19.textContent = result.entete.InfoComp19;
            IC20.textContent = result.entete.InfoComp20;
            IC21.textContent = result.entete.InfoComp21;
            IC22.textContent = result.entete.InfoComp22;
            IC23.textContent = result.entete.InfoComp23;
            IC24.textContent = result.entete.InfoComp24;
            ZU1.textContent = result.entete.ZoneUtil1;
            ZU2.textContent = result.entete.ZoneUtil2;
            ZU3.textContent = result.entete.ZoneUtil3;
            ZU4.textContent = result.entete.ZoneUtil4;
            ZU5.textContent = result.entete.ZoneUtil5;
            codeDossierDE.textContent = result.entete.codeDossier;
            codeTrDE.textContent = codeTraitementVJC;
            codeSocieteDE.textContent = result.entete.eXfilesCodeSociete;
            codeBanqueDE.textContent = result.entete.eXfilesCodeBanque;
            codeCompteDE.textContent = result.entete.eXfilesCodeCompte;
            codeJournalDE.textContent = result.entete.eXfilesCodeJournal;
            codeEtablissementDE.textContent = result.entete.eXfilesCodeEtablissement;
            idCompte.textContent = result.entete.eXfilesIdentifiantCompte;
            natureFlux.textContent = result.entete.eXfilesNatureFlux;
            dateGeneration.textContent = newDateXRT;
        }

    })
};


//  J'indique l'emplacement où on se trouve en créant un élément h4 sous le h3 'Détail Ecriture'
const h3 = document.querySelector('#detailEcritureTitre');

// Création du h4 contenant "Ligne 1 sur ..."
const indicLigne = document.createElement('h4');
indicLigne.classList.add('indicLigne');


// Afficher les données correspondant à une ligne retournée par la requête
const afficherLigne = (numeroLigne) => {
    let ligne = detailEcriture[numeroLigne - 1];
    
    indicLigne.textContent = `Ligne ${numeroLigne} sur ${nombreLignesTotal}`;

    // J'insère le h4 juste en-dessous du h3
    h3.insertAdjacentElement('afterend', indicLigne);

    // • DateImport
    const year = ligne.DateImport.slice(0, 4);
    const mois = ligne.DateImport.slice(4, 6) - 1;
    const day = ligne.DateImport.slice(6, 8);
    const dateImportObj = new Date(year, mois, day);
    const newDateImportDE = dateImportObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric', year: 'numeric' });

    // • DateComptaOperat
    const dateCompta = ligne.DateComptaOperat;
    const jourCompta = dateCompta.substr(0, 2);
    const moisCompta = dateCompta.substr(2, 2);
    const anneeCompta = dateCompta.substr(4, 2);
    const newDateOperatDE = `${jourCompta}/${moisCompta}/${anneeCompta}`;

    // • DateSoldeInit
    const dateInit = ligne.DateSoldeInit;
    const jourSoldeInit = dateInit.substr(0, 2);
    const moisSoldeInit = dateInit.substr(2, 2);
    const anneeSoldeInit = dateInit.substr(4, 2);
    const newDateSoldeInitDE = `${jourSoldeInit}/${moisSoldeInit}/${anneeSoldeInit}`;

    // • DateValeur
    const dateValeur = ligne.DateValeur;
    const jourValeur = dateValeur.substr(0, 2);
    const moisValeur = dateValeur.substr(2, 2);
    const anneeValeur = dateValeur.substr(4, 2);
    const newDateValeurDE = `${jourValeur}/${moisValeur}/${anneeValeur}`;

    // • DateSoldeFinal
    const dateSoldeFinal = ligne.DateSoldeFinal;
    const jourSoldeFinal = dateSoldeFinal.substr(0, 2);
    const moisSoldeFinal = dateSoldeFinal.substr(2, 2);
    const anneeSoldeFinal = dateSoldeFinal.substr(4, 2);
    let newDateSoldeFinalDE = `${jourSoldeFinal}/${moisSoldeFinal}/${anneeSoldeFinal}`;

    // • dateXRT
    let dateXRTDE = ligne.dateXRT;
    const dateXRTDEObj = new Date(dateXRTDE);
    const newDateXRTDE = dateXRTDEObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric', year: 'numeric' });

    user.textContent = ligne.UserImport;
    numeroImportDE.textContent = numeroImportSource;
    dateImportDE.textContent = newDateImportDE;
    nomFichierSource.textContent = ligne.NomFichSource;
    numeroLigneDE.textContent = numeroDeLigne;
    codeEnregistrement.textContent = ligne.CodeEnreg;
    codeBanqueDE.textContent = ligne.CodeBanque;
    ZR1.textContent = ligne.ZoneReservee1;
    codeGuichet.textContent = ligne.CodeGuichet;
    codeDeviseCompte.textContent = ligne.CodeDeviseCompte;
    codeDeviseMvt.textContent = ligne.CodeDeviseMVT;
    nbDecimSolde.textContent = ligne.NbDecimSolde;
    ZR2.textContent = ligne.ZoneReservee2;
    ZR3.textContent = ligne.ZoneReservee3;
    ZR4.textContent = ligne.ZoneReservee4;
    ZR5.textContent = ligne.ZoneReservee5;
    numCompteDE.textContent = ligne.NumCompte;
    dateSoldeInit.textContent = newDateSoldeInitDE;
    montantSoldeInit.textContent = ligne.montantSoldeInit;
    codeOperationInterne.textContent = ligne.CodeOpeInterne;
    codeGuichetCompteOuvert.textContent = ligne.CodeGuichetCompteOuvert;
    codeOpeInterban.textContent = ligne.CodeOperatInterban;
    dateComptaOperat.textContent = newDateOperatDE;
    codeMotifRejet.textContent = ligne.CodeMotifRejet;
    dateValeurDE.textContent = newDateValeurDE;
    libelleDE.textContent = ligne.Libelle;
    numeroEcriture.textContent = ligne.NumEcriture;
    indiceExonerationMVT.textContent = ligne.IndiceExoneMouv;
    indiceIndisponibilite.textContent = ligne.IndiceIndispo;
    montantMVT.textContent = ligne.MontantMouvement;
    nbDecimMontantMVT.textContent = ligne.NBDecimMontantMouv;
    qualifiantZoneIC.textContent = ligne.QualifiantZoneInfoCompl;
    infosCompl.textContent = ligne.InfosComplem;
    dateSoldeFinal.textContent = newDateSoldeFinalDE;
    montantSolideFinal.textContent = ligne.MontantSoldeFinal;
    codeFlux.textContent = ligne.Flux;
    refDE.textContent = ligne.Reference;
    codeBudgetDE.textContent = ligne.CodeBudget;
    nombre.textContent = ligne.Nombre;
    frais.textContent = ligne.Frais;
    numeroJournalTreso.textContent = ligne.NumJournalTreso;
    numeroSite.textContent = ligne.NumSite;
    numeroLog.textContent = ligne.NumLog;
    dateFin.textContent = ligne.DateFin;
    montantCVal.textContent = ligne.MontantCVal;
    sensDE.textContent = ligne.Sens;
    suppression.textContent = ligne.Supp;
    numeroEcriture.textContent = ligne.NumEcritERP;
    IC1.textContent = ligne.InfoComp1;
    IC2.textContent = ligne.InfoComp2;
    IC3.textContent = ligne.InfoComp3;
    IC4.textContent = ligne.InfoComp4;
    IC5.textContent = ligne.InfoComp5;
    IC6.textContent = ligne.InfoComp6;
    IC7.textContent = ligne.InfoComp7;
    IC8.textContent = ligne.InfoComp8;
    IC9.textContent = ligne.InfoComp9;
    IC10.textContent = ligne.InfoComp10;
    IC11.textContent = ligne.InfoComp11;
    IC12.textContent = ligne.InfoComp12;
    IC13.textContent = ligne.InfoComp13;
    IC14.textContent = ligne.InfoComp14;
    IC15.textContent = ligne.InfoComp15;
    IC16.textContent = ligne.InfoComp16;
    IC17.textContent = ligne.InfoComp17;
    IC18.textContent = ligne.InfoComp18;
    IC19.textContent = ligne.InfoComp19;
    IC20.textContent = ligne.InfoComp20;
    IC21.textContent = ligne.InfoComp21;
    IC22.textContent = ligne.InfoComp22;
    IC23.textContent = ligne.InfoComp23;
    IC24.textContent = ligne.InfoComp24;
    ZU1.textContent = ligne.ZoneUtil1;
    ZU2.textContent = ligne.ZoneUtil2;
    ZU3.textContent = ligne.ZoneUtil3;
    ZU4.textContent = ligne.ZoneUtil4;
    ZU5.textContent = ligne.ZoneUtil5;
    codeDossierDE.textContent = ligne.codeDossier;
    codeTrDE.textContent = codeTraitementVJC;
    codeSocieteDE.textContent = ligne.eXfilesCodeSociete;
    codeBanqueDE.textContent = ligne.eXfilesCodeBanque;
    codeCompteDE.textContent = ligne.eXfilesCodeCompte;
    codeJournalDE.textContent = ligne.eXfilesCodeJournal;
    codeEtablissementDE.textContent = ligne.eXfilesCodeEtablissement;
    idCompte.textContent = ligne.eXfilesIdentifiantCompte;
    natureFlux.textContent = ligne.eXfilesNatureFlux;
    dateGeneration.textContent = newDateXRTDE;
};


// ---------------------------------------------------------------------------------------------------------- //
//                              BOUTONS PRÉCÉDENT ET SUIVANT POPUP DÉTAIL ÉCRITURE                            //
// ---------------------------------------------------------------------------------------------------------- //

// Je cible les div correspondant aux boutons Précédent et Suivant pour les afficher dans la pop-up Détail Ecriture
let previousBtn = document.querySelector('.previous');
let nextBtn = document.querySelectorAll('.nextBtn');
let lastBtn = document.querySelector('.next');
let closePopUp = document.querySelector('.close-button');

// Affichage du bouton Suivant avec son icone
nextBtn.forEach((button) => {

    // Au clic sur le bouton Suivant, je réactive le bouton Précédent
    button.addEventListener('click', () => {
        previousBtn.disabled = false;

        // J'augmente le numéro de ligne et je mets à jour le contenu de "Ligne X sur X..."
        numeroLigne++;
        indicLigne.textContent = `Ligne ${numeroLigne} sur ${nombreLignesTotal}`;

        // Je désactive le bouton Suivant quand on est à "Ligne 5 sur 5" (par exemple)
        if (numeroLigne === nombreLignesTotal) {
            lastBtn.disabled = true;
        }
        
        afficherLigne(numeroLigne);

    });
});

// Au clic sur le bouton Précédent, je décrémente la valeur de numeroLigne de 1
previousBtn.addEventListener('click', () => {

    numeroLigne--;

    // Je vérifie si on est à la 1ère ligne. Si oui => je désactive le bouton "Précédent"
    if (numeroLigne === 1) {
        previousBtn.disabled = true;
    }

    // Réactiver le bouton "Suivant" si il est désactivé
    if (lastBtn.disabled === true) {
        lastBtn.disabled = false;
    }

    // Mettre à jour le contenu de "Ligne X sur X..." en utilisant le nouveau numéro de ligne
    indicLigne.textContent = `Ligne ${numeroLigne} sur ${nombreLignesTotal}`;

    // Afficher les données correspondant à la ligne précédente
    afficherLigne(numeroLigne);
});
 


const afficherFichiersAFB120 = async () => {

    await fetch("http://localhost:3000/visualisation/lignesource", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            codeTraitement: codeTraitementVJC,
            numImportSource: numeroImportSource,
            numeroDeLigne: numeroDeLigne
        })
    })
    .then(response => response.json())
    .then(result => {

        // Je réinitialise le numéro de ligne pour qu'à chaque changement, j'ai bien "Ligne 1 sur ..."
        numeroLigne = 1;

        // Je stocke les données récupérées dans la variable detailEcriture
        detailEcriture = result.detailEcriture;
        nombreLignesTotal = result.detailEcriture.length;

        // S'il y a plus de 1 ligne retournée, j'affiche les boutons Suivant et Précédent
        if (nombreLignesTotal != 1) {
            lastBtn.style.visibility = "visible";
            previousBtn.style.visibility = "visible";
        } else {
            lastBtn.style.visibility = "hidden";
            previousBtn.style.visibility = "hidden";
        }

        afficherLigne(numeroLigne);
    })
};



// ---------------------------------------------------------------------------------------------------------- //
//                          Suppression des lignes d'écriture (= suppresion d'un lot)                         //
// ---------------------------------------------------------------------------------------------------------- //

const divTitre = document.querySelector('.title-img');

toutSupprimer.addEventListener('click', () => {
    attentionToutSupprimer.classList.remove('invisible');
})

annulerToutSupprimer.addEventListener('click', () => {
    attentionToutSupprimer.classList.add('invisible');
})

validerToutSupprimer.addEventListener('click', () => {
    
    attentionToutSupprimer.classList.add("invisible");
    
    fetch("http://localhost:3000/visualisation/supprimer-tout", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            numImportSource: numImport,
        })
    })
    .then(response => {
        // Si la requête a fonctionné, alors je supprime les lignes et je réinitialise le contenu du tableau Ligne Source + le contenu de option1
        if (response.ok) {

            tableauEcriture.style.visibility = "hidden";
            apresTableau.style.visibility = "hidden";

            const pasEcritures = document.createElement('p');
            pasEcritures.textContent = "Toutes les écritures ont été supprimées.";
            pasEcritures.classList.add('ecrituresSupprimees');
            divTitre.insertAdjacentElement('afterend', pasEcritures);
        }
    })
});


// ---------------------------------------------------------------------------------------------------------- //
//                             Bouton 'Editer' sur la page journal-comptable-1.html                           //
// ---------------------------------------------------------------------------------------------------------- //

const editerFichier = async () => {

    try {
        const response = await fetch("http://localhost:3000/visualisation/lotsdetails", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                codeTraitement: codeTraitementVJC,
                numImportSource: numImport,
                dateImport: formattedDate
            })
        });
        
        const result = await response.json();
    
        // Récupération de la date courante au format : YYYMMDDhhmmss
        const getDate = new Date().toISOString().slice(0, -5);
        const currentDate = getDate.replace(/\D/g, "");
    
        // Formatage du nom du fichier qui va être créé
        let fileName = currentDate +  "export_exfiles.xlsx";
    
        // Création d'un nouveau classeur Excel (équivaut à un dossier)
        const workbook = new ExcelJS.Workbook();
    
        // Récupérer le nombre total d'écritures pour l'afficher dans l'onglet 'Toutes (X écritures)':
        let groupeEcritureToutes = {};
        let groupeEcrituresA = {};
        let groupeEcrituresC = {};
        let groupeEcrituresV = {};
        let groupeEcrituresX = {};
        let resultFilteredA = result.filter(e => e.statut.trim() === 'A');
        let resultFilteredC = result.filter(e => e.statut.trim() === 'C');
        let resultFilteredV = result.filter(e => e.statut.trim() === 'V');
        let resultFilteredX = result.filter(e => e.statut.trim() === 'X');
        
        result.forEach((nombreEcritures) => {

            // Je vérifie d'abord que la propriété numLigneSource n'existe pas déjà dans l'objet groupeEcritures
            if (!groupeEcritureToutes[nombreEcritures.numLigneSource]) {
                // Si elle n'existe pas, on crée une nouvelle propriété avec ce numLigneSource à laquelle on ajoute un tableau contenant l'objet nombreEcritures
                groupeEcritureToutes[nombreEcritures.numLigneSource] = [nombreEcritures];

            // Si numLigneSource existe déjà, nous ajoutons simplement l'objet nombreEcritures au tableau groupeEcritures
            } else {
                groupeEcritureToutes[nombreEcritures.numLigneSource].push(nombreEcritures);
            }
        });

        resultFilteredA.forEach((nombreEcritures) => {
            if (!groupeEcrituresA[nombreEcritures.numLigneSource]) {
              groupeEcrituresA[nombreEcritures.numLigneSource] = [nombreEcritures];
            } else {
              groupeEcrituresA[nombreEcritures.numLigneSource].push(nombreEcritures);
            }
        });

        resultFilteredC.forEach((nombreEcritures) => {
            if (!groupeEcrituresAC[nombreEcritures.numLigneSource]) {
              groupeEcrituresAC[nombreEcritures.numLigneSource] = [nombreEcritures];
            } else {
              groupeEcrituresAC[nombreEcritures.numLigneSource].push(nombreEcritures);
            }
        });

        resultFilteredV.forEach((nombreEcritures) => {
            if (!groupeEcrituresV[nombreEcritures.numLigneSource]) {
              groupeEcrituresV[nombreEcritures.numLigneSource] = [nombreEcritures];
            } else {
              groupeEcrituresV[nombreEcritures.numLigneSource].push(nombreEcritures);
            }
        });

        resultFilteredX.forEach((nombreEcritures) => {
            if (!groupeEcrituresX[nombreEcritures.numLigneSource]) {
              groupeEcrituresX[nombreEcritures.numLigneSource] = [nombreEcritures];
            } else {
              groupeEcrituresX[nombreEcritures.numLigneSource].push(nombreEcritures);
            }
        });
        
        let nombreEcritures = Object.keys(groupeEcritureToutes).length;
        let nombreEcrituresA = Object.keys(groupeEcrituresA).length;
        let nombreEcrituresC = Object.keys(groupeEcrituresC).length;
        let nombreEcrituresV = Object.keys(groupeEcrituresV).length;
        let nombreEcrituresX = Object.keys(groupeEcrituresX).length;
    
        // Création d'une nouvelle feuille de calcul (feuille principale)
        const worksheetPrincipale = workbook.addWorksheet(`Toutes (${nombreEcritures} écritures)`);
        const wsAnomalies = workbook.addWorksheet(`Anomalies (${nombreEcrituresA} écritures)`);
        const wsACompleter = workbook.addWorksheet(`A Compléter (${nombreEcrituresC} écritures)`);
        const wsValide = workbook.addWorksheet(`Validé (${nombreEcrituresV} écritures)`);
        const wsInconnu = workbook.addWorksheet(`Inconnu (${nombreEcrituresX} écritures)`);

        // Création de la fonction pour ajouter la ligne d'entête à chaque onglet
        const ajouterLigneEntete = (worksheet) => {
            const ligneEntete = worksheet.addRow(['NumLigneSource', 'NumImport', 'Règle appliquée', 'Flux', 'Société', 'Banque', 'Code compte', 'Date écriture', 'Date opération', 'Statut', 'N° Ligne', 'Libellé de la ligne', 'Compte Débité', 'Compte Crédité', 'Montant', 'Sens', 'Libellé', 'Code Journal', 'Référence', 'Libellé eXfiles', 'Zone Annexe 1', 'Zone Annexe 2', 'Zone Annexe 3', 'Zone Annexe 4', 'Zone Annexe 5', 'Zone Annexe 6', 'Zone Annexe 7', 'Zone Annexe 8', 'Zone Annexe 9', 'Zone Annexe 10']);
            // En gras
            ligneEntete.font = { bold: true };
        }

        // Ajout de la ligne d'entête à chaque feuille de calcul
        ajouterLigneEntete(worksheetPrincipale);
        ajouterLigneEntete(wsAnomalies);
        ajouterLigneEntete(wsACompleter);
        ajouterLigneEntete(wsValide);
        ajouterLigneEntete(wsInconnu);

        
        // Ajout des données dans le classeur Excel
        for (row of result) {
            // la variable data va contenir toutes les informations pour une ligne
            const dataAll = [
                row.numLigneSource, row.numImportSource, row.regleAppliquee, row.Flux, row.eXfilesCodeSociete, row.eXfilesCodeBanque, row.NumCompte, row.DateValeur, row.DateComptaOperat, row.statut, row.idEcriture, row.libelleEcriture, row.compteDebite, row.compteCredite, row.montant, row.sensEcriture, row.libelle, row.journal, row.reference, row.LIBEXFILES, row.ZA1, row.ZA2, row.ZA3, row.ZA4, row.ZA5, row.ZA6, row.ZA7, row.ZA8, row.ZA9, row.ZA10
            ];

            // J'ajoute les données à la feuille de style
            worksheetPrincipale.addRow(dataAll);

            // J'ajoute les conditions pour chaque onglet pour afficher les données en fonction du statut
            if (row.statut.trim() === 'A') {
                const dataA = [
                    row.numLigneSource, row.numImportSource, row.regleAppliquee, row.Flux, row.eXfilesCodeSociete, row.eXfilesCodeBanque, row.NumCompte, row.DateValeur, row.DateComptaOperat, row.statut, row.idEcriture, row.libelleEcriture, row.compteDebite, row.compteCredite, row.montant, row.sensEcriture, row.libelle, row.journal, row.reference, row.LIBEXFILES, row.ZA1, row.ZA2, row.ZA3, row.ZA4, row.ZA5, row.ZA6, row.ZA7, row.ZA8, row.ZA9, row.ZA10
                ]
                wsAnomalies.addRow(dataA);
            } else if (row.statut.trim() === 'C') {
                const dataAC = [
                    row.numLigneSource, row.numImportSource, row.regleAppliquee, row.Flux, row.eXfilesCodeSociete, row.eXfilesCodeBanque, row.NumCompte, row.DateValeur, row.DateComptaOperat, row.statut, row.idEcriture, row.libelleEcriture, row.compteDebite, row.compteCredite, row.montant, row.sensEcriture, row.libelle, row.journal, row.reference, row.LIBEXFILES, row.ZA1, row.ZA2, row.ZA3, row.ZA4, row.ZA5, row.ZA6, row.ZA7, row.ZA8, row.ZA9, row.ZA10
                ]
                wsACompleter.addRow(dataAC);
            } else if (row.statut.trim() === 'V') {
                const dataV = [
                    row.numLigneSource, row.numImportSource, row.regleAppliquee, row.Flux, row.eXfilesCodeSociete, row.eXfilesCodeBanque, row.NumCompte, row.DateValeur, row.DateComptaOperat, row.statut, row.idEcriture, row.libelleEcriture, row.compteDebite, row.compteCredite, row.montant, row.sensEcriture, row.libelle, row.journal, row.reference, row.LIBEXFILES, row.ZA1, row.ZA2, row.ZA3, row.ZA4, row.ZA5, row.ZA6, row.ZA7, row.ZA8, row.ZA9, row.ZA10
                ]
                wsValide.addRow(dataV);
            } else if (row.statut.trim() === 'X') {
                const dataX = [
                    row.numLigneSource, row.numImportSource, row.regleAppliquee, row.Flux, row.eXfilesCodeSociete, row.eXfilesCodeBanque, row.NumCompte, row.DateValeur, row.DateComptaOperat, row.statut, row.idEcriture, row.libelleEcriture, row.compteDebite, row.compteCredite, row.montant, row.sensEcriture, row.libelle, row.journal, row.reference, row.LIBEXFILES, row.ZA1, row.ZA2, row.ZA3, row.ZA4, row.ZA5, row.ZA6, row.ZA7, row.ZA8, row.ZA9, row.ZA10
                ]
                wsInconnu.addRow(dataX);
            }
        }
  
        // Enregistrement du classeur Excel
        const buffer = await workbook.xlsx.writeBuffer();

        // Utilisation de l'API de téléchargement du navigateur pour enregistrer le fichier
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);

        // Modifier le nom du fichier téléchargé
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = fileName;
        downloadLink.click();

        // Révoquer l'URL
        window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(error);
    }
};


editer.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Vérifier si l'élément cliqué est le bouton
    if (e.target.id == 'editer') {
        await editerFichier();
    }
});