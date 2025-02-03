var integra = {
	getDBFluig: function (query) {
		log.info(">> getDBFluig \n " + query)
		var dataSource = "jdbc/AppDS";
		var newDataset = [];
		var ic = new javax.naming.InitialContext();
		var ds = ic.lookup(dataSource);
		try {
			var conn = ds.getConnection();
			var stmt = conn.createStatement();
			var rs = stmt.executeQuery(query);
			var columnCount = rs.getMetaData().getColumnCount();
			var seq = 0;
			while (rs.next()) {
				var obj = {};

				for (var i = 1; i <= columnCount; i++) {
					var item = rs.getObject(rs.getMetaData().getColumnName(i));
					if (null != item) {
						obj[rs.getMetaData().getColumnName(i)] = rs.getObject(rs.getMetaData().getColumnName(i)).toString();
					}
				}
				newDataset.push(obj);
			}
		} catch (e) {
			log.error("ERRO==============> " + e.message);
		} finally {
			if (stmt != null) stmt.close();
			if (conn != null) conn.close();
		}
		return newDataset;
	},
	getProtheus: function (endpoint) {
		log.info(">> integra.getProtheus <<");
		//log.info("-- endpoint: " + endpoint);
		var obj = { "ok": false };

		try {

			var data = {
				companyId: getValue("WKCompany") + '',
				serviceCode: 'PROTHEUS_SERVICE_REST',
				endpoint: endpoint,
				method: 'get',
				timeout: '3600000',
				async: false,
				headers: {
					'Content-Type': 'application/json',
					'tenantId': '01,' + hAPI.getCardValue("idEmpresa")
				}
			}
			log.dir(data);

			var clientService = fluigAPI.getAuthorizeClientService();

			var result = clientService.invoke(new org.json.JSONObject(data).toString());
			//log.dir(result);
			if (result.getHttpStatusResult() >= 200 && result.getHttpStatusResult() < 300) {
				if (result.getResult() != null && !result.getResult().isEmpty()) {

					if (result.getResult().indexOf("com.fluig.authorize.client.exception.ClientBasicAuthorizeException: ") > 0) {
						obj["ok"] = false;
						obj["error"] = result.getResult();
					}
					else if (JSON.parse(result.getResult()).code != undefined && JSON.parse(result.getResult()).code == 500) {
						obj["ok"] = false;
						var ret = JSON.parse(result.getResult())
						obj["code"] = ret.code;
						obj["errorCode"] = ret.errorCode;
						obj["error"] = ret.message;
					}
					else {
						obj["ok"] = true;
						obj["retorno"] = JSON.parse(result.getResult());
					}

				} else {

					obj["error"] = "Não encontrou nenhum registro para a consulta!";

				}
			} else {
				obj["ok"] = false;
				obj["error"] = result.getResult()
			}
		} catch (e) {

			obj["error"] = (e.message != undefined && e.message != null) ? e.message : e;

		}

		log.info("** integra.getProtheus **")
		log.dir(obj);
		return obj;

	},
	postProtheus: function (endpoint, params) {
		log.info(">> integra.postProtheus <<");
		//log.info("-- endpoint: " + endpoint);
		//log.dir(params);
		var obj = { "ok": false };

		try {

			var data = {
				companyId: getValue("WKCompany") + '',
				serviceCode: 'PROTHEUS_SERVICE_REST',
				endpoint: endpoint,
				method: 'post',
				timeout: '3600000',
				async: false,
				params: params,
				headers: {
					'Content-Type': 'application/json',
					'tenantId': '01,' + hAPI.getCardValue("idEmpresa")
				}
			}
			log.dir(data);

			var clientService = fluigAPI.getAuthorizeClientService();

			var result = clientService.invoke(new org.json.JSONObject(data).toString());
			log.info("<<<<<<<LOGDIR>>>>>>>>>")
			log.dir(result);
			if (result.getHttpStatusResult() >= 200 && result.getHttpStatusResult() < 300) {
				if (result.getResult() != null && !result.getResult().isEmpty()) {

					if (result.getResult().indexOf("com.fluig.authorize.client.exception.ClientBasicAuthorizeException: java.net.SocketTimeoutException: Read timed out") > 0) {
						obj["ok"] = false;
						obj["error"] = result.getResult();
					}
					else if (JSON.parse(result.getResult()).errorMessage != undefined) {
						obj["ok"] = false;
						obj["error"] = JSON.parse(result.getResult()).errorMessage;
					}
					else {
						obj["ok"] = true;
						obj["retorno"] = JSON.parse(result.getResult());
					}
				} else {
					obj["error"] = "Não encontrou nenhum registro para a consulta!";
				}
			} else {
				obj["ok"] = false;
				obj["error"] = result.getResult()
			}
		} catch (e) {
			obj["error"] = (e.message != undefined && e.message != null) ? e.message : e;
		}
		//log.dir(obj);
		log.info("** integra.postProtheus **");
		return obj;

	},
	postFluig: function (endpoint, params) {
		log.info(">> integra.postFormFluig <<");
		//log.info("-- endpoint: " + endpoint);
		//log.dir(params)

		var obj = { "ok": false };

		try {

			var data = {
				companyId: getValue("WKCompany") + '',
				serviceCode: 'FLUIG_REST',
				endpoint: endpoint,
				method: 'post',
				timeout: 60000,
				async: false,
				params: params,
				headers: {
					'Content-Type': 'application/json'
				}
			}

			var clientService = fluigAPI.getAuthorizeClientService();

			var result = clientService.invoke(new org.json.JSONObject(data).toString());
			//log.info("<<<<<<<LOGDIR>>>>>>>>>")
			//log.dir(result);
			if (result.getHttpStatusResult() >= 200 && result.getHttpStatusResult() < 300) {
				if (result.getResult() != null && !result.getResult().isEmpty()) {

					if (result.getResult().indexOf("com.fluig.authorize.client.exception.ClientBasicAuthorizeException: java.net.SocketTimeoutException: Read timed out") > 0) {
						obj["ok"] = false;
						obj["error"] = result.getResult();
					}
					else if (JSON.parse(result.getResult()).errorMessage != undefined) {
						obj["ok"] = false;
						obj["error"] = JSON.parse(result.getResult()).errorMessage;
					}
					else {
						obj["ok"] = true;
						obj["retorno"] = JSON.parse(result.getResult());
					}
				} else {
					obj["error"] = "Não encontrou nenhum registro para a consulta!";
				}
			} else {
				obj["ok"] = false;
				obj["error"] = result.getResult()
			}
		} catch (e) {
			obj["error"] = (e.message != undefined && e.message != null) ? e.message : e;
		}

		//log.dir(obj);
		log.info("** integra.postFormFluig **");
		return obj;

	},
	putFluig: function (endpoint, params) {
		tools.log(">> integra.putFormFluig <<");

		var obj = { "ok": false };

		try {

			var data = {
				companyId: getValue("WKCompany") + '',
				serviceCode: 'FLUIG_REST',
				endpoint: endpoint,
				method: 'put',
				timeout: 60000,
				async: false,
				params: params,
				headers: {
					'Content-Type': 'application/json'
				}
			}
			log.dir(data);

			var clientService = fluigAPI.getAuthorizeClientService();

			var result = clientService.invoke(new org.json.JSONObject(data).toString());
			//log.info("<<<<<<<LOGDIR>>>>>>>>>")
			//log.dir(result);
			if (result.getHttpStatusResult() >= 200 && result.getHttpStatusResult() < 300) {
				if (result.getResult() != null && !result.getResult().isEmpty()) {

					if (result.getResult().indexOf("com.fluig.authorize.client.exception.ClientBasicAuthorizeException: java.net.SocketTimeoutException: Read timed out") > 0) {
						obj["ok"] = false;
						obj["error"] = result.getResult();
					}
					else if (JSON.parse(result.getResult()).errorMessage != undefined) {
						obj["ok"] = false;
						obj["error"] = JSON.parse(result.getResult()).errorMessage;
					}
					else {
						obj["ok"] = true;
						obj["retorno"] = JSON.parse(result.getResult());
					}
				} else {
					obj["error"] = "Não encontrou nenhum registro para a consulta!";
				}
			} else {
				obj["ok"] = false;
				obj["error"] = result.getResult()
			}
		} catch (e) {
			obj["error"] = (e.message != undefined && e.message != null) ? e.message : e;
		}

		tools.log("** integra.putFormFluig **");
		return obj;

	}
}