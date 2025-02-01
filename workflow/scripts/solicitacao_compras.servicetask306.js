function servicetask306(attempt, message) {
	try{
		var retorno = tools.pedido.decisao.aprovar();
		
		if(retorno.ok){
			tools.pedido.decisao.registrar("Aprovado")
		}
		else{
			throw retorno.error;
		}
	}catch(e){
		throw e.message != undefined ? e.message : e
	}
}