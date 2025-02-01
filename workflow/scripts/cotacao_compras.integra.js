var integra = {
		postFluig: function(endpoint, params){
			log.info(">> integra.postFormFluig <<");
			//log.info("-- endpoint: " + endpoint);
			//log.dir(params)
			
			var obj = {"ok":false};
			
			try{
				
				var data = {
		            companyId 	: getValue("WKCompany") + '',
		            serviceCode : 'FLUIG_REST',
		            endpoint 	: endpoint,
		            method 		: 'post',
		            timeout		: 60000,
		            async		: false,
		            params 		: params,
		            headers: {
		                'Content-Type': 'application/json'
		            }
		        }

				var clientService = fluigAPI.getAuthorizeClientService();
				
				var result = clientService.invoke(new org.json.JSONObject(data).toString());
				//log.info("<<<<<<<LOGDIR>>>>>>>>>")
			    //log.dir(result);
				if(result.getHttpStatusResult() >= 200 && result.getHttpStatusResult() < 300){
					if (result.getResult()!= null && !result.getResult().isEmpty()){
			        	
			        	if(result.getResult().indexOf("com.fluig.authorize.client.exception.ClientBasicAuthorizeException: java.net.SocketTimeoutException: Read timed out") > 0){
			        		obj["ok"] 		= false;
				        	obj["error"] 	= result.getResult();
			        	}
			        	else if(JSON.parse(result.getResult()).errorMessage != undefined){
			        		obj["ok"] 		= false;
				        	obj["error"] 	= JSON.parse(result.getResult()).errorMessage;
			        	}
			        	else{
			        		obj["ok"] 		= true;
				        	obj["retorno"] 	= JSON.parse(result.getResult());
			        	}
			        }else{
			        	obj["error"] 	= "Não encontrou nenhum registro para a consulta!";
			        }
				}else{
					obj["ok"] 		= false;
					obj["error"] 	= result.getResult()
				}
			}catch(e){
				obj["error"] = (e.message != undefined && e.message != null) ? e.message : e ;
			}
			
			//log.dir(obj);
			log.info("** integra.postFormFluig **");
			return obj;
			
		},
		putFluig: function(endpoint, params){
			log.info(">> integra.putFormFluig <<");
			//log.info("-- endpoint: " + endpoint);
			//log.dir(params)
			
			var obj = {"ok":false};
			
			try{
				
				var data = {
		            companyId 	: getValue("WKCompany") + '',
		            serviceCode : 'FLUIG_REST',
		            endpoint 	: endpoint,
		            method 		: 'put',
		            timeout		: 60000,
		            async		: false,
		            params 		: params,
		            headers: {
		                'Content-Type': 'application/json'
		            }
		        }

				var clientService = fluigAPI.getAuthorizeClientService();
				
				var result = clientService.invoke(new org.json.JSONObject(data).toString());
				//log.info("<<<<<<<LOGDIR>>>>>>>>>")
			    //log.dir(result);
				if(result.getHttpStatusResult() >= 200 && result.getHttpStatusResult() < 300){
					if (result.getResult()!= null && !result.getResult().isEmpty()){
			        	
			        	if(result.getResult().indexOf("com.fluig.authorize.client.exception.ClientBasicAuthorizeException: java.net.SocketTimeoutException: Read timed out") > 0){
			        		obj["ok"] 		= false;
				        	obj["error"] 	= result.getResult();
			        	}
			        	else if(JSON.parse(result.getResult()).errorMessage != undefined){
			        		obj["ok"] 		= false;
				        	obj["error"] 	= JSON.parse(result.getResult()).errorMessage;
			        	}
			        	else{
			        		obj["ok"] 		= true;
				        	obj["retorno"] 	= JSON.parse(result.getResult());
			        	}
			        }else{
			        	obj["error"] 	= "Não encontrou nenhum registro para a consulta!";
			        }
				}else{
					obj["ok"] 		= false;
					obj["error"] 	= result.getResult()
				}
			}catch(e){
				obj["error"] = (e.message != undefined && e.message != null) ? e.message : e ;
			}
			
			//log.dir(obj);
			log.info("** integra.putFormFluig **");
			return obj;
			
		}
}