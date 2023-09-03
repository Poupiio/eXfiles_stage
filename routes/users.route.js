const express = require('express');

const queryController = require('../controllers/userController');


const router = express.Router();


// http://localhost:3000/users/logged => Affiche l'id de l'utilisateur connecté
router.route('/logged')
    .get(async (req, res) => {
        const users = await queryController.getUserLogged(req.body);

        if (!users) {
            res.status(404).json({message : "nope"});
        } else {
            res.status(200).json(users);
        }
    })
;

// http://localhost:3000/users/logged/updatedfile => Modifie en BDD le code dossier du user connecté
router.route('/logged/updatedfile')
    .post(async (req, res) => {
        const code = req.body.codeDossier;

        const codeDossier = await queryController.updateCodeDossier(code);

        res.status(200).json({message: 'Le code dossier a bien été remplacé par ' + code});
        res.end();
    })
;

// http://localhost:3000/users/logged/file => Affiche le code dossier de l'utilisateur
router.route('/logged/file')
    .get(async (req, res) => {
        const codeDossier = await queryController.getCurrentFile();

        if (codeDossier) {
            res.status(200).json(codeDossier);
        } else {
            res.status(404).json();
        }
    })
;

// http://localhost:3000/users/folders => Affiche les codes dossier d'un user
router.route('/folders')
    .get(async (req, res) => {
        const dossier = await queryController.getUsersCodeDossier();

        if (!dossier) {
            res.status(404).json();
        } else {
            res.status(200).json(dossier);
        }
    })
;
// http://localhost:3000/users/access => Affiche les droits d'accès d'un user
router.route('/access')
    .get(async (req, res) => {
        const dossier = await queryController.access();
        
        if (!dossier) {
            res.status(404).json();
        } else {
            res.status(200).json(dossier);
        }
    })
;


module.exports = router;