function servicetask144(attempt, message) {
	tools.log(">> servicetask144")
	var ciclo_atual = hAPI.getCardValue("ciclo_atual");
	ciclo_atual = ciclo_atual == "" ? 1 : (ciclo_atual * 1);

	if (ciclo_atual == 1) {
		var cotacao = tools.cotacao.geraCotacao();

		if (cotacao.ok) {
			hAPI.setCardValue("C8_NUM", cotacao.numero.trim());
		} else {
			throw cotacao.errorMessage;
		}
	}
	tools.log("** servicetask144")
}