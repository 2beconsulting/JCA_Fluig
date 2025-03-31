function validateForm(form){
	var msg = "";
	if(form.getValue("nivel") == ""){
		msg += "O campo Nivel é obrigatório <br>"
	}
	if(form.getValue("valorLimite") == ""){
		msg += "O campo Valor Limite é obrigatório <br>"
	}
	var tabAprovadores = form.getChildrenIndexes("tabAprovadores");
	if(tabAprovadores.length == 0){
		msg += "É necessário ter ao menos 1 aprovador<br>"
	}
	tabAprovadores.forEach(function(idx,i,arr){
		if(form.getValue("aprovadorMatricula___"+idx) == ""){
			msg += "Não pode haver linhas sem colaborador na tabela de aprovadores<br>";
			arr.length = i;
		}
	})
	
	if(msg != ""){
		throw "<br>"+msg
	}
}