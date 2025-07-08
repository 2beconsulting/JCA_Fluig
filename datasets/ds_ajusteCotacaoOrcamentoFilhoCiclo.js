function defineStructure() {

}
function onSync(lastSyncDate) {

}
function createDataset(fields, constraints, sortFields) {

    log.info("ds_ajusteCotacaoOrcamentoCiclo")
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

    var codFormCotacoes = "746754"; //cotacoes no processo filho
    var CICLODESTINO = "4"
    var idEmpresa = "00100289"
    var c8Num = "000327"
    var solCompras = "62111"
    var numeroSolicitacao = "64571"


    log.info("ds_ajusteCotacaoOrcamentoCiclo")

    var dataset = DatasetBuilder.newDataset();
    try {

        cotacao = tools.getProtheus("/JWSSC803/1/" + idEmpresa + "/" + c8Num, idEmpresa);
        log.info(">> tools.ds_ajusteCotacaoOrcamentoCiclo [#1371]")
        var formAtualizado;
        if (cotacao.ok) {
            var filtCotacao = cotacao.retorno.DADOS
            log.info(">> tools.ds_ajusteCotacaoOrcamentoCiclo [#70]")
            log.dir(filtCotacao)

            var cardCreated = tools.postFluig("/ecm-forms/api/v2/cardindex/" + codFormCotacoes + "/cards", {
                "values": [
                    {
                        "fieldId": "idEmpresa",
                        "value": "" + idEmpresa
                    },
                    {
                        "fieldId": "numeroSolicitacao",
                        "value": "" + numeroSolicitacao
                    },
                    {
                        "fieldId": "solCompras",
                        "value": solCompras
                    }
                ]
            })

            if (cardCreated.ok) {
                log.info(">> tools.ds_ajusteCotacaoOrcamentoCiclo [#61]")
                var formFields = { "values": [] };
                var seq = 1;

                dadosProtheus = tools.getProtheus("/JWSSC803/3/" + idEmpresa + "/" + c8Num, idEmpresa);

                log.info(">> tools.ds_ajusteCotacaoOrcamentoCiclo [#70]")
                log.dir(dadosProtheus)
                filtCotacao.forEach(function (el) {
                    var C8_FORNECE = el["C8_FORNECE"] + "".trim()
                    var C8_LOJA = el["C8_LOJA"] + "".trim()
                    var C8_PRODUTO = el["C8_PRODUTO"] + "".trim()

                    log.info(">> tools.ds_ajusteCotacaoOrcamentoCiclo " + C8_FORNECE + ":" + C8_LOJA + ">>:" + C8_PRODUTO)
                    var filtered = dadosProtheus.retorno.filter(function (elem) {
                        return C8_FORNECE.indexOf(elem.C8_FORNECE) > -1
                            && C8_LOJA.indexOf(elem.C8_LOJA) > -1
                            && C8_PRODUTO.indexOf(elem.C8_PRODUTO) > -1
                    })
                    formFields.values.push({ "fieldId": "C8_CICLO" + "___" + seq, "value": "" + CICLODESTINO });
                    formFields.values.push({ "fieldId": "C8_ITEM" + "___" + seq, "value": "" + el["C8_ITEM"] + "".trim() });
                    formFields.values.push({ "fieldId": "C8_PRODUTO" + "___" + seq, "value": "" + el["C8_PRODUTO"] + "".trim() });
                    formFields.values.push({ "fieldId": "C8_UM" + "___" + seq, "value": "" + el["C8_UM"] + "".trim() });
                    formFields.values.push({ "fieldId": "C8_FORNECE" + "___" + seq, "value": "" + el["C8_FORNECE"] + "".trim() });
                    formFields.values.push({ "fieldId": "C8_LOJA" + "___" + seq, "value": "" + el["C8_LOJA"] + "".trim() });
                    formFields.values.push({ "fieldId": "C8_VALIDA" + "___" + seq, "value": "" + el["C8_VALIDA"] + "".trim() });

                    formFields.values.push({ "fieldId": "C8_QUANT" + "___" + seq, "value": "" + el["C8_QUANT"] + "".trim() });
                    formFields.values.push({ "fieldId": "C8_PRECO" + "___" + seq, "value": "" + el["C8_PRECO"] + "".trim() });
                    formFields.values.push({ "fieldId": "C8_PRAZO" + "___" + seq, "value": "" + el["C8_PRAZO"] + "".trim() });

                    log.dir(filtered);
                    if (filtered.length > 0) {
                        formFields.values.push({ "fieldId": "C8_DIFAL" + "___" + seq, "value": filtered[0]["C8_ICMSCOM"] + "".trim() });
                        formFields.values.push({ "fieldId": "C8_VALICM" + "___" + seq, "value": filtered[0]["C8_VALICM"] + "".trim() });
                        formFields.values.push({ "fieldId": "C8_VALIPI" + "___" + seq, "value": filtered[0]["C8_VALIPI"] + "".trim() });
                        formFields.values.push({ "fieldId": "C8_VALISS" + "___" + seq, "value": filtered[0]["C8_VALISS"] + "".trim() });
                        formFields.values.push({ "fieldId": "C8_VALSOL" + "___" + seq, "value": filtered[0]["C8_VALSOL"] + "".trim() });
                        formFields.values.push({ "fieldId": "C8_TOTAL" + "___" + seq, "value": filtered[0]["C8_TOTAL"] + "".trim() });

                    }
                    seq++
                })
                formAtualizado = tools.atualizaForm(cardCreated.retorno.cardId, codFormCotacoes, formFields);
                log.info(">> tools.ds_ajusteCotacaoOrcamentoCiclo [#92]")
                log.dir(formAtualizado)
            }

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
        log.info(error)
        dataset.addColumn("resultado");
        dataset.addRow([error]);

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
        log.info(">> tools.ds_ajusteCotacaoOrcamentoCiclo"); //Atualiza o formulário auxililar da cotação
        var obj = { "ok": false, "error": "" };

        obj = tools.putFluig("/ecm-forms/api/v2/cardindex/" + formId + "/cards/" + cardID + "", formFields);//tools.putFluig("/ecm-forms/api/v2/cardindex/" + formId + "/cards/" + cardID, formFields);

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
        log.info(">> ds_ajusteCotacaoOrcamentoCiclo <<");
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

        log.info("** ds_ajusteCotacaoOrcamentoCiclo **")
        log.dir(obj);
        return obj;

    },


}