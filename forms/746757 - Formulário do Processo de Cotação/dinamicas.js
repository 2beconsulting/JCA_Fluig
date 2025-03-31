var dinamicas = {
	init: function(){
		$(".acompanhamento").hide();
		
		switch(WKNumState){
			case 0:
			case 15:
				// $("#mapa_cotacao").hide();
			break;
			case 5:
				$(".acompanhamento").show();
				break;
		}
		tools.fornecedores.carregaDados()
		tools.produtos.carrega()
		tools.mapa.habilita();
		tools.TES.init();
		
	}
}