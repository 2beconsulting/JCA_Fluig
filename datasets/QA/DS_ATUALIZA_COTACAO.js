var mlSolicitacao = "ML001722";
var mlTES = "ML001739";
var formCotacao = "36306";

function createDataset(fields, constraints, sortFields) {
	try {
		var jConstr = constraintToJson(constraints);
		log.dir(jConstr);

		var WKCardId = "";

		//Identificador da ficha
		var idEmpresa = jConstr.IDEMPRESA;
		var C8_NUM = jConstr.C8_NUM;
		var C8_CICLO = jConstr.C8_CICLO;

		//Identificador da cotação
		var C8_FORNECE = jConstr.C8_FORNECE;
		var C8_LOJA = jConstr.C8_LOJA;
		var C8_PRODUTO = jConstr.C8_PRODUTO;
		var IDX = jConstr.IDX;

		//Dados a serem atualizados
		var COMPRADOR = jConstr.COMPRADOR;
		var VENCEDOR_COMPRADOR = jConstr.VENCEDOR_COMPRADOR;
		var QTD_COMPRADOR = jConstr.QTD_COMPRADOR;
		var C8_QUANT = jConstr.C8_QUANT;
		var C8_COND = jConstr.C8_COND;
		var C8_TPFRETE = jConstr.C8_TPFRETE;
		var C8_TOTFRE = jConstr.C8_TOTFRE;
		var COMPRADOR_JUSTIFICATIVA = jConstr.COMPRADOR_JUSTIFICATIVA;

		if ((idEmpresa != undefined && C8_NUM != undefined && C8_CICLO != undefined) || IDX != undefined) {
			if (C8_QUANT != undefined && QTD_COMPRADOR != undefined) {
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
				log.info("dsArr");
				log.dir(dsArr);

				if (IDX != undefined) {
					var dsIdx = dsArr.filter(function (el) { return el.idx == IDX });
					log.info("dsIdx");
					log.dir(dsIdx);

					if (dsIdx.length > 0) {
						C8_FORNECE = dsIdx[0]["C8_FORNECE"];
						C8_LOJA = dsIdx[0]["C8_LOJA"];
						C8_PRODUTO = dsIdx[0]["C8_PRODUTO"].trim();
					}
				}

				if (C8_FORNECE != undefined && C8_LOJA != undefined && C8_PRODUTO != undefined) {
					var dsFilt = dsArr.filter(function (el) { return el.C8_FORNECE == C8_FORNECE && el.C8_LOJA == C8_LOJA && el.C8_PRODUTO == C8_PRODUTO });
					log.info("dsFilt");
					log.dir(dsFilt);

					dsFilt.forEach(function (reg) {
						IDX = dsFilt[0].idx;

						if (C8_COND != undefined && C8_TPFRETE != undefined && C8_TOTFRE != undefined) {
							//if(QTD_COMPRADOR != C8_QUANT){
							var dsTES = getTES(idEmpresa, C8_NUM);
							reg["COMPRADOR"] = COMPRADOR;
							reg["VENCEDOR_COMPRADOR"] = VENCEDOR_COMPRADOR;
							reg["QTD_COMPRADOR"] = QTD_COMPRADOR;
							reg["C8_QUANT"] = C8_QUANT;

							var FORNECE = [{
								"C8_FORNECE": C8_FORNECE + C8_LOJA,
								"C8_COND": C8_COND,
								"C8_TPFRETE": C8_TPFRETE,
								"C8_TOTFRE": C8_TOTFRE,
								"C8_DESPESA": "0.00",
								"C8_SEGURO": "0.00",
								"C8_VALDESC": "0.00",
								"ITEM": []
							}]

							//var filFornec = dsArr.filter(function(el){return el.C8_FORNECE == C8_FORNECE && el.C8_LOJA == C8_LOJA}); //
							var filFornec = dsArr.filter(function (el) { return el.C8_FORNECE == C8_FORNECE && el.C8_LOJA == C8_LOJA && el.C8_PRODUTO == C8_PRODUTO });
							log.info("--filFornec");
							log.dir(filFornec);

							filFornec.forEach(function (regForn) {
								filtTES = dsTES.filter(function (el) { return el.TES_A2_COD == C8_FORNECE && el.TES_A2_LOJA == C8_LOJA && el.TES_B1_COD == reg.C8_PRODUTO.substring(0, 8) })
								FORNECE[0].ITEM.push({
									"C8_PRODUTO": regForn["C8_PRODUTO"],
									"C8_PRECO": regForn["C8_PRECO"],
									"C8_QTDISP": regForn["QTD_COMPRADOR"] != "" && regForn["QTD_COMPRADOR"] != "null" && regForn["QTD_COMPRADOR"] != "0" ? regForn["QTD_COMPRADOR"] : regForn["C8_QUANT"],
									"C8_PRAZO": regForn["C8_PRAZO"],
									"C8_TES": filtTES.length != 0 ? filtTES[0]["TES_CODIGO"] : "001"
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

											var filProtheus = dadosProtheus.retorno.filter(function (p) { return p.C8_FORNECE == reg.C8_FORNECE && p.C8_LOJA == reg.C8_LOJA && p.C8_PRODUTO.trim() == reg.C8_PRODUTO.trim() })
											log.info("--filProtheus");
											log.dir(filProtheus);
											if (filProtheus.length > 0) {
												var formFields = {
													"values": [
														{ "fieldId": "QTD_COMPRADOR" + "___" + reg.idx, "value": QTD_COMPRADOR },
														{ "fieldId": "COMPRADOR" + "___" + reg.idx, "value": COMPRADOR },
														{ "fieldId": "VENCEDOR_COMPRADOR" + "___" + reg.idx, "value": VENCEDOR_COMPRADOR },
														{ "fieldId": "COMPRADOR_JUSTIFICATIVA" + "___" + reg.idx, "value": COMPRADOR_JUSTIFICATIVA },
														{ "fieldId": "C8_DIFAL" + "___" + reg.idx, "value": filProtheus[0].C8_ICMSCOM },
														{ "fieldId": "C8_VALICM" + "___" + reg.idx, "value": filProtheus[0].C8_VALICM },
														{ "fieldId": "C8_VALIPI" + "___" + reg.idx, "value": filProtheus[0].C8_VALIPI },
														{ "fieldId": "C8_VALISS" + "___" + reg.idx, "value": filProtheus[0].C8_VALISS },
														{ "fieldId": "C8_VALSOL" + "___" + reg.idx, "value": filProtheus[0].C8_VALSOL },
														{ "fieldId": "C8_TOTAL" + "___" + reg.idx, "value": filProtheus[0].C8_TOTAL },
														{ "fieldId": "VENCEDOR" + "___" + reg.idx, "value": filProtheus[0].C8_STATUS }
													]
												}

												reg.QTD_COMPRADOR = QTD_COMPRADOR;
												reg.COMPRADOR = COMPRADOR;
												reg.VENCEDOR_COMPRADOR = VENCEDOR_COMPRADOR;
												reg.COMPRADOR_JUSTIFICATIVA = COMPRADOR_JUSTIFICATIVA;
												reg.C8_DIFAL = filProtheus[0].C8_ICMSCOM;
												reg.C8_VALICM = filProtheus[0].C8_VALICM;
												reg.C8_VALIPI = filProtheus[0].C8_VALIPI;
												reg.C8_VALISS = filProtheus[0].C8_VALISS;
												reg.C8_VALSOL = filProtheus[0].C8_VALSOL;
												reg.C8_TOTAL = filProtheus[0].C8_TOTAL;
												//reg.VENCEDOR = filProtheus[0].C8_STATUS;

												log.info("formFields");
												log.dir(formFields);

												if (reg.documentid != "" && reg.documentid != undefined) {
													var integrado = putFluig("/ecm-forms/api/v2/cardindex/" + formCotacao + "/cards/" + reg.documentid + "/children/" + reg.idx, formFields);
													log.info("integrado 156");
													log.dir(integrado);
													if (integrado.ok) {
														ds = dsSucess(dsArr, ds);
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
									else {
										return dsError(dadosProtheus.error.message, [])
									}
								}
								else {
									return dsError(dadosProtheus.error, [])
								}
							}
							else {
								return dsError(retorno.error, [])
							}
							/* PRECISA ALTERAR MESMO QUANDO A QUANTIDADE DO COMPRADOR É IGUAL A DO FORNECEDOR
							}
							else{
								var formFields = {
										"values":[
											{"fieldId":"QTD_COMPRADOR"+"___"+reg.idx 			, "value":QTD_COMPRADOR},
											{"fieldId":"COMPRADOR"+"___"+reg.idx 				, "value":COMPRADOR},
											{"fieldId":"VENCEDOR_COMPRADOR"+"___"+reg.idx 		, "value":VENCEDOR_COMPRADOR},
											{"fieldId":"COMPRADOR_JUSTIFICATIVA"+"___"+reg.idx 	, "value":COMPRADOR_JUSTIFICATIVA},
										]
									}
									
									log.info("formFields");
									log.dir(formFields);
									
									if(reg.documentid != "" && reg.documentid != undefined){
										var integrado = putFluig("/ecm-forms/api/v2/cardindex/"+formCotacao+"/cards/"+reg.documentid+"/children/"+reg.idx,formFields);
										log.info("integrado 195");
										log.dir(integrado);
										return integrado.ok ? 
											DatasetFactory.getDataset(
												"DS_CONSULTA_COTACOES",
												null,
												[
													DatasetFactory.createConstraint("idEmpresaEntrega",idEmpresaEntrega,idEmpresaEntrega,ConstraintType.MUST),
													DatasetFactory.createConstraint("C8_NUM",C8_NUM,C8_NUM,ConstraintType.MUST),
													DatasetFactory.createConstraint("C8_CICLO",C8_CICLO,C8_CICLO,ConstraintType.MUST)
												],
												null
											)
											: dsError(integrado.error,[])
									}
									else{
										return dsError("Não foi encontrado a cotação para atualizar!",[])
									}
							}
							*/
						}
						else {
							return dsError("Falta enviar campos obrigatórios!", [])
						}

					})
				}
				else {
					return dsError("Falta enviar campos obrigatórios!", []);
				}
			}
			// - FInaliza primeiro if
			return ds;
		}
		else {
			return dsError("Falta enviar campos obrigatórios!", [])
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

function dsSucess(dsArr, dsOld) {
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

}