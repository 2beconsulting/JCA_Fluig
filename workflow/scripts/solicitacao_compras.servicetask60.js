function servicetask60(attempt, message) { // GERAR PEDIDO DE COMPRAS
	log.info('servicetask60 pedido de compras')
	try {
		var pedidos = [];
		var cardData = hAPI.getCardData(getValue("WKNumProces"));
		var limpeza = tools.pedido.limpaCotacao(cardData);

		log.info("limpeza%%%%%%%%%%%%")
		log.dir(limpeza)
		if (limpeza.ok) {
			var atualizaCotacao = tools.pedido.atualizaCotacao(cardData);

			log.info("atualizaCotacao%%%%%%%%%%%%")
			log.dir(atualizaCotacao)
			if (atualizaCotacao.ok) {
				try {

					var itens = tools.pedido.getItens(cardData);
					if (itens.length > 0) {
						var obj = {
							"COTACAO": [{
								"EMPRESA": hAPI.getCardValue('idEmpresa'),
								"C8_NUMERO": hAPI.getCardValue('C8_NUM'),
								"FORNECE": itens
							}]
						}

						var ret = integra.postProtheus("/JWSSC804/1", obj);
						//log.dir(ret);
						if (ret.ok) {
							var a = tools.pedido.registra(ret.retorno[1], cardData);
							var b = tools.pedido.recuperaDados();
						} else {
							throw ret.error;
						}
					}

				} catch (e) {
					throw e.error != undefined ? e.error : e;
				}
			} else {
				throw "Erro na atualização da cotação: " + atualizaCotacao.error;
			}

		}
		else {
			throw "Erro na limpeza da cotação: " + limpeza.error
		}
	} catch (e) {
		throw e.message != undefined ? e.message : e
	}
}
