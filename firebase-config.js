// Configuração do Firebase da Rota ServiceNow.
//
// No console do Firebase: Configurações do projeto > Geral > Seus apps > rota-web,
// em "Configuração do SDK", escolha a opção "Configuração". Copie o bloco inteiro,
// de "const firebaseConfig = {" até "};", e cole no lugar do bloco de exemplo abaixo.
//
// Enquanto apiKey for "COLE_AQUI", a página funciona no modo local (salva só no navegador).
// A apiKey do Firebase identifica o projeto e pode ficar num repositório público.
// Quem protege os dados são as regras do Firestore (firestore.rules).

const firebaseConfig = {
  apiKey: "AIzaSyAvDPcQAQCIfkq4_8fxYtxi6sOj9X4Ti3M",
  authDomain: "rota-servicenow-a8cf3.firebaseapp.com",
  projectId: "rota-servicenow-a8cf3",
  storageBucket: "rota-servicenow-a8cf3.firebasestorage.app",
  messagingSenderId: "354608777072",
  appId: "1:354608777072:web:9304266cf5169cb027b1b5"
};

export default {
  dona: "Daiane Cerqueira",
  firebase: firebaseConfig,
};
