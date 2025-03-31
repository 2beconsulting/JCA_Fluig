function servicetask3(attempt, message) {
	var cotacao_encerramento = hAPI.getCardValue("cotacao_encerramento");
	var cotacao_encerramento_antigo = hAPI.getCardValue("cotacao_encerramento_antigo");
	var ciclo = hAPI.getCardValue("ciclo_atual");
	var especificacao_tecnica = hAPI.getCardValue("especificacao_tecnica");

	hAPI.getChildrenIndexes("tabFornecedor").forEach(function (idx) {
		var A2_COD = hAPI.getCardValue("A2_COD" + "___" + idx);
		var A2_LOJA = hAPI.getCardValue("A2_LOJA" + "___" + idx);
		var A2_NOME = hAPI.getCardValue("A2_NOME" + "___" + idx);

		var dsEmails = DatasetFactory.getDataset(
			"DS_COMPRAS_FORNECEDOR_GET-ACESSO",
			null,
			[
				DatasetFactory.createConstraint("A2_COD", A2_COD, A2_COD, ConstraintType.MUST),
				DatasetFactory.createConstraint("A2_LOJA", A2_LOJA, A2_LOJA, ConstraintType.MUST)
			],
			null
		)

		if (dsEmails != null && dsEmails.rowsCount > 0 && dsEmails.columnsName.indexOf("ERROR") < 0) {
			var destinatarios = [];
			var parametros = [
				{ "id": "INSTANCEID", "value": getValue("WKNumProces").toString() },
				{ "id": "RODADA", "value": ciclo },
				{ "id": "A2_NOME", "value": A2_NOME.trim() },
				{ "id": "ESPECIFICACAO_TECNICA", "value": especificacao_tecnica },
				{ "id": "PRAZO", "value": cotacao_encerramento },
			]
			for (var i = 0; i < dsEmails.rowsCount; i++) {
				destinatarios.push(dsEmails.getValue(i, "emailRegister"))
			}

			tools.sendMail(
				cotacao_encerramento_antigo == "" ? ciclo == "1" ? "TEMPLATE_COMPRAS_COTACAO_NOVA" : "TEMPLATE_COMPRAS_COTACAO_NOVA-RODADA" : "TEMPLATE_COMPRAS_COTACAO_PRAZO",
				cotacao_encerramento_antigo == "" ? ciclo == "1" ? "Nova Cotação Disponível" : "Nova Rodada de Cotações" : "Notificação de Encerramento de Prazo para Cotar",
				destinatarios,
				parametros
			)

			hAPI.setCardValue("A2_NOTIFICA___" + idx, "Enviado")
		}
		else if (!dsEmails.columnsName.indexOf("ERROR") < 0) {
			hAPI.setCardValue("A2_NOTIFICA___" + idx, dsEmails.getValue(0, "ERROR"))
		}
		else {
			hAPI.setCardValue("A2_NOTIFICA___" + idx, "Não localizado")
		}
	})

}