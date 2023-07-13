import { createRouter, createWebHashHistory } from 'vue-router';
import Layout from '@/layout';


/**
 * 页面配置
 */
export const layoutRoutes = [
  /**
   * 首页
   */
  {
    path: 'home',
    name: 'Home',
    meta: {
      title: '概览',
      unsearchable: true,
    },
    component: () => import('@/views/Home'),
  },

  /**************************************/
  /**
   * 监控管理
   */
  {
    path: 'device/network',
    name: 'network',
    meta: { title: '网络' },
    component: () => import('@/views/device/network'),
  },
  {
    path: 'device/router',
    name: 'router',
    meta: { title: '路由器' },
    component: () => import('@/views/device/router'),
  },
  {
    path: 'device/switch',
    name: 'switch',
    meta: { title: '交换机' },
    component: () => import('@/views/device/switch'),
  },
  {
    path: 'device/wireless',
    name: 'wireless',
    meta: { title: '无线AP' },
    component: () => import('@/views/device/wireless'),
  },
  {
    path: 'device/client',
    name: 'client',
    meta: { title: '客户端' },
    component: () => import('@/views/device/client'),
  },
  {
    path: 'device/restart',
    name: 'restart',
    meta: { title: '门店重启',},
    component: () => import('@/views/device/restart'),
  },

  /**
   * 监控管理
   */
  {
    path: 'monitor/alarmCount',
    name: 'alarmCount',
    meta: { title: '告警统计' },
    component: () => import('@/views/monitor/alarmCount'),
  },
  {
    path: 'monitor/alarmLog',
    name: 'alarmLog',
    meta: { title: '告警记录' },
    component: () => import('@/views/monitor/alarmLog'),
  },
  {
    path: 'monitor/alarmConfig',
    name: 'alarmConfig',
    meta: { title: '告警配置' },
    component: () => import('@/views/monitor/alarmConfig'),
  },
  {
    path: 'monitor/alarmIgnoreConfig',
    name: 'alarmIgnoreConfig',
    meta: { title: '告警忽略' },
    component: () => import('@/views/monitor/alarmIgnoreConfig'),
  },

  /**
   * 系统管理
   */
  {
    path: 'system/user',
    name: 'UserManager',
    meta: { title: '用户管理' },
    component: () => import('@/views/system/user'),
  },
  {
    path: 'system/role',
    name: 'RoleManager',
    meta: { title: '角色管理' },
    component: () => import('@/views/system/role'),
  },
  {
    path: 'system/resource',
    name: 'resource',
    meta: { title: '资源管理' },
    component: () => import('@/views/system/resource'),
  },
  {
    path: 'system/job',
    name: 'job',
    meta: { title: '定时任务' },
    component: () => import('@/views/system/job'),
  },
  {
    path: 'system/jobLog',
    name: 'jobLog',
    meta: { title: '任务记录' },
    component: () => import('@/views/system/jobLog'),
  },
  {
    path: 'system/dict',
    name: 'dict',
    meta: { title: '字典管理' },
    component: () => import('@/views/system/dict'),
  },
  {
    path: 'system/redis',
    name: 'redis',
    meta: { title: 'Redis管理' },
    component: () => import('@/views/system/redis'),
  },
];

/**
 * constantRoutes: 没有权限的路由
 */
export const constantRoutes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/login',
    meta: {
      title: '登录',
      guest: true,
    },
    component: () => import(/* webpackChunkName: "login" */ '@/views/Login.vue'),
  },
  {
    path: '/404',
    meta: {
      title: '404',
      guest: true,
    },
    component: () => import(/* webpackChunkName: "About" */ '@/views/common/error/404.vue'),
  },

  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        meta: { title: '刷新中' },
        component: () => import('@/views/common/redirect'),
      },
    ],
  },
  {
    path: '/',
    component: Layout,
    children: layoutRoutes,
  },
];

/**
 * constantRoutes: 根据权限动态添加的路由
 */
export const asyncRoutes = [];

const routes = [
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes.concat(routes),
});

export default router;
