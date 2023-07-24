import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
// 导入Element plus
import installElementPlus from './plugins/element';
import installFontawesome from './plugins/fontawesome';
import installMitt from './plugins/mitt';
/**
 * 导入事件发射器插件mitt
 * @link https://github.com/developit/mitt#usage
 */
// import mitt from 'mitt';
// 导入全局样式表
import './assets/css/global.css';
// 导入Element plus暗黑主题
import 'element-plus/theme-chalk/dark/css-vars.css'
// 导入工具包
import tool from '@/utils/tool';
import http from '@/utils/http';
// 导入tinymce编辑器
import Editor from '@tinymce/tinymce-vue';
// 导航守卫
import './permission';
// 导入组件
import compoTable from './components/compoTable';
import compoForm from './components/compoForm';
import compoDialog from './components/compoDialog';

// https://github.com/Shimada666/v-code-diff
import CodeDiff from 'v-code-diff';

const app = createApp(App);

app.component('Editor', Editor);
app.use(router);
app.use(store);
app.use(CodeDiff);
installElementPlus(app);
installFontawesome(app);
installMitt(app);

// 注册一个全局自定义指令“v-focus”，用于获取焦点
app.directive('focus', function(el) {
  el.querySelector('input').focus();
});

app.mount('#app');
// 设置全局属性，方便调用
app.config.globalProperties.$http = http;
app.config.globalProperties.$tool = tool;
// app.config.globalProperties.$mitt = mitt();

// 注册全局组件
app.component('CompoTable', compoTable);
app.component('CompoForm', compoForm);
app.component('CompoDialog', compoDialog);
