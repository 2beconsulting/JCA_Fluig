function validateForm(form){
	if(form.getValue("BM_DESC") == ""){
		throw "O campo Grupo do Produto é obrigatório!"
	}
	else if(form.getValue("groupDescription") == ""){
		throw "O campo Grupo do Fluig é obrigatório!"
	}
	else if(verificaDuplicidade(form)){
		throw "Esta associação de Grupos já está cadastrada"
	}
}

function verificaDuplicidade(form){
	var ds = DatasetFactory.getDataset(
		"DS_Cadastro_GrupoProduto_GrupoFluig",
		null,
		[
			DatasetFactory.createConstraint("BM_GRUPO",form.getValue("BM_GRUPO"),form.getValue("BM_GRUPO"),ConstraintType.MUST),
			DatasetFactory.createConstraint("groupId",form.getValue("groupId"),form.getValue("groupId"),ConstraintType.MUST),
			DatasetFactory.createConstraint("metadata#id",form.getDocumentId(),form.getDocumentId(),ConstraintType.MUST_NOT)
		],
		null
	)
	
	return ds != null && ds.rowsCount > 0
}