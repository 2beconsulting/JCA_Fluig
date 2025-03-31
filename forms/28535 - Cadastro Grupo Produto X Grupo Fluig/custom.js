function setSelectedZoomItem(selectedItem){
	if(selectedItem.inputId == 'BM_DESC'){
		$("#BM_GRUPO").val(selectedItem.BM_GRUPO)
		$("#BM_CONTA").val(selectedItem.BM_CONTA)
	}
	else if(selectedItem.inputId == 'groupDescription'){
		$("#groupId").val(selectedItem.groupId)
	}
}

function removedZoomItem(removedItem){
	if(removedItem.inputId == 'BM_DESC'){
		$("#BM_GRUPO").val("")
		$("#BM_CONTA").val("")
	}
	else if(removedItem.inputId == 'groupDescription'){
		$("#groupId").val("")
	}
}