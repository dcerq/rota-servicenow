# Rota ServiceNow: ITAM, ITOM e CMDB

Checklist de estudos ServiceNow em cinco fases (base da plataforma, CMDB e CSDM, ITAM, ITOM Visibility e próximas camadas). Página estática: roda no GitHub Pages e guarda o progresso no Firebase.

## Arquivos

| Arquivo | Para que serve |
| --- | --- |
| `index.html` | A página inteira. A lista de fases e itens fica no começo do `<script>`, no bloco `EDITE AQUI`. |
| `firebase-config.js` | Dados do seu projeto Firebase e o seu UID. Enquanto tiver `COLE_AQUI`, a página salva só no navegador. |
| `firestore.rules` | Regras de segurança do Firestore. Só você escreve; qualquer pessoa com o link pode ler. |

## 1. Publicar no GitHub Pages

1. Crie um repositório público, por exemplo `rota-servicenow`.
2. Envie os quatro arquivos para a raiz da branch `main`.
3. No repositório: **Settings > Pages > Build and deployment**. Em *Source*, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`, e salve.
4. Em um ou dois minutos a página fica em `https://SEU-USUARIO.github.io/rota-servicenow/`.

Até aqui a página já funciona, salvando no navegador que você estiver usando.

## 2. Ligar o Firebase (para salvar na nuvem)

1. Em [console.firebase.google.com](https://console.firebase.google.com), crie um projeto (o Google Analytics pode ficar desligado).
2. Adicione um app **Web** (ícone `</>`). Não precisa marcar o Firebase Hosting. Copie o objeto `firebaseConfig` que aparece e cole no campo `firebase` do `firebase-config.js`.
3. **Authentication**: ative o provedor **Google**. Em *Settings > Authorized domains*, adicione `SEU-USUARIO.github.io`.
4. **Firestore Database**: crie o banco em **modo de produção**. Para a região, `southamerica-east1` (São Paulo) fica mais perto de você. A região não muda depois.
5. Envie o `firebase-config.js` atualizado para o GitHub, abra a página e clique em **Entrar com Google**.
6. A página mostra o seu UID. Cole esse valor:
   - em `ownerUid`, no `firebase-config.js`;
   - no lugar de `SEU_UID`, no `firestore.rules`.
7. No console, abra **Firestore Database > Regras**, cole o conteúdo do `firestore.rules` e clique em **Publicar**.
8. Envie o `firebase-config.js` de novo para o GitHub e recarregue a página. O selo no topo deve mostrar **Salvo na nuvem**.

No primeiro login com tudo configurado, se a nuvem estiver vazia, o que você já tinha marcado neste navegador é enviado para o Firestore.

### Sobre segurança

- A `apiKey` do Firebase identifica o projeto e pode ficar num repositório público. Quem protege os dados são as regras.
- Não use o "modo de teste" do Firestore: ele deixa qualquer pessoa escrever no banco e expira sozinho.
- Para deixar o progresso privado, troque `allow read: if true;` por `allow read: if ehDona();` nos dois lugares do `firestore.rules`. Quem abrir a página sem estar logado como você verá a lista sem marcações.

## Como os dados ficam no Firestore

```
roadmaps/{seu UID}
  itens: { "cis-df": { done: true, at: "2026-12-10", badge: "https://www.credly.com/badges/..." }, ... }
  atualizadoEm
roadmaps/{seu UID}/historico/{evento}
  item, titulo, acao (concluiu | desmarcou | badge | importou), em
```

O botão **Baixar backup (JSON)** no rodapé exporta tudo, caso você queira guardar uma cópia.

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
