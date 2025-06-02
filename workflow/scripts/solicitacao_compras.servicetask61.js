function servicetask61(attempt, message) {
	log.info('servicetask61 contrato')
	var contratos = [];
	var cardData = hAPI.getCardData(getValue("WKNumProces"));
	var limpeza = tools.pedido.limpaCotacao(cardData);

	if (limpeza.ok) {
		try {
			var pedido = tools.pedido.getItens(cardData);
			log.dir(pedido);
			if (pedido.itens.length > 0 && pedido.contratos.length) {
				var obj = {
					"COTACAO": [{
						"EMPRESA": hAPI.getCardValue('idEmpresa'),
						"C8_NUMERO": hAPI.getCardValue('C8_NUM'),
						"FORNECE": pedido.itens,
						"CONTRATO": pedido.contratos
					}]
				}
				//log.dir(obj)
				var ret = integra.postProtheus("/JWSSC804/2", obj);
				log.info("-- ret --");
				log.dir(ret);
				if (ret.ok) {
					tools.pedido.registra(ret.retorno[1], cardData);
				} else {
					throw ret.erro
				}
			}

		} catch (e) {
			tools.pedido.registra(contratos, cardData);
			throw e;
		}
	} else {
		throw limpeza.error;
	}
}