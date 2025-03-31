function displayFields(form,customHTML){
	var WKNumState = getValue("WKNumState");
	var WKUser = fluigAPI.getUserService().getCurrent();

	customHTML.append("<script>var WKNumState="+WKNumState+";</script>");
	customHTML.append("<script>var usuarioAtual ='"+WKUser.getFullName()+"';</script>");
}