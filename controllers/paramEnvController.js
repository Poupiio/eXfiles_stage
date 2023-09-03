const sql = require("mssql");
const { connexionClient, getCurrentFile } = require('./userController');
const log = require ('../PARAM-ENV/log');

//-------------------------------------------------------------------------------PAGE DEVISE------------------------------------------------------------------------------------------
const devise = async (data) => {
    try {

       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();
        let deviseResult = await request.query(`select idDevise, TRIM(codeDevise) as codeDevise, TRIM(libelleDevise) as libelleDevise from P_DEVISE where codeDossier = '${data.codeDossier}'`)
      
        let doublon = await request.query(`select autoriserDoublons from T_DOSSIER where codeDossier = '${data.codeDossier}'`)

        log.log('la liste des Devises a été généré avec succès')

        return {deviseResult:deviseResult.recordset , doublon:doublon.recordset[0].autoriserDoublons} 

    } catch (error) {
        log.logError(error)
    }
}

//cette fonction ajoute une devise
const addDevise = async (data) => {
    try {

       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        const request = pool.request();

        //j'utilise les champs réservé de requête pour sécurisé les champs de saisie et j'insère dans la BDD
        await request
        .input('codeDevise', sql.Char, data.codeDevise)
        .input('libelleDevise', sql.Char, data.libelleDevise)
        .query(`INSERT INTO P_DEVISE (codeDevise, libelleDevise, codeDossier) VALUES (@codeDevise, @libelleDevise, '${data.codeDossier}') `);

        log.log(`Nouvelle devise ${data.codeDevise} ajoutée avec succès`)

    } catch (error) {
        console.error(error)
    }
}
//fonction pour supprimer une devise
const deleteDevise = async (data) => {
    try {
       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();

        await request.query(`DELETE FROM P_DEVISE WHERE idDevise = '${data.selectedIdDevise}' AND codeDevise = '${data.selectedCodeDevise}' AND codeDossier = '${data.codeDossier}'`)
        log.log(`Devise n°: ${data.selectedIdDevise},${data.selectedCodeDevise},  supprimée avec succès`);

    } catch (error) {
        log.logError(error)
    }
} 

//fonction pour modifier une devise
const updateDevise = async (data) => {
    try {

       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();

        await request
        .input('codeDevise', sql.Char, data.codeDevise)
        .input('libelleDevise', sql.Char, data.libelleDevise)
        .query(`UPDATE P_DEVISE SET codeDevise = @codeDevise, libelleDevise = @libelleDevise WHERE idDevise = '${data.idDevise}' AND codeDossier = '${data.codeDossier}' `)

        log.log(`Devise n°: ${data.idDevise},${data.codeDevise},  modifiée avec succès`);

    } catch (error) {
        log.logError(error)
    }
} 

//-------------------------------------------------------------------------------PAGE SOCIETE------------------------------------------------------------------------------------------

//fonction pour visualiser les code societe
const societe = async (data) => {
    try {

       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();
        const codeDossier = data.codeDossier.trim()
        let societeResult = await request.query(`SELECT idSociete,TRIM(codeSociete) AS codeSociete,
        TRIM(libelleSociete) AS libelleSociete,P_SOCIETE.idDevise,TRIM(P_DEVISE.codeDevise) AS codeDevise
        FROM P_SOCIETE
        JOIN P_DEVISE ON P_SOCIETE.idDevise = P_DEVISE.idDevise
        WHERE P_SOCIETE.codeDossier = '${codeDossier}' AND P_DEVISE.codeDossier = '${codeDossier}'`)
    
        return societeResult.recordset 

    } catch (error) {
        log.logError(error)
    }
}
;
//cette fonction ajoute une Societe
const addSociete= async (data) => {
    try {

       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        const request = pool.request();

        //j'utilise les champs réservé de requête pour sécurisé les champs de saisie et j'insère dans la BDD
        await request
        .input('codeSociete', sql.Char, data.codeSociete)
        .input('libelleSociete', sql.Char, data.libelleSociete)
        .query(`INSERT INTO P_SOCIETE (codeSociete, libelleSociete, idDevise, codeDossier)
            VALUES (@codeSociete,@libelleSociete,(select idDevise from P_DEVISE where codeDevise = '${data.codeDevise}' and codeDossier='${data.codeDossier}'),'${data.codeDossier}')
            `);

        log.log(`Nouvelle Societe ${data.libelleSociete} ajoutée avec succès`)

    } catch (error) {
        console.error(error)
    }
};

//fonction pour supprimer une Societe
const deleteSociete = async (data) => {
    try {
       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();

        await request.query(`DELETE FROM P_SOCIETE WHERE idSociete= '${data.selectedIdSociete}' AND codeSociete = '${data.selectedCodeSociete}' AND codeDossier = '${data.codeDossier}'`)
        log.log(`Devise n°: ${data.selectedIdSociete},${data.selectedCodeSociete},  supprimée avec succès`);

    } catch (error) {
        log.logError(error)
    }
} 

//fonction pour modifier une Societe
const updateSociete= async (data) => {
    try {
       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();
        await request
        //je réalise ma requète update en utilisant les champs réservé de requète. 
        .input('codeSociete', sql.Char, data.codeSociete)
        .input('libelleSociete', sql.Char, data.libelleSociete)
        .query(`UPDATE P_SOCIETE SET codeSociete = @codeSociete, 
                            libelleSociete = @libelleSociete, 
                            idDevise = (SELECT idDevise FROM P_DEVISE WHERE codeDevise = '${data.codeDevise}' AND codeDossier = '${data.codeDossier}'),
                            codeDossier = '${data.codeDossier}'
                            WHERE idSociete = '${data.idSociete}' AND codeDossier = '${data.codeDossier}' `)
        log.log(`Devise n°: ${data.idSociete},${data.codeSociete},  modifiée avec succès`);

    } catch (error) {
        log.logError(error)
    }
} 


//-------------------------------------------------------------------------------PAGE BANQUE------------------------------------------------------------------------------------------

//fonction pour visualiser les code banque
const banque = async (data) => {
    try {

       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();
        let banqueResult = await request.query(`select idBanque, TRIM(codeBanque) as codeBanque, TRIM(libelleBanque) as libelleBanque from P_Banque where codeDossier = '${data.codeDossier}'`)
      

        log.log('la liste des Banques a été générée avec succès')

        return banqueResult.recordset

    } catch (error) {
        log.logError(error)
    }

}
;
//cette fonction ajoute une banque
const addBanque = async (data) => {
    try {

       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        const request = pool.request();

        //j'utilise les champs réservé de requête pour sécurisé les champs de saisie et j'insère dans la BDD
        await request
        .input('codeBanque', sql.Char, data.codeBanque)
        .input('libelleBanque', sql.Char, data.libelleBanque)
        .query(`INSERT INTO P_BANQUE (codeBanque, libelleBanque, codeDossier) VALUES (@codeBanque, @libelleBanque, '${data.codeDossier}') `);

        log.log(`Nouvelle banque ${data.codeBanque} ajoutée avec succès`)

    } catch (error) {
        console.error(error)
    }
}
//fonction pour supprimer un Banque
const deleteBanque= async (data) => {
    try {
       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();

        await request.query(`DELETE FROM P_BANQUE WHERE idBanque = '${data.selectedIdBanque}' AND codeBanque = '${data.selectedCodeBanque}' AND codeDossier = '${data.codeDossier}'`)
        log.log(`Banque n°: ${data.selectedIdBanque},${data.selectedCodeBanque},  supprimée avec succès`);

    } catch (error) {
        log.logError(error)
    }
} 

//fonction pour modifier une Banque
const updateBanque = async (data) => {
    try {

       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();

        await request
        .input('codeBanque', sql.Char, data.codeBanque)
        .input('libelleBanque', sql.Char, data.libelleBanque)
        .query(`UPDATE P_BANQUE SET codeBanque = @codeBanque, libelleBanque = @libelleBanque WHERE idBanque = '${data.idBanque}' AND codeDossier = '${data.codeDossier}' `)

        log.log(`Banque n°: ${data.idBanque},${data.codeBanque},  modifiée avec succès`);

    } catch (error) {
        log.logError(error)
    }
} 


//-------------------------------------------------------------------------------PAGE ETABLISSEMENT------------------------------------------------------------------------------------------

//fonction pour visualiser les code societe
const etablissement = async (data) => {
    try {

       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();
        let etablissementResult = await request.query(`select idEtablissement, TRIM(codeEtablissement) as codeEtablissement, TRIM(libelleEtablissement) as libelleEtablissement from P_ETABLISSEMENT where codeDossier = '${data.codeDossier}'`)
        return etablissementResult.recordset 

    } catch (error) {
        log.logError(error)
    }
}
;
//cette fonction ajoute un Etablissement
const addEtablissement= async (data) => {
    try {

       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        const request = pool.request();

        //j'utilise les champs réservé de requête pour sécurisé les champs de saisie et j'insère dans la BDD
        await request
        .input('codeEtablissement', sql.Char, data.codeEtablissement)
        .input('libelleEtablissement', sql.Char, data.libelleEtablissement)
        .query(`INSERT INTO P_ETABLISSEMENT (codeEtablissement, libelleEtablissement, codeDossier) VALUES (@codeEtablissement, @libelleEtablissement, '${data.codeDossier}') 
            `);

        log.log(`L'établissement ${data.libelleEtablissement} ajouté avec succès`)

    } catch (error) {
        console.error(error)
    }
};

//fonction pour supprimer un Etablissement
const deleteEtablissement = async (data) => {
    try {
       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();

        await request.query(`DELETE FROM P_ETABLISSEMENT WHERE idEtablissement= '${data.selectedIdEtablissement}' AND codeEtablissement = '${data.selectedCodeEtablissement}' AND codeDossier = '${data.codeDossier}'`)
        log.log(`l'établissement n°: ${data.selectedIdEtablissement},${data.selectedCodeEtablissement},  supprimé avec succès`);

    } catch (error) {
        log.logError(error)
    }
} 

//fonction pour modifier un Etablissement
const updateEtablissement= async (data) => {
    try {
       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();
        await request
        //je réalise ma requète update en utilisant les champs réservé de requète. 
        .input('codeEtablissement', sql.Char, data.codeEtablissement)
        .input('libelleEtablissement', sql.Char, data.libelleEtablissement)
        .query(`UPDATE P_ETABLISSEMENT SET codeEtablissement = @codeEtablissement, libelleEtablissement = @libelleEtablissement WHERE idEtablissement = '${data.idEtablissement}' AND codeDossier = '${data.codeDossier}' `)
        log.log(`L'établissement n°: ${data.idEtablissement},${data.codeEtablissement},  modifié avec succès`);

    } catch (error) {
        log.logError(error)
    }
} 

//-------------------------------------------------------------------------------PAGE Journal------------------------------------------------------------------------------------------

//fonction pour visualiser un journal
const journal = async (data) => {
    try {

       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();
        let journalResult = await request.query(`select idJournal, TRIM(codeJournal) as codeJournal, TRIM(libelleJournal) as libelleJournal from P_JOURNAL where codeDossier = '${data.codeDossier}'`)
        return journalResult.recordset 

    } catch (error) {
        log.logError(error)
    }
}
;
//cette fonction ajoute un journal
const addJournal= async (data) => {
    try {

       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        const request = pool.request();

        //j'utilise les champs réservé de requête pour sécurisé les champs de saisie et j'insère dans la BDD
        await request
        .input('codeJournal', sql.Char, data.codeJournal)
        .input('libelleJournal', sql.Char, data.libelleJournal)
        .query(`INSERT INTO P_JOURNAL (codeJournal, libelleJournal, codeDossier) VALUES (@codeJournal, @libelleJournal, '${data.codeDossier}') 
            `);

        log.log(`Le Journal ${data.libelleJournal} a été ajouté avec succès`)

    } catch (error) {
        console.error(error)
    }
};

//fonction pour supprimer un journal
const deleteJournal = async (data) => {
    try {
       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();

        await request.query(`DELETE FROM P_JOURNAL WHERE idJournal= '${data.selectedIdJournal}' AND codeJournal = '${data.selectedCodeJournal}' AND codeDossier = '${data.codeDossier}'`)
        log.log(`le Journal n°: ${data.selectedIdJournal},${data.selectedCodeJournal}, a été supprimé avec succès`);

    } catch (error) {
        log.logError(error)
    }
} 

//fonction pour modifier un journal
const updateJournal= async (data) => {
    try {
       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();
        await request
        //je réalise ma requète update en utilisant les champs réservé de requète. 
        .input('codeJournal', sql.Char, data.codeJournal)
        .input('libelleJournal', sql.Char, data.libelleJournal)
        .query(`UPDATE P_JOURNAL SET codeJournal = @codeJournal, libelleJournal = @libelleJournal WHERE idJournal = '${data.idJournal}' AND codeDossier = '${data.codeDossier}' `)
        log.log(`Le Journal n°: ${data.idJournal},${data.codeJournal}, a été modifié avec succès`);

    } catch (error) {
        log.logError(error)
    }
} 

//-------------------------------------------------------------------------------PAGE Plan comptable------------------------------------------------------------------------------------------

//fonction pour visualiser un plan comptable 
const compte = async (data) => {
    try {

       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();
        let compteResult = await request.query(`select idCptCompta, TRIM(numCptCompta) as numCptCompta, TRIM(libelleCptCompta) as libelleCptCompta from P_CPTCOMPTA where codeDossier = '${data.codeDossier}'`)
        return compteResult.recordset 

    } catch (error) {
        log.logError(error)
    }
}
;
//cette fonction ajoute un plan comptable 
const addCompte= async (data) => {
    try {

       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        const request = pool.request();

        //j'utilise les champs réservé de requête pour sécurisé les champs de saisie et j'insère dans la BDD
        await request
        .input('numCptCompta', sql.Char, data.codeCompte)
        .input('libelleCptCompta', sql.Char, data.libelleCompte)
        .query(`INSERT INTO P_CPTCOMPTA(numCptCompta, libelleCptCompta, codeDossier) VALUES (@numCptCompta, @libelleCptCompta, '${data.codeDossier}') 
            `);

        log.log(`Le plan comptable  ${data.libelleCompte} a été ajouté avec succès`)

    } catch (error) {
        console.error(error)
    }
};

//fonction pour supprimer un plan comptable 
const deleteCompte = async (data) => {
    try {
       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();

        await request.query(`DELETE FROM P_CPTCOMPTA WHERE idCptCompta= '${data.selectedIdCompte}' AND numCptCompta = '${data.selectedCodeCompte}' AND codeDossier = '${data.codeDossier}'`)
        log.log(`le plan comptable  n°: ${data.selectedIdCompte},${data.selectedCodeCompte},  a été supprimé avec succès`);

    } catch (error) {
        log.logError(error)
    }
} 

//fonction pour modifier un plan comptable 
const updateCompte= async (data) => {
    try {
       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();
        await request
        //je réalise ma requète update en utilisant les champs réservé de requète. 
        .input('numCptCompta', sql.Char, data.codeCompte)
        .input('libelleCptCompta', sql.Char, data.libelleCompte)
       
        .query(`UPDATE P_CPTCOMPTA SET numCptCompta = @numCptCompta, libelleCptCompta = @libelleCptCompta WHERE idCptCompta = '${data.idCompte}' AND codeDossier = '${data.codeDossier}' `)
        log.log(`Le plan comptable  n°: ${data.idCompte},${data.codeCompte},  a été modifié avec succès`);

    } catch (error) {
        log.logError(error)
    }
} 

//-------------------------------------------------------------------------------PAGE Tresorerie------------------------------------------------------------------------------------------

//fonction pour visualiser les code banque
const cptTreso = async (data) => {
    try {

       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();
        let cptTresoResult = await request.query(`select idCptTreso,TRIM(ribCptTreso) as ribCptTreso,TRIM(ibanCptTreso) as ibanCptTreso, 
        TRIM(codeCptTreso) as codeCptTreso,P_CPTTRESO.idDevise,TRIM(P_DEVISE.codeDevise) AS codeDevise from P_CPTTRESO 
        JOIN P_DEVISE ON P_CPTTRESO .idDevise = P_DEVISE.idDevise
        WHERE P_CPTTRESO .codeDossier = '${data.codeDossier}' AND P_DEVISE.codeDossier = '${data.codeDossier}'`)
        
       
        log.log('la liste des compte de trésorerie a été générée avec succès')
        return cptTresoResult.recordset 

    } catch (error) {
        log.logError(error)
    }

}
;
//cette fonction ajoute un compte de trésorerie
const addCptTreso= async (data) => {
    try {

       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        const request = pool.request();
        //j'utilise les champs réservé de requête pour sécurisé les champs de saisie et j'insère dans la BDD
        await request
        .input('ribCptTreso', sql.Char, data.ribCptTreso)
        .input('ibanCptTreso', sql.Char, data.ibanCptTreso)
        .input('codeCptTreso', sql.Char, data.codeCptTreso)
        .query(`INSERT INTO P_CPTTRESO (ribCptTreso,ibanCptTreso,codeCptTreso,codeDossier, idDevise)
            VALUES (@ribCptTreso,@ibanCptTreso,@codeCptTreso,'${data.codeDossier.trim()}',(select idDevise from P_DEVISE where codeDevise = '${data.codeDevise}' and codeDossier='${data.codeDossier.trim()}'))
            `);

        log.log(`Nouveau compte de trésorerie ${data.codeCptTreso} ajouté avec succès`)

    } catch (error) {
        console.error(error)
    }
};
//fonction pour supprimer un compte de trésorerie
const deleteCptTreso= async (data) => {
    try {
       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();
        await request.query(`DELETE FROM P_CPTTRESO WHERE idCptTreso = '${data.selectedIdCptTreso}' AND codeDossier = '${data.codeDossier}'`)
        log.log(`Compte de trésorerie n°: ${data.selectedIdCptTreso}, supprimé avec succès`);
    } catch (error) {
        log.logError(error)
    }
} 

//fonction pour modifier un compte de trésorerie
const updateCptTreso = async (data) => {
    try {

       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();


        await request
        .input('ribCptTreso', sql.Char, data.ribCptTreso)
        .input('ibanCptTreso', sql.Char, data.ibanCptTreso)
        .input('codeCptTreso', sql.Char, data.codeCptTreso)
        .query(`UPDATE P_CPTTRESO SET ribCptTreso = @ribCptTreso, 
        ibanCptTreso = @ibanCptTreso, codeCptTreso = @codeCptTreso,
        idDevise = (SELECT idDevise FROM P_DEVISE WHERE codeDevise = '${data.codeDevise}' AND codeDossier = '${data.codeDossier}'),
        codeDossier = '${data.codeDossier}'
        WHERE idCptTreso = '${data.idCptTreso}' AND codeDossier = '${data.codeDossier}'`)

        log.log(`Compte de trésorerie n°: ${data.idCptTreso},${data.codeCptTreso},  modifié avec succès`);

    } catch (error) {
        log.logError(error)
    }
} 

//-------------------------------------------------------------------------------PAGE BUDGET------------------------------------------------------------------------------------------

//fonction pour visualiser le budget
const budget = async (data) => {
    try {

       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();
        let compteResult = await request.query(`select idBudget, TRIM(codeBudget) as codeBudget, TRIM(libelleBudget) as libelleBudget from P_BUDGETTRESO where codeDossier = '${data.codeDossier}'`)
        return compteResult.recordset 

    } catch (error) {
        log.logError(error)
    }
}
;
//cette fonction ajoute un budget 
const addBudget= async (data) => {
    try {

       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        const request = pool.request();

        //j'utilise les champs réservé de requête pour sécurisé les champs de saisie et j'insère dans la BDD
        await request
        .input('codeBudget', sql.Char, data.codeBudget)
        .input('libelleBudget', sql.Char, data.libelleBudget)
        .query(`INSERT INTO P_BUDGETTRESO (codeBudget, libelleBudget, codeDossier) VALUES (@codeBudget, @libelleBudget, '${data.codeDossier}') 
            `);

        log.log(`Le budget ${data.libelleBudget} a été ajouté avec succès`)

    } catch (error) {
        console.error(error)
    }
};

//fonction pour supprimer un budget
const deleteBudget = async (data) => {
    try {
       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();

        await request.query(`DELETE FROM P_BUDGETTRESO WHERE idBudget= '${data.selectedIdBudget}' AND codeDossier = '${data.codeDossier}'`)
        log.log(`le Budget n°: ${data.selectedIdBudget},${data.selectedCodeBudget},  a été supprimé avec succès`);

    } catch (error) {
        log.logError(error)
    }
} 

//fonction pour modifier un budget 
const updateBudget= async (data) => {
    try {
       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();
        await request
        //je réalise ma requète update en utilisant les champs réservé de requète. 
        .input('codeBudget', sql.Char, data.codeBudget)
        .input('libelleBudget', sql.Char, data.libelleBudget)
        .query(`UPDATE P_BUDGETTRESO SET codeBudget = @codeBudget, libelleBudget = @libelleBudget WHERE idBudget = '${data.idBudget}' AND codeDossier = '${data.codeDossier}' `)
        log.log(`Le budget  n°: ${data.idBudget},${data.codeBudget},  a été modifié avec succès`);

    } catch (error) {
        log.logError(error)
    }
} 

//-------------------------------------------------------------------------------PAGE FLUX------------------------------------------------------------------------------------------

//fonction pour visualiser les flux
const flux = async (data) => {
    try {

       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();
        let fluxResult = await request.query(`select idFlux, TRIM(numFlux) as numFlux, TRIM(libelleFlux) as libelleFlux, TRIM(natureFlux) as natureFlux  from P_FLUXTRESO where codeDossier = '${data.codeDossier}'`)

        return fluxResult.recordset 
    } catch (error) {
        log.logError(error)
    }
}
;
//cette fonction ajoute un flux 
const addFlux= async (data) => {
    try {

       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        const request = pool.request();

        //j'utilise les champs réservé de requête pour sécurisé les champs de saisie et j'insère dans la BDD
        await request
        .input('numFlux', sql.Char, data.codeFlux)
        .input('libelleFlux', sql.Char, data.libelleFlux)
        .input('natureFlux', sql.Char, data.natureFlux)
        .query(`INSERT INTO P_FLUXTRESO (numFlux, libelleFlux,natureFlux, codeDossier) VALUES (@numFlux, @libelleFlux,@natureFlux, '${data.codeDossier}') 
            `);

        log.log(`Le flux ${data.libelleFlux} a été ajouté avec succès`)

    } catch (error) {
        console.error(error)
    }
};

//fonction pour supprimer un flux
const deleteFlux = async (data) => {
    try {
       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();

        await request.query(`DELETE FROM P_FLUXTRESO WHERE idFlux= '${data.selectedIdFlux}' AND codeDossier = '${data.codeDossier}'`)
        log.log(`le flux n°: ${data.selectedIdFlux},${data.selectedCodeFlux},  a été supprimé avec succès`);

    } catch (error) {
        log.logError(error)
    }
} 

//fonction pour modifier flux
const updateFlux= async (data) => {
    try {
       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();
        console.log(data);
        await request
        //je réalise ma requète update en utilisant les champs réservé de requète. 
        .input('numFlux', sql.Char, data.codeFlux)
        .input('libelleFlux', sql.Char, data.libelleFlux)
        .input('natureFlux', sql.Char, data.natureFlux)
        .query(`UPDATE P_FLUXTRESO SET numFlux = @numFlux, libelleFlux = @libelleFlux, natureFlux = @natureFlux WHERE idFlux = '${data.idFlux}' AND codeDossier = '${data.codeDossier}' `)
        log.log(`Le flux  n°: ${data.idFlux},${data.codeFlux},  a été modifié avec succès`);

    } catch (error) {
        log.logError(error)
    }
} 


//-------------------------------------------------------------------------------PAGE taux------------------------------------------------------------------------------------------

//fonction pour visualiser les taux
const tauxTVA = async (data) => {
    try {
       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();
        let tauxResult = await request.query(`select idTauxTVA, TRIM(codeTauxTVA) as codeTauxTVA ,TRIM(libelleTauxTVA) as libelleTauxTVA, TRIM(tauxTVA) as tauxTVA  from P_TAUXTVA where codeDossier = '${data.codeDossier}'`)
        return tauxResult.recordset 
    } catch (error) {
        log.logError(error)
    }
}
;
//cette fonction ajoute un flux 
const addTaux= async (data) => {
    try {
console.log(data);
       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        const request = pool.request();
        //j'utilise les champs réservé de requête pour sécurisé les champs de saisie et j'insère dans la BDD
        await request
        .input('codeTauxTVA', sql.Char, data.codeTauxTVA)
        .input('libelleTauxTVA', sql.Char, data.libelleTauxTVA)
        .input('tauxTVA', sql.Char, data.tauxTVA)
        .query(`INSERT INTO P_TAUXTVA (codeTauxTVA, libelleTauxTVA,tauxTVA, codeDossier) VALUES (@codeTauxTVA, @libelleTauxTVA,@tauxTVA, '${data.codeDossier}') 
            `);

        log.log(`Le taux ${data.libelleTauxTVA} a été ajouté avec succès`)

    } catch (error) {
        console.error(error)
    }
};

//fonction pour supprimer un taux
const deleteTaux = async (data) => {
    try {
       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();

        await request.query(`DELETE FROM P_TAUXTVA WHERE idTauxTVA= '${data.selectedIdTaux}' AND codeDossier = '${data.codeDossier}'`)
        log.log(`le taux n°: ${data.selectedIdTaux},${data.selectedCodeTaux},  a été supprimé avec succès`);

    } catch (error) {
        log.logError(error)
    }
} 

//fonction pour modifier taux
const updateTaux= async (data) => {
    try {
       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();
        await request
        //je réalise ma requète update en utilisant les champs réservé de requète. 
        .input('codeTauxTVA', sql.Char, data.codeTauxTVA)
        .input('libelleTauxTVA', sql.Char, data.libelleTauxTVA)
        .input('tauxTVA', sql.Char, data.tauxTVA)
        .query(`UPDATE P_TAUXTVA SET codeTauxTVA = @codeTauxTVA, libelleTauxTVA = @libelleTauxTVA, tauxTVA = @tauxTVA WHERE idTauxTVA = '${data.idTaux}' AND codeDossier = '${data.codeDossier}' `)
        log.log(`Le taux  n°: ${data.idTaux},${data.codeTauxTVA},  a été modifié avec succès`);

    } catch (error) {
        log.logError(error)
    }
} 

//-------------------------------------------------------------------------------PAGE traitement------------------------------------------------------------------------------------------

// j'utilise la fonction filePath pour récupérer le chemin du fichier d'import
const traitement = async (data) => {

    try {
      //je me connecte à la BDD
      const pool = await sql.connect(connexionClient);
      let request = pool.request();
      //je réalise ma requête
      let traitementResponse = await request.query(`SELECT idTraitement,TRIM(codeTraitement) as codeTraitement, TRIM(libelleTraitement) as libelleTraitement,cheminRDC, cheminFRP,cheminCAMT054,cheminFACTMATA FROM P_TRAITEMENT where codeDossier = '${data.codeDossier}' `)
      traitementResponse = traitementResponse.recordset
    //   je renvoie le chemin du fichier d'import en front
      return traitementResponse
  
    } catch (error) {
        console.error(error);
    }
  }
  
;

//cette fonction ajoute un flux 
const addTraitement= async (data) => {
    try {

       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        const request = pool.request();

        //j'utilise les champs réservé de requête pour sécurisé les champs de saisie et j'insère dans la BDD
        await request
        .input('codeTraitement', sql.Char, data.codeTraitement)
        .input('libelleTraitement', sql.Char, data.libelleTraitement)
        .input('cheminRDC', sql.VarChar, data.cheminRDC)
        .input('cheminFRP', sql.VarChar, data.cheminFRP)
        .input('cheminCAMT054', sql.VarChar, data.cheminCAMT054)
        .input('cheminFACTMATA', sql.VarChar, data.cheminFACTMATA)
        .query(`INSERT INTO P_TRAITEMENT (codeTraitement, libelleTraitement,codeDossier,cheminRDC, cheminFRP,cheminCAMT054,cheminFACTMATA) 
                VALUES (@codeTraitement, @libelleTraitement,'${data.codeDossier}',@cheminRDC,@cheminCAMT054, @cheminFRP, @cheminFACTMATA) 
            `);
        log.log(`Le Traitement ${data.libelleTraitement} a été ajouté avec succès`)

    } catch (error) {
        console.error(error)
    }
};

//fonction pour supprimer un taux
const deleteTraitement= async (data,res) => {
    try {
       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();

        //je créé un tableau avec le nom des tables à vérifier
        const tab = ["T_PIVOT", "T_REGLE_COMPTA", "T_REGLE_COMPTA_SCHEMA_ECRITURE", "T_PIVOT_COMPTABLE", "T_FICHIER_EXPORT", "T_FICHIER_EXPORT_ENTETE_ECRITURE", 
        "T_PIVOT_FILTRE", "T_FICHIER_EXPORT_ENTETE_FICHIER", "T_FICHIER_EXPORT_LIGNE_ECRITURE", "T_FICHIER_EXPORT_PIED_FICHIER"];
        // je déclare la variable suppressionPossible à true
        let suppressionPossible = true;
        //je boucle sur chaque item de tab
        for (let i = 0; i < tab.length; i++) {
          const tableName = tab[i];
        // pour chaque item de tab je fais appel à la requête 
          let result = await request.query(`SELECT COUNT(*) as count FROM ${tableName} WHERE codeTraitement = '${data.codeTraitement}'`);
          const count = result.recordset[0].count;
        //si le résultat de la requête est supérieur à zero alors je passe suppressionPossible à false
          if (count > 0) {
            suppressionPossible = false;
            break;
          }
        }
        //si suppressionPossible est à true alors je réalise la requete delete pour supprimer le codeTraitement sinon je renvoi un message de rejet.
        if (suppressionPossible) {
            await request.query(`DELETE FROM P_TRAITEMENT WHERE idTraitement= '${data.idTraitement}'`)
            log.log(`le code traitement n:${data.idTraitement} a été supprimé avec succès`);
            return {suppressionPossible : suppressionPossible}
        } else {
            // Envoyer un message indiquant que la suppression est impossible
            let message = "Ce code traitement ne peut pas être supprimé car il est associé à d'autres paramétrages"
            return {erreur : message }
        }
        

    } catch (error) {
        log.logError(error)
    }
} 


//fonction pour modifier traitement
const updateTraitement= async (data) => {
    try {

   
       //je me connecte à la BDD
        const pool = await sql.connect(connexionClient);
        let request = pool.request();
        
        await request 
        .input('libelleTraitement', sql.Char, data.libelleTraitement)
        .input('cheminRDC', sql.VarChar, data.cheminRDC)
        .input('cheminFRP', sql.VarChar, data.cheminFRP)
        .input('cheminCAMT054', sql.VarChar, data.cheminCAMT054)
        .input('cheminFACTMATA', sql.VarChar, data.cheminFACTMATA)
        .query(`UPDATE P_TRAITEMENT SET  libelleTraitement = @libelleTraitement, cheminRDC = @cheminRDC, cheminFRP = @cheminFRP, cheminCAMT054 = @cheminCAMT054, cheminFACTMATA = @cheminFACTMATA WHERE idTraitement = '${data.idTraitement}' AND codeDossier = '${data.codeDossier}' `)
        log.log(`Le traitement  n°: ${data.idTraitement},${data.libelleTraitement},  a été modifié avec succès`);

    } catch (error) {
        log.logError(error)
    }
} 

//-------------------------------------------------------------------------------PAGE Zones Annexes------------------------------------------------------------------------------------------

// j'utilise la fonction pour récupérer les zones annexes
const ZonesAnnexes = async (data) => {

    try {
      //je me connecte à la BDD
      const pool = await sql.connect(connexionClient);
      let request = pool.request();
        let zoneAnnexeArray = []
       // Boucle sur les 10 zones
       for (let zoneNumber = 1; zoneNumber <= 10; zoneNumber++) {
           // Récupération de la valeur de la zone annexe X depuis la base de données
           const codeZone = `Zone Annexe ${zoneNumber}`;
           const result = await request.query(`SELECT libelle, codeZone FROM P_ZONEANNEXE_LIBELLE WHERE codeZone = '${codeZone}' AND codeDossier = '${data.codeDossier}'`);
         
            zoneAnnexeArray.push(result.recordset[0])
       }

       return zoneAnnexeArray
     
       
        
    } catch (error) {
        console.error(error);
    }
  }
  
;


//j'utilise cette fonction pour modifier les zones annexes
const updateZonesAnnexes = async (data) => {
    try {
      // je me connecte à la BDD
      const pool = await sql.connect(connexionClient);
      let request = pool.request();
      
      const libelleZoneValues = data.libelleZoneValues;
      
      // Boucle sur les données libelleZoneValues
      for (let i = 0; i < libelleZoneValues.length; i++) {
        const libelleZoneValue = libelleZoneValues[i];
        const codeZone = `Zone Annexe ${i + 1}`;
 
        await request.query(`UPDATE P_ZONEANNEXE_LIBELLE SET libelle = '${libelleZoneValue}' WHERE codeZone = '${codeZone}' AND codeDossier = '${data.codeDossier}'`);
      }
  

    } catch (error) {
      console.error(error);
    }
  };


// PAGE CORRESPONDANCES
const ribCodeCompte = async () => {
    try {
        const pool = await sql.connect(connexionClient);

        let currentFile = await getCurrentFile();
        currentFile = currentFile[0].codeDossier.trim();

        const ribCodeCompte = await pool.request().query(`SELECT ribCptTreso, codeDevise FROM P_CPTTRESO, P_DEVISE WHERE P_CPTTRESO.idDevise = P_DEVISE.idDevise AND P_CPTTRESO.codeDossier = '${currentFile}' AND ribCptTreso != '' AND idCptTreso NOT IN ( SELECT idRIB FROM t_corr_standard ) ORDER BY ribCptTreso`);
   
        const codeCptTreso = await pool.request().query(`SELECT codeCptTreso FROM P_CPTTRESO WHERE codeDossier = '${currentFile}' AND ribCptTreso = '' AND idCptTreso NOT IN ( SELECT idRIB FROM t_corr_standard ) ORDER BY codeCptTreso`);

        log.log(`La liste des rib, devises et codes compte a bien été renvoyée pour le code dossier ${currentFile}.`);

        return {
            ribCodeCompte: ribCodeCompte.recordset,
            codeCptTreso: codeCptTreso.recordset
        }
        
    } catch (error) {
        log.logError(error);
    }
};


const listeSocietes = async () => {
    try {
        const pool = await sql.connect(connexionClient);

        let currentFile = await getCurrentFile();
        currentFile = currentFile[0].codeDossier.trim();

        const listeSocietes = await pool.request().query(`SELECT codeSociete FROM P_SOCIETE WHERE codeDossier = '${currentFile}' AND codeSociete != '' ORDER BY codeSociete`);

        log.log(`La liste des codes société a bien été renvoyée pour le code dossier ${currentFile}.`);

        return listeSocietes.recordset;

    } catch (error) {
        log.logError(error);
    }
};

const listeBanques = async () => {
    try {
        const pool = await sql.connect(connexionClient);

        let currentFile = await getCurrentFile();
        currentFile = currentFile[0].codeDossier.trim();

        const listeBanques = await pool.request().query(`SELECT codeBanque FROM P_BANQUE WHERE codeDossier = '${currentFile}' AND codeBanque != '' ORDER BY codeBanque`);

        log.log(`La liste des codes banque a bien été renvoyée pour le code dossier ${currentFile}.`);

        return listeBanques.recordset;

    } catch (error) {
        log.logError(error);
    }
};

const listeComptes = async () => {
    try {
        const pool = await sql.connect(connexionClient);

        let currentFile = await getCurrentFile();
        currentFile = currentFile[0].codeDossier.trim();

        const listeComptes = await pool.request().query(`SELECT numCptCompta, libelleCptCompta FROM P_CPTCOMPTA WHERE codeDossier = '${currentFile}' ORDER BY numCptCompta`);

        log.log(`La liste des numéros de compte a bien été renvoyée pour le code dossier ${currentFile}.`);

        return listeComptes.recordset;

    } catch (error) {
        log.logError(error);
    }
};

const listeJournal = async () => {
    try {
        const pool = await sql.connect(connexionClient);

        let currentFile = await getCurrentFile();
        currentFile = currentFile[0].codeDossier.trim();

        const listeJournal = await pool.request().query(`SELECT codeJournal FROM P_JOURNAL WHERE codeDossier = '${currentFile}' ORDER BY codeJournal `);

        log.log(`La liste des codes journaux a bien été renvoyée pour le code dossier ${currentFile}.`);

        return listeJournal.recordset;

    } catch (error) {
        log.logError(error);
    }
};

const listeEtablissement = async () => {
    try {
        const pool = await sql.connect(connexionClient);

        let currentFile = await getCurrentFile();
        currentFile = currentFile[0].codeDossier.trim();

        const listeEtablissement = await pool.request().query(`SELECT codeEtablissement FROM P_ETABLISSEMENT WHERE codeDossier = '${currentFile}' ORDER BY codeEtablissement`);

        log.log(`La liste des codes établissement a bien été renvoyée pour le code dossier ${currentFile}.`);
        
        return listeEtablissement.recordset;

    } catch (error) {
        log.logError(error);
    }
};

const alimentationTableauCorres = async () => {
    try {
        const pool = await sql.connect(connexionClient);

        let currentFile = await getCurrentFile();
        currentFile = currentFile[0].codeDossier.trim();

        const tableau = await pool.request().query(`SELECT idCorrStandard, ribCptTreso, codeDevise, codeCptTreso, codeSociete, codeBanque, numCptCompta, codeJournal, codeEtablissement, identifiantCpt, libelleCptCompta FROM t_corr_standard cs, p_societe s, p_cpttreso ct, p_cptcompta cc, p_banque b, p_devise d WHERE cs.idSociete=s.idSociete
        AND cs.idBanque=b.idBanque AND cs.idCompte=cc.idCptCompta AND cs.idRIB=ct.idCptTreso AND ct.idDevise = d.idDevise AND cs.codeDossier = '${currentFile}' ORDER BY idCorrStandard`);

        log.log(`Les données du tableau de correspondances standard ont bien été renvoyées pour le code dossier ${currentFile}.`);
        
        return tableau.recordset;

    } catch (error) {
        log.logError(error);
    }
};


const obtenirIds = async (ribCptTreso, codeDevise, codeCptTreso, codeSociete, codeBanque, numCptCompta) => {
    try {
        const pool = await sql.connect(connexionClient);

        let currentFile = await getCurrentFile();
        currentFile = currentFile[0].codeDossier.trim();

        let idRib;

        // Si ribCptTreso - codeDevise
        if (ribCptTreso && codeDevise) {
            const idRibCodeCompte = await pool.request().query(`SELECT idCptTreso FROM P_CPTTRESO, P_DEVISE WHERE P_CPTTRESO.idDevise = P_DEVISE.idDevise AND P_CPTTRESO.codeDossier = '${currentFile}' AND (ribCptTreso = '${ribCptTreso}' OR codeCptTreso = '${codeCptTreso}' ) AND codeDevise = '${codeDevise}'`);
            idRib = idRibCodeCompte.recordset[0].idCptTreso;
        } else {
            // Si codeCptTreso
            const idCptTreso = await pool.request().query(`SELECT idCptTreso FROM P_CPTTRESO WHERE codeDossier = '${currentFile}' AND codeCptTreso = '${codeCptTreso}'`);
            idRib = idCptTreso.recordset[0].idCptTreso;
        }

        let idSociete = await pool.request().query(`SELECT idSociete FROM P_SOCIETE WHERE codeDossier = '${currentFile}' AND codeSociete = '${codeSociete}'`);
        idSociete = idSociete.recordset[0].idSociete;

        let idBanque = await pool.request().query(`SELECT idBanque FROM P_BANQUE WHERE codeDossier = '${currentFile}' AND codeBanque = '${codeBanque}'`);
        idBanque = idBanque.recordset[0].idBanque;

        let idCompte = await pool.request().query(`SELECT idCptCompta FROM P_CPTCOMPTA WHERE codeDossier = '${currentFile}'AND numCptCompta = '${numCptCompta}'`);
        idCompte = idCompte.recordset[0].idCptCompta;

        log.log(`Les ids rib (${idRib}), société (${idSociete}), banque (${idBanque}) et compte (${idCompte}) ont été retournés avec succès.`);

        return {
            idRib: idRib,
            idSociete: idSociete,
            idBanque: idBanque,
            idCompte: idCompte
        }

    } catch (error) {
        log.logError(error);
    }
}


const ajouterCorrespondance = async (idRib, idSociete, idBanque, idCompte, codeJournal, codeEtablissement, identifiantCpt) => {
    try {
        const pool = await sql.connect(connexionClient);

        let currentFile = await getCurrentFile();
        currentFile = currentFile[0].codeDossier.trim();

        const request = pool.request();

        await request
            .input('idRib', sql.Int, idRib)
            .input('idSociete', sql.Int, idSociete)
            .input('idBanque', sql.Int, idBanque)
            .input('idCompte', sql.Int, idCompte)
            .input('codeJournal', sql.VarChar, codeJournal)
            .input('codeEtablissement', sql.VarChar, codeEtablissement)
            .input('identifiantCpt', sql.VarChar, identifiantCpt)
            .query(`INSERT INTO T_CORR_STANDARD (idRib, idSociete, idBanque, idCompte, codeJournal, codeDossier, codeEtablissement, identifiantCpt) VALUES (@idRib, @idSociete, @idBanque, @idCompte, @codeJournal, '${currentFile}', @codeEtablissement, @identifiantCpt)`);

            log.log(`Un ajout de correspondance a été exécuté avec succès pour le dossier ${currentFile}.`);

            return true;

    } catch (error) {
        log.logError(error);
        return false;
    }
};

const modifierCorrespondance = async (idRib, idSociete, idBanque, idCompte, identifiantCpt, codeJournal, codeEtablissement, idCorrStandard) => {
    try {
        const pool = await sql.connect(connexionClient);

        let currentFile = await getCurrentFile();
        currentFile = currentFile[0].codeDossier.trim();

        const request = pool.request();

        await request
            .input('idRib', sql.Int, idRib)
            .input('idSociete', sql.Int, idSociete)
            .input('idBanque', sql.Int, idBanque)
            .input('idCompte', sql.Int, idCompte)
            .input('codeJournal', sql.VarChar, codeJournal)
            .input('codeEtablissement', sql.VarChar, codeEtablissement)
            .input('identifiantCpt', sql.VarChar, identifiantCpt)
            .input('idCorrStandard', sql.Int, idCorrStandard)
            .query(`UPDATE T_CORR_STANDARD set idRIB = @idRib, idSociete = @idSociete, idBanque = @idBanque, idCompte = @idCompte, identifiantCpt = @identifiantCpt, codeJournal = @codeJournal, codeEtablissement = @codeEtablissement WHERE idCorrStandard = @idCorrStandard AND codeDossier = '${currentFile}'`);


            // Récupération des données modifiées
            let updatedData = await pool.request().query(`SELECT idCorrStandard, ribCptTreso, codeDevise, codeCptTreso, codeSociete, codeBanque, numCptCompta, codeJournal, codeEtablissement, identifiantCpt FROM t_corr_standard cs, p_societe s, p_cpttreso ct, p_cptcompta cc, p_banque b, p_devise d WHERE cs.idSociete=s.idSociete
            AND cs.idBanque=b.idBanque AND cs.idCompte=cc.idCptCompta AND cs.idRIB=ct.idCptTreso AND ct.idDevise = d.idDevise AND cs.codeDossier = '${currentFile}' AND idCorrStandard = ${idCorrStandard} ORDER BY idCorrStandard`)


           updatedData = updatedData.recordset;
    
            log.log(`Une modification de correspondance a été exécutée avec succès pour le dossier ${currentFile} et les données modifiées ont bien été retournées.`);
    
            return updatedData;

    } catch (error) {
        log.logError(error);
        return false;
    }
};

const supprimerCorrespondance = async (idCorrStandard) => {
    try {
        const pool = await sql.connect(connexionClient);

        let currentFile = await getCurrentFile();
        currentFile = currentFile[0].codeDossier.trim();

        await pool.request().query(`DELETE FROM T_CORR_STANDARD WHERE idCorrStandard = ${idCorrStandard} and codeDossier = '${currentFile}'`);

        log.log(`La suppression de la ligne avec l'idCorrStandard ${idCorrStandard} a été exécutée avec succès pour le dossier ${currentFile}.`);
            
        return true;

    } catch (error) {
        log.logError(error);
        return false;
    }
};


module.exports = {

    devise,
    addDevise,
    deleteDevise,
    updateDevise,
    societe,
    addSociete,
    deleteSociete,
    updateSociete,
    banque,
    addBanque,
    deleteBanque,
    updateBanque,
    etablissement,
    addEtablissement,
    deleteEtablissement,
    updateEtablissement,
    journal,
    addJournal,
    deleteJournal,
    updateJournal,
    compte,
    addCompte,
    deleteCompte,
    updateCompte,
    cptTreso,
    addCptTreso,
    deleteCptTreso,
    updateCptTreso,
    budget,
    addBudget,
    deleteBudget,
    updateBudget,
    flux,
    addFlux,
    deleteFlux,
    updateFlux,
    tauxTVA,
    addTaux,
    deleteTaux,
    updateTaux,
    traitement,
    addTraitement,
    deleteTraitement,
    updateTraitement,
    ZonesAnnexes,
    updateZonesAnnexes,
    ribCodeCompte,
    listeSocietes,
    listeBanques,
    listeComptes,
    listeJournal,
    listeEtablissement,
    alimentationTableauCorres,
    obtenirIds,
    ajouterCorrespondance,
    modifierCorrespondance,
    supprimerCorrespondance
}