function beforeCancelProcess(colleagueId,processId){
	var idSc 	= hAPI.getCardValue("idSc");
	var C8_NUM 	= hAPI.getCardValue("C8_NUM");
	
	if(idSc != "" && C8_NUM != ""){
		throw "Não é permitido cancelar esta solicitação pois a mesma gerou SC e/ou Cotação no Protheus!"
	}
}