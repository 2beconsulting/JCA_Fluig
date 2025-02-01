var myLoading = FLUIGC.loading(window);
var aDados = {
		solicitacao	:[],
		produtos	:[],
		fornecedores:[],
		cotacoes	:[]
};

var fluigMapa = {}

var INICIO0 = 0
var INICIO1 = 1
var APROVAR_SOLICITACAO = 2
var REVISAR_SOLICITACAO = 3
var PREENCHER_SC = 65
var RESPONDER_COMPRAS = 88
var ANALISAR_COTACAO_VENCEDORA = 26
var APROVAR_MENOR_VALOR = 40
var REVISAR_VALORES = 35
var APROVAR_COTACAO = 121
var JURIDICO = 110
var RESPONDER_JURIDICO = 112
var AVALIAR_SOLICITACAO = 71

var TRATAR_ERRO = 21

$(document).ready(function(){
	dinamica.init();
	
    if(WKNumState != INICIO0 && WKNumState != INICIO1 && WKNumState != REVISAR_SOLICITACAO && WKNumState != TRATAR_ERRO && WKNumState != 260){
        $('.hideInserir').hide()
        $('.hideLixeira').hide()
    }

	let inserirRateio = $('#inserirRateio')
    inserirRateio.on('click', () => {
        if(WKNumState == INICIO0 || WKNumState == INICIO1 || WKNumState == REVISAR_SOLICITACAO || WKNumState == TRATAR_ERRO  || WKNumState == 260){
            let index = wdkAddChild('tabelaRateio');
            MaskEvent.init();
        }
    })

	let havera_rateio = $('input[name=havera_rateio]')
	havera_rateio.on('change', (ev) => {
		let rateio = ev.target.value;
		$('#divTabelaRateio').hide();
		$("[tablename='tabelaRateio'] tbody tr:not(:first-child)").remove();
		if(rateio == 'sim') $('#divTabelaRateio').show();
	})

    let decisaoAprovador = $('input[name=decisaoAprovador]')
    decisaoAprovador.on('change', (ev) => {
        let aprovacao = ev.target.value
        $('#divMotivoReprovacaoAprovador').hide()
        $('#descReprovAprov').val('')
        if(aprovacao == 'nao' || aprovacao == 'retornar') $('#divMotivoReprovacaoAprovador').show()
    })
    
    let decisaoAprovadorValorMenor = $('input[name=decisaoAprovadorValorMenor]')
    decisaoAprovadorValorMenor.on('change', (ev) => {
        let aprovacao = ev.target.value
        $('#divMotivoReprovacaoAprovadorValorMenor').hide()
        $('#descReprovAprovValorMenor').val('')
        if(aprovacao == 'nao' || aprovacao == 'retornar' || aprovacao == 'compras') $('#divMotivoReprovacaoAprovadorValorMenor').show()
    })
    
    let decisaoAprovadorCotacao = $('input[name=decisaoAprovadorCotacao]')
    decisaoAprovadorCotacao.on('change', (ev) => {
        let aprovacao = ev.target.value
        $('#divMotivoReprovacaoAprovadorCotacao').hide()
        $('#descReprovAprovCotacao').val('')
        if(aprovacao == 'nao' || aprovacao == 'retornar') $('#divMotivoReprovacaoAprovadorCotacao').show()
    })
})

function somarValores(){

    setTimeout(() => {

        let valor_total = 0

        let tabelaProduto = $("[tablename='tabelaProduto'] tbody tr")
        tabelaProduto.each(function(index, element){

            let quantidade = tabelaProduto.eq(index).find("[id^='produto_qtd']").val()
            let produto_qtd =  quantidade != '' ? parseInt(quantidade) : 0

            let valorUnitario = tabelaProduto.eq(index).find("[id^='produto_vlUnitario']").val()
            let produto_vlUnitario = valorUnitario != '' ? currencyToNumber(valorUnitario) : 0

            var produto_vlTotal = produto_qtd * produto_vlUnitario

            tabelaProduto.eq(index).find("[id^='produto_vlTotal']").val(numberToCurrency(produto_vlTotal))

            valor_total = valor_total + produto_vlTotal
        })

        $('#valor_total').val(numberToCurrency(valor_total))
    
    }, 500)

}
function currencyToNumber(numero) {
	if(numero!=null && numero!=undefined && numero!=''){
		numero = numero.split(',')
		numero[0] = numero[0].split('.').join('')
		return parseFloat(numero.join('.'))
	}else{
		return 0
	}
}
function numberToCurrency(numero) {
    var numero = parseFloat(numero).toFixed(2).split('.')
    numero[0] = numero[0].split(/(?=(?:...)*$)/).join('.')
    return numero.join(',')
}
