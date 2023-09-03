const sql = require("mssql");
const path = require('path');
const {connexionClient} = require('./userController');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const log = require ('../PARAM-ENV/log');


// j'utilise la fonction filePath pour récupérer le chemin du fichier d'import
const filePath = async (data) => {

  try {
    //je me connecte à la BDD
    const pool = await sql.connect(connexionClient);
    let request = pool.request();
    //je réalise ma requête
    let pathResponse = await request.query(`SELECT cheminRDC,cheminFRP,cheminCAMT054,cheminFACTMATA FROM P_TRAITEMENT where codeTraitement='${data.codeTraitement}' AND codeDossier = '${data.codeDossier}' `)
    pathResponse = pathResponse.recordset
    //je renvoie le chemin du fichier d'import en front
    return pathResponse

  } catch (error) {
      console.error(error);
  }
}




const importFile = async (data) => {
  try {

    const pool = await sql.connect(connexionClient);
    let request = pool.request();

    const fichierTraiter = data.filePath;
    const codeDossier = data.codeDossier.trim();
    const typeFichier = data.typeFichier;
    const traitement = data.codeTraitement;
    const archive = 'OUI';
    const cheminDossier = path.dirname(fichierTraiter)+'/';
    const extensionFichier = ".SAVE"
    const horodatage = 'yyyyMMdd';
    const userSQL =pool.config.user;
    const passwordSQL =pool.config.password;
    const serverSQL = "jdbc:sqlserver://" + pool.config.server + "\\" + pool.config.options.instanceName+ ";" + 'database=' + pool.config.database;
    const database = pool.config.database

    const commande = `java -jar "C:\\exfilesConfig\\script\\eXfilesWEB_ImportAutomatique.jar" "${fichierTraiter}" "${codeDossier}" "${typeFichier}" "${traitement}" "${archive}" "${cheminDossier}" "${extensionFichier}" "${horodatage}" "${userSQL}" "${passwordSQL}" "${serverSQL}" "${database}" `;
    
    // exécution de la commande en utilisant exec() du module child_process.
    //j'utilise les promesses pour attendre la fin de l'exécution du .jar pour réaliser les requêtes suivantes
    const { stdout, stderr } = await util.promisify(exec)(commande);

    log.log(stdout);

    let message = "";
    let treatedLines = 0;
    let filtredLines = 0;
    let writingGenerated = 0;
    

    if(stderr.includes('java.io.FileNotFoundException')){
      message = `Erreur lors de l'import du fichier : Le fichier 20220520_883_TEST AVISTA.SAVE est introuvable`
      log.logError('Le fichier 20220520_883_TEST AVISTA.SAVE est introuvable');
    }else if(stderr){
      message ="Erreur lors de l'import du fichier"
    }
    else {
      message = 'Import du fichier réalisé avec succès';
      log.log(message);
  
      try {
        // je récupère le numImportSource nouvellement créé
        let numImportSourceResult  = await request.query(`SELECT MAX(numImportSource) FROM T_PIVOT_COMPTABLE WHERE codeDossier = '${codeDossier}' AND codeTraitement = '${traitement}'`);
        let numImportSource = numImportSourceResult.recordset[0][''];
        //je récupère les lignes traitées
        let treatedLinesResult  = await request.query(`SELECT COUNT(*) FROM t_pivot_filtre WHERE numImport = '${numImportSource}' AND CodeEnreg!='05' `);
        treatedLines = treatedLinesResult .recordset[0]['']
        // je récupère les lignes filtrées
        let filtredLinesResult  = await request.query(`SELECT COUNT(*) FROM t_pivot WHERE numImport='${numImportSource}' AND CodeEnreg!='05'`);
        filtredLines = filtredLinesResult .recordset[0][''] - treatedLines;
        //je récupère les écritures générees
        let writingGeneratedResult  = await request.query(`SELECT COUNT(*) FROM t_pivot_comptable WHERE numImportSource = '${numImportSource}'`);
        writingGenerated = writingGeneratedResult .recordset[0]['']

      

      } catch (error) {
        log.logError(error);
      }
    }

    //je renvoi les onnées en front
    return {
      message: message,
      treatedLines: treatedLines,
      filtredLines: filtredLines,
      writingGenerated: writingGenerated
    };
  
     
  } catch (error) {
    console.error(error)
  }

}




module.exports = {

  filePath,
  importFile
}
