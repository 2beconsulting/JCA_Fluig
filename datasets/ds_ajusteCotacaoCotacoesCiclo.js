function defineStructure() {

}
function onSync(lastSyncDate) {

}
function createDataset(fields, constraints, sortFields) {

    log.info("ds_ajusteCotacaoCotacoesCiclo");

    /**
     * PROD
        var mlFormCotacao = "ML001742";
        var mlTabCotacao = "ML001743";
     * QA
        var mlFormCotacao = "ML001990";
        var mlTabCotacao = "ML001991";
     */
    /**
     * ajusta as cotações no processo de cotação para regularizar as linhas 
     */

    var codFormCotScs = "746756"; //form de cotação nas SCs
    var codFichaCotSC = "898431"; //ficha de origem da cotação na SC para referencia
    var codFormCotCotacao = "746754"; //ficha de cotações na cotação
    var codFichaDestinoCotCotacao = "890925"; //form de cotacoes na cotação

    log.info("ds_ajusteCotacaoCotacoesCiclo")

    var dataset = DatasetBuilder.newDataset();
    try {

        var dsCotCotacoes = tools.getFluig("/ecm-forms/api/v2/cardindex/" + codFormCotCotacao + "/cards/" + codFichaDestinoCotCotacao + "/childrens?page=1&pageSize=9999999");
        var dsCotScs = tools.getFluig("/ecm-forms/api/v2/cardindex/" + codFormCotScs + "/cards/" + codFichaCotSC + "/childrens?page=1&pageSize=9999999");
        log.info(">> tools.ds_ajusteCotacaoCotacoesCiclo [#1371]")

        if (!dsCotCotacoes.ok) {
            log.info("================> ds_ajusteCotacaoCotacoesCiclo ERRO" + e.toString());
            log.info("================> LINHA" + e.lineNumber);
            log.dir(dsCotCotacoes)

            dataset.addColumn("result")
            dataset.addColumn("erro");
            dataset.addRow(["nok", e.message + e.lineNumber + " - "]);
            return dataset;
        }
        dsCotCotacoes = dsCotCotacoes.retorno
        dsCotScs = dsCotScs.retorno
        var formFields = {
            "values": []
        };
        for (var i = 0; i < dsCotScs.items.length; i++) {
            var row = dsCotScs.items[i].values;
            row = tools.getValueInRowField(row)
            rowValues = row.values;

            seq = row.index;
            linhaCot = tools.findValueInCotacoes(dsCotCotacoes, rowValues)
            if (linhaCot.status) {
                rowValues = linhaCot.dado;
            }
            formFields.values.push({ "fieldId": "C8_ITEM" + "___" + seq, "value": "" + rowValues["C8_ITEM"] });
            formFields.values.push({ "fieldId": "C8_CICLO" + "___" + seq, "value": "" + rowValues["C8_CICLO"] });
            formFields.values.push({ "fieldId": "C8_PRODUTO" + "___" + seq, "value": "" + rowValues["C8_PRODUTO"] });
            formFields.values.push({ "fieldId": "C8_UM" + "___" + seq, "value": "" + rowValues["C8_UM"] });
            formFields.values.push({ "fieldId": "C8_FORNECE" + "___" + seq, "value": "" + rowValues["C8_FORNECE"] });
            formFields.values.push({ "fieldId": "C8_LOJA" + "___" + seq, "value": "" + rowValues["C8_LOJA"] });
            formFields.values.push({ "fieldId": "C8_VALIDA" + "___" + seq, "value": "" + rowValues["C8_VALIDA"] });
            formFields.values.push({ "fieldId": "C8_QUANT" + "___" + seq, "value": "" + rowValues.C8_QUANT });
            formFields.values.push({ "fieldId": "C8_DIFAL" + "___" + seq, "value": "" + rowValues["C8_DIFAL"] });
            formFields.values.push({ "fieldId": "C8_PRECO" + "___" + seq, "value": "" + rowValues.C8_PRECO });
            formFields.values.push({ "fieldId": "C8_PRAZO" + "___" + seq, "value": "" + rowValues.C8_PRAZO });
            formFields.values.push({ "fieldId": "C8_VALICM" + "___" + seq, "value": "" + rowValues["C8_VALICM"] });
            formFields.values.push({ "fieldId": "C8_VALIPI" + "___" + seq, "value": "" + rowValues["C8_VALIPI"] });
            formFields.values.push({ "fieldId": "C8_VALISS" + "___" + seq, "value": "" + rowValues["C8_VALISS"] });
            formFields.values.push({ "fieldId": "C8_TOTAL" + "___" + seq, "value": "" + rowValues.C8_TOTAL });
        }

        /* var integrado = tools.putFluig("/ecm-forms/api/v2/cardindex/"
             + codFormCotCotacao
             + "/cards/" + codFichaDestinoCotCotacao
             , formFields);
         log.info(">> ds_ajusteCotacaoCotacoesCiclo");
         log.dir(integrado);*/
        if (false || integrado.ok) {
            dataset.addColumn("result");
            dataset.addRow(["" + JSON.stringify(formFields)]);
            return dataset
        }

        dataset.addColumn("ERROR");
        dataset.addRow(["" + JSON.stringify(formFields)]);
        return dataset
    } catch (error) {
        log.info(error)
        dataset.addColumn("ERROR");
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
        log.info(">> tools.ds_ajusteCotacaoCotacoesCiclo"); //Atualiza o formulário auxililar da cotação
        var obj = { "ok": false, "error": "" };

        obj = tools.putFluig("/ecm-forms/api/v2/cardindex/" + formId + "/cards/" + cardID + "", formFields);//tools.putFluig("/ecm-forms/api/v2/cardindex/" + formId + "/cards/" + cardID, formFields);

        return obj;
    },
    findValueInCotacoes: function (dsCotCotacoes, rowValues) {
        var objeto = {
            status: false,
            dado: null
        }
        for (var i = 0; i < dsCotCotacoes.items.length; i++) {
            var rowCot = dsCotCotacoes.items[i].values;
            rowCot = tools.getValueInRowField(rowCot)
            rowCotValues = rowCot.values
            if (rowValues['C8_ITEM'] == rowCotValues["C8_ITEM"]
                && rowValues['C8_PRODUTO'] == rowCotValues["C8_PRODUTO"]
                && rowValues['C8_FORNECE'] == rowCotValues["C8_FORNECE"]
                && rowValues['C8_LOJA'] == rowCotValues["C8_LOJA"]) {
                objeto.dado = rowCotValues;
                objeto.status = true;
                return objeto;
            }
        }
        return objeto
    },
    getValueInRowField: function (row) {

        var value = {
            index: 0,
            values: {}
        }
        if (row && row.length > 0) {
            for (var i = 0; i < row.length; i++) {
                var fieldId = row[i].fieldId;
                var fieldValue = row[i].value;
                if (fieldId == "rowId") {
                    value.index = fieldValue
                    continue
                }
                var idCampo = fieldId.split("___");
                if (idCampo.length > 1) {
                    value.values[idCampo[0]] = fieldValue;
                }
            }
        }

        return value;
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
        log.info(">> ds_ajusteCotacaoCotacoesCiclo <<");
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

        log.info("** ds_ajusteCotacaoCotacoesCiclo **")
        log.dir(obj);
        return obj;

    },
    getFluig: function (endpoint) {
        log.info(">> integra.getFluig <<");
        //log.info("-- endpoint: " + endpoint);
        //log.dir(params)

        var obj = { "ok": false, "retorno": null, "error": null };

        try {

            var data = {
                companyId: getValue("WKCompany") + '',
                serviceCode: 'FLUIG_REST',
                endpoint: endpoint,
                method: 'get',
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            var clientService = fluigAPI.getAuthorizeClientService();

            var result = clientService.invoke(new org.json.JSONObject(data).toString());
            log.info("** integra.getFluig **");
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
        log.info("** integra.postFormFluig **");
        return obj;

    },


}