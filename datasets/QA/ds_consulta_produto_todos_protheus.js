function defineStructure(){
    addColumn("B1_COD")
    addColumn("B1_DESC")
    addColumn("B1_TIPO")
    addColumn("B1_GRUPO")
    addColumn("B1_ZMARCA")
    addColumn("B1_UM")
    addColumn("MO")
    addColumn("SERVICO")
    addColumn("BLOQUEADO")
    addColumn("DISPLAY")
    
    setKey(["B1_COD"])
	addIndex(["B1_COD"])
}
function onSync(lastSyncDate){
    var dataset = DatasetBuilder.newDataset()
    try {
        var clientService = fluigAPI.getAuthorizeClientService()
        var data = {
            companyId : getValue("WKCompany") + '',
            serviceCode : "protheus_qa",
            endpoint : '/JWSSX301/C1_PRODUTO',
            method : 'get',
            timeout:'600000'
        }
        var result = clientService.invoke(new org.json.JSONObject(data).toString())
        if (result.getResult() == null || result.getResult().isEmpty()){
            return false
        }else{
            var ret = JSON.parse(result.getResult());
            for (var y=0; y < ret.DADOS.length; y++){
                var row = ret.DADOS[y];
                dataset.addOrUpdateRow([
                	row["B1_COD"].trim(),
                	row["B1_DESC"].trim(),
                	row["B1_TIPO"].trim(),
                	row["B1_GRUPO"].trim(),
                	row["B1_ZMARCA"].trim(), 
                	row["B1_UM"].trim(),
                	row["B1_COD"].trim().indexOf("MOD") == 0 ? "S" : "N",
                	row["B1_COD"].trim().indexOf("S") == 0 ? "S" : "N",
                	row["BLOQUEADO"].trim(),
                	row["B1_COD"].trim() + " | " + row["B1_DESC"].trim()
                ])
            }
        }
    } catch (error) {
        throw error.toString()
    }   
    return dataset
}