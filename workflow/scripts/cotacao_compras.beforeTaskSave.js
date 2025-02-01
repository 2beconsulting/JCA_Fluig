function beforeTaskSave(colleagueId,nextSequenceId,userList){
    if(!hAPI.getCardValue('numeroSolicitacao')) hAPI.setCardValue('numeroSolicitacao', getValue("WKNumProces"))
}