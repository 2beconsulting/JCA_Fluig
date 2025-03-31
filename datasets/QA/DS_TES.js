function defineStructure() {

  addColumn("BLOQUEADO");
  addColumn("CFOP");
  addColumn("CODIGO");
  addColumn("DESCRICAO");
  addColumn("ESTOQUE");
  addColumn("FINANCEIRO");
  addColumn("TIPO");
  addColumn("FINALIDADE");
  addColumn("DISPLAY");

  setKey(["CODIGO"]);
  addIndex(["CODIGO"]);
}
function createDataset(fields, constraints, sortFields) {
  try {
    var dataset = DatasetBuilder.newDataset();
    var clientService = fluigAPI.getAuthorizeClientService();

    dataset.addColumn("BLOQUEADO");
    dataset.addColumn("CFOP");
    dataset.addColumn("CODIGO");
    dataset.addColumn("DESCRICAO");
    dataset.addColumn("ESTOQUE");
    dataset.addColumn("FINANCEIRO");
    dataset.addColumn("TIPO");
    dataset.addColumn("FINALIDADE");
    dataset.addColumn("DISPLAY");

    var endpoint = encodeURI("/JWSSF401/2/ ")
    var data = {
      companyId: getValue("WKCompany") + "",
      serviceCode: "PROTHEUS_SERVICE_REST",
      endpoint: endpoint,
      method: "get",
    };

    var result = clientService.invoke(new org.json.JSONObject(data).toString());
    var resultJson = JSON.parse(result.result);

    for (var i = 0; i < resultJson.length; i++) {
      dataset.addRow(
        new Array(
          resultJson[i]["BLOQUEADO"],
          resultJson[i]["CFOP"],
          resultJson[i]["CODIGO"],
          resultJson[i]["DESCRICAO"],
          resultJson[i]["ESTOQUE"],
          resultJson[i]["FINANCEIRO"],
          resultJson[i]["TIPO"],
          resultJson[i]["FINALIDADE"],
          resultJson[i]["CODIGO"] + " | " + resultJson[i]["FINALIDADE"]
        )
      );
    }
  } catch (error) {
    throw (
      "Erro ao executar o dataset: " +
      error.toString() +
      " / LINHA: " +
      error.lineNumber
    );
  }

  return dataset;
}



function onSync(lastSyncDate) {

  try {
    var dataset = DatasetBuilder.newDataset();
    var clientService = fluigAPI.getAuthorizeClientService();

    var endpoint = encodeURI("/JWSSF401/2/ ")
    var data = {
      companyId: getValue("WKCompany") + "",
      serviceCode: "PROTHEUS_SERVICE_REST",
      endpoint: endpoint,
      method: "get",
    };

    var result = clientService.invoke(new org.json.JSONObject(data).toString());
    var resultJson = JSON.parse(result.result);

    for (var i = 0; i < resultJson.length; i++) {
      dataset.addOrUpdateRow(
        [
          resultJson[i]["BLOQUEADO"],
          resultJson[i]["CFOP"],
          resultJson[i]["CODIGO"],
          resultJson[i]["DESCRICAO"],
          resultJson[i]["ESTOQUE"],
          resultJson[i]["FINANCEIRO"],
          resultJson[i]["TIPO"],
          resultJson[i]["FINALIDADE"],
          resultJson[i]["CODIGO"] + " | " + resultJson[i]["FINALIDADE"]
        ]
      );
    }
  } catch (error) {
    throw (
      "Erro ao executar o dataset: " +
      error.toString() +
      " / LINHA: " +
      error.lineNumber
    );
  }

  return dataset;

}

function onMobileSync(user) {

}