# Escopo

O sistema SIGEL (Sistema de Gestão de Estoque e Locação) será desenvolvido para a empresa EVENTPRO LOCAÇÕES. Seu objetivo é informatizar e gerenciar o processo de entrada de equipamentos no estoque (aquisições por compra e retornos de manutenção), o controle físico e financeiro do acervo armazenado e o fluxo completo de locação (saída e devolução) para os clientes. O acesso ao sistema será controlado por autenticação com diversos níveis de permissão: Administrador (acesso total), Atendente Comercial, Operador de Estoque/Financeiro e qualquer outro perfil com determinados privilégios que venha a ser definido pela gerência da empresa.
Como funções básicas e de suporte cadastral, o sistema abrangerá o gerenciamento de funcionários, clientes (pessoas físicas e jurídicas), fornecedores, categorias de equipamentos, catálogo e acervo de equipamentos e pacotes promocionais sazonais. Nas funções fundamentais de negócio, contemplará a gestão e aprovação de solicitações internas de aquisição, o registro de entradas por compra, o envio e retorno de manutenção, o registro de locações e devoluções de eventos e o controle financeiro simplificado de contas a pagar e a receber.
Os equipamentos serão classificados em categorias específicas (como som, iluminação, mobiliário, decoração e estruturas), registrando as particularidades de armazenamento e manuseio de cada uma. Cada equipamento cadastrado possuirá valor de diária para locação, código de identificação único, estado de conservação atualizado (novo, em uso, em manutenção ou baixado) e histórico completo de locações, permitindo identificar a qualquer momento quais itens estão disponíveis, locados, em manutenção ou descartados (baixados).
Os fornecedores também serão cadastrados para identificar a origem de aquisição de cada item, viabilizando o controle de garantia e processos de recompra.
O controle de recursos humanos armazenará de cada colaborador a matrícula (ou código interno), data de ingresso, data de saída (quando aplicável), setor de atuação (logística, montagem, atendimento, administrativo) e perfil de acesso.
Para o gerenciamento de suprimentos, quando o estoque for insuficiente para atender à demanda de orçamentos ou eventos, o funcionário registrará uma solicitação interna de aquisição contendo os equipamentos necessários e suas quantidades. Essa solicitação passará pela avaliação e aprovação da gerência (Administrador). Uma vez aprovada, a entrada dos equipamentos no estoque por nova compra será registrada vinculando uma ou mais solicitações aprovadas, o fornecedor cadastrado, a categoria do item e o funcionário responsável.
Do mesmo modo, quando um equipamento apresentar avaria, será registrado seu envio para manutenção (indisponibilizando-o para locação) e, posteriormente, seu retorno de manutenção vinculado ao fornecedor do serviço, à categoria e ao funcionário responsável.
Na saída de equipamentos (locação para um evento), o sistema exigirá o registro do cliente locatário (pessoa física para festas particulares ou pessoa jurídica para buffets, cerimoniais e empresas de eventos), dos itens e quantidades locados, da data de retirada, da data prevista de devolução e do funcionário responsável pelo atendimento, calculando o valor total com base no período e nos itens selecionados.
No encerramento do evento, será registrada a devolução dos equipamentos com a data real de entrega e a vistoria do estado de conservação de cada peça, retornando os itens íntegros para disponível e encaminhando automaticamente itens avariados para o status de manutenção.
No apoio à gestão comercial, cada equipamento poderá ser associado a pacotes promocionais sazonais (como "Festa Junina", "Casamento" ou "Formaturas de Dezembro"), contendo data inicial, data final, percentual de desconto e meta de locações. Ao fechar uma locação vinculada a um pacote vigente, o sistema aplicará os descontos correspondentes e atualizará automaticamente o progresso da meta da promoção.
O controle financeiro simplificado gerenciará as contas a receber (entradas oriundas das locações) e as contas a pagar (saídas referentes às compras de equipamentos). Locações à vista terão baixa imediata no ato do contrato, enquanto contratos parcelados para clientes pessoas jurídicas e compras de equipamentos realizadas a prazo junto aos fornecedores gerarão parcelas com controle de número da parcela, data de vencimento, valor e registro de quitação (pagamentos e recebimentos realizados).
Como funções de saída e apoio à tomada de decisão, o sistema emitirá relatórios gerenciais de fluxo financeiro mensal (consolidando entradas recebidas, saídas pagas e títulos em aberto no período), relatório de posição e disponibilidade do acervo por categoria e situação, relatório de histórico de locações e garantias por equipamento e relatório de desempenho de pacotes promocionais.
Com a implantação do SIGEL, a EVENTPRO LOCAÇÕES obterá rastreabilidade total do acervo para evitar extravios, visão clara da saúde financeira mensal e maior agilidade e segurança na formalização das locações.


# Funções do Produto

Referência	Função	Visibilidade
RF_B1	Realizar login no sistema	EVIDENTE
RF_B2	Cadastrar funcionários	EVIDENTE
RF_B3	Atualizar dados de funcionários	EVIDENTE
RF_B4	Cadastrar clientes pessoa física	EVIDENTE
RF_B5	Cadastrar clientes pessoa jurídica	EVIDENTE
RF_B6	Atualizar dados de clientes	EVIDENTE
RF_B7	Cadastrar fornecedores	EVIDENTE
RF_B8	Atualizar dados de fornecedores	EVIDENTE
RF_B9	Cadastrar categorias de equipamentos	EVIDENTE
RF_B10	Atualizar dados de categorias de equipamentos	EVIDENTE
RF_B11	Cadastrar equipamentos	EVIDENTE
RF_B12	Atualizar equipamentos	EVIDENTE
RF_B13	Cadastrar pacotes promocionais sazonais	EVIDENTE
RF_B14	Atualizar pacotes promocionais sazonais	EVIDENTE
RF_F1	Registrar entrada de equipamentos por compra	EVIDENTE
RF_F2	Registrar retorno de equipamentos da manutenção	EVIDENTE
RF_F3	Registrar locação de equipamentos	EVIDENTE
RF_F4	Registrar devolução de equipamentos	EVIDENTE
RF_F5	Registrar solicitações de aquisição	EVIDENTE
RF_F6	Avaliar solicitações de aquisição	EVIDENTE
RF_F7	Quitar contas a receber (registrar recebimento de parcelas de locação)	EVIDENTE
RF_F8	Quitar contas a pagar (registrar pagamento de parcelas de compra ao fornecedor)	EVIDENTE
RF_F9	Atualizar estoque e situação dos equipamentos	OCULTA
RF_F10	Gerar títulos financeiros de contas a pagar e a receber	OCULTA
RF_F11	Atualizar progresso da meta de pacotes promocionais	OCULTA
RF_S1	Consultar funcionários	EVIDENTE
RF_S2	Consultar clientes	EVIDENTE
RF_S3	Consultar fornecedores	EVIDENTE
RF_S4	Consultar categorias de equipamentos	EVIDENTE
RF_S5	Consultar equipamentos	EVIDENTE
RF_S6	Consultar pacotes promocionais	EVIDENTE
RF_S7	Consultar disponibilidade do estoque	EVIDENTE
RF_S8	Consultar contratos de locação	EVIDENTE
RF_S9	Consultar solicitações de aquisição	EVIDENTE
RF_S10	Consultar títulos financeiros (contas a pagar e a receber)	EVIDENTE
RF_S11	Emitir relatório de fluxo financeiro mensal	EVIDENTE
RF_S12	Emitir relatório de posição de estoque e situação do acervo	EVIDENTE
RF_S13	Emitir relatório de desempenho e metas de pacotes promocionais	EVIDENTE
