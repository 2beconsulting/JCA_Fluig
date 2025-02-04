function createDataset(fields, constraints, sortFields) {
  var dataset = DatasetBuilder.newDataset();
  dataset.addColumn("NumProcesso");
  dataset.addColumn("NumFormulario");
  dataset.addColumn("Id");
  dataset.addColumn("Nome");
  dataset.addColumn("Loja");
  dataset.addColumn("Cod");
  dataset.addColumn("CNPJ");

  var constraints = new Array();
  constraints.push(
    DatasetFactory.createConstraint(
      "metadata#active",
      true,
      true,
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
      var A2_CGC = datasetFilhos.getValue(j, "A2_CGC");

      if (A2_CGC && A2_CGC != "" && A2_CGC != null) {
        dataset.addRow(
          new Array(
            WKNumProces,
            documentId,
            datasetFilhos.getValue(j, "wdk_sequence_id"),
            datasetFilhos.getValue(j, "A2_NOME"),
            datasetFilhos.getValue(j, "A2_LOJA"),
            datasetFilhos.getValue(j, "A2_COD"),
            datasetFilhos.getValue(j, "A2_CGC")
          )
        );
      }
    }
  }

  return dataset;
}
