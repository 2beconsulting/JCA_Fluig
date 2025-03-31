function defineStructure() {
    addColumn("USR_ID");
    addColumn("USR_CODIGO");
    addColumn("USR_NOME");
    addColumn("DISPLAY");
    
    setKey(["USR_ID"]);
	addIndex(["USR_NOME"]);
}

function onSync(lastSyncDate) {

    var dataset = DatasetBuilder.newDataset();
    try {
        var clientService = fluigAPI.getAuthorizeClientService();

        var data = {
            companyId : getValue("WKCompany") + '',
            serviceCode : "PROTHEUS_SERVICE_REST",
            endpoint : '/JWSSX301/CN9_GESTC',
            method : 'get',
            timeout:'600000'
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
                	row["USR_ID"].trim(),
                	row["USR_CODIGO"].trim(),
                	row["USR_NOME"].trim(),
                	row["USR_NOME"].trim() + " | " + row["USR_CODIGO"].trim() + " | " + row["USR_ID"].trim()
                ]);

            }

        }
        
    } catch (error) {
        throw "Erro ao executar o dataset DS_CONSULTA_CN9_TPCTO: "+error.toString()+ " / LINHA: "+error.lineNumber;
    }   

    return dataset;
    
}