function validateForm(form) {
  if (
    form.getValue("emailRegister") == "" ||
    form.getValue("emailRegister") == null ||
    form.getValue("emailRegister") == undefined
  ) {
    throw "Preencher o campo email.";
  }

  if (
    form.getValue("passwordRegister") == "" ||
    form.getValue("passwordRegister") == null ||
    form.getValue("passwordRegister") == undefined
  ) {
    throw "Preencher o campo senha.";
  }

  if (
    form.getValue("validitySession") == "" ||
    form.getValue("validitySession") == null ||
    form.getValue("validitySession") == undefined
  ) {
    throw "Preencher o campo validade sessão.";
  }

  if (
    form.getValue("passwordRegister") == "" ||
    form.getValue("passwordRegister") == null ||
    form.getValue("passwordRegister") == undefined
  ) {
    throw "Preencher o campo senha.";
  }

  // var indexes = form.getChildrenIndexes("tabFornecedor");
  // var rowValues = [];
  // var occurrences = {};

  // if (indexes.length > 0) {
  //   indexes.forEach(function (id) {
  //     var codValue = form.getValue("A2_COD___" + id);
  //     var lojaValue = form.getValue("A2_LOJA___" + id);

  //     if (codValue == null || codValue == "" || codValue == undefined) {
  //       throw "Preencher o campo código.";
  //     }

  //     if (lojaValue == null || lojaValue == "" || lojaValue == undefined) {
  //       throw "Preencher o campo loja.";
  //     }

  //     var key = codValue + "-" + lojaValue;

  //     if (occurrences[key]) {
  //       throw "Valores repetidos na linha: Código e Loja já foram utilizados.";
  //     }

  //     occurrences[key] = true;
  //     rowValues.push({ cod: codValue, loja: lojaValue });

  //     if (
  //       form.getValue("A2_NOME___" + id) == null ||
  //       form.getValue("A2_NOME___" + id) == "" ||
  //       form.getValue("A2_NOME___" + id) == undefined
  //     ) {
  //       throw "Preencher o campo descrição.";
  //     }

  //     if (
  //       form.getValue("A2_CGC___" + id) == null ||
  //       form.getValue("A2_CGC___" + id) == "" ||
  //       form.getValue("A2_CGC___" + id) == undefined
  //     ) {
  //       throw "Preencher o campo CNPJ.";
  //     }
  //   });
  // }
}
