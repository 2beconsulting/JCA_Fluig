function servicetask60(attempt, message) { // GERAR PEDIDO DE COMPRAS
	log.info("servicetask60.js - Início");
	var pedidos = [];
	var cardData = hAPI.getCardData(getValue("WKNumProces"));
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

	log.info("servicetask60.js - Fim");
}
