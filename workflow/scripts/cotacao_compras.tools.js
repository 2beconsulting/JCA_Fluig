var tools = {
	confirmaValor: function(oldValue){
		return ["","null","0.00","0,00"].indexOf(oldValue) < 0 ? oldValue : ""
	},
	getEmail: function(colleagueId){
		var ds = DatasetFactory.getDataset(
			"colleague",
			null,
			[
				DatasetFactory.createConstraint("colleaguePK.colleagueId",colleagueId,colleagueId,ConstraintType.MUST)
			],
			null
		)
		return ds != null && ds.rowsCount > 0 ? ds.getValue(0,"mail") : ""
	},
	sendMail: function(template,subject,destinatarios,parametros){
		log.warn(">>> tools.sendMail");
		log.info(template)
		log.info(subject)
		log.dir(destinatarios)
		log.dir(parametros)
		
		var receivers 	= new java.util.ArrayList();
		var params 		= new java.util.HashMap();
    
	    destinatarios.forEach(function(email){
	    	receivers.add(email);
	    })

	    params.put("subject",subject);
	    parametros.forEach(function(param){
	    	params.put(param.id , param.value);
	    })
	    
	    notifier.notify("admin", template, params, receivers, "text/html");
	    
	    receivers.clear()
	},
	atualizaForm: function(cardID,formFields){
		log.info(">> tools.cotacao.atualizaForm"); //Atualiza o formulário auxililar da cotação
		var obj = {"ok":false,"error":""};

		obj = integra.putFluig("/ecm-forms/api/v2/cardindex/"+hAPI.getAdvancedProperty("formCotacaoAux")+"/cards/"+cardID,formFields);

		return obj;
	},
	SQL:{
		exec: function(query){
			var dataSource = "jdbc/AppDS";
		    var newDataset = [];
		    var ic = new javax.naming.InitialContext();
		    var ds = ic.lookup(dataSource);
		    var created = false;
		    try {
		        var conn = ds.getConnection();
		        var stmt = conn.createStatement();
		        var rs = stmt.executeQuery(query);
		        var columnCount = rs.getMetaData().getColumnCount();
		        while (rs.next()) {
		            var tmp = {};
		            for (var i = 1; i <= columnCount; i++) {
		                var obj = rs.getObject(rs.getMetaData().getColumnName(i));
		                if (null != obj) {
		                	tmp[rs.getMetaData().getColumnName(i)] = rs.getObject(rs.getMetaData().getColumnName(i)).toString();
		                } else {
		                	tmp[rs.getMetaData().getColumnName(i)] = "null";
		                }
		            }
		            newDataset.push(tmp);
		        }
		    } catch (e) {
		        log.error("ERRO==============> " + e.message);
		    } finally {
		        if (stmt != null) stmt.close();
		        if (conn != null) conn.close();
		    }
		    return newDataset;
		}
	}
}