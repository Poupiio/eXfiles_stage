const express = require('express');

// J'importe tous mes fichiers route.js contenus dans le dossier "routes"
const userRoute = require('./users.route');
const loginRoute = require('./login.route');
const signRoute = require('./signup.route');
const licenceRoute = require('./licence.route');
const exportRoute = require('./export.route');
const visuRoute = require('./visualisation.route');
const importRoute = require('./import.route');
const paramEnv = require('./paramEnv.route');


// J'importe le Routeur Express
const router = express.Router();


// http://localhost:3000/userlogged => Afficher tous les utilisateurs
router.use('/users', userRoute);

// http://localhost:3000/login => connexion à la BDD exfilesCS
router.use('/login', loginRoute);

// http://localhost:3000/signup => inscrire un user
router.use('/signup', signRoute);

// http://localhost:3000/licence => obtenir la licence d'un user
router.use('/licence', licenceRoute);

// http://localhost:3000/export => export de lot 
router.use('/export', exportRoute);

// http://localhost:3000/visualisatoin => visualisation journal comptable
router.use('/visualisation', visuRoute);

// http://localhost:3000/import => import de lot
router.use('/import', importRoute);

// http://localhost:3000/parametrage => paramétrage des environnements
router.use('/parametrage', paramEnv);

// J'exporte le router pour le rendre accessible en faisant un require de tout ce fichier
module.exports = router;
