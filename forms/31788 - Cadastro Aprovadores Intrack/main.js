function setSelectedZoomItem(selectedItem){
	if(selectedItem.inputId.indexOf("aprovadorNome___") == 0){
			if($("[name^=aprovadorNome___]").not("#"+selectedItem.inputId).filter(function(el){return el.value == selectedItem.colleagueName}).length == 0){
				let idx = selectedItem.inputId.replace("aprovadorNome___","")
				$("#aprovadorMatricula___"+idx).val(selectedItem.colleagueId)
			}else{
				window[selectedItem.inputId].clear();
    			FLUIGC.toast({
    				message: 'Colaborador já inserido!',
    				type: 'danger'
    			});
			}
	}
}