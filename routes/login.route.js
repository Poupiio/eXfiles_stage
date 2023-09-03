const express = require('express');

const queryController = require('../controllers/userController');

const router = express.Router();


// la route http://localhost:3000/login m'indique si le user est présent en base ou non 
router.route('/')
    .post(async (req, res) => {  
        try {
            const chaineCo = await queryController.getByLoginUserAndLoginPassword(req.body);
            const userid = await queryController.getUserLogged(req.body);
         
            if (!chaineCo) {
                res.status(401).json({ message: "Combinaison identifiant/password incorrecte" });
            }
            res.status(200).json({chaineCo, userid});
              
        } catch (error) {
            res.status(500).json({ message: "Erreur interne du serveur" });
        }
    })
;


module.exports = router;