# starbucks-meraki-monitor-frontend

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


local:
``` javascript
// 导入axios包
import axios from 'axios'
import { ElMessage } from 'element-plus/lib/components'
import NProgress from 'nprogress'

const Qs = require('qs')

 // 配置请求的根路径
let host = window.location.host; // 主机(主机名+端口号)(localhost:8080)
let reg = /^localhost+/;
if (reg.test(host)) {
  // 若本地项目调试使用
  axios.defaults.baseURL = 'http://localhost';
  // axios.defaults.baseURL = 'http://merakimonitor.starbucks.net';
} else {
  // 动态请求地址
  axios.defaults.baseURL = 'http://116.62.112.199/starbucks';
}

// 允许携带cookie
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// 接口错误处理
function errHandler(err) {
  ElMessage.error({ message: '接口调用失败: ' + err });
  NProgress.done();
}

// 接口响应拦截处理
function responseHandler(response) {
  if (response && response.data && response.data.code === 9999) {
    // 若错误码是9999则判断未登录
    ElMessage.error(response.data.msg);
    return Promise.reject('接口响应: ' + response.data);
  } else {
    return response;
  }
}

const request = axios.create();
request.defaults.withCredentials = true;
request.interceptors.response.use(responseHandler, errHandler);

const formRequest = axios.create();
formRequest.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';
formRequest.interceptors.response.use(responseHandler, errHandler);

const http = {
  baseURL: axios.defaults.baseURL,
  get: request.get,
  post: request.post,
  formPost: async function (path, formData) {
    return await formRequest.post(path, Qs.stringify(formData));
  },
};

export default http;


```

```json
{
  "name": "cf-workflow-front",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "serve": "set NODE_OPTIONS=--openssl-legacy-provider && vue-cli-service serve",
    "build": "set NODE_OPTIONS=--openssl-legacy-provider && vue-cli-service build"
  },
  "dependencies": {
    "@codemirror/lang-json": "^6.0.0",
    "@codemirror/theme-one-dark": "^6.0.0",
    "@element-plus/icons": "0.0.11",
    "@fortawesome/fontawesome-svg-core": "^6.1.2",
    "@fortawesome/free-brands-svg-icons": "^6.1.2",
    "@fortawesome/free-regular-svg-icons": "^6.1.2",
    "@fortawesome/free-solid-svg-icons": "^6.1.2",
    "@fortawesome/vue-fontawesome": "^3.0.1",
    "@fullcalendar/core": "^5.11.3",
    "@fullcalendar/daygrid": "^5.11.3",
    "@fullcalendar/interaction": "^5.11.3",
    "@fullcalendar/timegrid": "^5.11.3",
    "@fullcalendar/vue3": "^5.11.2",
    "@tinymce/tinymce-vue": "5.0.0",
    "axios": "^0.21.4",
    "codemirror": "^6.0.0",
    "core-js": "^3.6.5",
    "dayjs": "^1.11.6",
    "echarts": "^5.4.0",
    "element-plus": "^2.2.18",
    "file-saver": "^2.0.5",
    "js-cookie": "^3.0.1",
    "keymaster": "^1.6.2",
    "mammoth": "^1.4.21",
    "mitt": "^2.1.0",
    "monaco-editor": "^0.30.1",
    "monaco-editor-webpack-plugin": "^6.0.0",
    "nprogress": "^0.2.0",
    "pinyin-match": "^1.2.2",
    "splitpanes": "^3.1.1",
    "tinymce": "^5.10.2",
    "v-code-diff": "^0.3.11",
    "v-contextmenu": "^3.0.0",
    "vue-codemirror": "^6.0.0",
    "vue-router": "^4.0.12",
    "vue3-pdf": "^4.2.6",
    "vue3-video-play": "^1.3.1-beta.6",
    "vuedraggable": "^4.1.0",
    "vuex": "^4.0.2",
    "xlsx": "^0.18.2"
  },
  "devDependencies": {
    "@element-plus/icons-vue": "^1.1.4",
    "@vue/cli-plugin-babel": "~4.5.15",
    "@vue/cli-plugin-router": "~4.5.15",
    "@vue/cli-service": "~4.5.15",
    "@vue/compiler-sfc": "^3.2.26",
    "babel-plugin-import": "^1.13.3",
    "jquery": "^3.6.0",
    "sass": "1.26.2",
    "sass-loader": "^8.0.2",
    "vue": "^3.2.37"
  }
}

```