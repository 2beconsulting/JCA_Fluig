js = {
    "formData": {
        "idSolicitante": "admin", //fixo
        "loginSolicitante": "admin",//fixo
        "emailSolicitante": "fluig@jcatlm.com.br",//fixo
        "nome": "Admin Fluig",//fixo
        "matriculaSolicitante": "admin",//fixo
        "dataAbertura": "05/02/2025",//data de integração, DD/MM/AAAA
        "solicitanteSC": "Admin Fluig",//fixo
        "_nome": "Admin Fluig",//fixo
        "_matriculaSolicitante": "admin",//fixo
        "_dataAbertura": "2025-02-05",//data de integração, AAAA-MM-DDD
        "unidade": "Corporativo",//Unidade
        "diretoria_resposavel": "Compliance Riscos e Regulatorio", //Diretoria
        "regional": "Regional SP",//Regional
        "telefone_empresa": "(14) 13413-4134",//Telefone empresa solicitante
        "ramal_empresa": "244",//Telefone ramal
        "displayEmpresa": "00100289 | SIT MACAE - MATRIZ | 11889780000199",//codigo empresa | descrição filial | cnpj filial 
        "idEmpresa": "00100289",// codigo empresa 
        "descricaoEmpresa": "SIT MACAE - MATRIZ",// descrição filial
        "cepEmpresaOrigem": "27972014",// cep filial
        "estadoEmpresaOrigem": "RJ",// estado filial
        "cidadeEmpresaOrigem": "MACAE",// ciadade filial
        "bairroEmpresaOrigem": "AJUDA",// bairro filial
        "enderecoEmpresaOrigem": "AV DOMINGOS DE MORAES, 600",// ciadade filialendere
        "cnpjEmpresa": "11889780000199", // cnpj filialendere
        "telefoneEmpresaOrigem": "21 21091001",// telefone filialendere
        "displayEmpresaEntrega": "00100289 | SIT MACAE - MATRIZ | 11889780000199",//codigo empresa | descrição filial | cnpj filial de entrega
        "idEmpresaEntrega": "00100289",//codigo empresa entrega
        "descricaoEmpresaEntrega": "SIT MACAE - MATRIZ",//descricao empresa entrega
        "cepEmpresaEntrega": "27972014",//cep empresa entrega
        "estadoEmpresaEntrega": "RJ",//estado empresa entrega
        "cidadeEmpresaEntrega": "MACAE",//cidade empresa entrega
        "bairroEmpresaEntrega": "AJUDA",//bairro empresa entrega
        "enderecoEmpresaEntrega": "AV DOMINGOS DE MORAES,600",//endereco empresa entrega
        "cnpjEmpresaEntrega": "11889780000199",//cnpj empresa entrega
        "telefoneEmpresaEntrega": "21 21091001",//telefone empresa entrega
        "tipoSc": "1",/*1 - Compra Padrão,
          2 - Compra Emergencial,
          3 - Compra Estratégica, 
          4 - Compra Estratégica, 
          5 - Regularização, 
          6 - VTR
                        */
        "data_necessidade": "13/02/2025",//data da necessidade, DD/MM/AAAA
        "data_entrega": "15/02/2025",//data da entrega, DD/MM/AAAA
        "havera_rateio": "nao",// fixo
        "valor_total": "100,00", // total sc
        "especificacao_tecnica_solic": "especificação técnica", // especificacao tecnica
        "descricaoCentroCusto": "301202005   |   CORP - CONTABILIDADE CORPORATIVA", // centro de custo, centro | Descrição
        "idCentroCusto": "301202005",// ID centro de custo
        "localRecebimento": "teste", // local recebimento
        "responsavel_recebimento": "teste",// responsavel recebimento
        "justificativa_solicitacao": "Justificativa da Solicitação",// justificativa da solicitacao
        "produto_vlTotal": "0,00",// total produto 0,00
        /**Linha de Produtos visual, sempre campo ____ e o id, sempre iniciar em 1 */
        "produto___1": "14040005 | PERFIL PVC PORTA SEPARACAO MARCOPOLO 10064157", // codigo | Descricao
        "codigoProduto___1": "14040005",//codigo do produto
        "tipoProduto___1": "MATERIAL",//descrição tipo do produto
        "produto_entrega___1": "15/02/2025",// data da entrega do produto, DD/MM/AAAA
        "produto_saldo___1": "0",// saldo do produto
        "unidadeMedidaProduto___1": "PC", // Unidade de medida
        "produto_qtd___1": "10",// quantidade do produto
        "produto_vlUnitario___1": "10,00",// unitário do produto, 00,00
        "produto_dtUltCompra___1": "",// data ultima compra, DD/MM/AAAAA
        "produto_vlUltCompra___1": "0",// valor ultima compra, 0,00
        "produto_vlTotal___1": "100,00",// total Produto, 000,00
        "produto_percRateio___1": "0",// fixo
        "produto_marcas___1": "teste",// marcas
        "produto_observacao___1": "",// observação do produto
        /** fim linha produto visual */

        /** dados do produto, para mapa de cotação, sempre, produto pai e marcas homologadas.
         * iniciando sempre em com 1, campo ____ ID         * 
         */
        "B1_COD___1": "14040005", /** B1_COD produto pai*/
        "B1_DESC___1": "PERFIL PVC PORTA SEPARACAO MARCOPOLO 10064157",/** B1_DESC produto pai*/
        "B1_UM___1": "PC",/** B1_UM produto pai*/

        "B1_COD___2": "140400050001",/** B1_COD produto filho*/
        "B1_PAI___2": "14040005",/** B1_PAI, B1_COD do pai do filho */
        "B1_DESC___2": "PERFIL PVC PORTA SEPARACAO MARCOPOLO 10064157 MARCOPOLO",/** B1_DESC produto filho*/
        "B1_GRUPO___2": "1404",/** B1_GRUPO produto filho*/
        "B1_LOCPAD___2": "01",/** B1_LOCPAD produto filho*/
        "B1_TIPO___2": "MC",/** B1_TIPO produto filho*/
        "B1_UM___2": "PC",/** B1_UM produto filho*/
        "B1_ZMARCA___2": "0001",/** B1_ZMARCA produto filho*/
        "ZPM_DESC___2": "MARCOPOLO",/** ZPM_DESC produto filho*/
        "B1_UPRC___2": "0",/** B1_UPRC produto filho*/

        "observacoes": "teste",
    }
}