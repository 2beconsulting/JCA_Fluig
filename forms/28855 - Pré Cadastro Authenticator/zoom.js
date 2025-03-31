function setSelectedZoomItem(selectedItem) {
  /*$("#tabFornecedor tbody > tr")
    .not(":first")
    .each(function (index, element) {
      var id = element.id.split("___")[1];

      if (selectedItem.inputId == `A2_COD___${id}`) {
        $("#A2_LOJA___" + id).val(selectedItem.LOJA);
        window["A2_NOME___" + id].setValue(selectedItem.DESCRICAO);
        window["A2_CGC___" + id].setValue(selectedItem.CNPJ);
      }

      if (selectedItem.inputId == `A2_NOME___${id}`) {
        $("#A2_LOJA___" + id).val(selectedItem.LOJA);
        window["A2_COD___" + id].setValue(selectedItem.CODIGO);
        window["A2_CGC___" + id].setValue(selectedItem.CNPJ);
      }

      if (selectedItem.inputId == `A2_CGC___${id}`) {
        $("#A2_LOJA___" + id).val(selectedItem.A2_LOJA);
        window["A2_COD___" + id].setValue(selectedItem.A2_COD);
        window["A2_NOME___" + id].setValue(selectedItem.A2_NOME);
      }
    });
    */
	var fornecedores = [];
	
	var id = selectedItem.inputId.split("___")[1];

	$("[name^=A2_CGC___]").toArray().forEach(function(el){
		var idx = el.id.split("___")[1];
		if(idx != id){
			fornecedores.push({
				idx 	: idx,
				A2_COD 	: $(`#A2_COD___${idx}`).val()[0],
				A2_LOJA : $(`#A2_LOJA___${idx}`).val()[0],
				A2_NOME : $(`#A2_NOME___${idx}`).val()[0],
				A2_CGC 	: $(`#A2_CGC___${idx}`).val()[0]
			});
		}
		
	})
	
	

    if (selectedItem.inputId == `A2_COD___${id}`) {
    	if(fornecedores.filter(function(el){return el.A2_COD == selectedItem.CODIGO && el.A2_LOJA == selectedItem.LOJA}).length == 0){
    		$("#A2_LOJA___" + id).val(selectedItem.LOJA);
    	      window["A2_NOME___" + id].setValue(selectedItem.DESCRICAO);
    	      window["A2_CGC___" + id].setValue(selectedItem.CNPJ);
    	}
    }

    if (selectedItem.inputId == `A2_NOME___${id}`) {
    	if(fornecedores.filter(function(el){return el.A2_COD == selectedItem.CODIGO && el.A2_LOJA == selectedItem.LOJA}).length == 0){
    		$("#A2_LOJA___" + id).val(selectedItem.LOJA);
    	    window["A2_COD___" + id].setValue(selectedItem.CODIGO);
    	    window["A2_CGC___" + id].setValue(selectedItem.CNPJ);
    	}
    }

    if (selectedItem.inputId == `A2_CGC___${id}`) {
    	if(fornecedores.filter(function(el){return el.A2_COD == selectedItem.A2_COD && el.A2_LOJA == selectedItem.A2_LOJA}).length == 0){
    		$("#A2_LOJA___" + id).val(selectedItem.A2_LOJA);
    	    window["A2_COD___" + id].setValue(selectedItem.A2_COD);
    	    window["A2_NOME___" + id].setValue(selectedItem.A2_NOME);
    	}
    }
}

function removedZoomItem(removedItem) {
 /* $("#tabFornecedor tbody > tr")
    .not(":first")
    .each(function (index, element) {
      var id = element.id.split("___")[1];

      if (removedItem.inputId == `A2_COD___${id}`) {
        $("#A2_LOJA___" + id).val("");
        window["A2_NOME___" + id].clear();
        window["A2_CGC___" + id].clear();
      }

      if (removedItem.inputId == `A2_NOME___${id}`) {
        $("#A2_LOJA___" + id).val("");
        window["A2_COD___" + id].clear();
        window["A2_CGC___" + id].clear();
      }

      if (removedItem.inputId == `A2_CGC___${id}`) {
        $("#A2_LOJA___" + id).val("");
        window["A2_COD___" + id].clear();
        window["A2_NOME___" + id].clear();
      }
    });*/
	var id = removedItem.inputId.split("___")[1];

    if (removedItem.inputId == `A2_COD___${id}`) {
      $("#A2_LOJA___" + id).val("");
      window["A2_NOME___" + id].clear();
      window["A2_CGC___" + id].clear();
    }

    if (removedItem.inputId == `A2_NOME___${id}`) {
      $("#A2_LOJA___" + id).val("");
      window["A2_COD___" + id].clear();
      window["A2_CGC___" + id].clear();
    }

    if (removedItem.inputId == `A2_CGC___${id}`) {
      $("#A2_LOJA___" + id).val("");
      window["A2_COD___" + id].clear();
      window["A2_NOME___" + id].clear();
    }
}
