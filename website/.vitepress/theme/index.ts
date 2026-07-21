import DefaultTheme from "vitepress/theme";
import "./custom.css";
import ReadmeHome from "./ReadmeHome.vue";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("ReadmeHome", ReadmeHome);
  },
};
