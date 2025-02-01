function validateAvailableStates(iCurrentState,stateList){

	if (iCurrentState == 35) { // Solicitante - Revisar valores da solicitação
		var stateArray = new Array();
		
		stateList.clear();
        stateArray.push(40,38);
        
        stateArray.forEach(function(code) {
            stateList.add(new java.lang.Integer(code));
        });
         
        return stateList;
	}
}