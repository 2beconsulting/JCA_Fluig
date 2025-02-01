function afterProcessCreate(processId){
	hAPI.setCardValue("numeroSolicitacao",processId.toString())
	hAPI.setCardValue("idPastaGED",anexos.criaPasta(processId,hAPI.getAdvancedProperty("pastaRaiz")))
}