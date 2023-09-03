const express = require('express');

const queryController = require('../controllers/visualisationController');

const router = express.Router();


// Ajouter des en-têtes de contrôle de cache pour empêcher le navigateur de mettre en cache les résultats
router.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});


// http://localhost:3000/visualisation/traitements => Affiche les codes dossier d'un user
router.route('/traitements')
    .get(async (req, res) => {
        const codes = await queryController.getUserTraitements();

        if (!codes) {
            res.status(404).json({message: "Une erreur est survenue lors de la récupération des codes dossier."});
        } else {
            res.status(200).json(codes);
        }
    })
;

// http://localhost:3000/visualisation/afficher-lots => récupère le code de traitement cliqué + la valeur de offset
router.route('/afficher-lots')
    .post(async (req, res) => {
        const code = req.body.codeTraitement;
        const offset = req.body.offset;

        const lots = await queryController.chargerLotsJournalComptable(code, offset);

        if (!lots) {
            res.status(404).json();
        } else {
            res.status(200).json(lots);
        }
    })
;

// http://localhost:3000/visualisation/lotsdetails => récupère le détail des lots d'un code traitement
router.route('/lotsdetails')
    .post(async (req, res) => {
        const codeTraitement = req.body.codeTraitement;
        const numImportSource = req.body.numImportSource;
        const dateImport = req.body.dateImport;

        const details = await queryController.getLotsDetails(codeTraitement, numImportSource, dateImport);

        if (!details) {
            res.status(404).json();
        } else {
            res.status(200).json(details);
        }
    })
;

// http://localhost:3000/visualisation/lignesource => récupère la ligne d'entête du pivot bancaire
router.route('/lignesource')
    .post(async (req, res) => {
        const codeTraitement = req.body.codeTraitement;
        const numImportSource = req.body.numImportSource;
        const numeroDeLigne = req.body.numeroDeLigne;

        const ligneSource = await queryController.entetePivotBancaire(codeTraitement, numImportSource, numeroDeLigne);

        if (!ligneSource) {
            res.status(404).json();
        } else {
            res.status(200).json(ligneSource);
        }
    })
;

// http://localhost:3000/visualisation/editfile => récupération des données pour créer le fichier Excel
router.route('/editfile')
    .post(async (req, res) => {
        const codeTraitement = req.body.codeTraitement;
        const numImportSource = req.body.numImportSource;
        const dateImport = req.body.dateImport;

        const editer = await queryController.creationFichierXLS(codeTraitement, numImportSource, dateImport);

        if (!editer) {
            res.status(404).json();
        } else {
            res.status(200).json(editer);
        }
    })
;

// http://localhost:3000/visualisation/suppression-ligne => récupèrer les données cliquées pour les supprimer (supprimer un couple d'écritures)
router.route('/suppression-ligne')
    .post(async (req, res) => {
        const numImportSource = req.body.numImportSource;
        const numeroDeLigne = req.body.numeroDeLigne;

        const suppressionLignes = await queryController.supprimerLignesEcritures(numImportSource, numeroDeLigne);

        if (!suppressionLignes) {
            res.status(404).json();
        } else {
            res.status(200).json();
        }
    })
;

// http://localhost:3000/visualisation/supprimer-tout => récupèrer les numéros d'import pour tout supprimer
router.route('/supprimer-tout')
    .post(async (req, res) => {
        const numImportSource = req.body.numImportSource;

        const suppressionLignes = await queryController.supprimerToutesEcritures(numImportSource);
        
        if (!suppressionLignes) {
            res.status(404).json({ error: 'Échec de la suppression des lignes.' });
        } else {
            res.status(200).json({ message: 'Suppression des lignes réussie.' });
        }

    })
;

// http://localhost:3000/visualisation/donnees-parametrees => récupérer la liste des comptes et codes journaux paramétrés
router.route('/donnees-parametrees')
    .get(async (req, res) => {
        const listes = await queryController.listeDonneesParametrees();

        if (!listes) {
            res.status(404).json({message: "Aucun compte trouvé."});
        } else {
            res.status(200).json(listes);
        }
    })
;

// http://localhost:3000/visualisation/modifier-ecriture => récupère les données à modifier pour une ligne d'écriture
router.route('/modifier-ecriture')
    .post(async (req, res) => {
        const statut = req.body.statut;
        const libelleLigne = req.body.libelleLigne;
        const sensEcriture = req.body.sensEcriture;
        const compteDebite = req.body.compteDebite;
        const compteCredite = req.body.compteCredite;
        const codeJournal = req.body.codeJournal;
        const reference = req.body.reference;
        const libelle = req.body.libelle
        const montant = req.body.montant;
        const libelleExfiles = req.body.libelleExfiles;
        const ZA1 = req.body.ZA1;
        const ZA2 = req.body.ZA2;
        const ZA3 = req.body.ZA3;
        const ZA4 = req.body.ZA4;
        const ZA5 = req.body.ZA5;
        const ZA6 = req.body.ZA6;
        const ZA7 = req.body.ZA7;
        const ZA8 = req.body.ZA8;
        const ZA9 = req.body.ZA9;
        const ZA10 = req.body.ZA10;
        const numLigneSource = req.body.numLigneSource;
        const numImportSource = req.body.numImportSource;
        const idEcriture = req.body.idEcriture;
        const codeTraitement = req.body.codeTraitement;

        const modification = await queryController.modifierLigne(statut, libelleLigne, sensEcriture, compteDebite, compteCredite, codeJournal, reference, libelle, montant, libelleExfiles, ZA1, ZA2, ZA3, ZA4, ZA5, ZA6, ZA7, ZA8, ZA9, ZA10, numLigneSource, numImportSource, idEcriture, codeTraitement);

        if (modification) {
            res.status(200).json(modification);
        } else {
            res.status(400).json({message : "Erreur lors de la modification."});
        }
    })
;

// // http://localhost:3000/visualisation/modifier-ordre-colonnes => récupèrer la liste des colonnes et la taille
// router.route('/modifier-ordre-colonnes')
//     .post(async (req, res) => {
//         const colonneOrdre = req.body.colonneOrdre;
//         const tailleOrdre = req.body.tailleOrdre;

//         const modifierOrdre = await queryController.modifierOrdreColonnes(colonneOrdre, tailleOrdre);
        
//         if (!modifierOrdre) {
//             res.status(404).json({ error: "Un problème est survenu lors de la récupération des données." });
//         } else {
//             res.status(200).json(modifierOrdre);
//         }

//     })
// ;

// http://localhost:3000/visualisation/nouvel-ordre-colonnes => afficher l'ordre des colonnes précédemment modifié par l'utilisateur
// router.route('/nouvel-ordre-colonnes')
//     .get(async (req, res) => {
        
//         const nouvelOrdre = await queryController.recupererNouvelOrdre();
        
//         if (!nouvelOrdre) {
//             res.status(404).json({ error: "Un problème est survenu lors de la récupération des données." });
//         } else {
//             res.status(200).json(nouvelOrdre);
//         }

//     })
// ;


module.exports = router;