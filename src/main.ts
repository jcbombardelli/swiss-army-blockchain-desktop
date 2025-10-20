import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { loadSettings, applyTheme, settingsStore } from "./stores/settings";

const app = createApp(App);

app.use(router);

// Carregar configurações e aplicar tema antes de montar a aplicação
loadSettings().then(() => {
  applyTheme(settingsStore.theme);
});

app.mount("#app");
