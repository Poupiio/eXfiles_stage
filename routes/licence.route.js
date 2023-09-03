const express = require('express');

const queryController = require('../controllers/userController');

const router = express.Router();


router.route('/')
    .get(async(req,res) =>{

        try {
            const licence = await queryController.checkLicence();
                if (!licence) {
                    res.status(401).json({ message: "pas de licence" });
                } else {
                    res.status(200).json(licence);    
                }

        } catch (error) {
            res.status(500).json({ message: "Erreur " });
        }
    })
;


module.exports = router;