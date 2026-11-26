# Rota ServiceNow: ITAM, ITOM e CMDB

Plataforma pessoal de estudos ServiceNow, publicada no GitHub Pages, com o progresso salvo no Firebase. Tem quatro páginas:

- **Início:** próximo passo, lista "Para fazer", rotina, resumo de laboratórios e certificados, histórico.
- **Rota:** checklist em cinco fases (base da plataforma, CMDB e CSDM, ITAM, ITOM Visibility e próximas camadas). Curso à esquerda, credencial à direita.
- **Laboratórios:** exercícios guiados para fazer na PDI. O botão "Verificar na PDI" consulta a API Rota Labs instalada na instância e marca o que encontrar.
- **Certificados:** vitrine das credenciais concluídas, com link do badge, para mostrar no LinkedIn.

Página: https://dcerq.github.io/rota-servicenow/

## Arquivos

| Arquivo | Para que serve |
| --- | --- |
| `index.html` | A página inteira. A lista de fases e itens fica no começo do `<script>`, no bloco `EDITE AQUI`. |
| `firebase-config.js` | Configuração do app Web do Firebase. Enquanto tiver `COLE_AQUI`, a página salva só no navegador. |
| `firestore.rules` | Cópia das regras de segurança publicadas no Firestore. Só você escreve; qualquer pessoa com o link pode ler o progresso. O endereço da PDI fica num documento só seu. |
| `pdi/rota-labs-api.js` | Script da API Rota Labs, que fica na PDI e responde quais laboratórios foram feitos. |
| `pdi/instalar-rota-labs.js` | Instalador para rodar em Scripts - Background: cria a API, o recurso e a regra de CORS. |

## Verificação dos laboratórios na PDI

A página não guarda usuário nem senha da PDI. A verificação funciona assim:

1. Na PDI existe a Scripted REST API **Rota Labs**, com o recurso `GET /status`. Ela só lê e devolve, para cada laboratório, `true` ou `false`. Nenhum registro sai da instância.
2. Uma regra de CORS na PDI libera esse recurso apenas para `https://dcerq.github.io`.
3. Em **Laboratórios**, você salva o endereço da PDI (fica só para você) e clica em **Verificar na PDI**.

A API já está instalada na **dev196598**, no caminho `/api/1682697/rota_labs/status`.

### Instalar em outra PDI

1. Na PDI, abra **System Definition > Scripts - Background**, escopo `global`.
2. Cole o conteúdo de `pdi/instalar-rota-labs.js` e clique em **Run script**. Ele cria a API, o recurso e a regra de CORS. Pode rodar de novo, que ele só atualiza.
3. O resultado mostra uma linha `ROTA LABS OK | ... | recurso: /api/NNN/rota_labs/status`.
4. Em **Laboratórios**, salve o endereço completo: `https://devXXXXXX.service-now.com/api/NNN/rota_labs/status`. O número `NNN` muda de instância para instância.

Limites que valem saber:

- PDI hibernando não responde. Acorde a instância no Developer Portal e verifique de novo.
- Se a PDI for recolhida por falta de uso e você pedir outra, a API precisa ser instalada de novo, e o endereço muda.
- A verificação só marca laboratórios. Um laboratório que já estava marcado não é desmarcado se a PDI for apagada.
- Os nomes entre aspas nos passos de cada laboratório são os que a API procura. Use exatamente esses nomes.

## O que já está configurado

- Repositório `dcerq/rota-servicenow`, com GitHub Pages saindo da branch `main`.
- Projeto Firebase `rota-servicenow-a8cf3`, na conta kennash.mash@gmail.com (plano Spark, gratuito), com:
  - app Web `rota-web`;
  - login com Google ativado e o domínio `dcerq.github.io` autorizado;
  - Firestore criado em `southamerica-east1` (São Paulo), em modo de produção.

## Colar a configuração do Firebase (feito uma vez)

1. No console do Firebase, abra **Configurações do projeto > Geral > Seus apps > rota-web**.
2. Em **Configuração do SDK**, escolha **Configuração** e copie o bloco que vai de `const firebaseConfig = {` até `};`.
3. No GitHub, abra o `firebase-config.js`, clique no lápis para editar e cole esse bloco no lugar do bloco de exemplo.
4. Clique em **Commit changes**.

## Quem pode editar

A primeira conta Google que entra na página depois das regras publicadas cria o documento `roadmaps/principal` e vira a dona (campo `donaUid`). As regras não deixam ninguém trocar a dona depois. Qualquer outra conta só consegue ver.

Hoje a dona é a conta que entrou em 25/11/2026. Se um dia precisar trocar, apague o documento `roadmaps/principal` no console do Firestore (perde o progresso salvo na nuvem; baixe o backup antes) e entre com a conta nova.

## Segurança

- A `apiKey` do Firebase identifica o projeto e pode ficar num repositório público. Quem protege os dados são as regras.
- Não use o "modo de teste" do Firestore: ele deixa qualquer pessoa escrever no banco e expira sozinho.
- Para deixar o progresso privado, troque `allow read: if true;` por `allow read: if ehDona();` nos dois lugares do `firestore.rules` e publique de novo.

## Como os dados ficam no Firestore

```
roadmaps/principal                      (leitura pública)
  donaUid
  itens: { "cis-df": { done: true, at: "2026-12-10", badge: "https://www.credly.com/badges/..." }, ... }
  labs:  { "lab-classe": { done: true, at: "2026-12-02", via: "pdi" }, ... }
  pdi:   { ultima: "2026-12-02T10:15:00Z", encontrados: 4 }
  atualizadoEm
roadmaps/principal/historico/{evento}
  item, titulo, acao (concluiu | desmarcou | badge | verificou | importou), em
privado/pdi                             (só a dona)
  url
```

O plano gratuito do Firestore não tem backup automático. Para guardar uma cópia, use o botão **Baixar backup (JSON)** no rodapé da página.

## Editar a rota

No `index.html`, procure `EDITE AQUI`. Cada item tem:

```js
{ id: 'cis-ham', lado: 'cred', tipo: 'Mainline', titulo: 'CIS-Hardware Asset Management', meta: 'exige CIS-DF',
  porque: 'Uma frase dizendo por que esse item importa.' }
```

- `lado`: `estudo` (coluna Estudar) ou `cred` (coluna Credencial).
- A ordem dentro da fase é a ordem recomendada. O item "Próximo" é o primeiro não concluído, pulando as suites, que saem sozinhas.
- Não troque o `id` de um item já marcado: o progresso salvo está ligado a ele.
- Para trocar a ordem das fases ITAM e ITOM, recorte o bloco inteiro de uma fase e cole antes da outra.

## Fontes

Lista montada em novembro de 2026 a partir do ServiceNow University, da ServiceNow Community e dos badges da ServiceNow no Credly. Nomes de curso e requisitos mudam a cada release: confira no ServiceNow University antes de agendar uma prova.
