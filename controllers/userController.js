// J'importe mes paquets NPM
const sql = require("mssql");
const bcrypt = require('bcrypt');
const fs = require('fs');
const cipher = require('../PARAM-ENV/cipher');
const log = require ('../PARAM-ENV/log');



// configPath me donnne chemin absolu du fichier de configuration
const configPath = 'C:/exfilesConfig/conf/config.json';
// j'utilise la méthode readFileSync de Node.js pour lire le contenu du fichier
const configData = fs.readFileSync(configPath, 'utf8');
// je lis le fichier en tant qu'objet Json à l'aide le méthode "JSON.parse"
const config = JSON.parse(configData);
// Je stocke les données de connexion à exfilesCS dans une variable
const dbConnexion = sql.connect(config.dataBase);

let connexionClient = "";
let utilisateur = "";
// let result = "";

// Je déclare ma clé et mon vecteur de chiffrement afin de chiffrer mes données 
const key = Buffer.from("J/PYjc1ftDFK5+77U1PB80v2TamokGap5yCIP2YI6tQ=", "base64");
const iv = Buffer.from("gaOr3uvhZEwFeSbRHwlHcg==", "base64");


// cette fonction va comparer le hachage du password saisie au hachage du password présent en base de donnée et me retourne le user si les deux hachages sont identiques 
const getByLoginUserAndLoginPassword = async (data) => {
    try {
        let pool = await dbConnexion;
        let request = pool.request();
        let userData = data.login_user
        // je vais sélectionner le user en BDD en fonction du login_user saisi
        let query = 'SELECT login_password FROM users WHERE login_user = @login';
        request.input('login', userData);

        let user = await request.query(query);
     
        result = user.recordset[0];
  

        // j'utilise la fonction compare de bcrypt pour comparer le hachage du password saisie au hachage du password présent en base de donnée
        const hashedPassword = await bcrypt.compare(data.login_password, result.login_password);
     
        // si le hachage est identique alors je fais mon select sur la table chaine de connexion
        if (hashedPassword) {

            // j'effectue la requête et je vérifie si les données saisies dans le body correspondent bien aux données de la base
            query = `SELECT sql_user AS 'user', sql_password AS 'password', host AS 'server', database_name AS 'database', trustServerCertificate FROM users, chaine_de_connexion WHERE chaine_de_connexion.id_user = users.id_users AND login_user = @login_user `;
            request.input('login_user', data.login_user);

            const result = await request.query(query);
               
            if (!result) {
                return null;
            }

            // je nomme mes variables
            let user = result.recordset[0].user;
            let password = result.recordset[0].password;
            
            let server = result.recordset[0].server;
            let database = result.recordset[0].database;
            let trustServerCertificate = result.recordset[0].trustServerCertificate;

            // je décrypte mon sql_user et mon sql_password présent dans la chaine de connexion
            let decrypteduser = cipher.decrypt(user, key,iv);  
            let decryptedpassword = cipher.decrypt(password, key,iv);

            connexionClient = {"user": decrypteduser, "password": decryptedpassword, "server": server, "database": database, "trustServerCertificate": trustServerCertificate} 

            // je retourne ma chaine de connexion déchiffrée 
            log.log("Utilisateur connecté à la base de données exfilesCS, chaine de connexion retournée - OK")
            await pool.close();
         
            return connexionClient 
                
        }  
    } catch(err) {
        log.logError(err);
    }
};


// Affiche l'id de l'utilisateur connecté
// ATTENTION, cette fonction ne retourne l'id du user connecté qu'une seule fois, à la connexion.
// Pour récupérer l'id de l'utilisateur dans d'autres fonctions, il faudra utiliser la variable utilisateur
const getUserLogged = async (data) => {
    try {   
        
        // Connexion à la BDD
        let pool = await sql.connect(connexionClient);
        let request = pool.request();

        let login =  data.login_user;
     
        let query = `SELECT idutilisateur, CONCAT(prenomPersonne, ' ', nomPersonne) AS fullName, mailPersonne AS email FROM dbo.p_utilisateur WHERE nomUtilisateur = '${login}' `;
        let user = await request.query(query);
        // await pool.close();
        utilisateur = user.recordset[0].idutilisateur;

        let fullName = user.recordset[0].fullName
        log.log(`Connexion de l'utilisateur ${fullName} effectuée avec succès.`);
        return utilisateur;
       
    } catch(err) {
         log.logError(err);
    }
};


// permet de renvoyer les droits de l'utilisateur
const access = async () =>{
    try{
        let pool = await sql.connect(connexionClient);
        let request = pool.request();
        
        let query = `SELECT * FROM T_MENU WHERE idutilisateur = '${utilisateur}' `;
        let userAccess = await request.query(query);
        userAccess =userAccess.recordset[0];
        log.log(`Droits de l'utilisateur ${utilisateur} renvoyé avec succès`);
        return userAccess
    } catch(err){
        log.logError(err);
    }
};



// Afficher tous les codes dossier de la table utilisateurs
const getUsersCodeDossier = async () => {
    try {
        // Connexion à la BDD
        let pool = await sql.connect(connexionClient);

        // Je récupère l'id de l'utilisateur connecté
        userId = utilisateur;

        // Je passe cet id en valeur de l'idUtilisateur pour ne récupérer que les dossiers du user connecté
        const codeDossier = await pool.request().query(`SELECT codeDossier FROM dbo.t_relation_doss_util WHERE idUtilisateur = ${userId} AND codeDossier <> 'temp'`);

        log.log("Codes dossier de la table p_utilisateurs renvoyés avec succès");
        
        return codeDossier.recordsets[0];
    }
    catch(err) {
        log.logError(err);
    }
};



// Afficher le dossier en cours d'utilisation par un utilisateur (table p_tuilisateur)
const getCurrentFile = async () => {
    try {
        // Connexion à la BDD
        let pool = await sql.connect(connexionClient);

        // Je récupère l'id de l'utilisateur connecté
        userId = utilisateur;
        
        // Requête
        if (!userId) {
            return null;
        } else {
            const dossier = await pool.request()
                .query(`SELECT codeDossier FROM dbo.p_utilisateur WHERE idutilisateur = ${userId}`);

            log.log('Dossier en cours renvoyé avec succès');
            
            return dossier.recordsets[0];
        }
    }
    catch(err) {
        log.logError(err);
    }
};


// Modifier le codeDossier de l'utilisateur dans la table p_utilisateur
const updateCodeDossier = async (code) => {
    try {
        // Connexion à la BDD
        let pool = await sql.connect(connexionClient);

        // Je récupère l'id de l'utilisateur connecté
        userId = utilisateur;
        
        const newCode = pool.request()
            .input('code', sql.VarChar, code)
            .input('userId', sql.Int, userId)
            .query(`UPDATE dbo.p_utilisateur SET codeDossier = '${code}' WHERE idutilisateur = '${userId}'`);

        log.log(`Code dossier modifié par ${code} dans la base de données avec succès.`);
        
        return newCode;

    } catch(err) {
        log.logError(err);
    }
};


// Cette fonction permet de vérifier si un login_user est déjà utilisé 
const checkLoginuser= async (data) => {
    try {
      const pool = await dbConnexion;
      const request = pool.request();
      const result = await request.input('login_user', sql.VarChar, data.login_user)
                                   .query("SELECT * FROM users WHERE login_user = @login_user");
  
      if (!result || result.recordset.length == 0) {
          return null;
      }
      log.log("Non utilisateur disponible - OK")
      return result.recordset[0];
  
    } catch (err) {
      log.logError(err);
    }
}


// j'utilise la fonction addUser pour ajouter en base un user et une chaine de connexion
const addUser = async (data) => {
    try {
        // connexion à la BDD
        let pool = await dbConnexion;
        let request = pool.request();
     

        // je créé un Id dans la table users en allant rechercher le dernier Id de la base et je rajoute 1
        let addId = await request.query('SELECT MAX(id_users) + 1 as max_id FROM users');
        let id_users = addId.recordset[0]['max_id'] || 1;

        // j'utilise une méthode de hachage pour crypter les données de login_password avec le module bcrypt
        const hashedLoginPassword = await bcrypt.hash(data.login_password, 10);

        // j'insère dans ma table users un nouvel utilisateur à l'aide de la requête INSERT INTO et j'insère les donnéés chiffrées
        let user = await request.input('id_users', sql.Int, id_users)
            .input('login_user', sql.NVarChar, data.login_user)
            .input('login_password', sql.NVarChar, hashedLoginPassword)
            .query(`INSERT INTO users (id_users,login_user,login_password) VALUES (@id_users, @login_user, @login_password)`);
        log.log('Nouvel utilisateur @login_user ajouté avec succès - OK');

        // je vais chiffrer les données sql_user, sql_password et vecteur en utilisant ma fonction encrypt

        let cipherSqlUser = cipher.encrypt(data.sql_user, key, iv);
        let cipherSqlPassword = cipher.encrypt(data.sql_password,key,iv);

        //  je créé un Id dans la table chaine_de_connexion en allant rechercher le dernier Id de la base et je rajoute 1
        let add = await request.query('SELECT MAX(id_user) + 1 as max_id FROM chaine_de_connexion');
        let id_user = add.recordset[0]['max_id'] || 1;

        // j'insère dans ma table chaine_de_connexion une nouvelle chaine de connexion à l'aide de la requête INSERT INTO et j'insère les donnéés chiffrées
        let chaineConnexion = await request.input('id_user', sql.Int, id_user)
            .input('host', sql.NVarChar, data.host)
            .input('database_name', sql.NVarChar, data.database_name)
            .input('sql_user', sql.NVarChar, cipherSqlUser)
            .input('sql_password', sql.NVarChar, cipherSqlPassword)
            .query(`INSERT INTO chaine_de_connexion (id_user,host,database_name,sql_user,sql_password,trustServerCertificate) VALUES (@id_user, @host, @database_name, @sql_user, @sql_password,1)`);
        log.log('Nouvelle chaine de connexion ajoutée avec succès - OK')

    } catch (err) {
        log.logError(err);
    }
};


// cette fonction me permet de récupérer la date d'expiration de la licence
const checkLicence = async () =>{

    try{

        // je me connecte à la chaine de connexion retournée au moment du login

        let config =  sql.connect(connexionClient);
        let connect = await config;
        let request = connect.request();
        
        // j'effectue ma requete pour récupérer la date d'expiration
        let results = await request.query("SELECT valeurIni FROM P_INI WHERE codeIni = 'Licence_Expiry'");
        // je récupère uniquement la date présente dans mon objet
        let dateExpiry = Object.values(results.recordset[0])[0]
        // je transforme cette date au format "YYYY-MM-DD" en utilisant slice pour extraire les parties de la chaine de caratères
        let dateObj = new Date(`${dateExpiry.slice(4, 8)}-${dateExpiry.slice(2, 4)}-${dateExpiry.slice(0, 2)}`);
        // j'utilise toISOString() pour formater ma date en format ISO
        let formattedDate = new Date(dateObj.toISOString().slice(0,10));

        // je récupère la date actuelle
        let today = new Date();
        // je calcule le décalage horaire entre la date spécifique et la date actuelle
        let timeDiff = formattedDate.getTime() - today.getTime();
        // Je calcule le nombre de jours entre les deux dates. La fonction Math.ceil() pour arrondir le résultat au nombre entier supérieur. 
        // La constante (1000 * 3600 * 24) représente le nombre de millisecondes dans une journée.
        let remainingDay = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
        // je récupère la licence 
        let result = await request.query("SELECT valeurIni FROM P_INI WHERE codeIni = 'Licence_Client' OR codeIni = 'Licence_Expiry' OR codeIni = 'MaxEntry' OR codeIni = 'MaxUsers'");
        // je récupère ma clé de licence
        let result2 = await request.query("SELECT valeurIni FROM P_INI where codeIni = 'Licence_Key' ");

        data = result.recordset
        licence_key = Object.values(result2.recordset[0])[0];
      
        
        // je réorganise l'affichage du tableau
        const tableau = data[0];

        // Modifier les valeurs des deux premiers objets
        data[0] = data[1];
        data[1] = tableau;

        // j'insère dans le tableau la chaine de caractères '666314271162' à l'index 1 
        const newObj = { valeurIni: '666314271162' };
        const insertIndex = 1;
        data.splice(insertIndex, 0, newObj);

        // je concatenne le résultat en chaine de caractère.
        const licence = data.reduce((accumulator, currentValue) => accumulator + currentValue.valeurIni, "");
       
        // je crypte cette chaine de caractère.
        let cipherLicence = cipher.encrypt(licence, key, iv);

        // je vérifie si la licence crypté correspond bien à la licence_key de la BDD
        if (cipherLicence === licence_key) {
            log.log('Intégrité de la licence respecté, licence valide - OK')
            // je retourne le nombre de jour restant et la licence 
            return remainingDay ; 
        }
        
    } catch (err) {
        log.logError(err);

    }
 
};



module.exports = {
    getByLoginUserAndLoginPassword,
    getUserLogged,
    getCurrentFile,
    updateCodeDossier,
    getUsersCodeDossier,
    addUser,
    checkLoginuser,
    checkLicence,
    access,
    connexionClient,
}