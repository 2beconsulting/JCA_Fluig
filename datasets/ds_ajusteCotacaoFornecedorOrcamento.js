function defineStructure() {

}
function onSync(lastSyncDate) {

}
/**
 * 
 * @param {*} fields 
 * @param {*} constraints 
 * @param {*} sortFields 
 * 
 * Adiciona e regulariza os fornecedores que foram adiconados no ciclo atual, 
 * e não subiram para as cotações
 * @uso     recuparar o id do documento do processo
 *          recuparar o id do documento da cotação
 *          recuperar os valores do ciclo, empresa e cotação
 * 
 */
function createDataset(fields, constraints, sortFields) {

    log.info("ds_ajusteCotacaoFornecedorOrcamento")
    /**
     * PROD
     * 
    var mlFormCotacao = "ML001742";
    var mlTabCotacao = "ML001743";
     * QA
    var mlFormCotacao = "ML001990";
    var mlTabCotacao = "ML001991";
     * 
     * 
     */
    var mlFormCotacao = "ML001742";
    var mlTabCotacao = "ML001743";
    var mlTabFornecedor = "ML001727";

    var CICLOREFERENCIA = "1";
    var IDDOCPROCESSOREF = "837424"; /** id ficha do processo principal  */

    var codFormCotacoes = "746754"; /** codigo do fichario do processo principal */

    var IDDOCCOTDESTINO = "850535"; /** id ficha do cotacoes  no processo de cotaçõesprincipal  */
    var CICLODESTINO = "2"
    var IDXREF = 1223;
    var idEmpresa = "00100289"
    var c8Num = "000207"

    var query = "SELECT * FROM " + mlTabFornecedor + " ML \
                WHERE ML.CICLO_INSERIDO = '" + CICLODESTINO + "' \
                AND ML.DOCUMENTID = " + IDDOCPROCESSOREF + "";


    var dataSetRetorno = tools.getDataset('ds_sql_execute', null, null, false);


    log.info("ds_ajusteCotacaoFornecedorOrcamento")
    log.info(query)

    var dataset = DatasetBuilder.newDataset();
    try {

        var cotacaoFields = { "values": [] };
        var fornecedores = []
        var idx = 1
        for (var index = 0; index < dataSetRetorno.length; index++) {
            var linhaRetorno = dataSetRetorno[index];
            fornecedores.push({
                "idx": idx,
                "A2_COD": linhaRetorno["A2_COD"] ? linhaRetorno["A2_COD"] : "",
                "A2_LOJA": linhaRetorno["A2_LOJA"] ? linhaRetorno["A2_LOJA"] : "",
                "A2_CGC": linhaRetorno["A2_CGC"] ? linhaRetorno["A2_CGC"] : ""
            })
            idx++
        }


        cotacao = tools.getProtheus("/JWSSC803/1/" + idEmpresa + "/" + c8Num, idEmpresa);
        log.info(">> tools.ds_ajusteCotacaoFornecedorOrcamento [#1371]")
        log.dir(fornecedores);
        var formAtualizado;
        if (cotacao.ok) {
            fornecedores.forEach(function (f) {
                var filtCotacao = cotacao.retorno.DADOS.filter(function (el) { return "" + el.C8_FORNECE == f.A2_COD && "" + el.C8_LOJA == f.A2_LOJA })
                log.info(">> tools.ds_ajusteCotacaoFornecedorOrcamento [#70]")
                log.dir(filtCotacao)

                filtCotacao.forEach(function (el) {
                    seq = IDXREF;
                    /**
                     * 
                    cotacaoFields.values.push({ "fieldId": "C8_ITEM" + "___" + seq, "value": "" + el["C8_ITEM"] });
                    cotacaoFields.values.push({ "fieldId": "C8_PRODUTO" + "___" + seq, "value": "" + el["C8_PRODUTO"].trim() });
                    cotacaoFields.values.push({ "fieldId": "C8_UM" + "___" + seq, "value": "" + el["C8_UM"] });
                    cotacaoFields.values.push({ "fieldId": "C8_FORNECE" + "___" + seq, "value": "" + el["C8_FORNECE"] });
                    cotacaoFields.values.push({ "fieldId": "C8_LOJA" + "___" + seq, "value": "" + el["C8_LOJA"] });
                    cotacaoFields.values.push({ "fieldId": "C8_VALIDA" + "___" + seq, "value": "" + el["C8_VALIDA"] });
                     */
                    cotacaoFields.values.push({ "fieldId": "C8_CICLO", "value": "" + CICLODESTINO });
                    cotacaoFields.values.push({ "fieldId": "C8_ITEM", "value": "" + el["C8_ITEM"] });
                    cotacaoFields.values.push({ "fieldId": "C8_PRODUTO", "value": "" + el["C8_PRODUTO"].trim() });
                    cotacaoFields.values.push({ "fieldId": "C8_UM", "value": "" + el["C8_UM"] });
                    cotacaoFields.values.push({ "fieldId": "C8_FORNECE", "value": "" + el["C8_FORNECE"] });
                    cotacaoFields.values.push({ "fieldId": "C8_LOJA", "value": "" + el["C8_LOJA"] });
                    cotacaoFields.values.push({ "fieldId": "C8_VALIDA", "value": "" + el["C8_VALIDA"] });

                    formAtualizado = tools.atualizaForm(IDDOCCOTDESTINO, codFormCotacoes, cotacaoFields);
                    log.info(">> tools.ds_ajusteCotacaoFornecedorOrcamento [#92]")
                    log.dir(formAtualizado)
                })

            })

            if (!formAtualizado.ok) {

                dataset.addColumn("erro");
                dataset.addRow(["Erro na atualização do formulário > " + formAtualizado.error]);
            } else {
                dataset.addColumn("resultado");
                dataset.addRow([JSON.stringify(formAtualizado)]);
            }
        }


        return dataset
    } catch (error) {
        dataset.addColumn("resultado");
        dataset.addRow([error]);

    } finally {

    }

    return dataset

}

var tools = {
    getDataset: function (name, campos, filtros, isInternal) {

        var constraints = [];

        if (isInternal) {
            constraints.push(DatasetFactory.createConstraint('metadata#active', true, true, ConstraintType.MUST));
        }

        if (filtros) {
            filtros.forEach(function (filtro) {
                constraints.push(DatasetFactory.createConstraint(filtro.field, filtro.value, filtro.value, filtro.type || ConstraintType.MUST));
            });
        }

        var result = [];
        try {

            var dataset = DatasetFactory.getDataset(name, null, constraints, null);

            if (dataset == null) {
                return result;
            }
            if (dataset.rowsCount > 0) {

                var _loop = function _loop() {
                    var o = {};

                    if (!campos) {
                        campos = dataset.getColumnsName();
                    }

                    campos.forEach(function (campo) {
                        o[campo] = dataset.getValue(i, campo);
                    });

                    result.push(o);
                };

                for (var i = 0; i < dataset.rowsCount; i++) {
                    _loop();
                }
            }

            return result;
        } catch (error) {

            return result

        }
    },
    atualizaForm: function (cardID, formId, formFields) {
        log.info(">> tools.cotacao.atualizaForm"); //Atualiza o formulário auxililar da cotação
        var obj = { "ok": false, "error": "" };

        obj = tools.postFluig("/ecm-forms/api/v2/cardindex/" + formId + "/cards/" + cardID + "/children", formFields);//tools.putFluig("/ecm-forms/api/v2/cardindex/" + formId + "/cards/" + cardID, formFields);

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

    },
    createCardField: function (field, valor) {
        return {
            "fieldId": field,
            "value": valor
        }
    },
    confirmaValor: function (oldValue) {
        return ["", "null", "0.00", "0,00"].indexOf(oldValue) < 0 ? oldValue : ""
    },

    getProtheus: function (endpoint, empresa) {
        log.info(">> ds_ajusteCotacaoFornecedorOrcamento <<");
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
                    'tenantId': '01,' + empresa
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

        log.info("** ds_ajusteCotacaoFornecedorOrcamento **")
        log.dir(obj);
        return obj;

    },


}