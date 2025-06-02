function servicetask306(attempt, message) {
	try {
		var retorno = tools.pedido.decisao.aprovar();

		if (retorno.ok) {

			var cardData = hAPI.getCardData(getValue("WKNumProces"));
			tools.pedido.decisao.registrar("Aprovado", cardData)
		}
		else {
			throw retorno.error;
		}
	} catch (e) {
		throw e.message != undefined ? e.message : e
	}
}