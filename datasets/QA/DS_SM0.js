function defineStructure() {
	addColumn("COD_GRUPO")
    addColumn("DES_GRUPO")
    addColumn("COD_EMPRES")
    addColumn("DES_EMPRES")
    addColumn("CGC_EMPRES")
    addColumn("ID_GRPEMP")
    addColumn("DES_GRPEMP")
    addColumn("ID_FILIAL")
    addColumn("DES_FILIAL")
    
    addColumn("CEP_EMPRES")
    addColumn("EST_EMPRES")
    addColumn("CID_EMPRES")
    addColumn("BAIR_EMPRES")
    addColumn("END_EMPRES")
    addColumn("TEL_EMPRES")
    
    addColumn("DISPLAY")
    
    setKey(["COD_GRUPO","COD_EMPRES","CGC_EMPRES"]);
	addIndex(["DES_GRPEMP","DES_FILIAL"]);
}
function onSync(lastSyncDate) {
	log.info("<<<<<<<<<<<<<<<<<<<<<<< DS_SM0 >>>>>>>>>>>>>>>>>>>>>>>")

    var dataset = DatasetBuilder.newDataset();
    try {
        var clientService = fluigAPI.getAuthorizeClientService();

        var data = {
            companyId : getValue("WKCompany") + '',
            serviceCode : "PROTHEUS_SERVICE_REST",
            endpoint : '/JWSSMO01',
            method : 'get'
        }

        var result = clientService.invoke(new org.json.JSONObject(data).toString());

        log.info("<<<<<<<<<<<<<<<<<<<<<<< result >>>>>>>>>>>>>>>>>>>>>>>")

        if (result.getResult() == null || result.getResult().isEmpty()){
            return false
        }else{

            var gResult = result.getResult()
            var ret = JSON.parse(gResult);
            log.dir(ret)

            for(indice in ret){
            	
                var row = ret[indice];
                
                var conteudo = [
            		row["COD_GRUPO"],
            		row["DES_GRUPO"],
            	    row["COD_EMPRES"],
            	    row["DES_EMPRES"],
            	    row["CGC_EMPRES"]
            	];
                
                conteudo.push(row["COD_EMPRES"].substring(0,4))
                conteudo.push(row["DES_EMPRES"].split(" - ")[0])
                conteudo.push(row["COD_EMPRES"].substring(4))
                conteudo.push(row["DES_EMPRES"].split(" - ")[1] != undefined ? row["DES_EMPRES"].split(" - ")[1] : row["DES_EMPRES"].split(" - ")[0])
                
                conteudo.push(row["CEP_EMPRES"])
			    conteudo.push(row["EST_EMPRES"])
			    conteudo.push(row["CID_EMPRES"])
			    conteudo.push(row["BAIR_EMPRES"])
			    conteudo.push(row["END_EMPRES"])
			    conteudo.push(row["TEL_EMPRES"])
    
                conteudo.push(row["COD_EMPRES"]+" | "+ row["DES_EMPRES"] + " | " + row["CGC_EMPRES"])
                log.dir(conteudo);
                
            	dataset.addOrUpdateRow(conteudo);

            }  

        }
        
    } catch (error) {
        log.error("Erro ao executar o dataset DS_SM0: "+error.toString()+ " / LINHA: "+error.lineNumber);
    }   

    return dataset;
}
function createDataset(fields, constraints, sortFields) {

}function onMobileSync(user) {

}