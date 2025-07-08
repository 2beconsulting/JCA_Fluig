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
 * Adiciona e regulariza fornecedores especificos na cotaçaõ do processo pai e do processo filho
 * @uso     recuparar o id da ficha das cotações no processo principal
 *          recuparar o id do documento da cotação no processo filho
 *          recuperar os valores do ciclo, empresa e cotação
 * 
 */
function createDataset(fields, constraints, sortFields) {

    log.info("ds_ajusteCotacaoIncluiFornecedorFixo")
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

    var CODFORMPROCESSOPRINCIPAL = ""
    var IDFICHACOTACAOPRINCIPAL = ""
    var CODFORMPROCESSOFILHO = ""
    var IDFICHACOTACAOFILHO = ""


    var fornecedor = "008629"
    var lojaFornecedor = "04"
    var CICLODESTINO = "3"
    var IDXREF = 1223; /** id da linha a ser criada */
    var idEmpresa = "00100289"
    var c8Num = "000365"
    var c1Num = "001228"

    log.info("ds_ajusteCotacaoIncluiFornecedorFixo >> new Dataset")
    var dataset = DatasetBuilder.newDataset();
    try {

        var cotacaoFields = { "values": [] };
        var fornecedores = []
        var idx = 1


        var obj = {
            "ok": false,
            "error": ""
        }
        var SC = tools.getProtheus("/JWSSC102/" + idEmpresa + "/" + c1Num, idEmpresa)
        log.dir(SC)
        var produtos = []
        if (SC.ok) {
            SC.retorno.DADOS.forEach(function (el) {
                var C1_PRODUTO = el.C1_PRODUTO + "";
                C1_PRODUTO = C1_PRODUTO.trim();
                if (C1_PRODUTO.length > 8)
                    produtos.push({ "C8_PRODUTO": "" + C1_PRODUTO });
            })
        }
        var obj = {
            "COTACAO": [{
                "EMPRESA": idEmpresa,
                "C8_NUMERO": c8Num,
                "FORNECE": []
            }]
        }

        obj.COTACAO[0].FORNECE.push({
            "C8_FORNECE": fornecedor + lojaFornecedor,
            "C8_COND": "001",
            "ITEM": produtos
        })

        log.info(">> ds_ajusteCotacaoIncluiFornecedorFixo >> JWSSC802");
        log.dir(obj);

        retorno = tools.postProtheus("/JWSSC802/1", obj, idEmpresa)

        // cotacao = tools.getProtheus("/JWSSC803/1/" + idEmpresa + "/" + c8Num, idEmpresa);

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
        log.info(">> ds_ajusteCotacaoIncluiFornecedorFixo <<");
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

        log.info("** ds_ajusteCotacaoIncluiFornecedorFixo **")
        log.dir(obj);
        return obj;

    },
    postProtheus: function (endpoint, params, idEmpresa) {
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
                    'tenantId': '01,' + idEmpresa
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

    }


}