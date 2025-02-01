function onNotify(subject, receivers, template, params){
	if(getValue("WKNumState") == 5 && template == "TPLTASK_WILL_EXPIRE"){
		receivers.clear();
		
		var cotacao_encerramento 		= hAPI.getCardValue("cotacao_encerramento");
		var ciclo 						= hAPI.getCardValue("ciclo_atual");
		var especificacao_tecnica 		= hAPI.getCardValue("especificacao_tecnica");
		
		hAPI.getChildrenIndexes("tabFornecedor").forEach(function(idx){
			var A2_COD 	= hAPI.getCardValue("A2_COD"+"___"+idx);
			var A2_LOJA = hAPI.getCardValue("A2_LOJA"+"___"+idx);
			var A2_NOME = hAPI.getCardValue("A2_NOME"+"___"+idx);
			
			var dsEmails = DatasetFactory.getDataset(
				"DS_COMPRAS_FORNECEDOR_GET-ACESSO",
				null,
				[
					DatasetFactory.createConstraint("A2_COD"	,A2_COD		,A2_COD		,ConstraintType.MUST),
					DatasetFactory.createConstraint("A2_LOJA"	,A2_LOJA	,A2_LOJA	,ConstraintType.MUST)
				],
				null
			)
			
			if(dsEmails != null && dsEmails.rowsCount > 0 && !dsEmails.columnsName.toArray().includes("ERROR")){
				var parametros = [
					{"id":"INSTANCEID"		, "value": getValue("WKNumProces").toString()},
					{"id":"A2_NOME"			, "value": A2_NOME},
					{"id":"PRAZO"			, "value": cotacao_encerramento},
				]
				
				var destinatarios = [];
				for(var i = 0 ; i < dsEmails.rowsCount ; i++){
					destinarios.push(dsEmails.getValue(i,"emailRegister"))
				}
				
				tools.sendMail(
					"TEMPLATE_COMPRAS_COTACAO_PRAZO",
					"Notificação de Encerramento de Prazo para Cotar",
					destinatarios,
					parametros
				)
				
				hAPI.setCardValue("A2_NOTIFICA___"+idx,"Enviado")
			}
			else if(dsEmails.columnsName.toArray().includes("ERROR")){
				hAPI.setCardValue("A2_NOTIFICA___"+idx, dsEmails.getValue(0,"ERROR"))
			}
			else{
				hAPI.setCardValue("A2_NOTIFICA___"+idx, "Não localizado")
			}
		})
	}
}