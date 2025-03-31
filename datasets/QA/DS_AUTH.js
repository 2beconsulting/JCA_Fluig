function createDataset(fields, constraints, sortFields) {
  var dataset = DatasetBuilder.newDataset();

  dataset.addColumn("Id");
  dataset.addColumn("Email");
  dataset.addColumn("Senha");
  dataset.addColumn("ValidadeSessao");
  dataset.addColumn("UltimoAcesso");
  dataset.addColumn("Token");
  dataset.addColumn("CodigoFornecedor");
  dataset.addColumn("LojaFornecedor");
  dataset.addColumn("DescricaoFornecedor");
  dataset.addColumn("CnpjFornecedor");

  var email = getConstraintValue(constraints, "email");
  var token = getConstraintValue(constraints, "token");
  var type = getConstraintValue(constraints, "type");

  log.info("email, token, type");
  log.dir(email)
  log.dir(token)
  log.dir(type)

  var baseConstraints = [
    DatasetFactory.createConstraint("metadata#active", true, true, ConstraintType.MUST)
  ];

  var datasetPrincipal = DatasetFactory.getDataset("ds_cadastro_conta", null, baseConstraints, null);

  for (var i = 0; i < datasetPrincipal.rowsCount; i++) {
    var documentId = datasetPrincipal.getValue(i, "metadata#id");
    var documentVersion = datasetPrincipal.getValue(i, "metadata#version");
    var emailRegister = datasetPrincipal.getValue(i, "emailRegister");
    var passwordRegister = datasetPrincipal.getValue(i, "passwordRegister");
    var validitySession = datasetPrincipal.getValue(i, "validitySession");
    var lastAcess = datasetPrincipal.getValue(i, "lastAcess");
    var tokenRegister = datasetPrincipal.getValue(i, "tokenRegister");

    if (type == "LOGIN" && email == emailRegister) {
      var childConstraints = [
        DatasetFactory.createConstraint("tablename", "tabFornecedor", "tabFornecedor", ConstraintType.MUST),
        DatasetFactory.createConstraint("metadata#id", documentId, documentId, ConstraintType.MUST),
        DatasetFactory.createConstraint("metadata#version", documentVersion, documentVersion, ConstraintType.MUST)
      ];

      var datasetFilhos = DatasetFactory.getDataset("ds_cadastro_conta", null, childConstraints, null);

      for (var j = 0; j < datasetFilhos.rowsCount; j++) {
        dataset.addRow([
          documentId,
          emailRegister,
          passwordRegister,
          validitySession,
          lastAcess,
          tokenRegister,
          datasetFilhos.getValue(j, "A2_COD"),
          datasetFilhos.getValue(j, "A2_LOJA"),
          datasetFilhos.getValue(j, "A2_NOME"),
          datasetFilhos.getValue(j, "A2_CGC")
        ]);
      }
      if (dataset.rowsCount > 0)
        return dataset;
    }
  }

  for (var i = 0; i < datasetPrincipal.rowsCount; i++) {
    var documentId = datasetPrincipal.getValue(i, "metadata#id");
    var documentVersion = datasetPrincipal.getValue(i, "metadata#version");
    var emailRegister = datasetPrincipal.getValue(i, "emailRegister");
    var passwordRegister = datasetPrincipal.getValue(i, "passwordRegister");
    var validitySession = datasetPrincipal.getValue(i, "validitySession");
    var lastAcess = datasetPrincipal.getValue(i, "lastAcess");
    var tokenRegister = datasetPrincipal.getValue(i, "tokenRegister");

    if (token == tokenRegister) {

      var childConstraints = [
        DatasetFactory.createConstraint("tablename", "tabFornecedor", "tabFornecedor", ConstraintType.MUST),
        DatasetFactory.createConstraint("metadata#id", documentId, documentId, ConstraintType.MUST),
        DatasetFactory.createConstraint("metadata#version", documentVersion, documentVersion, ConstraintType.MUST)
      ];

      var datasetFilhos = DatasetFactory.getDataset("ds_cadastro_conta", null, childConstraints, null);
      for (var j = 0; j < datasetFilhos.rowsCount; j++) {
        dataset.addRow([
          documentId,
          emailRegister,
          passwordRegister,
          validitySession,
          lastAcess,
          tokenRegister,
          datasetFilhos.getValue(j, "A2_COD"),
          datasetFilhos.getValue(j, "A2_LOJA"),
          datasetFilhos.getValue(j, "A2_NOME"),
          datasetFilhos.getValue(j, "A2_CGC")
        ]);
      }
      if (dataset.rowsCount > 0)
        return dataset;
    }
  }
}

function getConstraintValue(constraints, fieldName) {
  for (var i = 0; i < constraints.length; i++) {
    if (constraints[i].fieldName == fieldName) {
      return constraints[i].initialValue;
    }
  }
  return "";
}
