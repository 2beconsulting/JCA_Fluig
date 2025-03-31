function defineStructure() {
    addColumn("AH_UNIMED")
    addColumn("AH_UMRES")
    setKey(["AH_UNIMED"])
	addIndex(["AH_UNIMED"])
}
function onSync(lastSyncDate) {
    var dataset = DatasetBuilder.newDataset()
    try {
        var clientService = fluigAPI.getAuthorizeClientService()
        var data = {
            companyId : getValue("WKCompany") + '',
            serviceCode : "PROTHEUS_SERVICE_REST",
            endpoint : '/JWSSX301/B1_UM',
            method : 'get'
        }
        var result = clientService.invoke(new org.json.JSONObject(data).toString())
        if (result.getResult() == null || result.getResult().isEmpty()){
            return false
        }else{
            var ret = JSON.parse(result.getResult())
            for (var y=0; y < ret.DADOS.length; y++){
                var row = ret.DADOS[y]
                dataset.addOrUpdateRow([
                	row["AH_UNIMED"].trim(),
                	row["AH_UMRES"].trim()
                ])
            }
        }
    } catch (error) {
        throw error.toString()
    }   
    return dataset
}