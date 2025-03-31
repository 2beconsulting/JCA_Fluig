
/**
 * busca tabela SRA
 */

var arrColumns = ["RA_MAT", "RA_NOME", "RA_DEPTO", "RA_CC", "RA_FILIAL", "RA_CIC", "RA_TPCONTR", "RA_SITFOLH", "RA_SEXO", "RA_CODFUNC", "RA_DESCFUN", "GESTOR", "RA_ADMISSA", "RA_DEFIFIS", "DESC_EMP", "RA_CTPCD", "RA_UNDFUNC"]
function defineStructure() {
    addColumn("RA_MAT");
    addColumn("RA_NOME");
    addColumn("RA_DEPTO");
    addColumn("RA_CC");
    addColumn("RA_FILIAL");
    addColumn("RA_CIC");
    addColumn("RA_TPCONTR");
    addColumn("RA_SITFOLH");
    addColumn("RA_SEXO");
    addColumn("RA_CODFUNC");
    addColumn("RA_DESCFUN");
    addColumn("GESTOR");
    addColumn("RA_ADMISSA");
    addColumn("RA_DEFIFIS");
    addColumn("DESC_EMP");
    addColumn("RA_CTPCD");
    addColumn("RA_UNDFUNC");


    setKey(["RA_MAT", "RA_FILIAL"]);
    addIndex(["RA_MAT", "RA_NOME", "RA_FILIAL"]);
}

/**
 *
 *
 * @param {number} lastSyncDate
 */
function onSync(lastSyncDate) {

    log.info("<<<<<<<<<<<<<<<<<<<<<<< DS_SRA >>>>>>>>>>>>>>>>>>>>>>>")

    var dataset = DatasetBuilder.newDataset();
    try {
        var clientService = fluigAPI.getAuthorizeClientService();

        var data = {
            headers: {
                tenantId: '01'
            },
            companyId: getValue("WKCompany") + '',
            serviceCode: "protheus_qa",
            endpoint: '/JWSSX301/RAS_MAT',
            method: 'get',
        };

        var result = clientService.invoke(new org.json.JSONObject(data).toString());

        log.info("<<<<<<<<<<<<<<<<<<<<<<< result >>>>>>>>>>>>>>>>>>>>>>>")


        if (result.getResult() == null || result.getResult().isEmpty()) {
            return false
        } else {

            var ret = JSON.parse(result.getResult());
            log.dir(ret)

            log.info("FUNCIONARIOS -> " + ret.DADOS.length)
            var funcoes = carregaFuncoes();
            var departamentos = carregaDepartamentos();
            var gapAfastados = getProtheus("/JWSSRA05");
            log.info("-- gapAfastados");
            log.dir(gapAfastados);

            for (var y = 0; y < ret.DADOS.length; y++) {
                var conteudo = [];
                var excluir = [];

                var row = ret.DADOS[y];
                //log.dir(row);

                row["GESTOR"] = verificaGestor(row["RA_MAT"], departamentos);
                row["RA_DESCFUN"] = processaFuncao(row["RA_FILIAL"].trim().substring(0, 4), row["RA_CODFUNC"].trim(), funcoes);
                row["RA_SITFOLH"] = gapAfastados.filter(function (el) { return el.RA_MAT == row["RA_MAT"] }).length > 0 ? "A" : row["RA_SITFOLH"];

                for (var x = 0; x < arrColumns.length; x++) {
                    var dado = row[arrColumns[x]];
                    if (dado == undefined) {
                        dado = '';
                    }

                    if (row["RA_MSBLQL"] == "2" && row["RA_SITFOLH"].trim() != "D") {
                        conteudo.push(dado)
                    } else {
                        excluir.push(dado)
                    }
                }

                if (conteudo.length > 0) {
                    dataset.addOrUpdateRow(conteudo);
                }

                if (excluir.length > 0) {
                    dataset.deleteRow(excluir);
                }
            }

        }


    } catch (error) {
        throw "Erro ao executar o dataset DS_SRA: " + error.toString() + " / LINHA: " + error.lineNumber;
    }
    log.info(">>>>>>>>>>>>>>>>>>>>>>> DS_SRA <<<<<<<<<<<<<<<<<<<<<<<")
    return dataset;

}

/**
 *
 *
 * @param user
 * @returns {DatasetMobileSync}
 */

function getDepto(MAT_USER) {
    var dataset = DatasetFactory.getDataset("DSRH_JWSSQB01", null, [
        DatasetFactory.createConstraint("MAT_RESP_DEPTO", MAT_USER, MAT_USER, ConstraintType.MUST)
    ], null);

    return dataset.rowsCount > 0;
}

function carregaDepartamentos() {
    var dataset = DatasetFactory.getDataset("DSRH_JWSSQB01", null, null, null);
    var colunas = dataset.getColumnsName();
    var retorno = [];

    for (var i = 0; i < dataset.rowsCount; i++) {
        var obj = {}
        for (var y = 0; y < colunas.length; y++) {
            var coluna = colunas[y];
            obj[coluna] = dataset.getValue(i, coluna).trim();
        }
        retorno.push(obj);
    }

    log.info("-- carregaDepartamentos --");
    //log.dir(retorno);
    return retorno;
}

function carregaFuncoes() {
    var dataset = DatasetFactory.getDataset("DS_SRJ", null, null, null);
    var colunas = dataset.getColumnsName();
    var retorno = [];

    for (var i = 0; i < dataset.rowsCount; i++) {
        var obj = {}
        for (var y = 0; y < colunas.length; y++) {
            var coluna = colunas[y];
            obj[coluna] = dataset.getValue(i, coluna).trim();
        }
        retorno.push(obj);
    }

    log.info("-- carregaFuncoes --");
    //log.dir(retorno);
    return retorno;
}

function verificaGestor(RA_MAT, departamentos) {
    var deptos = departamentos.filter(function (depto) {
        return depto.MAT_RESP_DEPTO == RA_MAT
    })

    return deptos.length > 0;
}

function processaFuncao(RA_FILIAL, RA_CODFUN, funcoes) {
    var funcs = funcoes.filter(function (funcao) {
        return funcao.RJ_FILIAL == RA_FILIAL && funcao.RJ_FUNCAO == RA_CODFUN
    })
    return funcs.length > 0 ? funcs[0]["RJ_DESC"] : ""
}

function getProtheus(endpoint) {
    try {

        var data = {
            companyId: getValue("WKCompany") + '',
            serviceCode: 'protheus_qa',
            endpoint: endpoint,
            method: 'get',
            headers: {
                tenantId: '01'
            },
            timeout: 60000,
            async: false,
            headers: {
                'Content-Type': 'application/json'
            }
        }

        var clientService = fluigAPI.getAuthorizeClientService();

        var result = clientService.invoke(new org.json.JSONObject(data).toString());
        log.dir(result);
        if (result.getResult() != null && !result.getResult().isEmpty()) {

            return JSON.parse(result.getResult());

        }

    } catch (e) {

        return [];

    }

}