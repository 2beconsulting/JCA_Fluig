function createDataset(fields, constraints, sortFields){
    /* 
        DATASET DE INTEGRAÇÃO COM O COMPRAS DO PROTHEUS
        OPERACAO: solicitacao - Criar ou excluir solicitação de compras
        OPERACAO: pedido - Criar, alterar ou excluir pedido de compras
    */
    log.info('Iniciando dataset ds_compras_protheus...')
    var dataset = DatasetBuilder.newDataset()
    var tipo = ''
    var operacao = ''
    var empresa = ''
    var campos = {}
	if(constraints != null && constraints.length > 0){
    	for(var i = 0; i < constraints.length; i++){
    		if(constraints[i].fieldName == 'tipo') tipo = constraints[i].initialValue
    		if(constraints[i].fieldName == 'operacao') operacao = constraints[i].initialValue
    		if(constraints[i].fieldName == 'campos') campos = JSON.parse(constraints[i].initialValue)
    		if(constraints[i].fieldName == 'empresa') empresa = constraints[i].initialValue
    	}
    }
    var endpoint = ''
    if(operacao == 'solicitacao' && tipo == 'incluir') endpoint = '/JWSSC101/1'
    if(operacao == 'solicitacao' && tipo == 'excluir') endpoint = '/JWSSC101/2'
    if(operacao == 'pedido' && tipo == 'incluir') endpoint = '/JWSSC701/1'
    if(operacao == 'pedido' && tipo == 'alterar') endpoint = '/JWSSC701/2'
    if(operacao == 'pedido' && tipo == 'excluir') endpoint = '/JWSSC701/3'
    var clientService = fluigAPI.getAuthorizeClientService()
	var data = {
        companyId : String(getValue('WKCompany')),
        serviceCode : 'PROTHEUS_SERVICE_REST',
        endpoint : endpoint,
        method : 'post',
        timeoutService : '999999999',
        params:campos,
        headers: {
	                'Content-Type'	: 'application/json',
	                'tenantId'		: '01,'+empresa
	            }
	}
	log.dir(data)
	var vo = clientService.invoke(JSON.stringify(data))
	var objdata = JSON.parse(vo.getResult())
	log.info("Retorno compras protheus...")
	log.dir(objdata)
    if(objdata.errorCode != null){
        dataset.addColumn('errorCode', DatasetFieldType.STRING)
        dataset.addColumn('errorMessage', DatasetFieldType.STRING)
        dataset.addRow([objdata.errorCode,objdata.errorMessage])
    }else{
        var dados = objdata.data[0]
        var colunas = Object.keys(dados)
        for(var i = 0; i < colunas.length; i++){
            var nomeCampo = colunas[i]
            dataset.addColumn(nomeCampo, DatasetFieldType.STRING)
        }
        var items = objdata.data
        for(var i = 0; i < items.length; i++){
            var item = items[i]
            var row = []
            for(var k = 0; k < colunas.length; k++){
                var nomeCampo = colunas[k]
                var campo = item[nomeCampo]
                row.push(campo)
            }
            dataset.addRow(row)
        }
    }
    return dataset
}