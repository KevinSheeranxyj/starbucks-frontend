// 导入axios包
import axios from 'axios'
import { ElMessage } from 'element-plus/lib/components'
import NProgress from 'nprogress'

const Qs = require('qs')

//  配置请求的根路径
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
