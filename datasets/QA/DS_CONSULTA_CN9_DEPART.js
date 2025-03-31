function defineStructure() {
    addColumn("CXQ_FILIAL");
    addColumn("CXQ_CODIGO");
    addColumn("CXQ_DESCRI");
    addColumn("CXQ_STATUS");
    
    setKey(["CXQ_FILIAL","CXQ_CODIGO"]);
	addIndex(["CXQ_DESCRI"]);
}

function onSync(lastSyncDate) {

    var dataset = DatasetBuilder.newDataset();
    try {
        var clientService = fluigAPI.getAuthorizeClientService();

        var data = {
            companyId : getValue("WKCompany") + '',
            serviceCode : "PROTHEUS_SERVICE_REST",
            endpoint : '/JWSSX301/CN9_DEPART',
            method : 'get'
        }

        var result = clientService.invoke(new org.json.JSONObject(data).toString());

        log.info("<<<<<<<<<<<<<<<<<<<<<<< result >>>>>>>>>>>>>>>>>>>>>>>") 

        if (result.getResult() == null || result.getResult().isEmpty()){
            return false
        }else{

            var ret = JSON.parse(result.getResult());
            log.dir(ret)

            for (var y=0; y < ret.DADOS.length; y++){
                
                var row = ret.DADOS[y];
                dataset.addOrUpdateRow([
                	row["CXQ_FILIAL"].trim(),
                	row["CXQ_CODIGO"].trim(),
                	row["CXQ_DESCRI"].trim(),
                	row["CXQ_STATUS"].trim()
                ]);

            }

        }
        
    } catch (error) {
        throw "Erro ao executar o dataset DS_CONSULTA_CN9_TPCTO: "+error.toString()+ " / LINHA: "+error.lineNumber;
    }   

    return dataset;
    
}