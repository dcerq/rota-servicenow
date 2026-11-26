// Rota Labs: recurso GET /status da Scripted REST API "Rota Labs" na PDI.
// Só leitura. Devolve, para cada laboratório da Rota ServiceNow, true ou false.
// Não devolve nenhum registro, só sim ou não. Por isso pode responder sem login.
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var CLASSE = 'u_cmdb_ci_rota_appliance';

    // condicoes: [[campo, operador, valor], ...]. Operadores extras: 'VAZIO' e 'PREENCHIDO'.
    // Campo inexistente devolve null: o GlideRecord ignoraria a condição e acharia tudo.
    function busca(tabela, condicoes) {
        if (!gs.tableExists(tabela)) return null;
        var g = new GlideRecord(tabela);
        for (var i = 0; i < condicoes.length; i++) {
            var c = condicoes[i];
            if (!g.isValidField(c[0].split('.')[0])) return null;
            if (c[1] === 'VAZIO') g.addNullQuery(c[0]);
            else if (c[1] === 'PREENCHIDO') g.addNotNullQuery(c[0]);
            else g.addQuery(c[0], c[1], c[2]);
        }
        return g;
    }
    function existe(tabela, condicoes) {
        var g = busca(tabela, condicoes);
        if (!g) return false;
        g.setLimit(1);
        g.query();
        return g.hasNext();
    }
    function primeiro(tabela, condicoes) {
        var g = busca(tabela, condicoes);
        if (!g) return '';
        g.setLimit(1);
        g.query();
        return g.next() ? g.getUniqueValue() : '';
    }

    var r = {};

    // Fase 1: base da plataforma
    var grupo = primeiro('sys_user_group', [['name', '=', 'Rota - Suporte CMDB']]);
    r['lab-grupo'] = !!grupo && existe('sys_user_grmember', [['group', '=', grupo]]);
    r['lab-flow'] = existe('sys_hub_flow', [['name', '=', 'Rota - CI sem responsável'], ['active', '=', true]]);
    r['lab-dashboard'] = existe('par_dashboard', [['name', 'STARTSWITH', 'Rota']]);

    // Fase 2: CMDB e CSDM
    var temClasse = gs.tableExists(CLASSE);
    r['lab-classe'] = temClasse;
    r['lab-identificacao'] = temClasse && existe('cmdb_identifier', [['applies_to', '=', CLASSE]]);
    var total = 0, semDono = 0, repetido = false, seriais = {};
    if (temClasse) {
        var ci = new GlideRecord(CLASSE);
        ci.query();
        while (ci.next()) {
            total++;
            var serial = ci.getValue('serial_number') || '';
            if (serial) {
                if (seriais[serial]) repetido = true;
                seriais[serial] = true;
            }
            if (!ci.getValue('managed_by_group')) semDono++;
        }
    }
    r['lab-ire'] = total >= 3 && !repetido;
    r['lab-dono'] = total >= 3 && semDono === 0;
    var app = primeiro('cmdb_ci_business_app', [['name', '=', 'Rota App']]);
    var servico = primeiro('cmdb_ci_service_auto', [['name', '=', 'Rota App PRD']]);
    r['lab-csdm'] = !!(app && servico) && existe('cmdb_rel_ci', [['parent', '=', app], ['child', '=', servico]]);

    // Fase 3: ITAM
    var modelo = primeiro('cmdb_hardware_product_model', [['name', '=', 'Rota Laptop X1']]);
    r['lab-ativo'] = !!modelo && existe('alm_hardware', [['model', '=', modelo]]);
    r['lab-ciclo'] = !!modelo && existe('alm_hardware', [['model', '=', modelo], ['install_status', '=', '1'], ['assigned_to', 'PREENCHIDO']]);
    var contrato = primeiro('ast_contract', [['short_description', '=', 'Rota - Garantia X1']]);
    r['lab-contrato'] = !!contrato && existe('clm_m2m_contract_asset', [['contract', '=', contrato]]);
    var software = primeiro('cmdb_software_product_model', [['name', '=', 'Rota Office']]);
    r['lab-sam'] = !!software && (existe('alm_license', [['software_model', '=', software]]) || existe('alm_license', [['model', '=', software]]));

    // Fase 4: ITOM
    r['lab-mid'] = existe('ecc_agent', [['status', '=', 'Up'], ['validated', '=', 'true']]);
    var agenda = primeiro('discovery_schedule', [['name', '=', 'Rota - Rede local']]);
    r['lab-discovery'] = !!agenda && existe('discovery_status', [['dscheduler', '=', agenda], ['state', '=', 'Completed']]);
    r['lab-ci-descoberto'] = !!agenda && existe('discovery_device_history', [['status.dscheduler', '=', agenda], ['cmdb_ci', 'PREENCHIDO']]);

    response.setStatus(200);
    response.setBody({
        versao: 1,
        instancia: gs.getProperty('instance_name'),
        verificadoEm: new GlideDateTime().getValue(),
        labs: r
    });
})(request, response);
