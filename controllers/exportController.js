const sql = require("mssql");
const log = require ('../PARAM-ENV/log');
const fs = require('fs');
const path = require('path');
const moment = require('moment');



const { getByLoginUserAndLoginPassword, getUserLogged, connexionClient, getCurrentFile } = require('./userController');

// Récupération de la listes des lots disponibles pour un code traitement
// Je paramètre une variable pour indiquer le nombre de lots déjà chargés
const lotsCharges = 15;

const lotsExportesTotal = async (data,) => {
    try {


        const pool = await sql.connect(connexionClient);
        let request = pool.request();
   

        let exportTotal = await request.query(`SELECT DISTINCT numImportSource, dateImport, lotExport, dateExport, dateXRT 
            FROM t_pivot_comptable tf WHERE codeDossier = '${data.codeDossier.trim()}' 
            AND codeTraitement = '${data.codeTraitement}' 
            AND dateExport != '' GROUP BY numImportSource, dateImport, lotExport, dateExport, dateXRT EXCEPT 
            SELECT DISTINCT numImportSource, dateImport, lotExport, dateExport, dateXRT FROM t_pivot_comptable tf 
            WHERE codeDossier = '${data.codeDossier.trim()}' AND codeTraitement = '${data.codeTraitement}' AND dateExport != '' 
            GROUP BY numImportSource, dateImport, lotExport, dateExport, dateXRT HAVING COUNT(dateExport) != (SELECT count(*) FROM [T_PIVOT_COMPTABLE] 
            WHERE tf.numImportSource = numImportSource AND dateExport = '' GROUP BY numImportSource) 
            ORDER BY numImportSource DESC, dateImport DESC, lotExport DESC       
             `);

        // J'utilise OFFSET pour spécifier à partir de quel endroit on veut obtenir les résultats
        // et FETCH NEXT pour indiquer combien d'enregistrements on veut avec lotsCharges
        // A chaque appel de la fonction chargerLots(), les résultats seront chargés 15 par 15



        log.log("La liste des lots exportés totalement a été récupérées avec succès");

        return exportTotal.recordset;
    } catch (err) {
        log.logError(err);
    }
};


// cette fonction permet de récuperer les lots "partiellement" dans la table t_pivot_comptable 
const lotsExportesPartiel = async (data) => {
    try {
        const pool = await sql.connect(connexionClient);
        let request = pool.request();
    
       
        let exportPartiel = await request.query(`SELECT DISTINCT numImportSource, dateImport, lotExport, dateExport, dateXRT
            FROM t_pivot_comptable tf WHERE codeDossier = '${data.codeDossier}' 
            AND codeTraitement = '${data.codeTraitement}' 
            AND dateExport != '' GROUP BY numImportSource, dateImport, lotExport, dateExport, dateXRT
            HAVING COUNT(dateExport) != (SELECT COUNT(*) FROM T_PIVOT_COMPTABLE WHERE tf.numImportSource = numImportSource
            AND dateExport = '' GROUP BY numImportSource)
            ORDER BY numImportSource DESC, dateImport DESC`);
        log.log("La liste des lots exportés partiellement a été récupérées avec succès");
        return exportPartiel.recordset;

    } catch (err) {
        log.logError(err);
    } 
};


// cette fonction permet de récuperer les lots "Jamais" dans la table t_pivot_comptable 
const lotsExportesJamais = async (data) => {
    try {
        const pool = await sql.connect(connexionClient);
        let request = pool.request();
    
        let exportJamais = await request.query(`SELECT DISTINCT numImportSource, dateImport, lotExport, dateExport, dateXRT
            FROM t_pivot_comptable tf WHERE codeDossier = '${data.codeDossier}' 
            AND codeTraitement = '${data.codeTraitement}' 
            AND dateExport = '' GROUP BY numImportSource, dateImport, lotExport, dateExport, dateXRT
            HAVING COUNT(dateExport) = (SELECT COUNT(*) FROM T_PIVOT_COMPTABLE
            WHERE tf.numImportSource = numImportSource GROUP BY numImportSource)
            ORDER BY numImportSource DESC, dateImport DESC`)
        
        log.log("La liste des lots jamais exportés a été récupérée avec succès")
        return  exportJamais.recordset;
    } catch (err) {
        log.logError(err);
    } 
};


// cette fonction permet d'afficher le message sur la popup en cas d'export partiellement et toutes
const paramExportPartiel = async (data) => {
    try {
        const pool = await sql.connect(connexionClient);
        let request = pool.request();

        // je récupère mes lots de traitement check par l'utilisateur
        const lotTraitementCheck = data.lotTraitementCheck
        // je réalise une boucle sur tous les numImport contenu dans mon tableau de lotTraitementCheck et j'ajoute les numImport dans les requêtes 
        for (let i = 0; i < lotTraitementCheck.length; i++) {
            const numImports = lotTraitementCheck[i].numImportSource.trim();

            let nbEcrituresV = await request.query(`SELECT count(distinct numImportPC) AS nbEcrituresV FROM T_PIVOT_COMPTABLE WHERE numImportSource = '${numImports}' AND statut = 'V' AND dateExport = '' AND lotExport = '' AND codeTraitement = '${data.codeTraitement}' AND codeDossier = '${data.codeDossier}'`);

            let nbEcrituresX  =  await request.query(`SELECT COUNT(DISTINCT numImportPC) AS nbEcrituresX FROM T_PIVOT_COMPTABLE WHERE numImportSource = '${numImports}' AND statut = 'X' AND codeTraitement = '${data.codeTraitement}' AND codeDossier = '${data.codeDossier}'`);

            let nbEcrituresA  =  await request.query(`SELECT COUNT(DISTINCT numImportPC) AS nbEcrituresA FROM T_PIVOT_COMPTABLE WHERE numImportSource = '${numImports}' AND statut = 'A' AND codeTraitement = '${data.codeTraitement}' AND codeDossier = '${data.codeDossier}'`);

            let nbEcrituresC  =  await request.query(`SELECT COUNT(DISTINCT numImportPC) AS nbEcrituresC FROM T_PIVOT_COMPTABLE WHERE numImportSource = '${numImports}' AND statut = 'C' AND codeTraitement = '${data.codeTraitement}' AND codeDossier = '${data.codeDossier}'`);

            let nbEcrituresTotal  =  await request.query(`SELECT COUNT(DISTINCT numImportPC) AS nbEcrituresTotal FROM T_PIVOT_COMPTABLE WHERE numImportSource = '${numImports}' AND codeTraitement = '${data.codeTraitement}' AND codeDossier = '${data.codeDossier}'`);
            
            const isPartSelected = data.isPartSelected;
            const isToutesSelected = data.isToutesSelected;
            const ecritureV = nbEcrituresV.recordset[0].nbEcrituresV;
            const ecritureX = nbEcrituresX.recordset[0].nbEcrituresX
            const ecritureA = nbEcrituresA.recordset[0].nbEcrituresA
            const ecritureC = nbEcrituresC.recordset[0].nbEcrituresC
        
            let messageExport;

            if ( isPartSelected === true && ecritureV === 0) {
            
                if (isToutesSelected === true ) {
                    messageExport = `\n Attention : Vous allez réexporter toutes les écritures du lot \n\n Détail du lot :  \n\n nb écritures V : '${ecritureV}'  \n nb écritures X : '${ecritureX}'  \n nb écritures A : '${ecritureA}' \n nb écritures C : '${ecritureC}' \n\n  Voulez-vous continuer ?`
            
                }else{
                    messageExport = `Aucunes nouvelles écritures à exporter! Détail du lot : nb écritures V : '${ecritureV}' - nb écritures X : '${ecritureX}' - nb écritures A : '${ecritureA}' - nb écritures C : '${ecritureC}'`
                }           
            }
                
            log.log("Attention - Demande d'export de lot partiellement ");
            return { messageExport };

        }

    } catch (err) {
        log.log(err);
    }
};


// ------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------FONCTION EXPORTLOTS---------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------

// cette fonction permet de récuperer les paramétrage dans la table T_FICHIER_EXPORT
const exportLots = async (data,res) =>{

    
    //je déclare mes variables que je récupère
    let codeTraitement = data.codeTraitement;
    let codeDossier = data.codeDossier;
    let isTotalementSelected = data.isTotalementSelected;
    let isPartSelected = data.isPartSelected;
    let isToutesSelected = data.isToutesSelected;
    let isJamaisSelected = data.isJamaisSelected;
    let dateValidateExport = data.dateValidateExport;
    let isNonExporte = data.isNonExporte;


    try{

        const pool = await sql.connect(connexionClient);
        let request = pool.request();
        
        

        //--------------------------------------------------------------------- Récupérer la structure de T_FICHIER_EXPORT---------------------------------------------------------------------


        let params = await request.query(`SELECT * FROM T_FICHIER_EXPORT WHERE codeTraitement = '${codeTraitement}'  AND codeDossier = '${codeDossier}'`);

        // je récupère ma valeur de séparateur Décimale 
        let separateurDecimale = params.recordset[0].separateurDecimale.trim()

        if (separateurDecimale === 'Point') {
            separateurDecimale = '.';
        } else if (separateurDecimale === 'Aucun') {
            separateurDecimale = '';
        } else if (separateurDecimale === 'Virgule') {
            separateurDecimale = ',';
        }
        //je récupère ma valeur de séparateur de rubrique 
        let separateurRubrique = params.recordset[0].separateurRubrique.trim();
        if (separateurRubrique === 'Point virgule') {
            separateurRubrique = ';';
        } else if (separateurRubrique === 'Longueur fixe') {
            separateurRubrique = '';
        } else if (separateurRubrique === 'Virgule') {
            separateurRubrique = ',';
        } else if (separateurRubrique === 'Tabulation') {
            separateurRubrique = '  ';
        }

        
        //-----------------------------------------------------------------------------si horodatage---------------------------------------------------------------------------------------------------
                
        const horodatage = params.recordset[0].horodatage;
        // formatage de la date et de l'heure
        let dateDuJour = new Date();
        const annee = dateDuJour.getFullYear();
        const mois = String(dateDuJour.getMonth() + 1).padStart(2, '0');
        const jour = String(dateDuJour.getDate()).padStart(2, '0');
        const heures = String(dateDuJour.getHours()).padStart(2, '0');
        const minutes = String(dateDuJour.getMinutes()).padStart(2, '0');
        const secondes = String(dateDuJour.getSeconds()).padStart(2, '0');
        dateDuJour = `${annee}${mois}${jour}${heures}${minutes}${secondes}`;
    
        let nameFile;
        if (horodatage === 'OUI') {
            nameFile = `${dateDuJour}-${params.recordset[0].nomFichier.trim()}.${params.recordset[0].typeFichier.trim()}`;
        } else {
            if (params.recordset[0].typeFichier.trim() === 'LIBRE') {
                nameFile = params.recordset[0].nomFichier.trim();
            } else {
                nameFile = `${params.recordset[0].nomFichier.trim()}.${params.recordset[0].typeFichier.trim()}`;
            }
        }
        
    
        //---------------------------------------------------------------- Récupérer la structure d'entête d'écritures de fichier-------------------------------------------------------------
        const headerColonne = await request.query(`SELECT colonne, constante, longueur, position, cadrage, ordre, completion FROM T_FICHIER_EXPORT_ENTETE_FICHIER WHERE codeTraitement = '${codeTraitement}'  AND codeDossier = '${codeDossier}' ORDER BY ordre `)
        // Tableau pour stocker les noms de colonnes du headerColonne
        let itemsHeader = [];
        headerColonne.recordset.forEach(function(item){
            itemsHeader.push({
                nom: item.colonne.trim(),
                longueur: item.longueur,
                constante: item.constante.trim(),
                cadrage: item.cadrage.trim(),
                position: item.position,
                ordre: item.ordre,
                completion: item.completion.trim()

            })
        ;})
            
            

        //---------------------------------------------------------------- Récupérer la structure de pied de fichier-----------------------------------------------------------------------
        const footerColonne = await request.query(`SELECT colonne, constante, longueur, position, cadrage, ordre, completion FROM T_FICHIER_EXPORT_PIED_FICHIER WHERE codeTraitement = '${codeTraitement}'  AND codeDossier = '${codeDossier}' ORDER BY ordre `)
        // Tableau pour stocker les noms de colonnes du footerColonne
        let itemsFooter = []; 
        footerColonne.recordset.forEach(function(item){
            itemsFooter.push({
                nom: item.colonne.trim(),
                longueur: item.longueur,
                constante: item.constante.trim(),
                cadrage: item.cadrage.trim(),
                position: item.position,
                ordre: item.ordre,
                completion: item.completion.trim()
            });
        });

        //---------------------------------------------------------------- Récupérer la structure d'entête d'écritures d'écriture-------------------------------------------------------------
        const ResultEnteteEcriture = await request.query(`SELECT colonne, constante, longueur, position, cadrage, ordre, completion, typeColonne FROM T_FICHIER_EXPORT_ENTETE_ECRITURE WHERE codeTraitement = '${codeTraitement}'  AND codeDossier = '${codeDossier}' ORDER BY ordre `)
    
        // Tableau pour stocker les item de colonnes de l'entete d'écriture
        let colonneEnteteEcriture = [];
        let enteteEcriture = [];
        ResultEnteteEcriture.recordset.forEach(function(item){
            colonneEnteteEcriture.push({
                nom: item.colonne.trim(),
                longueur: item.longueur,
                constante: item.constante.trim(),
                cadrage: item.cadrage.trim(),
                position: item.position,
                ordre: item.ordre,
                completion: item.completion.trim(),
                typeColonne : item.typeColonne
            });
        });
        enteteEcriture.push(colonneEnteteEcriture)
        
        
        //-----------------------------------------------------Ecriture de l'entete de fichier et du pied de fichier------------------------------------------------------------------------
        // j'utilise la même boucle pour récupérer les données, que ce soit dans le HeaderColonne ou le footerColonne en concaténant les tableaux
        let resultsColonnesHeader = await paramsExportFichier(itemsHeader,data,1);
        let resultsColonnesFooter = await paramsExportFichier(itemsFooter,data,1);
        
        // j'utilise ma fonction pour contaténer les résultats et les renvoyer dans un seul tableau
        let formatedColonnesHeader= joinResults(resultsColonnesHeader);
        let formatedColonnesFooter= joinResults(resultsColonnesFooter);



        //-----------------------------------------------------Ecriture de l'entete d'écriture et des lignes d'écriture------------------------------------------------------------------------

        const promises = data.lotTraitementCheck.map(async (lot) => {            
            //je récupère le numImportSource de chaque lot
            let numImportSource = lot.numImportSource;
            let lotExport = lot.lotExport;
            let dateImport = lot.dateImport;
            let dateExport = lot.dateExport;
            let lignesEcriture;
            // --------------------------------------------------------------------------Si REGROUPEMENT-----------------------------------------------------------------------------------------------

            // je récupère la valeur de regroupement dans T_FICHIER_EXPORT
            let regroupement = params.recordset[0].regroupement.trim();

            let query;
            if (regroupement === "OUI") {
                query = `
                SELECT MAX(numLigneSource) AS NumLigne, MAX(numImportSource) AS NumImportSource, DatecomptaOperat, CompteDebite, CompteCredite, SUM(CAST(montant AS DECIMAL(9,2))) AS montant
                FROM (
                    SELECT numImportPC, numImportSource, numLigneSource, SUBSTRING(DatecomptaOperat, 3, 4) AS DatecomptaOperat, MAX(compteDebite) AS CompteDebite, MAX(compteCredite) AS CompteCredite, MAX(montant) AS montant 
                    FROM t_pivot_comptable, t_pivot_filtre 
                    WHERE t_pivot_comptable.numImportSource = t_pivot_filtre.numImport 
                    AND t_pivot_comptable.numLigneSource = t_pivot_filtre.numLigne 
                    AND t_pivot_comptable.codeDossier = '${codeDossier}' 
                    AND t_pivot_comptable.codeTraitement = '${codeTraitement}'
                    AND numImportSource = '${numImportSource}' 
                    AND t_pivot_comptable.dateImport = '${dateImport}'`
                    if (isToutesSelected === true) {
                        query += ` AND statut = 'V'`;
                    } else if (isNonExporte === true) {
                        query += ` AND statut = 'V' AND dateExport = '' AND lotExport = ''`;
                    }
                    `GROUP BY numImportPC, numImportSource, numLigneSource, DatecomptaOperat 
                ) t_pivot_comptable 
                GROUP BY DatecomptaOperat, CompteDebite, CompteCredite 
                ORDER BY DatecomptaOperat, CompteDebite, CompteCredite 
                `;

                lignesEcriture = await request.query(query);

            }else{
                query =
                `SELECT T_PIVOT_COMPTABLE.*, DateComptaOperat, Flux, NumCompte, DateValeur, eXfilesCodeSociete,eXfilesCodeEtablissement, eXfilesCodeBanque 
                FROM T_PIVOT_COMPTABLE, T_PIVOT_FILTRE 
                WHERE T_PIVOT_COMPTABLE.numImportSource = T_PIVOT_FILTRE.numImport 
                AND T_PIVOT_COMPTABLE.numLigneSource = T_PIVOT_FILTRE.NumLigne 
                AND T_PIVOT_COMPTABLE.codeDossier = '${codeDossier}'
                AND T_PIVOT_COMPTABLE.codeTraitement = '${codeTraitement}'
                AND T_PIVOT_COMPTABLE.numImportSource = '${numImportSource}' 
                AND T_PIVOT_COMPTABLE.dateImport = '${dateImport}'
                AND T_PIVOT_FILTRE.CodeEnreg != '05'`
                if(isTotalementSelected === true){ //si totalement selectionné 
                    query += ` AND T_PIVOT_COMPTABLE.dateExport like '${dateExport}%'
                                AND lotExport = '${lotExport}'
                                AND statut = 'V'`
                }else if(isToutesSelected === true){ 
                    query += ` AND T_PIVOT_COMPTABLE.statut = 'V'`
                }else if(isNonExporte=== true){ 
                    query += `AND T_PIVOT_COMPTABLE.dateExport = '' 
                    AND lotExport = '' AND statut = 'V'`
                }
                    query += `ORDER BY numLigneSource, numImportSource, numImportPC, idEcriture`
                lignesEcriture = await request.query(query)
            }

            // Ajouter la clé numImportSource à chaque objet dans lignesEcriture
            lignesEcriture = lignesEcriture.recordset

                return lignesEcriture
        })
        // results est un tableau contenant les lignesEcriture pour chaque lot
        const results = await Promise.all(promises);

        // Récupérer la structure de l'écriture du fichier pour le traitement et dossier en cours
        const structureEcritureFichier = await request.query(`SELECT DISTINCT numLigneFichier, ordreLigneFichier FROM T_FICHIER_EXPORT_LIGNE_ECRITURE WHERE codeTraitement = '${codeTraitement}' AND codeDossier = '${codeDossier}' ORDER BY ordreLigneFichier`);

    
        // Créer un objet vide pour stocker les résultats
        const ligneEcritureFile = {};
        const arrayLigneEcriture = {};
        const arrayFilter = []


        // Boucler sur chaque ligne de la structure de l'écriture du fichier
        for (const item of structureEcritureFichier.recordset) {
            // Créer une clé pour l'objet vide avec le numéro de ligne de fichier (sans espaces avant ou après)
            // const numLigneFichier = item.numLigneFichier.trim();
            const numLigneFichier = item.numLigneFichier.trim();

            
            // Récupérer les données pour chaque colonne de la ligne de fichier courante
            const dataLigneEcriture = await request.query(`SELECT * FROM T_FICHIER_EXPORT_LIGNE_ECRITURE WHERE codeTraitement = '${codeTraitement}' AND codeDossier = '${codeDossier}' AND numLigneFichier = '${numLigneFichier}' ORDER BY ordre`);
    
            const arrayLigneEcritureItems = [];
            // Boucler sur chaque donnée de la ligne de fichier courante
            dataLigneEcriture.recordset.forEach((item) => {
                // Ajouter les données dans le tableau correspondant
                arrayLigneEcritureItems.push({
                nom: item.colonne.trim(),
                longueur: item.longueur,
                constante: item.constante.trim(),
                cadrage: item.cadrage.trim(),
                position: item.position,
                ordre: item.ordre,
                completion: item.completion.trim(),
                typeColonne: item.typeColonne,
                numLigneFichier: item.numLigneFichier.trim(),
                gestionMontant : item.gestionMontant.trim()
                });
                
            });

            // Utiliser le numéro de ligne de fichier comme clé pour l'objet arrayLigneEcriture
            arrayLigneEcriture[numLigneFichier] = arrayLigneEcritureItems;



            // - Tester si un filtre est appliqué sur une des colonnes de la structure : SELECT * FROM T_FICHIER_EXPORT_LIGNE_ECRITURE WHERE codeTraitement = ? AND codeDossier = ? AND numLigneFichier = ? AND sertDeFiltre = 'OUI' ORDER BY numLigneFichier
            let filter = await request.query(`SELECT * FROM T_FICHIER_EXPORT_LIGNE_ECRITURE WHERE codeTraitement = '${codeTraitement}' AND codeDossier = '${codeDossier}' AND numLigneFichier = '${numLigneFichier}' AND sertDeFiltre = 'OUI' ORDER BY numLigneFichier`);
            filter = filter.recordset
    
            // Boucler sur chaque donnée de la ligne de fichier courante
            filter.forEach((item) => {
                // Ajouter les données dans le tableau correspondant
                arrayFilter.push({
                numLigneFichier : item.numLigneFichier.trim(),
                item: item.colonne.trim(),
                sertDeFiltre: item.sertDeFiltre.trim(),
                conditionFiltre: item.conditionFiltre.trim(),
                structureFiltre: item.structureFiltre.trim(),
                valeurFiltre: item.valeurFiltre.trim(),
                longueurFiltre: item.longueurFiltre.trim(),
                positionFiltre: item.positionFiltre.trim(),
                typeColonne: item.typeColonne.trim(),
                signeC: item.signeC.trim(),
                signeD: item.signeD.trim(),
                positionSigne: item.positionSigne.trim()

                });

            }); 
       

        }  

        
        // je vais boucler sur mes lignes d'écriture récupérées dans ma promesse 
        for (const lignesEcriture of results) {
            for (const ligne of lignesEcriture) {
            
                //je déclare mes variables
                let numImport = ligne.numImportSource;
                let numLigneSource = ligne.numLigneSource;
                let eXfilesCodeSociete = ligne.eXfilesCodeSociete.trim();
                let eXfilesCodeEtablissement = ligne.eXfilesCodeEtablissement.trim()
                let dateImport = ligne.dateImport;
                let lotExport = ligne.lotExport;
                let dateExport = ligne.dateExport;

                // Appeler la fonction pour traiter chaque cas et récupérer l'entête d'écriture
                let resultsDataEnteteEcriture = await paramsExportFichier(enteteEcriture, data, ligne, arrayFilter);
                //je récupère que la valeur de arrayLigneEcriture et j'enleve la clé pour voiture itérer dessus
                const arrayStructures = Object.values(arrayLigneEcriture);
                let resultsDataLigneEcriture = await paramsExportFichier(arrayStructures, data, ligne, arrayFilter);
                
                // Vérifier si l'objet ligneEcritureFile ne contient pas encore la clé numImport
                if (!ligneEcritureFile.hasOwnProperty(numImport)) {
                    // Si la clé numImport n'existe pas, créer un tableau vide pour cette clé
                    ligneEcritureFile[numImport] = [];
                }
                // Rechercher si une ligne d'écriture avec le même numLigneSource existe déjà dans le tableau
                let existingLigneEcriture = ligneEcritureFile[numImport].find(ligneEcriture => ligneEcriture.numLigneSource === numLigneSource);
          
                if (existingLigneEcriture) {
                    // Si une ligne d'écriture avec le même numLigneSource existe déjà, concaténer les données
                    existingLigneEcriture.data = existingLigneEcriture.data.concat(resultsDataLigneEcriture);
                } else {
                    // Sinon, créer une nouvelle ligne d'écriture avec les informations correspondantes
                    let ligneEcriture = {
                    numImport,
                    numLigneSource,
                    eXfilesCodeSociete,
                    eXfilesCodeEtablissement,
                    header: resultsDataEnteteEcriture,
                    data: resultsDataLigneEcriture,
                    };

                    if ( typeof resultsDataLigneEcriture  == "undefined") {
                        const errorMessage = "Une erreur s'est produite lors de la récupération des lignes d'Ecriture.";
                        console.error(errorMessage)
                        res.json({ error: errorMessage });     
                    }else{
                        // Les données sont valides, ajouter la nouvelle ligne d'écriture au tableau ligneEcritureFile
                        ligneEcritureFile[numImport].push(ligneEcriture);
                    
                        //si lotJamais ou lotPartiellement et toutes le lotExport vaut 1
                        if (isJamaisSelected === true || isPartSelected === true && isToutesSelected) {
                            await request.query(` UPDATE T_PIVOT_COMPTABLE
                            SET lotExport = 1
                            WHERE dateImport = '${dateImport}'
                            AND dateExport = '${dateExport}'
                            AND statut = 'V'
                            AND numImportSource = '${numImport}'
                            AND codeTraitement = '${codeTraitement}'
                            AND codeDossier = '${codeDossier}'`)

                            //je modifie la date d'export 
                            await request.query(`UPDATE T_PIVOT_COMPTABLE SET dateExport = '${dateValidateExport}' WHERE dateImport = '${dateImport}' AND numLigneSource = '${numLigneSource}'
                            AND numImportSource = '${numImport}'  AND codeTraitement = '${codeTraitement}' AND codeDossier = '${codeDossier.trim()}'`)

                        // si lotPartiellement et non-exporté je récupère le Max(lotExport)
                        }else if(isPartSelected === true && isNonExporte === true){
                            let tagExport = await request.query(`SELECT MAX(lotExport) FROM T_PIVOT_COMPTABLE WHERE numImportSource = '${numImport}' 
                            AND codeTraitement = '${codeTraitement}' AND codeDossier = '${codeDossier.trim()}'`);
                            // je modifie le lot export en rajoutant 1 au Max(lotExport)
                            await request.query(` UPDATE T_PIVOT_COMPTABLE
                            SET lotExport = '${tagExport}'+ 1 WHERE dateImport = '${dateImport}' AND dateExport = '${dateValidateExport}'
                            AND statut = 'V' AND numImportSource = '${numImport}'AND codeTraitement = '${codeTraitement}'AND codeDossier = '${codeDossier.trim()}'`)
                            
                        }else{
                            //sinon si lot Totalement je récupère la valeur de lotExport
                            //Sinon tagExport = le numéro qu'il y a après le - du lot choisi 
                            await request.query(`UPDATE T_PIVOT_COMPTABLE SET lotExport = '${lotExport.trim()}' WHERE dateImport = '${dateImport}'
                            AND dateExport = '${dateExport}' AND statut = 'V' AND numImportSource = '${numImport}'
                            AND codeTraitement = '${codeTraitement}' AND codeDossier = '${codeDossier.trim()}'`)
                            
                            await request.query(`UPDATE T_PIVOT_COMPTABLE SET dateExport = '${dateValidateExport}' WHERE dateImport = '${dateImport}' AND numLigneSource = '${numLigneSource}'
                            AND numImportSource = '${numImport}'  AND codeTraitement = '${codeTraitement}' AND codeDossier = '${codeDossier.trim()}'`)
                            
                        } 


                    }
                
                }          
            }
        
        }
                
     
       

        // je récupère la valeur de decouperExport et valeurDecouperExport du type de fichier et du chemin fichier et j'utilise le module path pour lire la route 
        const decouperExport = params.recordset[0].decouperExport;
        const valeurDecouperExport = params.recordset[0].valeurDecouperExport;
        const cheminFichier = params.recordset[0].cheminFichier.trim();
        const exportDir = path.join(cheminFichier, '');
        const typeFichier = params.recordset[0].typeFichier.trim();

        // Vérification que le découpage est activé OUI ou NON
        if (decouperExport === 'OUI') {
            // Vérification que le découpage se fait par société
            if (valeurDecouperExport === 'Societe') {

                // Requête SQL pour récupérer les informations nécessaires au découpage par société
                const decoupSociete = await request.query(`
                    SELECT codeSociete, teps.codeRegroupement, tde.nomFichier
                    FROM t_export_par_societe teps, t_decouper_export tde, t_fichier_export tfe 
                    WHERE tfe.codeTraitement = tde.codeTraitement
                    AND teps.codeRegroupement = tde.codeRegroupement
                    AND tde.codeTraitement = '${codeTraitement}'
                    AND tde.codeDossier = '${codeDossier}'
                `);
            
                // Création d'une Map pour stocker les noms de fichiers par code société
                const resultDecoupMap = new Map();         
                // Remplissage de la Map avec les résultats de la requête SQL
                decoupSociete.recordset.forEach((res) => {
                    resultDecoupMap.set(res.codeSociete.trim(), res.nomFichier.trim());
                });
          

              

                let resultsByFile = {};
                // Récupération des valeurs du tableau ligneEcritureFile
                const writeFile = Object.values(ligneEcritureFile);
                // Parcourir chaque tableau dans writeFile
                for (const tableau of writeFile) {
                  // Parcourir chaque objet dans le tableau
                  for (const { eXfilesCodeSociete, header, data } of tableau) {
                    // Récupération du nom de fichier correspondant à eXfilesCodeSociete depuis resultDecoupMap
                    const nomFichier = resultDecoupMap.get(eXfilesCodeSociete)?.trim();
  
                    if (nomFichier) {
                        // Récupération des résultats correspondant à eXfilesCodeSociete depuis ligneEcritureFile
                        const results = ligneEcritureFile[eXfilesCodeSociete];
                

                        // Vérifier si la clé nomFichier n'existe pas déjà dans resultsByFile
                        if (!resultsByFile[nomFichier]) {
                            // Si la clé nomFichier n'existe pas, créer un tableau vide pour cette clé
                            resultsByFile[nomFichier] = [];
                        }
                        // Ajouter l'entête (header) et les données (data) au tableau correspondant à la clé nomFichier dans resultsByFile
                        resultsByFile[nomFichier].push(header, ...data);
                
                
                        // Ajouter l'entête (header) et les données (data) au tableau correspondant à la clé nomFichier dans resultsByFile
                        resultsByFile[nomFichier].push(header, ...data);
                    } 
                  }
                }


               // Créer un Set pour stocker les noms de fichiers manquants uniques
                const emptyFilesSet = new Set();

                // Parcourir resultDecoupMap pour vérifier les correspondances
                for (const [eXfileCodeSociete,nomFichier] of resultDecoupMap) {
                    // Vérifier si le nom de fichier n'est pas présent dans resultsByFile
                    if (!nomFichier || !nomFichier.trim() || !resultsByFile.hasOwnProperty(nomFichier)) {
                        // Ajouter le nom de fichier manquant au Set emptyFilesSet
                        emptyFilesSet.add(nomFichier);
                    }
                }

                // Convertir le Set en tableau emptyFiles
                const emptyFiles = Array.from(emptyFilesSet);
                const fileName =[];

                try{
                    
    
                    // Parcours de l'objet contenant les résultats par nom de fichier
                    for (const nomFichier in resultsByFile) {
                
                        
                        //je récupère mes nomFichier pour envoyer en front
                        fileName.push(nomFichier)

                        // je détermine le nom du dossier en fonction de l'horodatage ou non 
                        let filePath;
                        if (horodatage === 'OUI') {
                            filePath = path.join(exportDir, dateDuJour + nomFichier + '.' + typeFichier);
                    
                        } else {
                            if (params.recordset[0].typeFichier.trim() === 'LIBRE') {
                                filePath = path.join(exportDir, nomFichier );
                            } else {
                                filePath = path.join(exportDir, nomFichier + '.' + typeFichier );
                            }
                        }
                        
                        let fileContent = "";
                    

                        if (formatedColonnesHeader.length > 0 ) {
                            fileContent = formatedColonnesHeader + '\r\n'
                        }
                        // Vérification si la variable resultsFile contient des données
                        if (resultsByFile[nomFichier].length > 0) {
                            // Si c'est le cas, les données sont ajoutées à la variable fileContent, avec un saut de ligne avant et après
                            fileContent +=  resultsByFile[nomFichier].join('\r\n') ;
                        }       
                        // Vérification si la variable formatedColonnesFooter contient des données
                        if (formatedColonnesFooter.length > 0) {
                            // Si c'est le cas, les données sont ajoutées à la variable fileContent, sans saut de ligne supplémentaire
                            fileContent += '\r\n' + formatedColonnesFooter;
                        }
                        // Écriture du contenu de la variable fileContent dans le fichier spécifié par la variable filePath
                        fs.writeFileSync(filePath, fileContent);    
                        log.log(`Fichier d'export ${nomFichier} créé avec succès`);

                   
                    }      

                }catch(err){
                    // En cas d'erreur, renvoyer un message d'erreur au front-end
                    const errorMessage = "Une erreur s'est produite lors de l'écriture dans le fichier de sortie.";
                    res.json({ error: errorMessage });
                    log.logError(err)                
                }


                return{
                    cheminFichier: cheminFichier,
                    fileName:fileName,
                    emptyFiles:emptyFiles
                }
            

            }else if(valeurDecouperExport === 'Etablissement'){
                // Requête SQL pour récupérer les informations nécessaires au découpage par société
                const decoupEtablissement= await request.query(`SELECT codeEtablissement, tepe.codeRegroupement, tde.nomFichier 
                FROM t_export_par_etablissement tepe, t_decouper_export tde, t_fichier_export tfe 
                WHERE tfe.codeTraitement = tde.codeTraitement AND tepe.codeRegroupement = tde.codeRegroupement 
                AND tde.codeTraitement = '${codeTraitement}' AND tde.codeDossier = '${codeDossier}'`);

                // Création d'une Map pour stocker les noms de fichiers par code société
                const resultDecoupMap = new Map();         
                // Remplissage de la Map avec les résultats de la requête SQL
                decoupEtablissement.recordset.forEach((res) => {
                    resultDecoupMap.set(res.eXfilesCodeEtablissement, res.nomFichier);
                });

                let resultsByFile = {};


                
                // Récupération des valeurs du tableau ligneEcritureFile
                const writeFile = Object.values(ligneEcritureFile);
                // Parcourir chaque tableau dans writeFile
                for (const tableau of writeFile) {
                  // Parcourir chaque objet dans le tableau
                  for (const { eXfilesCodeEtablissement, header, data } of tableau) {
                    // Récupération du nom de fichier correspondant à eXfilesCodeSociete depuis resultDecoupMap
                    const nomFichier = resultDecoupMap.get(eXfilesCodeEtablissement)?.trim();
  
                    if (nomFichier) {
                        // Récupération des résultats correspondant à eXfilesCodeSociete depuis ligneEcritureFile
                        const results = ligneEcritureFile[eXfilesCodeEtablissement];
                

                        // Vérifier si la clé nomFichier n'existe pas déjà dans resultsByFile
                        if (!resultsByFile[nomFichier]) {
                            // Si la clé nomFichier n'existe pas, créer un tableau vide pour cette clé
                            resultsByFile[nomFichier] = [];
                        }
                        // Ajouter l'entête (header) et les données (data) au tableau correspondant à la clé nomFichier dans resultsByFile
                        resultsByFile[nomFichier].push(header, ...data);
                
                
                        // Ajouter l'entête (header) et les données (data) au tableau correspondant à la clé nomFichier dans resultsByFile
                        resultsByFile[nomFichier].push(header, ...data);
                    } 
                  }
                }

                // Créer un Set pour stocker les noms de fichiers manquants uniques
                const emptyFilesSet = new Set();

                // Parcourir resultDecoupMap pour vérifier les correspondances
                for (const [eXfilesCodeEtablissement,nomFichier] of resultDecoupMap) {
                    // Vérifier si le nom de fichier n'est pas présent dans resultsByFile
                    if (!nomFichier || !nomFichier.trim() || !resultsByFile.hasOwnProperty(nomFichier)) {
                        // Ajouter le nom de fichier manquant au Set emptyFilesSet
                        emptyFilesSet.add(nomFichier);
                    }
                }

                // Convertir le Set en tableau emptyFiles
                const emptyFiles = Array.from(emptyFilesSet);
                const fileName =[];

                try{
                    

                    // Parcours de l'objet contenant les résultats par nom de fichier
                    for (const nomFichier in resultsByFile) {
                
                        
                        //je récupère mes nomFichier pour envoyer en front
                        fileName.push(nomFichier)

                        // je détermine le nom du dossier en fonction de l'horodatage ou non 
                        let filePath;
                        if (horodatage === 'OUI') {
                            filePath = path.join(exportDir, dateDuJour + nomFichier + '.' + typeFichier);
                    
                        } else {
                            if (params.recordset[0].typeFichier.trim() === 'LIBRE') {
                                filePath = path.join(exportDir, nomFichier );
                            } else {
                                filePath = path.join(exportDir, nomFichier + '.' + typeFichier );
                            }
                        }
                        
                        let fileContent = "";
                    

                        if (formatedColonnesHeader.length > 0 ) {
                            fileContent = formatedColonnesHeader + '\r\n'
                        }
                        // Vérification si la variable resultsFile contient des données
                        if (resultsByFile[nomFichier].length > 0) {
                            // Si c'est le cas, les données sont ajoutées à la variable fileContent, avec un saut de ligne avant et après
                            fileContent +=  resultsByFile[nomFichier].join('\r\n') ;
                        }       
                        // Vérification si la variable formatedColonnesFooter contient des données
                        if (formatedColonnesFooter.length > 0) {
                            // Si c'est le cas, les données sont ajoutées à la variable fileContent, sans saut de ligne supplémentaire
                            fileContent += '\r\n' + formatedColonnesFooter;
                        }
                        // Écriture du contenu de la variable fileContent dans le fichier spécifié par la variable filePath
                        fs.writeFileSync(filePath, fileContent);    
                        log.log(`Fichier d'export ${nomFichier} créé avec succès`);

                    
                    }      

                }catch(err){
                    // En cas d'erreur, renvoyer un message d'erreur au front-end
                    const errorMessage = "Une erreur s'est produite lors de l'écriture dans le fichier de sortie.";
                    res.json({ error: errorMessage });
                    log.logError(err)                
                }

                return{
                    cheminFichier: cheminFichier,
                    fileName:fileName,
                    emptyFiles:emptyFiles
                }
            
            }
        }else{
            try{
            

                let resultsFile = [];

                // Récupération des valeurs du tableau ligneEcritureFile
                const writeFile = Object.values(ligneEcritureFile)[0];
                for (const { header, data }  of writeFile) {
                    resultsFile.push(header, ...data);   
                }
                // Chemin complet du fichier à créer
                const filePath = path.join(exportDir, nameFile + '.' + typeFichier);
                
                // Écriture des résultats dans le fichier correspondant

                // Création d'une variable pour stocker le contenu complet du fichier
                let fileContent = "";
                let emptyFiles =[]
                //si resultsFile est vide alors je push le nom de fichier dans la variable emptyFiles
                if (resultsFile.length === 0) {
                    emptyFiles.push(nameFile)
                }

                if (formatedColonnesHeader.length > 0 ) {
                    fileContent = formatedColonnesHeader + '\r\n'
                }
                // Vérification si la variable resultsFile contient des données
                if (resultsFile.length > 0) {
                    // Si c'est le cas, les données sont ajoutées à la variable fileContent, avec un saut de ligne avant et après
                    // Si c'est le cas, les données sont ajoutées à la variable fileContent, avec un saut de ligne avant et après
                    fileContent +=  resultsFile.join('\r\n') ;
                }       
                // Vérification si la variable formatedColonnesFooter contient des données
                if (formatedColonnesFooter.length > 0) {
                    // Si c'est le cas, les données sont ajoutées à la variable fileContent, sans saut de ligne supplémentaire
                    fileContent += '\r\n' + formatedColonnesFooter;
                }
               

                // Écriture du contenu de la variable fileContent dans le fichier spécifié par la variable filePath
                fs.writeFileSync(filePath, fileContent);

                // Affichage d'un message pour indiquer que l'export a été effectué avec succès
                log.log(`Fichier d'export ${nameFile} créé avec succès`);

                return{
                    cheminFichier: cheminFichier,
                    fileName:nameFile,
                    emptyFiles:emptyFiles
                }

            }catch(err){
                // En cas d'erreur, renvoyer un message d'erreur au front-end
            const errorMessage = "Une erreur s'est produite lors de l'écriture dans le fichier de sortie.";
            res.json({ error: errorMessage });
            log.logError(err)       
            }

        }

        
        // La fonction prend un tableau de tableaux comme argument
        function joinResults(resultsData) {
        // On initialise une variable resultat qui sera utilisée pour stocker les résultats
        let resultat = [];
                
        // On parcourt chaque tableau dans le tableau resultsData
        resultsData.forEach(tableau => {

        // On parcourt chaque élément dans chaque tableau
            tableau.forEach(element => {
                
                
                // On ajoute la valeur de la première propriété de chaque élément dans la variable resultat
                resultat.push(Object.values(element)[0]);
            
            });
        });
        // On joint les éléments dans la variable resultat en utilisant le séparateurRubrique
        resultat = resultat.join(separateurRubrique);
        // On remplace tous les points (.) dans la variable resultat avec separateurDecimale
        
        resultat = resultat.replace('.', separateurDecimale); 
        // On renvoie la variable resultat
        return resultat;
        }
    
    } catch(err){
      log.logError(err)
        
    } 
}




// ------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------FONCTION PARAMSEXPORTFICHIER---------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------

const paramsExportFichier = async (colonneStructure,data,ligne,arrayFilter) => {

    try{

        let codeTraitement = data.codeTraitement;
        let codeDossier = data.codeDossier.trim();
        let numImportSource = ligne.numImportSource
        let numLigneSource = ligne.numLigneSource


        const pool = await sql.connect(connexionClient);
        let request = pool.request();

            // je créé une fonction qui va me gérérer les colonnes du fichier en réalisant un select sur chaque nom de colonne et en récupérant les données depuis la table T_PIVOT_FILTRE
            const generateColonne = async (colonne,numImportSource,numLigneSource,codeTraitement,codeDossier) => {
                try {

                    let resultats;
        
                    resultats = await request.query(`SELECT ${colonne} FROM T_PIVOT_FILTRE WHERE NumImport = '${numImportSource}' AND NumLigne = '${numLigneSource}'  AND codeTraitement = '${codeTraitement}' AND codeDossier = '${codeDossier}'`);
                    let res = resultats.recordset;
                    return res;
                } catch (err) {
                    log.logError(err);
                }
            };
            
            //  j'utilise la fonction formatDate qui va utiliser la bibliothèque moment pour gérer l'affichage des dates
                function formatDate(dateString, formatString,item) {
                const dateObj = moment(dateString, 'DDMMYY');
                let formattedDate =  dateObj.format(formatString.toUpperCase());
                value = formatColumnValue(formattedDate,item)
                return value
            }
        //--------------------------------------------------------------------- Récupérer la structure de T_FICHIER_EXPORT---------------------------------------------------------------------


        let params = await request.query(`SELECT * FROM T_FICHIER_EXPORT WHERE codeTraitement = '${codeTraitement}'  AND codeDossier = '${codeDossier}'`);

        // je récupère ma valeur de séparateur Décimale 
        let separateurDecimale = params.recordset[0].separateurDecimale.trim()

        if (separateurDecimale === 'Point') {
            separateurDecimale = '.';
        } else if (separateurDecimale === 'Aucun') {
            separateurDecimale = '';
        } else if (separateurDecimale === 'Virgule') {
            separateurDecimale = ',';
        }
        //je récupère ma valeur de séparateur de rubrique 
        let separateurRubrique = params.recordset[0].separateurRubrique.trim();
        if (separateurRubrique === 'Point virgule') {
            separateurRubrique = ';';
        } else if (separateurRubrique === 'Longueur fixe') {
            separateurRubrique = '';
        } else if (separateurRubrique === 'Virgule') {
            separateurRubrique = ',';
        } else if (separateurRubrique === 'Tabulation') {
            separateurRubrique = '  ';
        }

        const gestionMontant = async (ligne, arrayFilter,colonne, typeColonne,item) => {
            let resultData = "";
            let resultats;
        
            // Récupérer les numéros d'ordre de la colonne (Montant ou Mnt transaction ou Mnt solde final ou Mnt mouvement) :
            const numOrdreColonne = await request.query(`SELECT DISTINCT ordre FROM T_FICHIER_EXPORT_LIGNE_ECRITURE WHERE codeTraitement = '${codeTraitement}' AND colonne = '${colonne}' AND codeDossier = '${codeDossier}' ORDER BY ordre`);
            // je stocke le résultat dans un tableau
            const numOrdreArray = numOrdreColonne.recordset.map((item) => item.ordre);
            let sens = ligne.sensEcriture.trim();
        
            if (!typeColonne || typeColonne.trim() === "SOURCE") {
                // Appeler la fonction pour générer la colonne 
                resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                // Vérifier si la fonction a renvoyé un tableau non vide
                if (Array.isArray(resultats) && resultats.length > 0) {
                    if (item.gestionMontant === "Une Colonne par sens") {
                        colonne = "montant";
                        if (sens === "D" && numOrdreArray[0] === "") {
                        resultData = "";
                        } else if (sens === "C" && numOrdreArray[1] === "") {
                        resultData = "";
                        } else {
                            resultData = resultats[0].colonne;
                        }
                    } else if (item.gestionMontant === "Une Colonne Montant Signé") {
                        if (sens === "D") {
                        arrayFilter.forEach((filtre) => {
                            if (sens === "D" && filtre.positionSigne === "Préfixé") {
                            resultData = filtre.signeD + resultats[0].colonne;
                            } else if (sens === "C" && filtre.positionSigne === "Préfixé") {
                            resultData = resultats[0].colonne + filtre.signeC;
                            } else {
                                resultData = resultats[0].colonne;
                            }
                        });
                        }  
                    } else{
                        resultData = resultats[0].colonne;
                    }
                
                }
            }else if (typeColonne.trim() === "SCHEMA") {
                    
                if (item.gestionMontant === "Une Colonne par sens") {
                    colonne = "montant";
                    if (sens === "D" && numOrdreArray[0] === "") {
                    resultData = "";
                    } else if (sens === "C" && numOrdreArray[1] === "") {
                    resultData = "";
                    } else {
                    resultData = ligne.montant;
                    }
                } else if (item.gestionMontant === "Une Colonne Montant Signé") {
                    if (sens === "D") {
                        arrayFilter.forEach((filtre) => {
                            if (sens === "D" && filtre.positionSigne === "Préfixé") {
                            resultData = filtre.signeD + ligne.montant;
                            } else if (sens === "C" && filtre.positionSigne === "Préfixé") {
                            resultData = ligne.montant + filtre.signeC;
                            } else {
                            resultData = ligne.montant;
                            }
                        });
                    }
                } else{
                    resultData = ligne.montant;
                }
            }
            return resultData;
        }
            
        
        // je récupère le format d'affichage de la date et le nombre de décimale dans la table T_FICHIER_EXPORT
        let formatResponse = await request.query(`SELECT formatDate,nbDecimales,sensDebit,sensCredit FROM T_FICHIER_EXPORT WHERE codeTraitement = '${codeTraitement}'  AND codeDossier = '${codeDossier}'`);
        let formatDateStart = formatResponse.recordset[0].formatDate.trim();
        let nbDecimales = formatResponse.recordset[0].nbDecimales;
        let sensCredit = formatResponse.recordset[0].sensCredit;
        let sensDebit = formatResponse.recordset[0].sensDebit;

        // La fonction getColumnValue prend deux arguments : resultData et item. Elle récupère la longueur et la position de la colonne à partir de item.
        const formatColumnValue = (resultData, item) => {
            try{ 
                let value;
                // je gère la position 
                subdata = resultData.substring(item.position - 1, item.position - 1 + item.longueur)
        
        
                if (item.longueur === 0) {
                    value = resultData;      
                }
                if (item.completion === "") {
                    item.completion = " ";
                }
                //  je gère la complétion 
                if (item.cadrage === "Droite") {
                    value = subdata.padStart(item.longueur, item.completion);
                } else {
                    value = subdata.padEnd(item.longueur, item.completion);
                }   
                return value
            
            }catch(err){
                log.logError(err);
            }
        }




        //fonction pour appliquer les filtres
        const applyFilter = (filterItem, value) => {
            let sertDeFiltre = filterItem.sertDeFiltre;
          // Vérifier si le filtre est activé (sertDeFiltre === "OUI")
            if (sertDeFiltre === "OUI") {
                let valeurFiltre = filterItem.valeurFiltre;
                let conditionFiltre = filterItem.conditionFiltre;
                let structureFiltre = filterItem.structureFiltre;
                let longueurFiltre = filterItem.longueurFiltre;
                let positionFiltre = filterItem.positionFiltre;

                if (ligne.motant === 0) {
                    return true
                }
                // Vérification de la longueur du filtre
                if (value.length >= longueurFiltre) {
                    value = value.substring(positionFiltre - 1, positionFiltre - 1 + longueurFiltre);
                }
            
                // Vérifier la condition de filtre et la structure de filtre
                if (conditionFiltre === "Inférieure" && structureFiltre === "Ignorée") {
                    if (value <= valeurFiltre) {
                    // La condition de filtre est respectée, passer à la structure suivante
                    return true;
                    }
                } else if (conditionFiltre === "Supérieure" && structureFiltre === "Ignorée") {
                    if (value >= valeurFiltre) {
                    // La condition de filtre est respectée, passer à la structure suivante
                    return true;
                    }
                }
            }
            // Si aucune des conditions précédentes n'est remplie, retourner false pour appliquer le filtre
            return false;
          }
          
          






        //j'initialise mon compteur de ligne
        let compteurLigne = 0;
        let results = [];
        // j'utilise cette boucle pour parcourir chaque colonne de la structure du fichier d'export afin de créer la ligne dans le fichier de sortie. 
        for (const structure of colonneStructure) {
            ligneData = '';
            let skipStructure = false; // Variable pour vérifier si on doit passer à la structure suivante


            for (const item of structure) {        
            // je déclare mes variables         
                let colonne;
                let value;
                let resultats;
                let resultData;
                let typeColonne = item.typeColonne;
                let dateStr;
                let dateObj;
                let numLigneFichier = item.numLigneFichier

              
                switch (item.nom) {
                        
                    case "SAISI": 
                        // le champs SAISI correspond à la colonne constante je fais directement ma requète pour récupérer la donnée          
                        resultData = item.constante;  
                        value = formatColumnValue(resultData,item)       
                        //je récupère les données de filtre
                        filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "SAISI");
                        // Appliquer le filtre en utilisant la fonction applyFilter
                        if (filterItem) {
                            skipStructure = applyFilter(filterItem, value);
                            // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                            if (skipStructure) {
                            break;
                            }    
                        }              
                        break
                    case "Code Banque":
                        colonne = "codeBanque";
                        if (!typeColonne || typeColonne.trim() === "SOURCE") {
                            
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].codeBanque;
                                // j'appelle la fonction pour gérer l'affichage de ma valeur
                                value = formatColumnValue(resultData,item)
                            } 
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Code Banque");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }   
                        }
                        break;
                    
                    case "Code Banque du paramétrage eXfiles":
                        colonne = "eXfilesCodeBanque";
                        if (!typeColonne || typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].eXfilesCodeBanque.trim();
                                // j'appelle la fonction pour gérer l'affichage de ma valeur
                                value = formatColumnValue(resultData,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Code Banque du paramétrage eXfiles");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            } 
                        }
                        break;
                    case "Code budget":
                        colonne = "CodeBudget" ;
                        if (!typeColonne || typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].CodeBudget.trim();
                                // j'appelle la fonction pour gérer l'affichage de ma valeur
                                value = formatColumnValue(resultData,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Code budget");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }   
                        }
                        break;
                    case "Code compte du paramétrage eXfiles":
                        colonne = "eXfilesCodeCompte" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].eXfilesCodeCompte.trim();
                                // j'appelle la fonction pour gérer l'affichage de ma valeur
                                value = formatColumnValue(resultData,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Code compte du paramétrage eXfiles");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }
                        break;
                    case "Code devise CPT":
                        colonne = "CodeDeviseCompte" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].CodeDeviseCompte.trim();
                                // j'appelle la fonction pour gérer l'affichage de ma valeur
                                value = formatColumnValue(resultData,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Code devise CPT");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }   
                        }
                        break;
                    case "Code devise MVT":
                        colonne ="CodeDeviseMVT" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].CodeDeviseMVT.trim();
                                // j'appelle la fonction pour gérer l'affichage de ma valeur
                                value = formatColumnValue(resultData,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Code devise MVT");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }    
                        }
                        break;
                    case "Code Enreg":
                        colonne = "CodeEnreg" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].CodeEnreg.trim();
                                // j'appelle la fonction pour gérer l'affichage de ma valeur
                                value = formatColumnValue(resultData,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Code Enreg");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            } 
                        }
                        break;
                    case "Code Etablissement du paramétrage eXfiles":
                        colonne = "eXfilesCodeEtablissement" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].eXfilesCodeEtablissement.trim();
                                // j'appelle la fonction pour gérer l'affichage de ma valeur
                                value = formatColumnValue(resultData,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Code Etablissement du paramétrage eXfiles");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }
                        break;
                    case "Code guichet":
                        colonne = "CodeGuichet" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].CodeGuichet.trim();
                                // j'appelle la fonction pour gérer l'affichage de ma valeur
                                value = formatColumnValue(resultData,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Code guichet");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }   
                        }
                        break;
                    case "Code guichet CPT ouvert":
                        colonne = "codeGuichetCompteOuvert" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].codeGuichetCompteOuvert.trim();
                                // j'appelle la fonction pour gérer l'affichage de ma valeur
                                value = formatColumnValue(resultData,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Code guichet CPT ouvert");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }
                        break;
                    case "Code Journal du paramétrage eXfiles":
                        colonne = "eXfilesCodeJournal"  ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].eXfilesCodeJournal.trim();
                                // j'appelle la fonction pour gérer l'affichage de ma valeur
                                value = formatColumnValue(resultData,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Code Journal du paramétrage eXfiles");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }
                        break;
                    case "Code motif rejet":
                        colonne = "CodeMotifRejet" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].CodeMotifRejet.trim();
                                // j'appelle la fonction pour gérer l'affichage de ma valeur
                                value = formatColumnValue(resultData,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Code motif rejet");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }   
                        }
                        break;
                    case "Code opé interb":
                        colonne = "CodeOperatInterban" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].CodeOperatInterban.trim();
                                // j'appelle la fonction pour gérer l'affichage de ma valeur
                                value = formatColumnValue(resultData,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Code opé interb");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }
                        break;
                    case "Code opé interne":
                        colonne = "CodeOpeInterne" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].CodeOpeInterne.trim();
                                // j'appelle la fonction pour gérer l'affichage de ma valeur
                                value = formatColumnValue(resultData,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Code opé interne");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        } 
                        break;
                    case "Code Société du paramétrage eXfiles":
                        colonne = "eXfilesCodeSociete" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].eXfilesCodeSociete.trim();
                                // j'appelle la fonction pour gérer l'affichage de ma valeur
                                value = formatColumnValue(resultData,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Code Société du paramétrage eXfiles");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }
                        break;
                    case "Date compta":
                        colonne = "DateComptaOperat" ;
                        if (!typeColonne || typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].DateComptaOperat.trim();
                                // je formate la date et je gère la position et la complétion
                                value = formatDate(resultData, formatDateStart,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Date compta");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }   
                        }
                        break
                    case "Date de fin":
                        colonne = "DateFin" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].DateFin.trim();
                                // je formate la date
                                value = formatDate(resultData, formatDateStart,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Date de fin");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }
                        break;
                    case "Date de valeur":
                        colonne = "DateValeur" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].DateValeur.trim();
                                // je formate la date
                                value = formatDate(resultData, formatDateStart,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Date de valeur");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            } 
                        }
                        break;
                    case "Date solde final":
                        colonne = "DateSoldeFinal" ;
                        if (typeColonne.trim() === "SOURCE") { 
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].DateSoldeFinal.trim();
                                // je formate la date
                                value = formatDate(resultData, formatDateStart,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Date solde final");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }
                        break;
                    case "Date solde initial":
                        colonne = "DateSoldeInit" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].DateSoldeFinal.trim();
                                // je formate la date
                                value = formatDate(resultData, formatDateStart,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Date solde initial");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }
                        break;
                    case "Flux":
                        colonne = "Flux" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].Flux.trim();
                                // j'utilise toFixed pour arrondir la décimale 
                                value = resultData.toFixed(nbDecimales);
                                // je transforme la donnée en string 
                                value = value.toString();
                                value = formatColumnValue(value,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item ===  "Flux");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }
                        break;
                    case "Frais":
                        colonne = "Frais" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].Frais.trim();
                                // j'utilise toFixed pour arrondir la décimale 
                                value = resultData.toFixed(nbDecimales);
                                // je transforme la donnée en string 
                                value = value.toString();
                                value = formatColumnValue(value,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Frais");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }
                        break;
                    case "Identifiant Compte du paramétrage eXfiles":
                        colonne = "eXfilesIdentifiantCompte" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].eXfilesIdentifiantCompte.trim();
                                // j'appelle la fonction pour gérer l'affichage de ma valeur
                                value = formatColumnValue(resultData,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Identifiant Compte du paramétrage eXfiles");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }
                        break;
                    case "Indice exonérat":
                        colonne = "IndiceExoneMouv"  ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].IndiceExoneMouv.trim();
                                // j'utilise toFixed pour arrondir la décimale 
                                value = resultData.toFixed(nbDecimales);
                                // je transforme la donnée en string 
                                value = value.toString();
                                value = formatColumnValue(value,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Indice exonérat");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }
                        break;
                    case "Indice indispo":
                        colonne = "IndiceIndispo" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].IndiceIndispo.trim();
                                // j'utilise toFixed pour arrondir la décimale 
                                value = resultData.toFixed(nbDecimales);
                                // je transforme la donnée en string 
                                value = value.toString();
                                value = formatColumnValue(value,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Indice indispo");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }   
                        }
                        break;
                    case "Infos comp":
                        colonne = "InfoComplem" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].InfoComplem.trim();
                                // j'appelle la fonction pour gérer l'affichage de ma valeur
                                value = formatColumnValue(resultData,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Infos comp");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }   
                        }
                        break;         
                      case "Libellé":
                        colonne = "libelle";
                        if (!typeColonne || typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].libelle.trim();
                                // j'appelle la fonction pour gérer l'affichage de ma valeur
                                value = formatColumnValue(resultData,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Libellé");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }else{
                            resultData = ligne.libelle.trim();
                            value = formatColumnValue(resultData,item)
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Libellé");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }   
                        }
                        break;
                    case "Mnt mouvement":
                        colonne = "MontantMouvement" ;
                        resultData = gestionMontant(ligne,typeColonne,arrayFilter,colonne,item)
                        // j'utilise toFixed pour arrondir la décimale 
                        value = resultData.toFixed(nbDecimales).replace('.',separateurDecimale);
                        // je transforme la donnée en string 
                        value = formatColumnValue(value,item)
                        //je récupère les données de filtre
                        filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Mnt mouvement");
                        // Appliquer le filtre en utilisant la fonction applyFilter
                        if (filterItem) {
                            skipStructure = applyFilter(filterItem, value);
                            // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                            if (skipStructure) {
                            break;
                            }    
                        }   
                        break;
                    case "Mnt solde final":
                        colonne = "MontantSoldeFinal" ;
                        resultData = gestionMontant(ligne,typeColonne,arrayFilter,colonne,item)
                        // j'utilise toFixed pour arrondir la décimale 
                        value = resultData.toFixed(nbDecimales).replace('.',separateurDecimale);
                        // je transforme la donnée en string 
                        value = formatColumnValue(value,item)
                        //je récupère les données de filtre
                        filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Mnt solde final");
                        // Appliquer le filtre en utilisant la fonction applyFilter
                        if (filterItem) {
                            skipStructure = applyFilter(filterItem, value);
                            // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                            if (skipStructure) {
                            break;
                            }    
                        }  
                        break;
                    case "Mnt solde init":
                        colonne = "MontantSoldeInit" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].MontantSoldeInit;
                                // j'utilise toFixed pour arrondir la décimale 
                               value = resultData.toFixed(nbDecimales).replace('.',separateurDecimale);
                               // je transforme la donnée en string 
                               value = formatColumnValue(value,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Mnt solde init");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }
                        break;
                    case "Mnt transaction":
                        colonne = "MontantCVal";   
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].MontantCVal;
                                // j'utilise toFixed pour arrondir la décimale 
                                value = resultData.toFixed(nbDecimales).replace('.',separateurDecimale);
                                // je transforme la donnée en string 
                                value = formatColumnValue(value,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Mnt transaction");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }
                        break;
                    case "Nature du flux ou du CIB du paramétrage eXfiles":
                        colonne = "eXfilesNatureFlux"  ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);

                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].eXfilesNatureFlux.trim();
                                // j'appelle la fonction pour gérer l'affichage de ma valeur
                                value = formatColumnValue(resultData,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Nature du flux ou du CIB du paramétrage eXfiles");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }
                        break;
                    case "NB décim mvt":
                        colonne = "NBDecimMontantMouv"  ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].NBDecimMontantMouv.trim();
                                // j'utilise toFixed pour arrondir la décimale 
                                value = resultData.toFixed(nbDecimales);
                                // je transforme la donnée en string 
                                value = value.toString();
                                value = formatColumnValue(value,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "NB décim mvt");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }
                        break;
                    case "Nb décim solde":
                        colonne = "NbDecimSolde" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].NbDecimSolde.trim();
                                value = resultData.toFixed(nbDecimales);
                                value = value.toString();
                                value = formatColumnValue(value,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Nb décim solde");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }
                        break;
                    case "Nombre":
                        colonne = "Nombre" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].Nombre.trim();
                                value = resultData.toFixed(nbDecimales);
                                value = value.toString();
                                value = formatColumnValue(value,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Nombre");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            } 
                        }
                        break;
                    case "Num Compte":
                        colonne = "NumCompte" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].NumCompte.trim();
                                value = formatColumnValue(resultData,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Num Compte");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }
                        break;
                    case "Num de journal":
                        colonne = "NumJournalTreso" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].NumJournalTreso.trim();
                                value = resultData.toFixed(nbDecimales);
                                value = value.toString();
                                value = formatColumnValue(value,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Num de journal");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }
                        break;
                    case "Num de log":
                        colonne = "NumLog" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].NumLog.trim();
                                value = resultData.toFixed(nbDecimales);
                                value = value.toString();
                                value = formatColumnValue(value,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Num de log");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }
                        break;
                    case "Num de site":
                        colonne = "NumSite" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].NumSite.trim();
                                value = resultData.toFixed(nbDecimales);
                                value = value.toString();
                                value = formatColumnValue(value,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Num de site");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }   
                        }
                        break;
                    case "Num Ecriture":
                        colonne = "NumEcriture" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].NumEcriture.trim();
                                resultData = parseFloat(resultData)
                                value = resultData.toFixed(nbDecimales);
                                value = value.toString();
                                value = formatColumnValue(value,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Num Ecriture");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }
                        break;
                    case "Num écriture":
                        colonne = "NumEcriture" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].NumEcriture.trim();
                                value = resultData.toFixed(nbDecimales);
                                value = value.toString();
                                value = formatColumnValue(value,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Num écriture");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            } 
                        }
                        break;
                    case "Qualif Info Comp":
                        colonne = "QualifiantZoneInfoCompl" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].QualifiantZoneInfoCompl.trim();
                                // j'appelle la fonction pour gérer l'affichage de ma valeur
                                value = formatColumnValue(resultData,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Qualif Info Comp");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }   
                        }
                        break;
                    case "Référence":
                        if (typeColonne.trim() === "SOURCE") {
                            colonne = "Reference" ;
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].Reference.trim();
                                // j'appelle la fonction pour gérer l'affichage de ma valeur
                                value = formatColumnValue(resultData,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Référence");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }   
                        }else{
                            if (typeColonne.trim() === "SCHEMA") {
                                    colonne = "reference" ;
                                resultData = ligne.reference;
                                value = formatColumnValue(resultData, item)
                            } 
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Référence");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            skipStructure = applyFilter(filterItem, value);
                            // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                            if (skipStructure) {
                                break;
                            }  
                        }
                        break;
                    case "Sens":
                        if (!typeColonne || typeColonne.trim() === "SOURCE") {
                            colonne ="Sens" ;
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].Sens.trim();
                                if (resultData === "D") {
                                    resultData = sensDebit.trim();
                                }else{
                                    resultData = sensCredit.trim()
                                }
                                // j'appelle la fonction pour gérer l'affichage de ma valeur
                                value = formatColumnValue(resultData,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Sens");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }else{
                            colonne = "sensEcriture"
                            resultData = ligne.sensEcriture.trim();
                            if (resultData === "D") {
                                resultData = sensDebit.trim();
                            }else{
                                resultData = sensCredit.trim();
                            }
                            value = formatColumnValue(resultData,item)
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Code Journal");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }
                        break;
                    case "Suppression":
                        colonne = "Supp" ;
                        if (typeColonne.trim() === "SOURCE") {
                            resultats = await generateColonne(colonne,numImportSource,numLigneSource,codeTraitement,codeDossier);
                            if (Array.isArray(resultats) && resultats.length > 0) {
                                resultData = resultats[0].Supp.trim();
                                // j'appelle la fonction pour gérer l'affichage de ma valeur
                                value = formatColumnValue(resultData,item)
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Suppression");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }
                        break;
                    case "Date traitement":
                        // je récupère la valeur de date au click du bouton exporté
                        dateStr = data.dateValidateExport;
                        // Convertir la chaîne de caractères en objet Date
                        dateObj = new Date(dateStr);
                        // Formater la date au format "yyyyMMdd"
                        const year = dateObj.getFullYear();
                        const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
                        const day = ('0' + dateObj.getDate()).slice(-2);
                        value = year + month + day;
                        //je récupère les données de filtre
                        filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item ===  "Date traitement");
                        // Appliquer le filtre en utilisant la fonction applyFilter
                        if (filterItem) {
                            skipStructure = applyFilter(filterItem, value);
                            // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                            if (skipStructure) {
                            break;
                            }    
                        }  
                        break
                    case "Heure Traitement":
                    // je récupère la valeur de date au click du bouton exporté
                        dateStr = data.dateValidateExport;
                        // Convertir la chaîne de caractères en objet Date
                        dateObj = new Date(dateStr);
                        // Formater l'heure au format "HHmmss"
                        const hours = ('0' + dateObj.getHours()).slice(-2);
                        const minutes = ('0' + dateObj.getMinutes()).slice(-2);
                        const seconds = ('0' + dateObj.getSeconds()).slice(-2);
                        value = hours + minutes + seconds;
                        //je récupère les données de filtre
                        filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "CHeure Traitement");
                        // Appliquer le filtre en utilisant la fonction applyFilter
                        if (filterItem) {
                            skipStructure = applyFilter(filterItem, value);
                            // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                            if (skipStructure) {
                            break;
                            }    
                        }  
                        break 
                    case "Code Journal":
                        if (typeColonne.trim() === "SCHEMA") {
                            colonne = "journal" ;
                            resultData = ligne.journal;
                            value = formatColumnValue(resultData, item);
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Code Journal");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            } 
                        } 
                        break
                    case "Compte":     
                        if (typeColonne.trim() === "SCHEMA") {
                            if (ligne.compteDebite.trim() === "") {
                                colonne = "compteCredite"
                                resultData = ligne.compteCredite;
                                value = formatColumnValue(resultData, item);
                            }else{
                                colonne = "compteDebite";
                                resultData = ligne.compteDebite;
                                value = formatColumnValue(resultData, item)
                            }  
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Compte");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }     
                        }
                        break; 
                    case "Montant":
                        if (typeColonne.trim() === "SCHEMA") {
                            colonne = "montant"
                            let montant= await gestionMontant (ligne, arrayFilter,colonne,typeColonne, item);
                            resultData = parseFloat(montant)
                            // resultData = 235 + 'f'
                            //.replace() est utilisée pour remplacer le point (séparateur décimal par défaut) par le séparateur décimal souhaité (dans cet exemple, une virgule).
                            value = resultData.toFixed(nbDecimales).replace('.',separateurDecimale)
                            value = formatColumnValue(value,item)       
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Montant");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }              
                        }                
                        break;
                    case "Compteur de ligne":
                        if (typeColonne.trim() === "SCHEMA") {
                        // - Si SCHEMA et colonne = Compteur de ligne ALORS il faut que tu incrémentes un compteur à chaque ligne traitée et qui sera dans le fichier générée 
                        // boucle qui traite chaque ligne du fichier d'entrée
                            for (let i = 0; i < item.nom.length; i++) {
                                // traitement de la ligne i
                                compteurLigne++;
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Compteur de ligne");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }     
                        break;
                    case "N°Ligne":
                        if (typeColonne.trim() === "SCHEMA") {
                            colonne = "idEcriture" ;
                            resultData = ligne.idEcriture;
                            resultData = resultData.toString()     
                            value = formatColumnValue(resultData, item);
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "N°Ligne");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }     
                        break;
                    case "N°Ecriture":
                        if (typeColonne.trim() === "SCHEMA") {
                            colonne = "numLigneSource" ;
                            resultData = ligne.numLigneSource;
                            resultData = resultData.toString()   
                            value = formatColumnValue(resultData, item);
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "N°Ecriture");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }   
                        }   
                        break;
                    case "N°Lot":
                        if (typeColonne.trim() === "SCHEMA") {
                            colonne = "numImportSource" ;
                            resultData = ligne.numImportSource;
                            resultData = resultData.toString()   
                            value = formatColumnValue(resultData, item);
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "N°Lot");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            } 
                        }   
                        break;

                    default:
                        //gestion des zones annexes
                        if (item.nom.includes("Zone Annexe")) {
                            const numZoneAnnexe = item.nom.match(/\d+/)[0]; // extrait le numéro de la zone annexe
                            const colonne = `ZA${numZoneAnnexe}`; // je défini le nom de la colonne avec le numéro de zone Annexe
                            const resultData = ligne[colonne]; // utilise la notation d'objet dynamique pour accéder à la propriété de ligne correspondante
                            value = formatColumnValue(resultData, item);
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Zone Annexe");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }
                        }
                         // gestion des zones réservées
                        if (typeColonne.trim() === "SOURCE" && item.nom.includes("Zone réservée")) {
                            const numZoneReservee = item.nom.match(/\d+/)[0]; // extrait le numéro de la zone annexe
                            
                            // je créé une variable colonne qui correspond au préfixe de la zone + i (ex:ZoneReservee1)
                            colonne = `ZoneReservee${numZoneReservee}`;
                            let resultats = await generateColonne([colonne], data);
                            // je vais exclure les zones qui n'ont pas été complétée par l'utilisateur 
                            if (resultats && resultats.length > 0 && resultats[0] && resultats[0][colonne]) {
                                let resultData = resultats[0][colonne].trim();
                                // je gère la position et la complétion avec la fonction formatColumnValue
                                 value = formatColumnValue(resultData, item);
                                // if (value !== 0) {
                                //     let zoneData = {};
                                //     zoneData[colonne] = value;
                                // }
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Zone réservée");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            } 
                        
                        }
                
                        //zones utiles
                        if (typeColonne.trim() === "SOURCE" && item.nom.includes("Zone util")) {
                            // Utilisation de la fonction pour générer les résultats pour "Zone réservée 1 à 5"
                            const numZoneUtil = item.nom.match(/\d+/)[0]; // extrait le numéro de la zone annexe
                                
                            // je créé une variable colonne qui correspond au préfixe de la zone + i (ex:ZoneReservee1)
                            colonne = `ZoneUtil${numZoneUtil}`;
                            let resultats = await generateColonne([colonne], data);
                            // je vais exclure les zones qui n'ont pas été complétée par l'utilisateur 
                            if (resultats && resultats.length > 0 && resultats[0] && resultats[0][colonne]) {
                                let resultData = resultats[0][colonne].trim();
                                // je gère la position et la complétion avec la fonction formatColumnValue
                                value = formatColumnValue(resultData, item);
                                // if (value !== 0) {
                                //     let zoneData = {};
                                //     zoneData[colonne] = value;
                                // }
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Zone util");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }
                        }

                        //zone infos complémentaire
                        if (typeColonne.trim() === "SOURCE" && item.nom.includes("Infos comp")) {
                            const numInfosComp = item.nom.match(/\d+/)[0]; // extrait le numéro de la zone annexe
                            
                            // je créé une variable colonne qui correspond au préfixe de la zone + i (ex:ZoneReservee1)
                            colonne = `InfoComp${numInfosComp}`;
                            let resultats = await generateColonne([colonne], data);
                            // je vais exclure les zones qui n'ont pas été complétée par l'utilisateur 
                            if (resultats && resultats.length > 0 && resultats[0] && resultats[0][colonne]) {
                                let resultData = resultats[0][colonne].trim();
                                // je gère la position et la complétion avec la fonction formatColumnValue
                                 value = formatColumnValue(resultData, item);
                                // if (value !== 0) {
                                //     let zoneData = {};
                                //     zoneData[colonne] = value;
                                // }
                            }
                            //je récupère les données de filtre
                            filterItem = arrayFilter.find(filter => filter.numLigneFichier === numLigneFichier && filter.item === "Infos comp");
                            // Appliquer le filtre en utilisant la fonction applyFilter
                            if (filterItem) {
                                skipStructure = applyFilter(filterItem, value);
                                // Si le filtre est respecté, passer à la structure suivante en utilisant 'break'
                                if (skipStructure) {
                                break;
                                }    
                            }  
                        }
                        
                
                        
                        break;
            
                } 
                if (skipStructure) {
                    // Passer à la structure suivante, ne pas pousser la ligne de données dans results
                    break;
                  }

                 // Ajouter la valeur à la variable "ligneData" avec le séparateur de rubrique
                ligneData += value + separateurRubrique;
             
            }
            if (!skipStructure) {
                // Ajouter la variable "ligneData" à "results" en supprimant le dernier séparateur de rubrique
                results.push(ligneData);
              }

            // Ajouter les clés supplémentaires à "ligneData"
            ligneData = '';

        }  
        return results

    }catch(err){
      
        log.logError(err)
 
    };


}




//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 
//-----------------------------------------------------------------------------------Générer un fichier PDF------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------       


const generatePdf = async (data) =>{
    try{


        let codeTraitement = data.codeTraitement;
        let codeDossier = data.codeDossier;
        let dateEdition = data.dateEdition
    
                
        const pool = await sql.connect(connexionClient);
        let request = pool.request();



        //- Le chemin d'export du fichier (peut être déjà récupéré) : SELECT cheminFichier FROM T_FICHIER_EXPORT WHERE codeTraitement = ? AND codeDossier = ?
        let cheminExportFichier = await request.query(`SELECT cheminFichier FROM T_FICHIER_EXPORT WHERE codeTraitement = '${codeTraitement}' AND codeDossier = '${codeDossier}'`);
        cheminExportFichier = cheminExportFichier.recordset[0].cheminFichier.trim()


        //- Le libellé des zones annexes 1 à 5 : SELECT libelle FROM P_ZONEANNEXE_LIBELLE WHERE codeZone = ? AND codeDossier = ? ==> Si libelle est vide alors libellé = Zone Annexe "X"
        const codeZone = ['Zone Annexe 1','Zone Annexe 2','Zone Annexe 3','Zone Annexe 4','Zone Annexe 5']

        // Création d'un tableau vide qui va contenir les résultats de la requête SQL
        const libZoneAnexArray = [];

        // Utilisation de la méthode `Promise.all()` pour exécuter toutes les requêtes en parallèle
        try{ 
            await Promise.all(
            // Utilisation de la méthode `map()` pour exécuter une requête SQL pour chaque codeZone
            codeZone.map(async (code) => {
                // Exécution de la requête SQL pour récupérer le libellé correspondant au codeZone
                const result = await request.query(`SELECT libelle FROM P_ZONEANNEXE_LIBELLE WHERE codeZone = '${code}' AND codeDossier = '${codeDossier}'`);
                // Ajout du résultat dans le tableau `libZoneAnexArray`
                libZoneAnexArray.push(result.recordset[0]);
            })
            );
        }catch(err){
            // console.error(err)
        }

        

        //je boucle sur tous mes lot traitement
        for (let i = 0; i < data.lotTraitementCheck.length; i++) {

            let lot = data.lotTraitementCheck[i];
            //je récupère le numImportSource de chaque lot
            let numImportSource = lot.numImportSource;
            let lotExport=lot.lotExport;
            let dateValidateExport = lot.dateExport.split(' ')[0];
             
            


            //je déclare le nom du fichier PDF
            let nomFichier = `${dateValidateExport}_${numImportSource}_${lotExport}_${codeTraitement}.pdf`;
            // je récuère mes ligne d'écriture avec la requête 
            let writeFilePdf = await request.query(` SELECT numImportSource, numLigneSource, DateComptaOperat, exfilesCodeSociete, NumCompte, CONCAT(compteDebite,compteCredite) 
            as compte, CASE WHEN sensEcriture='D' THEN montant ELSE '' END as Débit, CASE WHEN sensEcriture='C' THEN montant ELSE '' END as Crédit, tpc.libelle, ZA1, ZA2, ZA3, ZA4, ZA5, eXfilesNatureFlux, journal
            from t_pivot_comptable tpc, t_pivot_filtre tpf where tpf.NumImport=tpc.numImportSource and tpf.NumLigne=tpc.numLigneSource 
            and tpc.NumImportSource= ${numImportSource} and tpc.lotExport= ${lotExport} and statut='V' and montant!='0.00' and CodeEnreg!='05' order by eXfilesCodeSociete, NumCompte, numLigneSource`)
            writeFilePdf = writeFilePdf.recordset
            //je récupère les totaux des colonnes débit et crédit 
            let writeFileTotal = await request.query(`select CASE WHEN sensEcriture='C' THEN sum(cast(replace(montant,' ','') 
            as decimal(20,2))) ELSE sum(cast(replace(montant,' ','') as decimal(20,2))) END from t_pivot_comptable 
            where numImportSource= ${numImportSource}  and lotExport= ${lotExport} and statut='V' group by sensEcriture order by sensEcriture DESC
            `);
            writeFileTotal = writeFileTotal.recordset

    
//-----------------------------------------------------------------------------------Ecrite dans un fichier PDF------------------------------------------------------------------------------------------------------



            // j'utilise la bibliothèse pdfMake pour écrire dans un PDF
            const pdfMake = require('pdfmake/build/pdfmake');
            const pdfFonts = require('pdfmake/build/vfs_fonts');
            pdfMake.vfs = pdfFonts.pdfMake.vfs;

        
            
            let column = [
                //En-tete du tableau
                { text: `Date d'édition : ${dateEdition}`, alignment: 'center', colSpan: 5 }, {}, {}, {},{},
                { text: `Traitement: ${codeTraitement}`, alignment: 'center', colSpan: 4 }, {}, {}, {},
                { text: `Chemin du fichier généré : ${cheminExportFichier}`, alignment: 'center', colSpan: 5 }, {}, {}, {},{},
                { text: 'Devise : EUR', alignment: 'center', colSpan: 2 }, {},
            ];
            let subHeader = [
                // En-têtes des colonnes
                { text: 'Lot', alignment: 'center' },
                { text: 'Lig', alignment: 'center' },
                { text: 'Date Opé', alignment: 'center' },
                { text: 'Sté', alignment: 'center' },
                { text: 'Code Compte', alignment: 'center' },
                { text: 'Compte', alignment: 'center' },
                { text: 'Débit', alignment: 'center' },
                { text: 'Crédit', alignment: 'center' },
                { text: 'Libellé', alignment: 'center' },
                { text: libZoneAnexArray[0]?.libelle || 'Zone Annexe 1', alignment: 'center' },
                { text: libZoneAnexArray[1]?.libelle || 'Zone Annexe 2', alignment: 'center' },
                { text: libZoneAnexArray[2]?.libelle || 'Zone Annexe 3', alignment: 'center' },
                { text: libZoneAnexArray[3]?.libelle || 'Zone Annexe 4', alignment: 'center' },
                { text: libZoneAnexArray[4]?.libelle || 'Zone Annexe 5', alignment: 'center' },
                { text: 'Nature flux', alignment: 'center' },
                { text: 'Journal', alignment: 'center' }
            ];
        



        
            // Préparez les données pour le tableau pdfMake
            let body = [];
            let colorDictionary = {}; // Dictionnaire pour stocker les couleurs correspondantes à chaque groupe de numLigneSource
            let currentGroup = null; // Groupe en cours
            let currentGroupColor = null; // Couleur du groupe en cours
            const darkGreyColor = "#F0F0F0"; // Couleur grise foncée (à personnaliser selon vos préférences)
            const lightGreyColor = "white"; // Couleur grise claire (à personnaliser selon vos préférences)

            for (let i = 0; i < writeFilePdf.length; i++) {
            let row = [];
            let item = writeFilePdf[i];
            
            // Remplir chaque cellule de la ligne avec les données correspondantes
            row.push(
                { text: item.numImportSource, style: {} },
                { text: item.numLigneSource, style: {} },
                { text: item.DateComptaOperat, style: {} },
                { text: item.exfilesCodeSociete, style: {} },
                { text: item.NumCompte, style: {} },
                { text: item.compte, style: {} },
                { text: item.Débit, style: {} },
                { text: item.Crédit, style: {} },
                { text: item.libelle, style: {} },
                { text: item.ZA1, style: {} },
                { text: item.ZA2, style: {} },
                { text: item.ZA3, style: {} },
                { text: item.ZA4, style: {} },
                { text: item.ZA5, style: {} },
                { text: item.eXfilesNatureFlux, style: {} },
                { text: item.journal, style: {} }
            );
            
            if (item.numLigneSource !== currentGroup) {
                // Changer de groupe
                currentGroup = item.numLigneSource;
            
                if (!colorDictionary[currentGroup]) {
                // Définir la couleur du groupe en fonction du numéro de groupe
                colorDictionary[currentGroup] = Object.keys(colorDictionary).length % 2 === 0 ? darkGreyColor : lightGreyColor;
                    // Si le nombre de groupes est pair, utiliser la couleur grise foncée, sinon utiliser la couleur grise claire

                }
            
                currentGroupColor = colorDictionary[currentGroup];
            }
            
            row.forEach(cell => {
                cell.style.fillColor = currentGroupColor;
            });
            
            body.push(row);
            }
            
            

        // Ajouter la ligne de total à la fin du tableau body
            totalRow = ['', '', '', '', '', 'Total', writeFileTotal[0][''],writeFileTotal[1][''], '', '', '', '', '', '', '', ''];
            body.push(totalRow);

    const logo = "data:image/png;base64,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"            
        // Génération du document PDF avec PDFMake
            const docDefinition  = {

                pageSize:"A4",
                pageOrientation:"Landscape",

                content: [
                    {
                        //affichage des images et le titre
                        table: {
                        widths: ['*', '*','*'], 
                        body: [
                            [  
                                {
                                image: logo,
                                alignment: 'left',
                                margin: [0, 0, 0, 10],
                                width: 60,
                                height:60,
                                },
                                {
                                text: 'EDITION EXFILES DES ECRITURES EXPORTEES', 
                                style: 'header',
                                alignment: 'center',
                                margin: [0, 40, 0,0],
                         
                                },
                                {
                                image: "data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCABIAGQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+ikooAKKKKAFpKKYZox/GKAH0tMEsZ6OKdQAtJRRQAUtJRQAUUUUALRRRQAVHNKsKZPJPQetSVmyP5srP2HC/SqirsTdhXkeU5c8f3R0ptUX1DZKVMRwPXg1Kl9A/Vip9xWpmWaekzRH73HoagaeNIy5cFR6GqKrJfzbmysa0AdFHIsi5H4in1nwv5cg9Dwa0KykrM0TuFFFFSMKKKKADFGKTFGKAGycRMR1ANZqfcFahGQQe9ZaqUyh6qcVpAiQkkMcq4dQazbmy8ld6uCvoetW7i6eB8eUSv8AePeqyK9/Nuc4jXsKskpjGeelactyts8UEMJkZ0Z1UED5Vxnr3+YVWvrcROGQYQ8Y9DVqCOG6tojNEkhQ8b1B2kdxmgDOe+uraS7glm3PEsk8DkACZQPuHA6qeuPb3xei1aaC4RJ3ZxkoynbyzeTt5AHA83/9dWPsFrL5cZtYWCk7AYwQueuPTNaJsbQhgbWE7gQcxjkEAHP4AfkKzmVEhg1DzLz7LLA8MuCQH6NjHQjg9fXPqKvYqKO2ghIMcMaEDA2qB/noPyqXFQWFFGKKAEooo5oAKrXMBY+agyw6j1FWaOaadhNXMshXQgjIPBFQ2lu1uHBOcnj6VqyW6SHOMN6iojaN2YH8K0UkRyspzxCaFkPccfWoLCOSOJg4xk8CtMWh7t+QqZIUj5AyfU0OaBRYy3hKfM33j0HpU9HNHNZt3LSsFLSUUhhRRzRQAUUUUAFFFFAC0lFFABRRRQAUUUUAFFFFABRRRQB//9k=",
                                alignment: 'right',
                                margin: [0, 10, 0, 0],
                               
                                },
                            ]
                        ],
                        margin: 0,
                        },
                        layout: 'noBorders',
                    },
                    ' ',
                    {
                        //affichage du contentu du tableau 
                        style: 'tableExample',
                        table: {
                            widths: [18, 14, 30, 20, 40, 43, 42, 42, 136, 40, 40, 38, 38, 38, 28, 35],
                            //je concatene les entête avec le corps du tableau
                            body: [column,subHeader].concat(body),
                            margin: 0, 
                        },
                    
                        layout: {
                            hLineWidth: function(i) {
                                if (i === 0 || i === 1 || i === 2 || i === body.length +1 || i === body.length +2) {
                                    return 0.5; // Épaisseur de la ligne 
                                } else{
                                    return 0
                                }
                            },
                            vLineWidth: function() {
                                return 0.5; // Épaisseur de la ligne verticale                          
                            },
                                                
            

                        },
                    }
                    

                ],
                styles: {
                    header: {
                        fontSize: 20,
                        bold: true,
                    },
                },
                defaultStyle: {
                    fontSize: 8,
                },
                // construction du footer
                footer: function(currentPage, pageCount) { 
                    return [
                        { 
                            table: {
                                widths: ['*', '*'],
                                body: [
                                    [
                                        {
                                            text: `eXfiles - Edition des écritures exportées pour le lot ${numImportSource} - ${lotExport}`, 
                                            alignment: 'left',
                                            margin: [40, 10, 0, 0] // Ajout d'une marge à gauche
                                        }, 
                                        {
                                            text: `Page ${currentPage.toString()} sur ${pageCount}`, 
                                            alignment: 'right',
                                            margin: [0, 10, 20, 0] // Ajout d'une marge à droite
                                        }
                                    
                                    ]
                                ],
                                margin: [0, 0, 0, 0] ,
                            },
                            layout: 'noBorders',
                    
                        },
                        { 
                            //affichage d'une ligne noir en dessous du footer
                            canvas: [
                                { 
                                    type: 'line', 
                                    x1: 40, y1: 0, 
                                    x2: 820, // Longueur de la ligne - à ajuster si nécessaire 
                                    y2: 0, 
                                    lineWidth: 1, 
                                    color: 'black' 
                                }
                            ]
                        }
                    
                    ];
                },
        

            };

          
            // Sauvegarde du document PDF localement
            const pdfDoc = pdfMake.createPdf(docDefinition);
            const filePath = `${cheminExportFichier}/${nomFichier}`
            pdfDoc.getBuffer((buffer) => {
                fs.writeFileSync(filePath, buffer);
                log.log(`Fichier PDF ${nomFichier} créé avec succès `)   

            });
            // Ouverture automatique du fichier PDF
            const open = require('open');
            open(filePath);
          
           

        }

            
    }catch(err){
        console.error(err);
    }
}




module.exports = {
    lotsExportesTotal,
    lotsExportesPartiel,
    lotsExportesJamais,
    exportLots,
    paramExportPartiel,
    generatePdf
}