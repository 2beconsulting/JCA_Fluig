function validateForm(form){
	if(getValue("WKNextState") == 8){
		if(tools.validaTESNecessarias(form)) throw "<br>Existem TES necessárias de preenchimento em aberto. Necessário verificar antes de prosseguir!<br>";
	}
}