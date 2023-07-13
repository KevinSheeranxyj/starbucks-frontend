import mitt from 'mitt';

const emitter = mitt();

export default (app) => {
  // locale.use(zhCn);
  // const elementOption = { size: 'small', zIndex: 3000 };
  // app.config.globalProperties.$ELEMENT = elementOption;
  app.config.globalProperties.$mitt = emitter;
};

export { emitter };
