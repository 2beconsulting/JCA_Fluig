function defineStructure(){
    addColumn("E4_CODIGO")
    addColumn("E4_TIPO")
    addColumn("E4_DESCRI")
    addColumn("E4_MSBLQL")
    setKey(["E4_CODIGO"])
	addIndex(["E4_CODIGO"])
}
function onSync(lastSyncDate) {
    var dataset = DatasetBuilder.newDataset()
    try {
        var clientService = fluigAPI.getAuthorizeClientService()
        var data = {
            companyId : getValue("WKCompany") + '',
            serviceCode : "PROTHEUS_SERVICE_REST",
            endpoint : '/JWSSX301/A2_COND',
            method : 'get'
        }
        var result = clientService.invoke(new org.json.JSONObject(data).toString())
        if (result.getResult() == null || result.getResult().isEmpty()){
            return false
        }else{
            var ret = JSON.parse(result.getResult());
            for (var y=0; y < ret.DADOS.length; y++){
                var row = ret.DADOS[y];
                dataset.addOrUpdateRow([
                	row["E4_CODIGO"].trim(),
                	row["E4_TIPO"].trim(),
                	row["E4_DESCRI"].trim(),
                	row["E4_MSBLQL"].trim()
                ])
            }
        }
    } catch (error) {
        throw error.toString()
    }   
    return dataset
}