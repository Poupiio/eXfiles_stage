const express = require('express');

const queryController = require('../controllers/exportController');

const router = express.Router();

// http://localhost:3000/export/lotsTotal => Affiche les lots totalement
router.route('/lotsTotal')
    .post(async (req, res) => {
        const lots = await queryController.lotsExportesTotal(req.body);

        if (lots) {
            res.status(200).json(lots);
        }else{
            res.status(404).json();

        }
       
    })
;

// http://localhost:3000/export/lotsPartiel => Affiche les lots partiellement 
router.route('/lotsPartiel')
    .post(async (req, res) => {
        const lots = await queryController.lotsExportesPartiel(req.body);

        if (lots) {
            res.status(200).json(lots);
        }else{
            res.status(404).json();
        }
    })
;

// http://localhost:3000/export/lotsJamais=> Affiche les lots jamais
router.route('/lotsJamais')
    .post(async (req, res) => {
        const lots = await queryController.lotsExportesJamais(req.body);

        if (lots) {
            res.status(200).json(lots);
        }else{
            res.status(404).json();

        }
    })
;


// http://localhost:3000/export/exportlots=> Affiche les paramétrage d'export
router.route('/structure/fichier')
    .post(async (req, res) => {

        const result = await queryController.structureFichierExport(req.body);
        if (result) {
            res.status(200).json(result);
        }else{
            res.status(404).json();
        }
      
    }) 
;
// http://localhost:3000/export/exportlots=> Affiche les paramétrage d'export
router.route('/lots')
    
    .post(async (req, res) => {
   
        const result = await queryController.exportLots(req.body,res);
        if (result) {
            res.status(200).json(result);
        }
    
    }) 
;

// http://localhost:3000/export/params/exportpartiel=> Affiche les paramétrage d'export
router.route('/params/exportpartiel')
    .post(async (req, res) => {
        const param = await queryController.paramExportPartiel(req.body);

        if (param) {
           res.status(200).json(param);
        }else{
            res.status(404).json(); 

        }
    })
;

// http://localhost:3000/export/pdf => générer un pdf
router.route('/pdf')
    .post(async (req, res) => {
        const result = await queryController.generatePdf(req.body);

        if (result) {
           res.status(200).json(result);
        }else{
            res.status(404).json(); 

        }
    })
    
;
module.exports = router;