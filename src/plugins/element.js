import ElementPlus from 'element-plus/lib';
import 'element-plus/dist/index.css';

// import locale from 'element-plus/lib/locale';
import zhCn from 'element-plus/lib/locale/lang/zh-cn';

export default (app) => {
  // locale.use(zhCn);
  // const elementOption = { size: 'small', zIndex: 3000 };
  // app.config.globalProperties.$ELEMENT = elementOption;
  app.use(ElementPlus, {
    size: 'small',
    locale: zhCn,
  });
};
