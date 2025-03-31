function createDataset(fields, constraints, sortFields) {
	try{

		var produto = getContraint(constraints,"B1_COD","");
		var empresa = getContraint(constraints,"EMPRESA","");
		
		var data = {
	            companyId 	: getValue("WKCompany") + '',
	            serviceCode : 'PROTHEUS_SERVICE_REST',
	            endpoint 	: empresa != "" ? "/JWSSB101/5/"+produto+"/"+empresa : "/JWSSB101/5/"+produto,
	            method 		: 'get',
	            timeout		: 60000,
	            async		: false,
	            headers: {
	                'Content-Type'	: 'application/json',
	                'tenantId'		: '01,'+empresa
	            }
	        }

			var clientService = fluigAPI.getAuthorizeClientService();
			
			var result = clientService.invoke(new org.json.JSONObject(data).toString());
		    log.dir(result);
	        if (result.getResult()!= null && !result.getResult().isEmpty()){
	        	
	        	if(result.getResult().indexOf("com.fluig.authorize.client.exception.ClientBasicAuthorizeException: ") > 0){
		        	return dsErro(result.getResult());
	        	}
	        	else if(JSON.parse(result.getResult()).code != undefined && JSON.parse(result.getResult()).code == 500){
		        	return dsErro(JSON.parse(result.getResult()).message);
	        	}
	        	else{
		        	var retorno	= JSON.parse(result.getResult());
		        	var ds = DatasetBuilder.newDataset();
		        	
		        	ds.addColumn("B1_COD");
		        	ds.addColumn("B1_DESC");
		        	ds.addColumn("B1_MSBLQL");
		        	ds.addColumn("B1_TIPO");
		        	ds.addColumn("B1_UM");
		        	ds.addColumn("B1_UPRC");
		        	ds.addColumn("B1_UCOM");
		        	ds.addColumn("B1_GRUPO");
					ds.addColumn("BLOQFIL");
		        	ds.addColumn("B1_LOCPAD");
		        	ds.addColumn("B1_ZMARCA");
		        	ds.addColumn("ZPM_DESC");
		        	ds.addColumn("SALDO");
		        	
		        	retorno.forEach(function(it){
		        		ds.addRow([
		        			it.B1_COD,
		        			it.B1_DESC,
		        			it.B1_MSBLQL,
		        			it.B1_TIPO,
		        			it.B1_UM,
		        			it.B1_UPRC,
		        			it.B1_UCOM,
		        			it.B1_GRUPO,
							it.BLOQFIL,
		        			it.B1_LOCPAD,
		        			it.B1_ZMARCA,
		        			it.ZPM_DESC,
		        			it.SALDO
		        		])
		        	})
		        	
		        	return ds;
	        	}
	        	
	        }else{
	        	
	        	return dsErro("Não foi encontrado nenhum item!");
	        	
	        }
		
	}catch(e){
		return dsErro(e.message != undefined ? e.message : e);
	}
	
}


function dsErro(msg){
	var ds = DatasetBuilder.newDataset();
	ds.addColumn("ERRO")
	ds.addRow([msg])
	return ds;
}

function getContraint(constraints,fieldName,defaultValue){
	if(constraints != null){
		for(var i=0 ; i < constraints.length ; i++){
			if(constraints[i]["fieldName"].toUpperCase() == fieldName.toUpperCase()){
				return constraints[i]["initialValue"]
			}
		}
	}
	
	return defaultValue;
}