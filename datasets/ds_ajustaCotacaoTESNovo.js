var mlSolicitacao = "ML001722";
var mlTES = "ML001739";

function createDataset(fields, constraints, sortFields) {
	try {
		var jConstr = constraintToJson(constraints);
		log.dir(jConstr);


		var C8_NUM = jConstr.C8_NUM;
		var C8_CICLO = jConstr.C8_CICLO;
		var idEmpresa = jConstr.IDEMPRESA;
		var TES = jConstr.TES;
		/**PROD
		 * 
		var codFormCotacoes = "746756";
		 * QA
		 * 
		var codFormCotacoes = "36306";
		 */
		var codFormCotacoes = "746756";

		var ds = DatasetFactory.getDataset(
			"DS_CONSULTA_COTACOES",
			null,
			[
				DatasetFactory.createConstraint("idEmpresa", idEmpresa, idEmpresa, ConstraintType.MUST),
				DatasetFactory.createConstraint("C8_NUM", C8_NUM, C8_NUM, ConstraintType.MUST),
				DatasetFactory.createConstraint("C8_CICLO", C8_CICLO, C8_CICLO, ConstraintType.MUST)
			],
			null
		)
		var dsArr = dsToJson(ds);
		log.info("ds_ajustaCotacaoTESNovo>> dsArr");
		log.dir(dsArr);
		var fornecedores = dsArr.reduce(function (acc, elem) {
			if (acc.indexOf(elem.C8_FORNECE + ":" + elem.C8_LOJA) == -1)
				acc.push(elem.C8_FORNECE + ":" + elem.C8_LOJA)
			return acc;
		}, [])

		/** @todo em construção
		 * pegar todos os fornecedores e lojas
		 * e amarrar com as cotações retornadas em dsArr
		 * para cada fornecedor e loja, criar um array de itens
		 * com os itens que foram cotados
		 * e enviar para o Protheus
		 */
		var FORNECE = []
		fornecedores.forEach(function (registro) {
			var registro = registro.split(":");
			var C8_FORNECE = registro[0]
			var C8_LOJA = registro[1]
			FORNECE.push({
				"C8_FORNECE": C8_FORNECE + C8_LOJA,
				"C8_COND": "010",
				"C8_TPFRETE": "",
				"C8_TOTFRE": "0.00",
				"C8_DESPESA": "0.00",
				"C8_SEGURO": "0.00",
				"C8_VALDESC": "0.00",
				"ITEM": []
			})

			var cotacao = dsArr.filter(function (p) {
				return p.C8_FORNECE.trim() == C8_FORNECE && p.C8_LOJA.trim() == C8_LOJA
			}).forEach(function (reg) {
				var C8_PRODUTO = reg.C8_PRODUTO;
				C8_PRODUTO = C8_PRODUTO.replace("   ", "");
				FORNECE[FORNECE.length - 1].ITEM.push({
					"C8_PRODUTO": C8_PRODUTO,
					"C8_PRECO": reg.C8_PRECO,
					"C8_QTDISP": reg.QTD_COMPRADOR != "" && reg.QTD_COMPRADOR != "null" && reg.QTD_COMPRADOR != "0" ? reg.QTD_COMPRADOR : reg.C8_QUANT,
					"C8_PRAZO": reg.C8_PRAZO,
					"C8_TES": "" + TES
				})
			})
		})
		var COTACAO = [{
			"EMPRESA": idEmpresa,
			"C8_NUMERO": C8_NUM,
			"FORNECE": FORNECE
		}]
		retorno = postProtheus("/JWSSC8A2/2", { "COTACAO": COTACAO }, "01," + idEmpresa);

		if (retorno.ok) {
			var dadosProtheus = getProtheus("/JWSSC803/3/" + idEmpresa + "/" + C8_NUM, "01," + idEmpresa);
			if (dadosProtheus.ok) {
				if (dadosProtheus.retorno.message == undefined) {
					if (dadosProtheus.retorno.length > 0) {
						var formFields = {
							"values": []
						};
						dadosProtheus.retorno.forEach(function (registroProtheus) {
							var C8_FORNECE = registroProtheus.C8_FORNECE;
							var C8_LOJA = registroProtheus.C8_LOJA;
							var C8_PRODUTO = registroProtheus.C8_PRODUTO;
							C8_PRODUTO = C8_PRODUTO.replace("   ", "");
							var reg = dsArr.filter(function (p) {
								return p.C8_FORNECE == C8_FORNECE && p.C8_LOJA == C8_LOJA && p.C8_PRODUTO == C8_PRODUTO
							})[0];
							if (reg != undefined) {
								reg.documentid

								formFields.values.push({ "fieldId": "C8_ITEM" + "___" + reg.idx, "value": "" + reg.C8_ITEM });
								formFields.values.push({ "fieldId": "C8_PRODUTO" + "___" + reg.idx, "value": "" + C8_PRODUTO });
								formFields.values.push({ "fieldId": "C8_UM" + "___" + reg.idx, "value": "" + reg.C8_UM });
								formFields.values.push({ "fieldId": "C8_FORNECE" + "___" + reg.idx, "value": "" + C8_FORNECE });
								formFields.values.push({ "fieldId": "C8_LOJA" + "___" + reg.idx, "value": "" + C8_LOJA });
								formFields.values.push({ "fieldId": "C8_VALIDA" + "___" + reg.idx, "value": "" + reg.C8_VALIDA });
								formFields.values.push({ "fieldId": "QTD_COMPRADOR" + "___" + reg.idx, "value": reg.QTD_COMPRADOR });
								formFields.values.push({ "fieldId": "COMPRADOR" + "___" + reg.idx, "value": reg.COMPRADOR });
								formFields.values.push({ "fieldId": "VENCEDOR_COMPRADOR" + "___" + reg.idx, "value": reg.VENCEDOR_COMPRADOR });
								formFields.values.push({ "fieldId": "COMPRADOR_JUSTIFICATIVA" + "___" + reg.idx, "value": reg.COMPRADOR_JUSTIFICATIVA });
								formFields.values.push({ "fieldId": "C8_DIFAL" + "___" + reg.idx, "value": registroProtheus.C8_ICMSCOM });
								formFields.values.push({ "fieldId": "C8_VALICM" + "___" + reg.idx, "value": registroProtheus.C8_VALICM });
								formFields.values.push({ "fieldId": "C8_VALIPI" + "___" + reg.idx, "value": registroProtheus.C8_VALIPI });
								formFields.values.push({ "fieldId": "C8_VALISS" + "___" + reg.idx, "value": registroProtheus.C8_VALISS });
								formFields.values.push({ "fieldId": "C8_VALSOL" + "___" + reg.idx, "value": registroProtheus.C8_VALSOL });
								formFields.values.push({ "fieldId": "C8_TOTAL" + "___" + reg.idx, "value": registroProtheus.C8_TOTAL });
								formFields.values.push({ "fieldId": "VENCEDOR" + "___" + reg.idx, "value": registroProtheus.C8_STATUS });
							}
						})
						documentid = dsArr[0].documentid;
						log.info("ds_ajustaCotacaoTESNovo>> formFields>>"
							+ ":" + documentid);
						log.dir(formFields);
						if (documentid != "" && documentid != undefined) {
							var integrado = putFluig("/ecm-forms/api/v2/cardindex/" + codFormCotacoes
								+ "/cards/" + documentid, formFields);
							log.info("ds_ajustaCotacaoTESNovo>> integrado 112");
							log.dir(integrado);
							if (integrado.ok) {
								return dsSucess(ds, ds);
							}
							else {
								return dsError(integrado.error, []);
							}
						}
						else {
							return dsError("Não foi encontrado a cotação para atualizar!", [])
						}
					}
				}
			}
		}
	}
	catch (e) {
		return dsError(e.message != undefined ? e.message : e, [])
	}
}

function dsError(msgError, fieldsRequired) {
	var ds = DatasetBuilder.newDataset();
	ds.addColumn("ERROR");
	fieldsRequired.forEach(function (field) { ds.addColumn(field) });

	var arr = [msgError];
	fieldsRequired.forEach(function (field) { arr.push("") });

	ds.addRow(arr);
	return ds;
}

function dsSucess() {
	log.info("-dsSucess-");
	var ds = DatasetBuilder.newDataset();

	ds.addColumn("OK");

	ds.addRow(["ok"]);
	return ds;
}
function dsSucessOld(dsArr, dsOld) {
	log.info("-dsSucess-");
	var ds = DatasetBuilder.newDataset();

	dsOld.columnsName.forEach(function (coluna) {
		ds.addColumn(coluna);
	})

	dsArr.forEach(function (item) {
		var row = [];
		dsOld.columnsName.forEach(function (coluna) {
			row.push(item[coluna]);
		})
		ds.addRow(row);
	})
	log.dir(ds)
	return ds;
}

function constraintToJson(constraints) {
	var obj = {};
	if (constraints != null) {
		for (var i = 0; i < constraints.length; i++) {
			obj[constraints[i].fieldName.toUpperCase()] = "" + constraints[i].initialValue
		}
	}
	return obj;
}

function dsToJson(ds) {
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
}

function getTES(idEmpresa, C8_NUM) {
	return dsToJson(Exec("SELECT TES.TES_A2_COD, TES.TES_A2_LOJA, TES.TES_B1_COD, TES.TES_CODIGO FROM " + mlTES + " TES \
			  INNER JOIN "+ mlSolicitacao + " ML ON TES.DOCUMENTID = ML.DOCUMENTID AND TES.VERSION = ML.VERSION \
			  INNER JOIN DOCUMENTO DOC ON DOC.NR_DOCUMENTO = ML.DOCUMENTID AND DOC.NR_VERSAO = ML.VERSION \
			  WHERE DOC.VERSAO_ATIVA = 1 AND ML.idEmpresa = '"+ idEmpresa + "' AND ML.C8_NUM = '" + C8_NUM + "'"))
}

function Exec(minhaQuery) {
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
		var seq = 0;
		while (rs.next()) {
			if (!created) {
				newDataset.addColumn("idx")
				for (var i = 1; i <= columnCount; i++) {
					newDataset.addColumn(rs.getMetaData().getColumnName(i));
				}
				created = true;
			}
			var Arr = new Array();
			seq = seq + 1;
			Arr.push(seq.toString());
			for (var i = 1; i <= columnCount; i++) {
				var obj = rs.getObject(rs.getMetaData().getColumnName(i));
				if (null != obj) {
					Arr.push(rs.getObject(rs.getMetaData().getColumnName(i)).toString());
				} else {
					Arr.push("null");
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
}

function putFluig(endpoint, params) {
	log.info(">> putFluig <<");

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

	return obj;
}

function getProtheus(endpoint, tenantid) {
	log.info(">> integra.getProtheus <<");
	log.info("-- endpoint: " + endpoint);
	log.info("-- tenantid: " + tenantid);
	var obj = { "ok": false };

	try {

		var data = {
			companyId: getValue("WKCompany") + '',
			serviceCode: 'PROTHEUS_SERVICE_REST',
			endpoint: endpoint,
			method: 'get',
			timeout: 60000,
			async: false,
			headers: {
				'Content-Type': 'application/json',
				'tenantId': tenantid
			}
		}

		log.dir(data)
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

}
function postProtheus(endpoint, params, tenantid) {
	log.info(">> postProtheus <<");
	log.info("-- endpoint: " + endpoint);
	log.dir(params);
	var obj = { "ok": false };

	try {

		var data = {
			companyId: getValue("WKCompany") + '',
			serviceCode: 'PROTHEUS_SERVICE_REST',
			endpoint: endpoint,
			method: 'post',
			timeout: 60000,
			async: false,
			params: params,
			headers: {
				'Content-Type': 'application/json',
				'tenantId': tenantid
			}
		}

		var clientService = fluigAPI.getAuthorizeClientService();
		log.info("<<<<<<<LOGDIR>>>>>>>>>")
		log.dir(data);
		var result = clientService.invoke(new org.json.JSONObject(data).toString());

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
				obj["ok"] = false;
				obj["error"] = "Não encontrou nenhum registro para a consulta!";
			}
		} else {
			obj["ok"] = false;
			obj["error"] = result.getResult()
		}
	} catch (e) {

		obj["ok"] = false;
		obj["error"] = (e.message != undefined && e.message != null) ? e.message : e;
	}
	//log.dir(obj);
	log.info("** integra.postProtheus **");
	return obj;

}