
function defineStructure() {
  addColumn("BLOQUEADO");
  addColumn("CODIGO");
  addColumn("CONDICAO");
  addColumn("DESCRICAO");
  addColumn("DISPLAY");
  addColumn("TIPO");

  setKey(["CODIGO"]);
  addIndex(["CODIGO"]);
}
function onSync(lastSyncDate) {

  try {
    var dataset = DatasetBuilder.newDataset();
    var clientService = fluigAPI.getAuthorizeClientService();
    var endpoint = encodeURI("/JWSSE401/2/ ")
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
          resultJson[i]["CODIGO"],
          resultJson[i]["CONDICAO"],
          resultJson[i]["DESCRICAO"],
          resultJson[i]["DESCRICAO"]+ " | "+ resultJson[i]["CODIGO"] ,
          resultJson[i]["TIPO"]
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

function onMobileSync(user) {

}

function createDataset(fields, constraints, sortFields) {
  try {
    var dataset = DatasetBuilder.newDataset();
    var clientService = fluigAPI.getAuthorizeClientService();

    dataset.addColumn("BLOQUEADO");
    dataset.addColumn("CODIGO");
    dataset.addColumn("CONDICAO");
    dataset.addColumn("DESCRICAO");
    dataset.addColumn("TIPO");

    var data = {
      companyId: getValue("WKCompany") + "",
      serviceCode: "PROTHEUS_SERVICE_REST",
      endpoint: "/JWSSE401/2/DIAS",
      method: "get",
    };

    var result = clientService.invoke(new org.json.JSONObject(data).toString());
    var resultJson = JSON.parse(result.result);

    for (var i = 0; i < resultJson.length; i++) {
      dataset.addRow(
        new Array(
          resultJson[i]["BLOQUEADO"],
          resultJson[i]["CODIGO"],
          resultJson[i]["CONDICAO"],
          resultJson[i]["DESCRICAO"],
          resultJson[i]["TIPO"]
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
