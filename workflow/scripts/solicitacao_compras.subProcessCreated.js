function subProcessCreated(processId){
	
	var numeroSolicitacaoCotacao = processId.toString();
	var dataInicioSolicitacaoCotacao = tools.outros.getDataAtual();
	var dataTerminoSolicitacaoCotacao = tools.outros.getDataTermino();
	
	hAPI.setCardValue("numeroSolicitacaoCotacao"		, numeroSolicitacaoCotacao);
	hAPI.setCardValue("dataInicioSolicitacaoCotacao"	, dataInicioSolicitacaoCotacao);
	hAPI.setCardValue("dataTerminoSolicitacaoCotacao"	, dataTerminoSolicitacaoCotacao);
	
	var childData = new java.util.HashMap();
    childData.put("cotacao_ciclo"		, hAPI.getCardValue("ciclo_atual"));
    childData.put("cotacao_solicitacao"	, numeroSolicitacaoCotacao);
    childData.put("cotacao_inicio"		, dataInicioSolicitacaoCotacao);
    childData.put("cotacao_termino"		, dataTerminoSolicitacaoCotacao);
    hAPI.addCardChild("tabCiclos", childData);
    
}