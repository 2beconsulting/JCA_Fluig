function beforeStateEntry(sequenceId){
    var WKNumProces = getValue('WKNumState');
    
    if(sequenceId == 5 || sequenceId == 23){
    	hAPI.setCardValue("atividadeAtual"		, String(sequenceId));
    	hAPI.setCardValue("atividadeAnterior"	, String(WKNumProces));
    }
    if(sequenceId == 5) hAPI.setCardValue("cotacao_encerramento_antigo", hAPI.getCardValue("cotacao_encerramento"))
}