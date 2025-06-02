function onNotify(subject, receivers, template, params) {
	if (getValue("WKNumState") == 5 && template == "TPLTASK_WILL_EXPIRE") {
		receivers.clear();

		var cotacao_encerramento = hAPI.getCardValue("cotacao_encerramento");
		var ciclo = hAPI.getCardValue("ciclo_atual");
		var especificacao_tecnica = hAPI.getCardValue("especificacao_tecnica");
		var WKNumProces = getValue("WKNumProces");
		var cardData = hAPI.getCardData(WKNumProces);
		var tableFornecedor = tools.getTableFilho(
			cardData,
			["A2_COD", "A2_LOJA", "A2_NOME", "A2_NOTIFICA"]
		)
		tableFornecedor.forEach(function (linha) {
			var idx = linha.index;
			var A2_COD = linha.A2_COD.value;
			var A2_LOJA = linha.A2_LOJA.value;
			var A2_NOME = linha.A2_NOME.value;

			var dsEmails = DatasetFactory.getDataset(
				"DS_COMPRAS_FORNECEDOR_GET-ACESSO",
				null,
				[
					DatasetFactory.createConstraint("A2_COD", A2_COD, A2_COD, ConstraintType.MUST),
					DatasetFactory.createConstraint("A2_LOJA", A2_LOJA, A2_LOJA, ConstraintType.MUST)
				],
				null
			)

			if (dsEmails != null && dsEmails.rowsCount > 0 && !dsEmails.columnsName.toArray().includes("ERROR")) {
				var parametros = [
					{ "id": "INSTANCEID", "value": WKNumProces + "" },
					{ "id": "A2_NOME", "value": A2_NOME },
					{ "id": "PRAZO", "value": cotacao_encerramento },
				]

				var destinatarios = [];
				for (var i = 0; i < dsEmails.rowsCount; i++) {
					destinarios.push(dsEmails.getValue(i, "emailRegister"))
				}

				tools.sendMail(
					"TEMPLATE_COMPRAS_COTACAO_PRAZO",
					"Notificação de Encerramento de Prazo para Cotar",
					destinatarios,
					parametros
				)

				hAPI.setCardValue("A2_NOTIFICA___" + idx, "Enviado")
			}
			else if (dsEmails.columnsName.toArray().includes("ERROR")) {
				hAPI.setCardValue("A2_NOTIFICA___" + idx, dsEmails.getValue(0, "ERROR"))
			}
			else {
				hAPI.setCardValue("A2_NOTIFICA___" + idx, "Não localizado")
			}
		})
	}
}