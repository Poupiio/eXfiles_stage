const express = require('express');
const router = express.Router();

const queryController = require('../controllers/paramEnvController');

//-------------------------------------------------------------------------------PAGE DEVISE------------------------------------------------------------------------------------------

// la route http://localhost:3000/parametrage/devise : permet visualiser les devises
router.route('/devise')
.post(async (req, res) => {

   
    const devise = await queryController.devise(req.body);

    if (!devise) {
        res.status(404).json();
    } else {
        res.status(200).json(devise);
    }
})
;

// la route http://localhost:3000/ajouter/devise : permet d'ajouter une devise
router.route('/ajouter/devise')
.post(async (req, res) => {

   
    const devise = await queryController.addDevise(req.body);

    if (!devise) {
        res.status(404).json();
    } else {
        res.status(200).json(devise);
    }
})
;

// la route http://localhost:3000/supprimer/devise : permet de supprimer une devise
router.route('/supprimer/devise')
.post(async (req, res) => {


    const devise = await queryController.deleteDevise(req.body);

    if (!devise) {
        res.status(404).json();
    } else {
        res.status(200).json(devise);
    }
})
;

// la route http://localhost:3000/modifier/devise : permet de modifier une devise
router.route('/modifier/devise')
.post(async (req, res) => {


    const devise = await queryController.updateDevise(req.body);

    if (!devise) {
        res.status(404).json();
    } else {
        res.status(200).json(devise);
    }
})
;


//-------------------------------------------------------------------------------PAGE SOCIETE------------------------------------------------------------------------------------------

// la route http://localhost:3000/parametrage/societe : permet visualiser les societes
router.route('/societe')
.post(async (req, res) => {

   
    const societe = await queryController.societe(req.body);

    if (!societe) {
        res.status(404).json();
    } else {
        res.status(200).json(societe);
    }
})
;

// la route http://localhost:3000/ajouter/societe : permet d'ajouter une societes
router.route('/ajouter/societe')
.post(async (req, res) => {

    const societe = await queryController.addSociete(req.body);

    if (!societe) {
        res.status(404).json();
    } else {
        res.status(200).json(societe);
    }
})
;

// la route http://localhost:3000/supprimer/societe : permet de supprimer une societe
router.route('/supprimer/societe')
.post(async (req, res) => {


    const devise = await queryController.deleteSociete(req.body);

    if (!devise) {
        res.status(404).json();
    } else {
        res.status(200).json(devise);
    }
})
;

// la route http://localhost:3000/modifier/devise : permet de modifier une devise
router.route('/modifier/societe')
.post(async (req, res) => {


    const devise = await queryController.updateSociete(req.body);

    if (!devise) {
        res.status(404).json();
    } else {
        res.status(200).json(devise);
    }
})
;

//-------------------------------------------------------------------------------PAGE BANQUE------------------------------------------------------------------------------------------

// la route http://localhost:3000/parametrage/banque : permet visualiser les banques
router.route('/banque')
.post(async (req, res) => {

   
    const banque = await queryController.banque(req.body);

    if (!banque) {
        res.status(404).json();
    } else {
        res.status(200).json(banque);
    }
})
;

// la route http://localhost:3000/ajouter/banque : permet d'ajouter une banque
router.route('/ajouter/banque')
.post(async (req, res) => {

    const banque = await queryController.addBanque(req.body);

    if (!banque) {
        res.status(404).json();
    } else {
        res.status(200).json(banque);
    }
})
;

// la route http://localhost:3000/supprimer/banque : permet de supprimer une banque
router.route('/supprimer/banque')
.post(async (req, res) => {


    const banque = await queryController.deleteBanque(req.body);

    if (!banque) {
        res.status(404).json();
    } else {
        res.status(200).json(banque);
    }
})
;

// la route http://localhost:3000/modifier/banque : permet de modifier une banque
router.route('/modifier/banque')
.post(async (req, res) => {


    const banque = await queryController.updateBanque(req.body);

    if (!banque) {
        res.status(404).json();
    } else {
        res.status(200).json(banque);
    }
})
;

//-------------------------------------------------------------------------------PAGE Etablissement------------------------------------------------------------------------------------------

// la route http://localhost:3000/parametrage/etablissement : permet visualiser les etablissement
router.route('/etablissement')
.post(async (req, res) => {

   
    const etablissement = await queryController.etablissement(req.body);

    if (!etablissement) {
        res.status(404).json();
    } else {
        res.status(200).json(etablissement);
    }
})
;

// la route http://localhost:3000/ajouter/etablissement : permet d'ajouter un etablissement
router.route('/ajouter/etablissement')
.post(async (req, res) => {

   
    const etablissement = await queryController.addEtablissement(req.body);

    if (!etablissement) {
        res.status(404).json();
    } else {
        res.status(200).json(etablissement);
    }
})
;

// la route http://localhost:3000/supprimer/etablissement : permet de supprimer un etablissement
router.route('/supprimer/etablissement')
.post(async (req, res) => {


    const etablissement = await queryController.deleteEtablissement(req.body);

    if (!etablissement) {
        res.status(404).json();
    } else {
        res.status(200).json(etablissement);
    }
})
;

// la route http://localhost:3000/modifier/etablissement : permet de modifier un etablissement
router.route('/modifier/etablissement')
.post(async (req, res) => {


    const etablissement = await queryController.updateEtablissement(req.body);

    if (!etablissement) {
        res.status(404).json();
    } else {
        res.status(200).json(etablissement);
    }
})
;

//-------------------------------------------------------------------------------PAGE JOURNAL------------------------------------------------------------------------------------------

// la route http://localhost:3000/parametrage/journal : permet visualiser le journal
router.route('/journal')
.post(async (req, res) => {

   
    const journal = await queryController.journal(req.body);

    if (!journal) {
        res.status(404).json();
    } else {
        res.status(200).json(journal);
    }
})
;

// la route http://localhost:3000/ajouter/journal : permet d'ajouter un journal
router.route('/ajouter/journal')
.post(async (req, res) => {

   
    const journal = await queryController.addJournal(req.body);

    if (!journal) {
        res.status(404).json();
    } else {
        res.status(200).json(journal);
    }
})
;

// la route http://localhost:3000/supprimer/journal : permet de supprimer un journal
router.route('/supprimer/journal')
.post(async (req, res) => {


    const journal = await queryController.deleteJournal(req.body);

    if (!journal) {
        res.status(404).json();
    } else {
        res.status(200).json(journal);
    }
})
;

// la route http://localhost:3000/modifier/journal : permet de modifier un journal
router.route('/modifier/journal')
.post(async (req, res) => {


    const journal = await queryController.updateJournal(req.body);

    if (!journal) {
        res.status(404).json();
    } else {
        res.status(200).json(journal);
    }
})
;

//-------------------------------------------------------------------------------PAGE plan comptable------------------------------------------------------------------------------------------

// la route http://localhost:3000/parametrage/compte : permet visualiser le compte
router.route('/compte')
.post(async (req, res) => {

   
    const compte = await queryController.compte(req.body);

    if (!compte) {
        res.status(404).json();
    } else {
        res.status(200).json(compte);
    }
})
;

// la route http://localhost:3000/ajouter/compte : permet d'ajouter un compte
router.route('/ajouter/compte')
.post(async (req, res) => {

   
    const compte = await queryController.addCompte(req.body);

    if (!compte) {
        res.status(404).json();
    } else {
        res.status(200).json(compte);
    }
})
;

// la route http://localhost:3000/supprimer/compte : permet de supprimer un compte
router.route('/supprimer/compte')
.post(async (req, res) => {


    const compte = await queryController.deleteCompte(req.body);

    if (!compte) {
        res.status(404).json();
    } else {
        res.status(200).json(compte);
    }
})
;

// la route http://localhost:3000/modifier/compte : permet de modifier un compte
router.route('/modifier/compte')
.post(async (req, res) => {


    const compte = await queryController.updateCompte(req.body);

    if (!compte) {
        res.status(404).json();
    } else {
        res.status(200).json(compte);
    }
})
;

//-------------------------------------------------------------------------------PAGE CPTE TRESORERIE------------------------------------------------------------------------------------------

// la route http://localhost:3000/parametrage/tresorerie : permet visualiser le compte de tresorerie
router.route('/tresorerie')
.post(async (req, res) => {

   
    const tresorerie = await queryController.cptTreso(req.body);

    if (!tresorerie) {
        res.status(404).json();
    } else {
        res.status(200).json(tresorerie);
    }
})
;

// la route http://localhost:3000/ajouter/tresorerie : permet d'ajouter un compte de tresorerie
router.route('/ajouter/tresorerie')
.post(async (req, res) => {

   
    const tresorerie = await queryController.addCptTreso(req.body);

    if (!tresorerie) {
        res.status(404).json();
    } else {
        res.status(200).json(tresorerie);
    }
})
;

// la route http://localhost:3000/supprimer/tresorerie : permet de supprimer un compte de tresorerie
router.route('/supprimer/tresorerie')
.post(async (req, res) => {


    const tresorerie = await queryController.deleteCptTreso(req.body);

    if (!tresorerie) {
        res.status(404).json();
    } else {
        res.status(200).json(tresorerie);
    }
})
;

// la route http://localhost:3000/modifier/tresorerie : permet de modifier un compte de tresorerie
router.route('/modifier/tresorerie')
.post(async (req, res) => {


    const tresorerie = await queryController.updateCptTreso(req.body);

    if (!tresorerie) {
        res.status(404).json();
    } else {
        res.status(200).json(tresorerie);
    }
})
;

//-------------------------------------------------------------------------------PAGE BUDGET------------------------------------------------------------------------------------------

// la route http://localhost:3000/parametrage/budget : permet visualiser le budget
router.route('/budget')
.post(async (req, res) => {

   
    const budget = await queryController.budget(req.body);

    if (!budget) {
        res.status(404).json();
    } else {
        res.status(200).json(budget);
    }
})
;

// la route http://localhost:3000/ajouter/budget : permet d'ajouter budget
router.route('/ajouter/budget')
.post(async (req, res) => {

   
    const budget = await queryController.addBudget(req.body);

    if (!budget) {
        res.status(404).json();
    } else {
        res.status(200).json(budget);
    }
})
;

// la route http://localhost:3000/supprimer/budget : permet de supprimer un budget
router.route('/supprimer/budget')
.post(async (req, res) => {


    const budget = await queryController.deleteBudget(req.body);

    if (!budget) {
        res.status(404).json();
    } else {
        res.status(200).json(budget);
    }
})
;

// la route http://localhost:3000/modifier/budget : permet de modifier un budget
router.route('/modifier/budget')
.post(async (req, res) => {


    const budget = await queryController.updateBudget(req.body);

    if (!budget) {
        res.status(404).json();
    } else {
        res.status(200).json(budget);
    }
})
;

//-------------------------------------------------------------------------------PAGE flux------------------------------------------------------------------------------------------

// la route http://localhost:3000/parametrage/flux : permet visualiser le flux
router.route('/flux')
.post(async (req, res) => {

   
    const flux = await queryController.flux(req.body);

    if (!flux) {
        res.status(404).json();
    } else {
        res.status(200).json(flux);
    }
})
;

// la route http://localhost:3000/ajouter/flux : permet d'ajouter un flux
router.route('/ajouter/flux')
.post(async (req, res) => {

   
    const flux = await queryController.addFlux(req.body);

    if (!flux) {
        res.status(404).json();
    } else {
        res.status(200).json(flux);
    }
})
;

// la route http://localhost:3000/supprimer/flux : permet de supprimer un flux
router.route('/supprimer/flux')
.post(async (req, res) => {


    const flux = await queryController.deleteFlux(req.body);

    if (!flux) {
        res.status(404).json();
    } else {
        res.status(200).json(flux);
    }
})
;

// la route http://localhost:3000/modifier/flux : permet de modifier un flux
router.route('/modifier/flux')
.post(async (req, res) => {


    const flux = await queryController.updateFlux(req.body);

    if (!flux) {
        res.status(404).json();
    } else {
        res.status(200).json(flux);
    }
})
;

//-------------------------------------------------------------------------------PAGE taux------------------------------------------------------------------------------------------

// la route http://localhost:3000/parametrage/taux : permet visualiser le taux
router.route('/taux')
.post(async (req, res) => {

   
    const taux = await queryController.tauxTVA(req.body);

    if (!taux) {
        res.status(404).json();
    } else {
        res.status(200).json(taux);
    }
})
;

// la route http://localhost:3000/ajouter/taux : permet d'ajouter un taux
router.route('/ajouter/taux')
.post(async (req, res) => {

   
    const taux = await queryController.addTaux(req.body);

    if (!taux) {
        res.status(404).json();
    } else {
        res.status(200).json(taux);
    }
})
;

// la route http://localhost:3000/supprimer/taux : permet de supprimer un taux
router.route('/supprimer/taux')
.post(async (req, res) => {


    const taux = await queryController.deleteTaux(req.body);

    if (!taux) {
        res.status(404).json();
    } else {
        res.status(200).json(taux);
    }
})
;

// la route http://localhost:3000/modifier/taux : permet de modifier un taux
router.route('/modifier/taux')
.post(async (req, res) => {


    const taux = await queryController.updateTaux(req.body);

    if (!taux) {
        res.status(404).json();
    } else {
        res.status(200).json(taux);
    }
})
;

//-------------------------------------------------------------------------------PAGE TRAITEMENT------------------------------------------------------------------------------------------

// la route http://localhost:3000/parametrage/traitement : permet visualiser les societes
router.route('/traitement')
.post(async (req, res) => {

   
    const traitement = await queryController.traitement(req.body);

    if (!traitement) {
        res.status(404).json();
    } else {
        res.status(200).json(traitement);
    }
})
;
// la route http://localhost:3000/parametrage/ajouter/traitement : permet d'ajouter un traitement
router.route('/ajouter/traitement')
.post(async (req, res) => {

   
    const traitement = await queryController.addTraitement(req.body);

    if (!traitement) {
        res.status(404).json();
    } else {
        res.status(200).json(traitement);
    }
})
;

// la route http://localhost:3000/supprimer/traitement : permet de supprimer un traitement
router.route('/supprimer/traitement')
.post(async (req, res) => {


    const traitement = await queryController.deleteTraitement(req.body);

    if (traitement) {
        res.status(200).json(traitement);
    }
})
;

// la route http://localhost:3000/modifier/traitement : permet de modifier un traitement
router.route('/modifier/traitement')
.post(async (req, res) => {


    const traitement = await queryController.updateTraitement(req.body);

    if (!traitement) {
        res.status(404).json();
    } else {
        res.status(200).json(traitement);
    }
})
;


//-------------------------------------------------------------------------------PAGE Zones Annexes------------------------------------------------------------------------------------------

// la route http://localhost:3000/parametrage/zonesannexes : permet visualiser les zonesannexes
router.route('/zonesannexes')
.post(async (req, res) => {

   
    const zonesAnnexes = await queryController.ZonesAnnexes(req.body);

    if (!zonesAnnexes) {
        res.status(404).json();
    } else {
        res.status(200).json(zonesAnnexes);
    }
})
;



// PAGE CORRESPONDANCES

// http://localhost:3000/parametrage/rib-code-compte : récupère le rib et le code devise
router.route('/rib-code-compte')
    .get(async (req, res) => {
        const rib = await queryController.ribCodeCompte();

        if (!rib) {
            res.status(404).json();
        } else {
            res.status(200).json(rib);
        }
    })
;

// http://localhost:3000/parametrage/liste-societes : récupère la liste des codes société
router.route('/liste-societes')
    .get(async (req, res) => {
        const listeSocietes = await queryController.listeSocietes();

        if (!listeSocietes) {
            res.status(404).json();
        } else {
            res.status(200).json(listeSocietes);
        }
    })
;

// http://localhost:3000/parametrage/liste-banque : récupère la liste des codes banque
router.route('/liste-banque')
    .get(async (req, res) => {
        const listeBanques = await queryController.listeBanques();

        if (!listeBanques) {
            res.status(404).json();
        } else {
            res.status(200).json(listeBanques);
        }
    })
;

// http://localhost:3000/parametrage/liste-comptes : récupère la liste des codes compte
router.route('/liste-comptes')
    .get(async (req, res) => {
        const listeComptes = await queryController.listeComptes();

        if (!listeComptes) {
            res.status(404).json();
        } else {
            res.status(200).json(listeComptes);
        }
    })
;

// http://localhost:3000/parametrage/liste-journaux : récupère la liste des codes journaux
router.route('/liste-journaux')
    .get(async (req, res) => {
        const listeJournal = await queryController.listeJournal();

        if (!listeJournal) {
            res.status(404).json();
        } else {
            res.status(200).json(listeJournal);
        }
    })
;

// http://localhost:3000/parametrage/liste-etablissements : récupère la liste des codes établissement
router.route('/liste-etablissements')
    .get(async (req, res) => {
        const listeEtablissement = await queryController.listeEtablissement();

        if (!listeEtablissement) {
            res.status(404).json();
        } else {
            res.status(200).json(listeEtablissement);
        }
    })
;

// http://localhost:3000/parametrage/donnees-tableau : récupère les données pour alimenter le tableau de correspondances
router.route('/donnees-tableau')
    .get(async (req, res) => {
        const tableau = await queryController.alimentationTableauCorres();

        if (!tableau) {
            res.status(404).json();
        } else {
            res.status(200).json(tableau);
        }
    })
;


// http://localhost:3000/parametrage/datas-id : obtenir les ids
router.route('/datas-id')
    .post(async (req, res) => {
        const ribCptTreso = req.body.ribCptTreso;
        const codeDevise = req.body.codeDevise;
        const codeCptTreso = req.body.codeCptTreso;
        const codeSociete = req.body.codeSociete;
        const codeBanque = req.body.codeBanque;
        const numCptCompta = req.body.numCptCompta;

        const ajout = await queryController.obtenirIds(ribCptTreso, codeDevise, codeCptTreso, codeSociete, codeBanque, numCptCompta);

        if (!ajout) {
            res.status(404).json();
        } else {
            res.status(200).json(ajout);
        }
    })
;

// http://localhost:3000/parametrage/ajout-correspondance : ajoute une correspondance
router.route('/ajout-correspondance')
    .post(async (req, res) => {
        const idRib = req.body.idRib;
        const idSociete = req.body.idSociete;
        const idBanque = req.body.idBanque;
        const idCompte = req.body.idCompte;
        const codeJournal = req.body.codeJournal;
        const codeEtablissement = req.body.codeEtablissement;
        const identifiantCpt = req.body.identifiantCpt;

        const ajout = await queryController.ajouterCorrespondance(idRib, idSociete, idBanque, idCompte, codeJournal, codeEtablissement, identifiantCpt);

        if (!ajout) {
            res.status(404).json();
        } else {
            res.status(201).json(ajout);
        }
    })
;

// http://localhost:3000/parametrage/modif-correspondance : modifier une correspondance
router.route('/modif-correspondance')
    .post(async (req, res) => {
        const idRib = req.body.idRib;
        const idSociete = req.body.idSociete;
        const idBanque = req.body.idBanque;
        const idCompte = req.body.idCompte;
        const identifiantCpt = req.body.identifiantCpt;
        const codeJournal = req.body.codeJournal;
        const codeEtablissement = req.body.codeEtablissement;
        const idCorrStandard = req.body.idCorrStandard;

        const ajout = await queryController.modifierCorrespondance(idRib, idSociete, idBanque, idCompte, identifiantCpt, codeJournal, codeEtablissement, idCorrStandard);

        if (!ajout) {
            res.status(404).json();
        } else {
            res.status(201).json(ajout);
        }
    })
;

// http://localhost:3000/parametrage/suppr-correspondance => Supprime une ligne du tableau de correspondances standard
router.route('/suppr-correspondance')
    .post(async (req, res) => {
        const idCorrStandard = req.body.idCorrStandard;

        const suppression = await queryController.supprimerCorrespondance(idCorrStandard);

        if (!suppression) {
            res.status(404).json();
        } else {
            res.status(201).json(suppression);
        }
    })
;

module.exports = router;



