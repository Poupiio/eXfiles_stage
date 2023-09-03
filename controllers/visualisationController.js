// J'importe mes paquets NPM
const sql = require("mssql");
const log = require ('../PARAM-ENV/log');

// J'importe la connexion à la base de données client et la fonction getCurrentFile pour les réutiliser
const { connexionClient, getCurrentFile } = require('./userController');


// Récupère les codes traitement pour le dossier en cours
const getUserTraitements = async () => {
    try {
        let pool = await sql.connect(connexionClient);

        let result = await getCurrentFile();
        dossEnCours = (Object.values(result[0])[0]);
        
        let codesTraitement = await pool.request().query(`SELECT codeTraitement FROM dbo.p_traitement WHERE codeDossier = '${dossEnCours}'`);
      
        log.log(`Les codes traitement du dossier en cours ${dossEnCours.trim()} ont été renvoyés avec succès.`);

        return codesTraitement.recordset;

    } catch (err) {
        log.logError(err);
    }
};


// Récupération de la listes des lots disponibles pour un code traitement
// Je paramètre une variable pour indiquer le nombre de lots déjà chargés
const lotsCharges = 15;

const chargerLotsJournalComptable = async (codeTraitement, offset) => {
    try {
        const pool = await sql.connect(connexionClient);

        let currentFile = await getCurrentFile();
        currentFile = currentFile[0].codeDossier;

        // Afficher la liste des lots pour le code traitement sélectionné
        let lots = await pool.request().query(`
            SELECT numImportSource, dateImport, dateXRT, COUNT(DISTINCT dateExport) AS exportPartTotal
            FROM dbo.T_PIVOT_COMPTABLE
            WHERE codeDossier = '${currentFile}' AND codeTraitement = '${codeTraitement}'
            GROUP BY numImportSource, dateImport, dateXRT
            ORDER BY numImportSource DESC, dateImport DESC
            OFFSET ${offset} ROWS FETCH NEXT ${lotsCharges} ROWS ONLY
        `);
        // J'utilise OFFSET pour spécifier à partir de quel endroit on veut obtenir les résultats
        // et FETCH NEXT pour indiquer combien d'enregistrements on veut avec lotsCharges
        // A chaque appel de la fonction chargerLots(), les résultats seront chargés 15 par 15

        let dataLots = {};

        for (let i = 0 ; i < lots.recordset.length ; i++) {
            let numImportSource = lots.recordset[i].numImportSource

            // Obtenir dates d'export pour chaque numImportSource
            let  dateExport = await pool.request().query(`SELECT DISTINCT dateExport FROM dbo.T_PIVOT_COMPTABLE
            WHERE codeDossier = '${currentFile}'
            AND codeTraitement = '${codeTraitement}'
            AND numImportSource = ${numImportSource}
            AND dateExport != ''
            ORDER BY dateExport`);      
        
            if (dateExport.recordset.length === 0) {  
                dateExport = "";
            } else {
                dateExport = dateExport.recordset[0].dateExport;
            }

            let  exportPartiel = await pool.request().query(`SELECT COUNT(DISTINCT dateExport) FROM dbo.T_PIVOT_COMPTABLE
                WHERE codeDossier = '${currentFile}'
                AND codeTraitement = '${codeTraitement}'
                AND numImportSource = ${numImportSource}
                AND dateExport = ''`);

            exportPartiel = exportPartiel.recordset[0].exportPartiel;
            
            dataLots[numImportSource] = {
                dateExport : dateExport,
                exportPartiel : exportPartiel,
                lots : lots.recordset[i]
            }
        }

        log.log(`La liste des lots disponibles pour le code traitement ${codeTraitement} sélectionné par l'utilisateur a bien été retournée. Sont également retournés : les dates d'export pour chaque numImportSource et la vérification de l'export partiel.`);

        return { dataLots } ;

    } catch (err) {
        log.logError(err);
    }
};


// Récupération des détails d'écriture pour un lot
const getLotsDetails = async (codeTraitement, numImportSource, dateImport) => {
    try {
        const pool = await sql.connect(connexionClient);

        let currentFile = await getCurrentFile();
        currentFile = currentFile[0].codeDossier;

        const getDetails = await pool.request().query(`SELECT T_PIVOT_COMPTABLE.*, DateComptaOperat, Flux, NumCompte, DateValeur, eXfilesCodeSociete, eXfilesCodeBanque 
            FROM T_PIVOT_COMPTABLE, T_PIVOT_FILTRE 
            WHERE T_PIVOT_COMPTABLE.numImportSource = T_PIVOT_FILTRE.numImport 
            AND T_PIVOT_COMPTABLE.numLigneSource = T_PIVOT_FILTRE.NumLigne 
            AND T_PIVOT_COMPTABLE.codeDossier = '${currentFile}' 
            AND T_PIVOT_COMPTABLE.codeTraitement = '${codeTraitement}' 
            AND T_PIVOT_COMPTABLE.numImportSource = ${numImportSource}
            AND T_PIVOT_COMPTABLE.dateImport = ${dateImport}
            AND T_PIVOT_FILTRE.CodeEnreg != '05'
            ORDER BY numLigneSource, numImportSource, numImportPC, idEcriture`);

        let result = getDetails.recordset;

        log.log(`La liste détaillée des lots pour le code traitement ${codeTraitement} du code dossier ${currentFile.trim()} a bien été retournée.`);

        return result;
        
    } catch (err) {
        log.logError(err)
    }
};


// Fonction qui permet la création du fichier Excel lors du clic sur le bouton "Editer"
const creationFichierXLS = async (codeTraitement, numImportSource, dateImport) => {
    try {
        const pool = await sql.connect(connexionClient);

        let currentFile = await getCurrentFile();
        currentFile = currentFile[0].codeDossier;

        const getDetails = await pool.request().query(`SELECT T_PIVOT_COMPTABLE.*, DateComptaOperat, Flux, NumCompte, DateValeur, eXfilesCodeSociete, eXfilesCodeBanque 
            FROM T_PIVOT_COMPTABLE, T_PIVOT_FILTRE 
            WHERE T_PIVOT_COMPTABLE.numImportSource = T_PIVOT_FILTRE.numImport 
            AND T_PIVOT_COMPTABLE.numLigneSource = T_PIVOT_FILTRE.NumLigne 
            AND T_PIVOT_COMPTABLE.codeDossier = '${currentFile}' 
            AND T_PIVOT_COMPTABLE.codeTraitement = '${codeTraitement}' 
            AND T_PIVOT_COMPTABLE.numImportSource = ${numImportSource}
            AND T_PIVOT_COMPTABLE.dateImport = ${dateImport}
            AND T_PIVOT_FILTRE.CodeEnreg != '05'
            ORDER BY numLigneSource, numImportSource, numImportPC, idEcriture`);

        let result = getDetails.recordset;

        log.log(`Les données sélectionnées par l'utilisateur ont bien été renvoyées au navigateur afin de télécharger le fichier Excel du lot ${numImportSource}.`);

        return result;

    } catch (err) {
        log.logError(err)
    }
};


// Récupération de la ligne d'entête du pivot bancaire (table T_PIVOT_FILTRE)
const entetePivotBancaire = async (codeTraitement, numImportSource, numeroDeLigne) => {
    try {
        const pool = await sql.connect(connexionClient);

        let currentFile = await getCurrentFile();
        currentFile = currentFile[0].codeDossier;

        let entete = await pool.request().query(`SELECT * FROM T_PIVOT_FILTRE
            WHERE NumImport = ${numImportSource}
            AND NumLigne = ${numeroDeLigne}
            AND CodeEnreg != '05'
            AND codeDossier = '${currentFile}'
            AND codeTraitement = '${codeTraitement}'
            ORDER BY CodeEnreg`);


        let detailEcriture = await pool.request().query(`SELECT * FROM T_PIVOT_FILTRE
            WHERE NumImport = ${numImportSource} 
            AND NumLigne =  ${numeroDeLigne}
            AND codeDossier = '${currentFile}'
            AND codeTraitement = '${codeTraitement}'
            ORDER BY CodeEnreg`);

        log.log(`Récupération de la ligne d'entête du pivot bancaire du code traitement ${codeTraitement} du dossier ${currentFile.trim()} a été réalisée avec succès. Les détails de la ligne d'entête ont également été récupérés pour le numéro d'import source ${numImportSource} et la ligne ${numeroDeLigne}.`);

        return {
            entete: entete.recordset[0],
            detailEcriture: detailEcriture.recordset
        }
        
    } catch (err) {
        log.logError(err);
    }
};


// Fonction pour supprimer un grouope d'écritures
const supprimerLignesEcritures = async (numImportSource, numeroDeLigne) => {
    try {
        const pool = await sql.connect(connexionClient);

        let codeDossier = await getCurrentFile();
        codeDossier = codeDossier[0].codeDossier;

        let supp1 = await pool.request().query(`DELETE FROM T_PIVOT_COMPTABLE WHERE numLigneSource = ${numeroDeLigne}
            AND numImportSource = ${numImportSource} 
            AND codeDossier = '${codeDossier}'`);
        let supp2 = await pool.request().query(`DELETE FROM T_PIVOT_FILTRE WHERE numLigne = ${numeroDeLigne} 
            AND numImport = ${numImportSource} 
            AND codeDossier = '${codeDossier}'`);
        let supp3 = await pool.request().query(`DELETE FROM T_PIVOT WHERE numLigne = ${numeroDeLigne}
            AND numImport = ${numImportSource}
            AND codeDossier = '${codeDossier}'`);


        log.log(`Les lignes d'écriture ${numeroDeLigne} du lot n°${numImportSource} du code dossier ${codeDossier.trim()} ont bien été supprimées.`)

        return true;
        
    } catch (err) {
        log.logError(err);
        return false;
    }
};


// Fonction pour supprimer toutes les écritures d'un lot (et donc le lot avec)
const supprimerToutesEcritures = async (numImportSource) => {
    try {
        const pool = await sql.connect(connexionClient);

        let codeDossier = await getCurrentFile();
        codeDossier = codeDossier[0].codeDossier.trim();

        let supp1 = await pool.request().query(`DELETE FROM T_PIVOT_COMPTABLE WHERE numImportSource = '${numImportSource}'
            AND codeDossier = '${codeDossier}'`);
        let supp2 = await pool.request().query(`DELETE FROM T_PIVOT_FILTRE WHERE NumImport = '${numImportSource}' 
            AND codeDossier = '${codeDossier}'`);
        let supp3 = await pool.request().query(`DELETE FROM T_PIVOT WHERE NumImport = '${numImportSource}'
            AND codeDossier = '${codeDossier}'`);

        log.log(`Toutes les écritures du lot ${numImportSource} ont été supprimées.`);

        return true;
        
    } catch (err) {
        log.logError(err);
        return false;
    }
};


// Fonction pour récupérer la liste des comptes et codes journaux paramétrés (pour la modification des lignes)
const listeDonneesParametrees = async () => {
    try {
        const pool = await sql.connect(connexionClient);

        let currentFile = await getCurrentFile();
        currentFile = currentFile[0].codeDossier;
        
        const liste = await pool.request().query(`SELECT numCptCompta, libelleCptCompta FROM p_cptcompta WHERE codeDossier = '${currentFile}' ORDER BY numCptCompta`);
        const codes = await pool.request().query(`SELECT codeJournal FROM p_journal WHERE codeDossier = '${currentFile}' ORDER BY codeJournal`);

        log.log(`La liste des comptes paramétrés pour la modification de ligne pour le dossier ${currentFile.trim()} a bien été retournée.`);

        return {
            listeComptes: liste.recordset,
            listeCodesJournaux: codes.recordset
        }

    } catch (error) {
        log.logError(error)
    }
};


const modifierLigne = async (statut, libelleLigne, sensEcriture, compteDebite, compteCredite, codeJournal, reference, libelle, montant, libelleExfiles, ZA1, ZA2, ZA3, ZA4, ZA5, ZA6, ZA7, ZA8, ZA9, ZA10, numLigneSource, numImportSource, idEcriture, codeTraitement) => {
    try {
        const pool = await sql.connect(connexionClient);

        let currentFile = await getCurrentFile();
        currentFile = currentFile[0].codeDossier;

        const modification = await pool.request().query(`
            UPDATE T_PIVOT_COMPTABLE
            SET statut = '${statut}', libelleEcriture = '${libelleLigne}', sensEcriture = '${sensEcriture}', compteDebite = '${compteDebite}', compteCredite = '${compteCredite}', journal = '${codeJournal}', reference = '${reference}', libelle = '${libelle}', montant = '${montant}', ZA1 = '${ZA1}', ZA2 = '${ZA2}', ZA3 = '${ZA3}', ZA4 = '${ZA4}', ZA5 = '${ZA5}', ZA6 = '${ZA6}', ZA7 = '${ZA7}', ZA8 = '${ZA8}', ZA9 = '${ZA9}', ZA10 = '${ZA10}', LIBEXFILES = '${libelleExfiles}'
            WHERE numLigneSource = ${numLigneSource}
            AND numImportSource = ${numImportSource}
            AND idEcriture = ${idEcriture}
            AND codeDossier = '${currentFile.trim()}'
            AND codeTraitement = '${codeTraitement}'`);

        // Récupération des données modifiées :
        const result = await pool.request().query(`SELECT * FROM T_PIVOT_COMPTABLE
            WHERE numLigneSource = ${numLigneSource}
            AND numImportSource = ${numImportSource}
            AND idEcriture = ${idEcriture}
            AND codeDossier = '${currentFile.trim()}'
            AND codeTraitement = '${codeTraitement}'`);
         
        const donneesModifiees = result.recordset;

        log.log(`Pour la ligne source n°${numLigneSource} du lot n°${numImportSource} du code traitement ${codeTraitement}, les données de la ligne ${idEcriture} ont été modifiées.`);

        return donneesModifiees;
         
    } catch (err) {
        log.logError('err');
    }
};


// Fonction pour mettre à jour l'ordre des colonnes du tableau Ecriture
// const modifierOrdreColonnes = async (colonneOrdre, tailleOrdre) => {
//     try {
//         const pool = await sql.connect(connexionClient);


//         const modifierOrdre = await pool.request().query(`UPDATE T_ORDRE_TABLEAU_VISU SET colonneOrdre = '${colonneOrdre}', TailleOrdre = '${tailleOrdre}' WHERE codeTab = 't_ecriture'`);

//         return true;

//     } catch (error) {
//         log.logError(error);
//         return false;
//     }
// };


// Fonction pour afficher le nouvel ordre des colonnes du tableau Ecriture
// const recupererNouvelOrdre = async () => {
//     try {
//         const pool = await sql.connect(connexionClient);

//         let nouvelOrdre = await pool.request().query(`SELECT colonneOrdre, TailleOrdre FROM T_ORDRE_TABLEAU_VISU WHERE codeTab = 't_ecriture'`);

//         nouvelOrdre = nouvelOrdre.recordset[0];

//         const nouvelOrdreCol = nouvelOrdre.colonneOrdre;
//         const nouvelleTaille = nouvelOrdre.TailleOrdre;

//         return {
//             nouvelOrdre: nouvelOrdreCol,
//             nouvelleTaille: nouvelleTaille
//         };

//     } catch (error) {
//         log.logError(error);
//     }
// };


module.exports = {
    getUserTraitements,
    entetePivotBancaire,
    getLotsDetails,
    chargerLotsJournalComptable,
    creationFichierXLS,
    supprimerLignesEcritures,
    supprimerToutesEcritures,
    listeDonneesParametrees,
    modifierLigne,
    // modifierOrdreColonnes,
    // recupererNouvelOrdre
}