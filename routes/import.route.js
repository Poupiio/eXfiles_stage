const express = require('express');

const queryController = require('../controllers/importController');

const router = express.Router();

// http://localhost:port/import/chemin => Affiche les lots totalement
router.route('/chemin')
    .post(async (req, res) => {

        const path = await queryController.filePath(req.body);

        if (path) {
            res.status(200).json(path);
        }else{
            res.status(404).json();

        }
       
    })
;
// http://localhost:port/import/fichier => Affiche les lots totalement
router.route('/fichier')
    .post(async (req, res) => {

        const file = await queryController.importFile(req.body);

        if (file) {
            res.status(200).json(file);
        }else{
            res.status(404).json();

        }
       
    })
;




module.exports = router;