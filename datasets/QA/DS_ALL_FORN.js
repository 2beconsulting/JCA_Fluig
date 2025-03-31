function createDataset(fields, constraints, sortFields) {
  var dataset = DatasetBuilder.newDataset();
  dataset.addColumn("Codigo");
  dataset.addColumn("Loja");
  dataset.addColumn("Descricao");
  dataset.addColumn("CNPJ");
  //
  dataset.addColumn("UF");
  dataset.addColumn("CondPagamento");
  dataset.addColumn("TipoFrete");
  dataset.addColumn("ValorFrete");
  dataset.addColumn("Validade");

  var solicitacao = getConstraintValue(constraints, "solicitacao");

  var constraints = new Array();

  constraints.push(
    DatasetFactory.createConstraint(
      "metadata#active",
      true,
      true,
      ConstraintType.MUST
    )
  );

  constraints.push(
    DatasetFactory.createConstraint(
      "metadata#id",
      solicitacao,
      solicitacao,
      ConstraintType.MUST
    )
  );

  var datasetPrincipal = DatasetFactory.getDataset(
    "DSFormulariodoProcessodeCotacao",
    null,
    constraints,
    null
  );

  for (var i = 0; i < datasetPrincipal.rowsCount; i++) {
    var WKNumProces = datasetPrincipal.getValue(i, "WKNumProces");
    var documentId = datasetPrincipal.getValue(i, "metadata#id");
    var documentVersion = datasetPrincipal.getValue(i, "metadata#version");

    var constraintsFilhos = new Array();

    constraintsFilhos.push(
      DatasetFactory.createConstraint(
        "tablename",
        "tabFornecedor",
        "tabFornecedor",
        ConstraintType.MUST
      )
    );

    constraintsFilhos.push(
      DatasetFactory.createConstraint(
        "metadata#id",
        documentId,
        documentId,
        ConstraintType.MUST
      )
    );

    constraintsFilhos.push(
      DatasetFactory.createConstraint(
        "metadata#version",
        documentVersion,
        documentVersion,
        ConstraintType.MUST
      )
    );

    var datasetFilhos = DatasetFactory.getDataset(
      "DSFormulariodoProcessodeCotacao",
      null,
      constraintsFilhos,
      null
    );

    for (var j = 0; j < datasetFilhos.rowsCount; j++) {
      if (documentId == solicitacao) {
        dataset.addRow(
          new Array(
            datasetFilhos.getValue(j, "A2_COD"),
            datasetFilhos.getValue(j, "A2_LOJA"),
            datasetFilhos.getValue(j, "A2_NOME"),
            datasetFilhos.getValue(j, "A2_CGC"),
            //
            datasetFilhos.getValue(j, "A2_EST"),
            datasetFilhos.getValue(j, "A2_COND"),
            datasetFilhos.getValue(j, "A2_TPFRETE"),
            datasetFilhos.getValue(j, "A2_VALFRE"),
            datasetFilhos.getValue(j, "A2_VALIDA")
          )
        );
      }
    }
  }

  return dataset;
}

function getConstraintValue(constraints, fieldName) {
  for (var i = 0; i < constraints.length; i++) {
    if (constraints[i].fieldName == fieldName) {
      return constraints[i].initialValue;
    }
  }
  return "";
}
