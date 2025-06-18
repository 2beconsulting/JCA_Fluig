function validateForm(form){
	
	var ds = DatasetFactory.getDataset(
		"DS_COMPRAS_PRAZOS_ENTREGA",
		null,
		[
			DatasetFactory.createConstraint("metadata#id",form.getDocumentId(),form.getDocumentId(),ConstraintType.MUST_NOT)
		],
		null
	)
	
	if(ds != null && ds.rowsCount > 0){
		throw "Só pode haver um registro para este cadastro"
	}
}