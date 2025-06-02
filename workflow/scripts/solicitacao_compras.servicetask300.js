function servicetask300(attempt, message) {
	try {
		var retorno = tools.pedido.decisao.reprovar();

		if (retorno.ok) {
			var cardData = hAPI.getCardData(getValue("WKNumProces"));
			tools.pedido.decisao.registrar("Reprovado", cardData)
		}
		else {
			throw retorno.error;
		}
	} catch (e) {
		throw e.message != undefined ? e.message : e
	}
}