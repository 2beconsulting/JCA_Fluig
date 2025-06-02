function servicetask38(attempt, message) {
	try {
		var cotacao = tools.cotacao.cancelaProtheus();

		if (cotacao.ok) {
			var sc = tools.sc.cancelaProtheus();

			if (!sc.ok) throw sc.error;
		}
		else {
			throw cotacao.error
		}
	} catch (e) {
		throw e.message != undefined ? e.message : e
	}
}