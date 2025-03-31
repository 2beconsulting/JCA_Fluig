function enableFields(form){ 
	setEnable(form, false);
	form.setEnabled("cotacao_encerramento",true)
	form.setEnabled("filtrar_mapa",true)
	
	if(getValue("WKNumState") == 5 || getValue("WKNumState") == 23){
		form.setEnabled("TES_A2_COD",true)
		form.setEnabled("TES_A2_LOJA",true)
		form.setEnabled("TES_A2_CGC",true)
		form.setEnabled("TES_B1_COD",true)
		form.setEnabled("TES_CODIGO",true)
		form.setEnabled("TES_COMPRADOR",true)
		
        var tabTES = form.getChildrenIndexes("tabTES")
        tabTES.forEach(function(idx){
    		form.setEnabled("TES_A2_COD" 	+ "___" + idx, true)
            form.setEnabled("TES_A2_LOJA" 	+ "___" + idx, true)
            form.setEnabled("TES_A2_CGC" 	+ "___" + idx, true)
            form.setEnabled("TES_B1_COD" 	+ "___" + idx, true)
        	form.setEnabled("TES_CODIGO" 	+ "___" + idx, true)
            form.setEnabled("TES_COMPRADOR" + "___" + idx, true)
        })
	}
}