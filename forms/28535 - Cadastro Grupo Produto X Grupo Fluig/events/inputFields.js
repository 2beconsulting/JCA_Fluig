function inputFields(form){
	form.setValue("descritor",form.getValue("BM_GRUPO") + "-" + form.getValue("BM_DESC") + " > " + form.getValue("groupId") + "-" + form.getValue("groupDescription"))
	
}