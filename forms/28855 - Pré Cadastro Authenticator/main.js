$(document).ready(() => {
  toggleTableHeader();

  let $btnAdd = document.getElementById("btnAddFornecedor");
  $btnAdd.addEventListener("click", () => {
    this.addChild("tabFornecedor");
  });

  const result = getFormMode();
  console.log("result", result);

  if (result == "ADD") {
    $("#btnAddTableForn").show();
    $("#btnDelete").show();
    $(".btnDelete").show();
  } else if (result == "MOD") {
    $("#btnAddTableForn").show();
    $("#btnDelete").show();
    $(".btnDelete").show();
  } else {
    $("#btnAddTableForn").hide();
    $("#btnDelete").hide();
    $(".btnDelete").hide();
  }
});

function addChild(tablename = "") {
  wdkAddChild(tablename);
  toggleTableHeader();
}

function deleteRow(element) {
  fnWdkRemoveChild(element);
  toggleTableHeader();
}

function toggleTableHeader() {
  const table = document.getElementById("tabFornecedor");
  const tbody = table.getElementsByTagName("tbody")[0];
  const thead = table.getElementsByTagName("thead")[0];

  if (tbody.rows.length > 1) {
    thead.style.display = "table-header-group";
    $("#noResult").hide();
  } else {
    thead.style.display = "none";
    $("#noResult").show();
  }
}

var beforeSendValidate = function(numState, nextState) {
  limpaDuplicidade();
  return true;
}

function limpaDuplicidade(){
	var fornecedores = [];
	
	$("[name^=A2_CGC___]").toArray().forEach(function(el){
		if(fornecedores.includes(el.value)){
			deleteRow(el);
		}
		else{
			fornecedores.push(el.value);
		}
	})
}