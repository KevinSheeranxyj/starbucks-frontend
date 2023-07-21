import {
  Coin,
  DataLine,
  Setting,
  User,
  Monitor,
  Platform,
  House,
  UserFilled,
  Switch,
  AlarmClock,
  SetUp,
  Notebook,
  Connection,
  DataAnalysis,
  Document,
  Message,
  Bell,
  MuteNotification,
  SwitchButton,
  OfficeBuilding,
  List,
  Clock
} from '@element-plus/icons-vue';
import { markRaw } from 'vue';

/**
 * 图标请参考：https://element-plus.gitee.io/zh-CN/component/icon.html#icon-collection
 */
const menu = [
  {
    index: '02',
    icon: DataAnalysis,
    title: '设备管理',
    children: [
      { icon: DataLine, title: '网络', path: '/device/network' },
      { icon: Connection, title: '路由器', path: '/device/router' },
      { icon: Switch, title: '交换机', path: '/device/switch' },
      { icon: Monitor, title: '无线AP', path: '/device/wireless' },
      { icon: Platform, title: '客户端', path: '/device/client' },
      { icon: SwitchButton, title: '门店重启', path: '/device/restart', role: 'L1' }
    ]
  },
  {
    index: '03',
    icon: SetUp,
    title: '监控管理',
    children: [
      { icon: DataAnalysis, title: '告警统计', path: '/monitor/alarmCount' },
      { icon: Document, title: '告警记录', path: '/monitor/alarmLog' },
      { icon: Bell, title: '告警配置', path: '/monitor/alarmConfig' },
      { icon: MuteNotification, title: '告警忽略', path: '/monitor/alarmIgnoreConfig' },
      { icon: AlarmClock, title: '定时任务', path: '/system/job' },
      { icon: Message, title: '任务记录', path: '/system/jobLog' }
    ]
  },
  {
    index: '04',
    icon: OfficeBuilding,
    title: 'org管理',
    children: [
      { icon: List, title: 'org信息', path: '/org/info' }
    ]
  },
  {
    index: '05',
    icon: Document,
    title: '日志管理',
    children: [
      { icon: Clock, title: '变更记录', path: '/logs/history' }
    ]
  },
  {
    index: '06',
    icon: Setting,
    title: '系统管理',
    children: [
      { icon: UserFilled, title: '用户管理', path: '/system/user' },
      { icon: User, title: '角色管理', path: '/system/role' },
      { icon: House, title: '资源管理', path: '/system/resource' },
      { icon: Notebook, title: '字典管理', path: '/system/dict' },
      { icon: Coin, title: 'redis管理', path: '/system/redis' }
    ]
  }
];

// 调用markRaw处理每个icon组件，消除警告
menu.forEach((subMenu) => {
  const children = subMenu.children;
  subMenu.icon = markRaw(subMenu.icon);
  children.forEach((item) => {
    if (item.icon) {
      item.icon = markRaw(item.icon);
    }
  });
});

export default menu;
