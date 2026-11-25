// Configuração da Rota ServiceNow.
// Enquanto apiKey tiver "COLE_AQUI", a página funciona no modo local (salva só no navegador).
//
// 1. No console do Firebase, abra Configurações do projeto > Seus apps > app Web
//    e copie o objeto firebaseConfig inteiro para o campo "firebase" abaixo.
// 2. Abra a página publicada, clique em "Entrar com Google" e copie o UID que aparece.
// 3. Cole o UID em ownerUid (aqui) e em SEU_UID (no firestore.rules).
//
// A apiKey do Firebase não é segredo: ela identifica o projeto. Quem protege os dados
// são as regras do Firestore (firestore.rules).

export default {
  dona: 'Daiane Cerqueira',
  ownerUid: '',
  firebase: {
    apiKey: 'COLE_AQUI',
    authDomain: 'COLE_AQUI.firebaseapp.com',
    projectId: 'COLE_AQUI',
    storageBucket: 'COLE_AQUI',
    messagingSenderId: 'COLE_AQUI',
    appId: 'COLE_AQUI',
  },
};
