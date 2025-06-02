function beforeTaskSave(colleagueId, nextSequenceId, userList) {
	var WKNumState = getValue("WKNumState")

	var WKNumProces = getValue("WKNumProces");
	if (nextSequenceId == "65") { // Preencher dados da SC
		hAPI.setCardValue("validade_cotacao", "");
		hAPI.setCardValue("dataTerminoSolicitacaoCotacao", "");
		hAPI.setCardValue("decisaoComprador", "");
		hAPI.setCardValue("decisaoComprador_motivo", "");
	}
	else if (WKNumState == 65) {
		var cardData = hAPI.getCardData(WKNumProces);
		tools.tes.regulariza(cardData);
	}
	else if (WKNumState == 26) {
		var cardData = hAPI.getCardData(WKNumProces);
		tools.validacaoTecnica.carregaIdDocs(cardData);
		if (hAPI.getCardValue("ciclo_aprovado") == "sim") {
			//tools.aprovacao.carregaCompradores(cardData);
		}
		var cardData = hAPI.getCardData(WKNumProces);
		tools.tes.regulariza(cardData);
	}
	else if (WKNumState == 97) {
		var ciclo_atual = hAPI.getCardValue("ciclo_atual");
		var cardData = hAPI.getCardData(WKNumProces);
		var tableCiclo = tools.getTableFilho(
			cardData,
			["cotacao_ciclo", "cotacao_termino"]
		)
		tableCiclo.forEach(function (linha) {
			var idx = linha.index;
			if (linha["cotacao_ciclo"].value == ciclo_atual) {
				hAPI.setCardValue("cotacao_termino___" + idx, tools.outros.getDataAtual())
			}
		})
	}
	else if (nextSequenceId == "199") { // Saida da atividade inicial para Carrega aprovadores
		if (hAPI.getCardValue("tipoSc") == "5") { // Regularização
			hAPI.setCardValue("ciclo_atual", "1");
			var attach = hAPI.listAttachments();
			if (attach.size() < 1) {
				throw "<br><strong>É necessário inserir anexo para solicitação do tipo Regularização!</strong><br>"
			}
		}
	}
	else if (WKNumState == 35 && nextSequenceId == "38") {
		if (getValue("WKUserComment").trim() == "") {
			throw "É necessário inserir uma observação para cancelar esta solicitação!s"
		}
	}

	tools.atualizaHistoricoDecisao(fluigAPI.getUserService().getCurrent().getFullName());
	tools.atualizaHistorico(fluigAPI.getUserService().getCurrent().getFullName())
}