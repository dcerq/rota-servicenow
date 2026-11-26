// Instala a API Rota Labs (só leitura) e libera CORS para a página no GitHub Pages.
// Rode em System Definition > Scripts - Background, escopo global. Pode rodar de novo: ele atualiza.
(function () {
    var ORIGEM = 'https://dcerq.github.io';
    var SCRIPT = "// Rota Labs: recurso GET /status da Scripted REST API \"Rota Labs\" na PDI.\n// Só leitura. Devolve, para cada laboratório da Rota ServiceNow, true ou false.\n// Não devolve nenhum registro, só sim ou não. Por isso pode responder sem login.\n(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {\n    var CLASSE = 'u_cmdb_ci_rota_appliance';\n\n    // condicoes: [[campo, operador, valor], ...]. Operadores extras: 'VAZIO' e 'PREENCHIDO'.\n    // Campo inexistente devolve null: o GlideRecord ignoraria a condição e acharia tudo.\n    function busca(tabela, condicoes) {\n        if (!gs.tableExists(tabela)) return null;\n        var g = new GlideRecord(tabela);\n        for (var i = 0; i < condicoes.length; i++) {\n            var c = condicoes[i];\n            if (!g.isValidField(c[0].split('.')[0])) return null;\n            if (c[1] === 'VAZIO') g.addNullQuery(c[0]);\n            else if (c[1] === 'PREENCHIDO') g.addNotNullQuery(c[0]);\n            else g.addQuery(c[0], c[1], c[2]);\n        }\n        return g;\n    }\n    function existe(tabela, condicoes) {\n        var g = busca(tabela, condicoes);\n        if (!g) return false;\n        g.setLimit(1);\n        g.query();\n        return g.hasNext();\n    }\n    function primeiro(tabela, condicoes) {\n        var g = busca(tabela, condicoes);\n        if (!g) return '';\n        g.setLimit(1);\n        g.query();\n        return g.next() ? g.getUniqueValue() : '';\n    }\n\n    var r = {};\n\n    // Fase 1: base da plataforma\n    var grupo = primeiro('sys_user_group', [['name', '=', 'Rota - Suporte CMDB']]);\n    r['lab-grupo'] = !!grupo && existe('sys_user_grmember', [['group', '=', grupo]]);\n    r['lab-flow'] = existe('sys_hub_flow', [['name', '=', 'Rota - CI sem responsável'], ['active', '=', true]]);\n    r['lab-dashboard'] = existe('par_dashboard', [['name', 'STARTSWITH', 'Rota']]);\n\n    // Fase 2: CMDB e CSDM\n    var temClasse = gs.tableExists(CLASSE);\n    r['lab-classe'] = temClasse;\n    r['lab-identificacao'] = temClasse && existe('cmdb_identifier', [['applies_to', '=', CLASSE]]);\n    var total = 0, semDono = 0, repetido = false, seriais = {};\n    if (temClasse) {\n        var ci = new GlideRecord(CLASSE);\n        ci.query();\n        while (ci.next()) {\n            total++;\n            var serial = ci.getValue('serial_number') || '';\n            if (serial) {\n                if (seriais[serial]) repetido = true;\n                seriais[serial] = true;\n            }\n            if (!ci.getValue('managed_by_group')) semDono++;\n        }\n    }\n    r['lab-ire'] = total >= 3 && !repetido;\n    r['lab-dono'] = total >= 3 && semDono === 0;\n    var app = primeiro('cmdb_ci_business_app', [['name', '=', 'Rota App']]);\n    var servico = primeiro('cmdb_ci_service_auto', [['name', '=', 'Rota App PRD']]);\n    r['lab-csdm'] = !!(app && servico) && existe('cmdb_rel_ci', [['parent', '=', app], ['child', '=', servico]]);\n\n    // Fase 3: ITAM\n    var modelo = primeiro('cmdb_hardware_product_model', [['name', '=', 'Rota Laptop X1']]);\n    r['lab-ativo'] = !!modelo && existe('alm_hardware', [['model', '=', modelo]]);\n    r['lab-ciclo'] = !!modelo && existe('alm_hardware', [['model', '=', modelo], ['install_status', '=', '1'], ['assigned_to', 'PREENCHIDO']]);\n    var contrato = primeiro('ast_contract', [['short_description', '=', 'Rota - Garantia X1']]);\n    r['lab-contrato'] = !!contrato && existe('clm_m2m_contract_asset', [['contract', '=', contrato]]);\n    var software = primeiro('cmdb_software_product_model', [['name', '=', 'Rota Office']]);\n    r['lab-sam'] = !!software && (existe('alm_license', [['software_model', '=', software]]) || existe('alm_license', [['model', '=', software]]));\n\n    // Fase 4: ITOM\n    r['lab-mid'] = existe('ecc_agent', [['status', '=', 'Up'], ['validated', '=', 'true']]);\n    var agenda = primeiro('discovery_schedule', [['name', '=', 'Rota - Rede local']]);\n    r['lab-discovery'] = !!agenda && existe('discovery_status', [['dscheduler', '=', agenda], ['state', '=', 'Completed']]);\n    r['lab-ci-descoberto'] = !!agenda && existe('discovery_device_history', [['status.dscheduler', '=', agenda], ['cmdb_ci', 'PREENCHIDO']]);\n\n    response.setStatus(200);\n    response.setBody({\n        versao: 1,\n        instancia: gs.getProperty('instance_name'),\n        verificadoEm: new GlideDateTime().getValue(),\n        labs: r\n    });\n})(request, response);\n";
    function msg(t) { gs.print(t); gs.info(t); }

    // 1. Definição da API
    var api = new GlideRecord('sys_ws_definition');
    api.addQuery('service_id', 'rota_labs');
    api.query();
    if (!api.next()) {
        api.initialize();
        api.setValue('name', 'Rota Labs');
        api.setValue('service_id', 'rota_labs');
        api.setValue('active', true);
        var novaApi = api.insert();
        api = new GlideRecord('sys_ws_definition');
        api.get(novaApi);
    }

    // 2. Recurso GET /status, sem login (só devolve sim/não)
    var op = new GlideRecord('sys_ws_operation');
    op.addQuery('web_service_definition', api.getUniqueValue());
    op.addQuery('relative_path', '/status');
    op.query();
    var novo = !op.next();
    if (novo) op.initialize();
    op.setValue('name', 'status');
    op.setValue('web_service_definition', api.getUniqueValue());
    op.setValue('http_method', 'GET');
    op.setValue('relative_path', '/status');
    op.setValue('operation_script', SCRIPT);
    op.setValue('active', true);
    ['requires_authentication', 'requires_acl_authorization', 'requires_snc_internal_role'].forEach(function (f) {
        if (op.isValidField(f)) op.setValue(f, false);
    });
    var opId = novo ? op.insert() : op.getUniqueValue();
    if (!novo) op.update();

    // 3. CORS só para a página
    var cors = new GlideRecord('sys_cors_rule');
    cors.addQuery('rest_api', api.getUniqueValue());
    cors.addQuery('domain', ORIGEM);
    cors.query();
    var novoCors = !cors.next();
    if (novoCors) cors.initialize();
    cors.setValue('name', 'Rota Labs - GitHub Pages');
    cors.setValue('rest_api', api.getUniqueValue());
    cors.setValue('domain', ORIGEM);
    if (cors.isValidField('max_age')) cors.setValue('max_age', 3600);
    if (cors.isValidField('active')) cors.setValue('active', true);
    var campos = [];
    var els = cors.getElements();
    var n = els.size ? els.size() : els.length;
    for (var i = 0; i < n; i++) {
        var e = els.get ? els.get(i) : els[i];
        var nome = String(e.getName());
        campos.push(nome);
        if (/get/i.test(nome) && /method|^get$|_get$/i.test(nome)) cors.setValue(nome, true);
    }
    if (novoCors) cors.insert(); else cors.update();

    var fim = new GlideRecord('sys_ws_operation');
    fim.get(opId);
    msg('ROTA LABS OK | base: ' + api.getValue('base_uri') + ' | recurso: ' + fim.getValue('operation_uri') +
        ' | sem login: ' + (fim.isValidField('requires_authentication') ? fim.getValue('requires_authentication') : '?') +
        ' | campos CORS: ' + campos.join(','));
})();
