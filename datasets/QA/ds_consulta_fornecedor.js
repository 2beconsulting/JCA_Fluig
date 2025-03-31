function createDataset(fields, constraints, sortFields) {
	log.info('Iniciando dataset ds_consulta_fornecedor...')
	var dataset = DatasetBuilder.newDataset()
	log.dir(constraints)

	var tipoConsulta = '';
	var cpfCNPJ = '';
	var descricao = '';
	var codigo = '';
	var loja = '';

	if (constraints != null && constraints.length > 0) {
		for (var i = 0; i < constraints.length; i++) {
			if (constraints[i].fieldName == 'tipoConsulta') tipoConsulta = constraints[i].initialValue
			if (constraints[i].fieldName == 'cpfCNPJ' || constraints[i].fieldName == 'A2_CGC') cpfCNPJ = constraints[i].initialValue
			if (constraints[i].fieldName == 'descricao' || constraints[i].fieldName == 'A2_NOME' || constraints[i].fieldName == 'DESCRICAO') descricao = constraints[i].initialValue
			if (constraints[i].fieldName == 'CODIGO' || constraints[i].fieldName == 'A2_COD') codigo = constraints[i].initialValue
			if (constraints[i].fieldName == 'LOJA') loja = constraints[i].initialValue
		}
	}

	var endpoint = ''
	if (tipoConsulta == 'cpfCNPJ') endpoint = '/JWSSA201/1/' + cpfCNPJ
	if (tipoConsulta == 'descricao') endpoint = encodeURI('/JWSSA201/2/' + descricao)
	if (tipoConsulta == 'codigo') endpoint = '/JWSSA201/3/' + codigo

	var clientService = fluigAPI.getAuthorizeClientService()
	var data = {
		companyId: String(getValue('WKCompany')),
		serviceCode: 'PROTHEUS_SERVICE_REST',
		endpoint: endpoint,
		method: 'get',
		timeoutService: '999999999'
	}
	log.dir(data)
	var vo = clientService.invoke(JSON.stringify(data))
	var objdata = JSON.parse(vo.getResult())
	log.info("Retorno consulta fornecedor...")
	log.dir(objdata)
	if (objdata.errorCode) {
		dataset.addColumn("error", DatasetFieldType.STRING)
		dataset.addRow([objdata.errorMessage])
	} else {
		var dados
		if (tipoConsulta == 'cpfCNPJ')
			dados = objdata.data[0]
		else
			dados = objdata[0]

		var colunas = Object.keys(dados)
		for (var i = 0; i < colunas.length; i++) {
			var nomeCampo = colunas[i]
			dataset.addColumn(nomeCampo, DatasetFieldType.STRING)
		}
		var fornecedores
		if (tipoConsulta == 'cpfCNPJ')
			fornecedores = objdata.data
		else
			fornecedores = objdata

		for (var i = 0; i < fornecedores.length; i++) {
			var fornecedor = fornecedores[i]
			if (tipoConsulta != "codigo" || (fornecedor["LOJA"] == loja || loja == "")) {
				var row = []
				for (var k = 0; k < colunas.length; k++) {
					var nomeCampo = colunas[k]
					var campo = fornecedor[nomeCampo]
					row.push(campo)
				}
				dataset.addRow(row)
			}
		}
	}
	return dataset
}