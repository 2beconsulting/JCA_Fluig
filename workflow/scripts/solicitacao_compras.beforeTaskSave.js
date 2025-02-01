function beforeTaskSave(colleagueId,nextSequenceId,userList){
    var WKNumState = getValue("WKNumState")
	
    if(nextSequenceId == "65"){ // Preencher dados da SC
    	hAPI.setCardValue("validade_cotacao","");
    	hAPI.setCardValue("dataTerminoSolicitacaoCotacao","");
    	hAPI.setCardValue("decisaoComprador","");
    	hAPI.setCardValue("decisaoComprador_motivo","");
    }
    else if(WKNumState == 65){
    	tools.tes.regulariza();
    }
    else if(WKNumState == 26){
    	tools.validacaoTecnica.carregaIdDocs();
    	if(hAPI.getCardValue("ciclo_aprovado") == "sim"){
    		//tools.aprovacao.carregaCompradores();
    	}
    	tools.tes.regulariza();
    }
    else if(WKNumState == 97){
    	var ciclo_atual = hAPI.getCardValue("ciclo_atual");
    	
    	hAPI.getChildrenIndexes("tabCiclos").forEach(function(idx){
    		if(hAPI.getCardValue("cotacao_ciclo___"+idx) == ciclo_atual){
    			hAPI.setCardValue("cotacao_termino___"+idx,tools.outros.getDataAtual())
    		}
    	})
    }
    else if(nextSequenceId == "199"){ // Saida da atividade inicial para Carrega aprovadores
    	if(hAPI.getCardValue("tipoSc") == "5"){ // Regularização
    		hAPI.setCardValue("ciclo_atual","1");
    		var attach = hAPI.listAttachments();
    		if(attach.size() < 1){
    			throw "<br><strong>É necessário inserir anexo para solicitação do tipo Regularização!</strong><br>"
    		}
    	}
    }
    else if(WKNumState == 35 && nextSequenceId == "38"){
    	if(getValue("WKUserComment").trim() == ""){
    		throw "É necessário inserir uma observação para cancelar esta solicitação!s"
    	}
    }
    
   tools.atualizaHistoricoDecisao(fluigAPI.getUserService().getCurrent().getFullName());
   tools.atualizaHistorico(fluigAPI.getUserService().getCurrent().getFullName())
}