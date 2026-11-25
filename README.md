# Rota ServiceNow: ITAM, ITOM e CMDB

Checklist de estudos ServiceNow em cinco fases: base da plataforma, CMDB e CSDM, ITAM, ITOM Visibility e próximas camadas. É uma página estática publicada no GitHub Pages, com o progresso salvo no Firebase.

Página: https://dcerq.github.io/rota-servicenow/

## Arquivos

| Arquivo | Para que serve |
| --- | --- |
| `index.html` | A página inteira. A lista de fases e itens fica no começo do `<script>`, no bloco `EDITE AQUI`. |
| `firebase-config.js` | Configuração do app Web do Firebase. Enquanto tiver `COLE_AQUI`, a página salva só no navegador. |
| `firestore.rules` | Cópia das regras de segurança publicadas no Firestore. Só você escreve; qualquer pessoa com o link pode ler. |

## O que já está configurado

- Repositório `dcerq/rota-servicenow`, com GitHub Pages saindo da branch `main`.
- Projeto Firebase `rota-servicenow` (plano Spark, gratuito) com:
  - app Web `rota-web`;
  - login com Google ativado e o domínio `dcerq.github.io` autorizado;
  - Firestore criado em `southamerica-east1` (São Paulo), em modo de produção.

## Colar a configuração do Firebase (feito uma vez)

1. No console do Firebase, abra **Configurações do projeto > Geral > Seus apps > rota-web**.
2. Em **Configuração do SDK**, escolha **Configuração** e copie o bloco que vai de `const firebaseConfig = {` até `};`.
3. No GitHub, abra o `firebase-config.js`, clique no lápis para editar e cole esse bloco no lugar do bloco de exemplo.
4. Clique em **Commit changes**.

## Liberar a sua conta nas regras (feito uma vez)

1. Abra a página e clique em **Entrar com Google**.
2. A página mostra o seu UID. Coloque esse valor no lugar de `SEU_UID` no `firestore.rules`.
3. No console, abra **Firestore Database > Regras**, cole o conteúdo do arquivo e clique em **Publicar**.
4. Recarregue a página. O selo no topo deve mostrar **Salvo na nuvem**.

No primeiro login com tudo liberado, o que você já tinha marcado naquele navegador é enviado para o Firestore.

## Segurança

- A `apiKey` do Firebase identifica o projeto e pode ficar num repositório público. Quem protege os dados são as regras.
- Não use o "modo de teste" do Firestore: ele deixa qualquer pessoa escrever no banco e expira sozinho.
- Para deixar o progresso privado, troque `allow read: if true;` por `allow read: if ehDona();` nos dois lugares do `firestore.rules` e publique de novo.

## Como os dados ficam no Firestore

```
roadmaps/principal
  donaUid
  itens: { "cis-df": { done: true, at: "2026-12-10", badge: "https://www.credly.com/badges/..." }, ... }
  atualizadoEm
roadmaps/principal/historico/{evento}
  item, titulo, acao (concluiu | desmarcou | badge | importou), em
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
