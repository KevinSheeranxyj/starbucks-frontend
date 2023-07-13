import router from './router';
import store from './store';
import { getToken } from './utils/auth';
import { ElMessage } from 'element-plus/lib/components';
import { getUserInfo } from '@/api/user';
import NProgress from 'nprogress';
import './assets/css/nprogress/nprogress.css';

// 配置进度条
NProgress.configure({ showSpinner: false });

function hasUserInfo() {
  const account = store.state.user.account;
  if (account) return true;
  return false;
}

async function refreshUserInfo(errHandler, successHandler) {
  const res = await getUserInfo(errHandler);
  if (!res) {
    return;
  }
  const userInfo = {
    username: res.data.username,
    account: res.data.email,
    roles: res.data.roleList,
  };
  store.dispatch('user/refreshUserInfo', userInfo);
  successHandler();
}

function getParentRoute(route) {
  if (!route.meta.isChild) {
    return false;
  }
  for (const matchedRoute of route.matched) {
    if (matchedRoute.children.map((o) => o.name).indexOf(route.name) > -1) {
      return matchedRoute;
    }
  }
}

// 离线本地调试将此方法返回true
function debug() {
  return false;
   // return true;
}

router.beforeEach((to, from, next) => {
  if (debug()) {
    next();
    return;
  }
  // 不允许跳转到menuPage路由
  const parentRoute = getParentRoute(from);
  if (parentRoute && parentRoute.name == to.name) {
    return;
  }

  NProgress.start();

  //未匹配到路由跳转404页面
  if (to.matched.length === 0) {
    next(`/404`);
    return;
  }

  // 设置网页标题
  document.title = to.meta.title + ' - Starbucks Network Management';

  if (to.meta.guest) {
    next();
    NProgress.done();
    return;
  }

  const hasToken = getToken();
  // if (debug()){
  //   next()
  //   return
  // }
  if (hasToken) {
    // vuex中没有用户信息则重新获取用户信息
    if (hasUserInfo()) next();
    else {
      refreshUserInfo(() => {
        next(`/login?redirect=${to.path}`);
        return;
      }, next);
    }
  } else {
    if (to.path == '/login') {
      next();
    } else {
      ElMessage.error('登录失效，请重新登录！');
      next(`/login?redirect=${to.path}`);
    }
  }
  NProgress.done();
});
