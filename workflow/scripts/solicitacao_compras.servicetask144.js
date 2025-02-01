function servicetask144(attempt, message) {
	var ciclo_atual = hAPI.getCardValue("ciclo_atual");
	ciclo_atual = ciclo_atual == "" ? 1 : ((ciclo_atual*1)+1);
	
	if(ciclo_atual == 1){
		var cotacao = tools.cotacao.geraCotacao();
		
		if(cotacao.ok){
			hAPI.setCardValue("C8_NUM",cotacao.numero.trim());
			var ciclo = tools.cotacao.geraCicloInicial(cotacao.numero);
			
			if(!ciclo.ok){
				throw ciclo.errorMessage;
			}
		}else{
			throw cotacao.errorMessage;
		}
	}else{
		var novoCiclo = tools.cotacao.geraCicloNovo(ciclo_atual);
		
		if(!novoCiclo.ok) throw "Ocorreu um problema ao gerar o novo ciclo : " + novoCiclo.error
	}
	
	hAPI.setCardValue("ciclo_atual",ciclo_atual);
}