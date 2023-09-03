const express = require('express');
const router = express.Router();

const queryController = require('../controllers/userController');


router.route('/')
    .put(async (req, res) => {
        const user = await queryController.checkLoginuser(req.body);

        if (user) {
            res.status(400).json({message: "Un compte avec cet identifiant existe déjà"});

        } else{
            const new_user = await queryController.addUser(req.body);

            if (!new_user) {
                res.status(404).json();
            }
            res.status(201).json(new_user);
        }
    })
;


module.exports = router;