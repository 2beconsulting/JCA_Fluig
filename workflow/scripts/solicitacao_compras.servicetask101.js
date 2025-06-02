function servicetask101(attempt, message) {

	if (hAPI.getCardValue("tipoSc") != "5") { // Tipo de Solicitação diferente de regularização
		cardData = hAPI.getCardData(getValue("WKNumProces"));
		var cotacao = tools.cotacao.getData(cardData);
		log.info(">> servicetask101 [#06]")
		log.dir(cotacao)
		if (cotacao.ok) {
			if (tools.cotacao.necessitaAtualizar(cotacao)) {
				var atualizado = tools.cotacao.atualizaProtheus(cotacao);
				log.info(">> servicetask101 [#10]")
				if (atualizado.ok) {
					var formAtualizado = tools.cotacao.atualizaForm(cotacao.formFields);
					log.info(">> servicetask101 [#13]")
					if (formAtualizado.ok) {
						var cotaAtualizado = tools.cotacao.atualizaCotacao(cotacao.cotacaoFields);
					} else {
						throw "Erro na atualização do formulário > " + formAtualizado.error;
					}
				} else {
					throw "Erro na atualização da cotação no Protheus > " + atualizado.error
				}
			}

		} else {
			throw "Erro na recuperação dos dados da solicitação de cotação > " + cotacao.error;
		}

	} else { // Regularização
		var C8_NUM = hAPI.getCardValue("C8_NUM");
		var cardData = hAPI.getCardData(getValue("WKNumProces"));
		try {
			if (C8_NUM == "") {
				var cotacao = tools.cotacao.geraCotacao(cardData);
				if (cotacao.ok) {
					C8_NUM = cotacao.numero.trim();
				}
			}

			if (C8_NUM != "") {
				hAPI.setCardValue("C8_NUM", C8_NUM);
				var dadosCotacao = tools.cotacao.getDataForm(cardData);

				var atualizado = tools.cotacao.atualizaProtheus(dadosCotacao);

				if (!atualizado.ok) {
					log.info(">> servicetask101 [#36]")
					throw "Erro na atualização da cotação no Protheus > " + atualizado.error
				}
				tools.aprovacao.carregaCompradores(cardData);
			}
		} catch (e) {
			hAPI.setCardValue("C8_NUM", C8_NUM);
			throw e;
		}

	}

}