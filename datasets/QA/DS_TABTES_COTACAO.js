function createDataset(fields, constraints, sortFields) {
  var dataset = DatasetBuilder.newDataset();
  dataset.addColumn("A2_COD");
  dataset.addColumn("A2_LOJA");
  dataset.addColumn("A2_CGC");
  dataset.addColumn("B1_COD");
  dataset.addColumn("TES_CODIGO");
  dataset.addColumn("TES_COMPRADOR");

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
        "tabTES",
        "tabTES",
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
            datasetFilhos.getValue(j, "TES_A2_COD"),
            datasetFilhos.getValue(j, "TES_A2_LOJA"),
            datasetFilhos.getValue(j, "TES_A2_CGC"),
            datasetFilhos.getValue(j, "TES_B1_COD"),
            datasetFilhos.getValue(j, "TES_CODIGO"),
            datasetFilhos.getValue(j, "TES_COMPRADOR")
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
