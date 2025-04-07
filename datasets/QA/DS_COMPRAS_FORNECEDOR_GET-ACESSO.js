var formAcesso = "746406";
importPackage(Packages.com.fluig.foundation.mail);

function createDataset(fields, constraints, sortFields) {
	try {
		var mlAutenticator = "ML001720"; // 28855
		var tabFornecedor = "ML001721"; // tabFornecedor
		var jsonConstraints = tools.constraintToJson(constraints);

		if (jsonConstraints.A2_COD != undefined && jsonConstraints.A2_LOJA != undefined) {
			var dsAcessos = integra.Exec(
				"SELECT distinct ML.emailRegister FROM " + mlAutenticator + " ML \
				INNER JOIN "+ tabFornecedor + " FORN ON ML.DOCUMENTID = FORN.DOCUMENTID AND ML.VERSION = FORN.VERSION \
				INNER JOIN DOCUMENTO DOC ON DOC.NR_DOCUMENTO = ML.DOCUMENTID AND DOC.NR_VERSAO = ML.VERSION \
				WHERE DOC.VERSAO_ATIVA = 1 AND FORN.A2_COD = '"+ jsonConstraints.A2_COD + "' AND FORN.A2_LOJA = '" + jsonConstraints.A2_LOJA + "'"
			)

			if (dsAcessos != null && dsAcessos.rowsCount > 0) {
				return dsAcessos;
			}
			else {
				var dadosFornec = tools.getDadosFornecedor(jsonConstraints.A2_COD, jsonConstraints.A2_LOJA);

				if (dadosFornec != null) {
					var dadosOutro = tools.outroFornec(dadosFornec[0]["EMAIL"]);

					if (dadosOutro.rowsCount > 0) {
						var fornAdic = tools.adicionaAcesso(dadosOutro.getValue(0, "DOCUMENTID"), dadosFornec);

						if (fornAdic.ok) {
							var ds = DatasetBuilder.newDataset();
							ds.addColumn("emailRegister");
							ds.addRow([dadosFornec[0]["EMAIL"]]);
							return ds;
						}
						else {
							throw fornAdic.error;
						}
					}
					else {
						var dadosNovo = tools.novoAcesso(dadosFornec);
						if (dadosNovo.ok) {
							var ds = DatasetBuilder.newDataset();
							ds.addColumn("emailRegister");
							ds.addRow([dadosFornec[0]["EMAIL"]]);
							return ds;
						} else {
							throw dadosNovo.error;
						}
					}
				} else {
					throw "Não foi localizado o e-mail do fornecedor";
				}
			}
		}
		else {
			throw "É necessário enviar as constraints obrigatória para esta consulta";
		}

	} catch (e) {
		return tools.dsError(e.message != undefined ? e.message : e)
	}
}

var tools = {
	adicionaAcesso: function (documentId, dadosFornec) {
		return integra.postFluig("/ecm-forms/api/v2/cardindex/" + formAcesso + "/cards/" + documentId + "/children", {
			"values": [
				{
					"fieldId": "A2_COD",
					"value": dadosFornec[0]["CODIGO"]
				},
				{
					"fieldId": "A2_LOJA",
					"value": dadosFornec[0]["LOJA"]
				},
				{
					"fieldId": "A2_NOME",
					"value": dadosFornec[0]["DESCRICAO"]
				},
				{
					"fieldId": "A2_CGC",
					"value": dadosFornec[0]["CGC"]
				}
			]
		})
	},
	constraintToJson: function (constraints) {
		var obj = {};
		if (constraints != null) {
			for (var i = 0; i < constraints.length; i++) {
				obj[constraints[i].fieldName.toUpperCase()] = "" + constraints[i].initialValue
			}
		}
		return obj;
	},
	dsError: function (msgError) {
		var ds = DatasetBuilder.newDataset();
		ds.addColumn("ERROR");

		ds.addRow([msgError]);
		return ds;
	},
	dsToJson: function (ds) {
		var arr = [];
		var columns = ds.columnsName;
		for (var i = 0; i < ds.rowsCount; i++) {
			var obj = {};
			columns.forEach(function (coluna) {
				obj[coluna] = ds.getValue(i, coluna)
			})
			arr.push(obj)
		}
		return arr;
	},

	generatePassword: function () {
		var length = 8,
			charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
			retVal = "";
		for (var i = 0, n = charset.length; i < length; ++i) {
			retVal += charset.charAt(Math.floor(Math.random() * n));
		}
		return retVal;
	},
	getDadosFornecedor: function (A2_COD, A2_LOJA) {
		var ds = DatasetFactory.getDataset(
			"ds_consulta_fornecedor",
			null,
			[
				DatasetFactory.createConstraint("tipoConsulta", "codigo", "codigo", ConstraintType.MUST),
				DatasetFactory.createConstraint("CODIGO", A2_COD, A2_COD, ConstraintType.MUST),
				DatasetFactory.createConstraint("LOJA", A2_LOJA, A2_LOJA, ConstraintType.MUST)
			],
			null
		)

		return ds != null && ds.rowsCount > 0 && ds.getValue(0, "EMAIL") != "" ? tools.dsToJson(ds) : null
	},
	getTemplate: function (param) {
		return '<html>\
						<head>\
							<meta charset="utf-8">\
							<title>Compras</title>\
							<link href="https://jcaholding161427.fluig.cloudtotvs.com.br/globalmailsender/resources/global.css" type="text/css" rel="stylesheet" />\
							<style>\
						        .tab {\
						            display: inline-block;\
						            margin-left: 40px;\
						        }\
						    </style>\
						</head>\
						<body leftmargin="0" topmargin="0" marginheight="0" marginwidth="0">\
							<p>Prezado ' + param.A2_NOME + ',</p>\
							<p>É com grande satisfação que informamos que seu usuário foi criado com sucesso em nosso sistema. Agora, você pode acessar todas as funcionalidades disponíveis para facilitar sua interação conosco.</p>\
							<p>Para acessar sua conta, utilize o seguinte link: <a href="https://jcaholding161427.fluig.cloudtotvs.com.br/portal/1/portal_cotacao">https://jcaholding161427.fluig.cloudtotvs.com.br/portal/1/portal_cotacao</a>. Seus dados de login são:</p>\
								<p><span class="tab"></span><strong>Usuário: </strong>' + param.USERNAME + '</p>\
								<p><span class="tab"></span><strong>Senha: </strong>' + param.PASSWORD + '</p>\
							<p>Recomendamos que você altere sua senha após o primeiro acesso. Caso tenha alguma dúvida ou precise de assistência, não hesite em entrar em contato.</p>\
							<p>Agradecemos pela parceria!</p>\
						</body>\
					</html>'
	},
	getValidade: function () {
		var atualDate = new Date();
		var novaData = new Date();
		novaData.setDate(atualDate.getDate() + 365);
		//**
		// @todo ajustar aqui */
		return novaData.split("/").join("-");
	},
	novoAcesso: function (dadosFornec) {
		var passw = tools.generatePassword();
		var cardCreated = integra.postFluig("/ecm-forms/api/v2/cardindex/" + formAcesso + "/cards", {
			"values": [
				{
					"fieldId": "emailRegister",
					"value": dadosFornec[0]["EMAIL"]
				},
				{
					"fieldId": "passwordRegister",
					"value": passw
				},
				{
					"fieldId": "validitySession",
					"value": tools.getValidade()
				}
			]
		})

		if (cardCreated.ok) {
			if (cardCreated.retorno.cardId != undefined) {
				var child = integra.postFluig("/ecm-forms/api/v2/cardindex/" + formAcesso + "/cards/" + cardCreated.retorno.cardId + "/children", {
					"values": [
						{
							"fieldId": "A2_COD",
							"value": dadosFornec[0]["CODIGO"]
						},
						{
							"fieldId": "A2_LOJA",
							"value": dadosFornec[0]["LOJA"]
						},
						{
							"fieldId": "A2_NOME",
							"value": dadosFornec[0]["DESCRICAO"]
						},
						{
							"fieldId": "A2_CGC",
							"value": dadosFornec[0]["CGC"]
						}
					]
				})
				if (child.ok) {
					child["retorno"]["cardId"] = cardCreated.retorno.cardId;

					tools.sendMail(
						"Bem-vindo ao Grupo JCA!",
						[dadosFornec[0]["EMAIL"]],
						"TEMPLATE_COMPRAS_FORNECEDOR_NOVO",
						[
							{ id: "A2_NOME", value: dadosFornec[0]["DESCRICAO"] },
							{ id: "USERNAME", value: dadosFornec[0]["EMAIL"] },
							{ id: "PASSWORD", value: passw }
						]
					)
				}

				return child;
			} else {
				return {
					"ok": false,
					"error": "cardId não identificado"
				}
			}
		} else {
			return cardCreated;
		}

	},
	outroFornec: function (email) {
		return integra.Exec(
			"SELECT  ML.DOCUMENTID, ML.emailRegister FROM " + formAcesso + " ML \
				INNER JOIN DOCUMENTO DOC ON DOC.NR_DOCUMENTO = ML.DOCUMENTID AND DOC.NR_VERSAO = ML.VERSION \
				WHERE DOC.VERSAO_ATIVA = 1 AND ML.emailRegister = '"+ email + "'"
		)
	},
	sendMail: function (subject, destinatarios, template, parametros) {
		var receivers = new java.util.ArrayList();
		var params = new java.util.HashMap();

		destinatarios.forEach(function (email) {
			receivers.add(email);
		})

		params.put("subject", subject);
		parametros.forEach(function (param) {
			params.put(param.id, param.value);
		})

		notifier.notify("admin", template, params, receivers, "text/html");

	}
}

var integra = {
	Exec: function (minhaQuery) {
		log.info(">> minhaQuery: \n" + minhaQuery)
		var dataSource = "jdbc/AppDS";
		var newDataset = DatasetBuilder.newDataset();
		var ic = new javax.naming.InitialContext();
		var ds = ic.lookup(dataSource);
		var created = false;
		try {
			var conn = ds.getConnection();
			var stmt = conn.createStatement();
			var rs = stmt.executeQuery(minhaQuery);
			var columnCount = rs.getMetaData().getColumnCount();
			while (rs.next()) {
				if (!created) {
					for (var i = 1; i <= columnCount; i++) {
						newDataset.addColumn(rs.getMetaData().getColumnName(i));
					}
					created = true;
				}
				var Arr = new Array();
				for (var i = 1; i <= columnCount; i++) {
					var obj = rs.getObject(rs.getMetaData().getColumnName(i));
					if (null != obj) {
						Arr[i - 1] = rs.getObject(rs.getMetaData().getColumnName(i)).toString();
					} else {
						Arr[i - 1] = "null";
					}
				}
				newDataset.addRow(Arr);
			}
		} catch (e) {
			log.error("ERRO==============> " + e.message);
		} finally {
			if (stmt != null) stmt.close();
			if (conn != null) conn.close();
		}
		return newDataset;
	},
	postFluig: function (endpoint, params) {
		log.info(">> integra.postFormFluig <<");
		log.info("-- endpoint: " + endpoint);
		log.dir(params)

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

		log.info("** integra.putFormFluig **");
		return obj;

	},
	putFluig: function (endpoint, params) {
		log.info(">> integra.putFormFluig <<");

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

			var clientService = fluigAPI.getAuthorizeClientService();

			var result = clientService.invoke(new org.json.JSONObject(data).toString());
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

		log.info("** integra.putFormFluig **");
		return obj;

	}
}