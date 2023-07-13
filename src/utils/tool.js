import axios from '@/utils/http';
import { ElMessage } from 'element-plus/lib/components';

const tool = {
  /* 判断两个对象属性和属性值是否相等 */
  isObjectValueEqual(a, b) {
    //取对象a和b的属性名
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);
    //判断属性名的length是否一致
    if (aProps.length != bProps.length) {
      return false;
    }
    //循环取出属性名，再判断属性值是否一致
    for (var i = 0; i < aProps.length; i++) {
      var propName = aProps[i];
      if (a[propName] !== b[propName]) {
        return false;
      }
    }
    return true;
  },

  isDeepObjectEqual(obj1, obj2) {
    //1.如果是比较对象===，返回true
    if (obj1 === obj2) return true;

    //2.如果比较的是两个方法，转成字符串比较
    if (typeof obj1 === 'function' && typeof obj2 === 'function') return obj1.toString() === obj2.toString();

    //3如果obj1和obj2都是Date实例，获取毫秒值比较
    if (obj1 instanceof Date && obj2 instanceof Date) return obj1.getTime() === obj2.getTime();

    //4如果比较是两个类型不一致,无须比较直接返回false
    if (Object.prototype.toString.call(obj1) !== Object.prototype.toString.call(obj2) || typeof obj1 !== 'object')
      return false;

    //5.获取对象所有自身属性的属性名（包括不可枚举属性但不包括Symbol值作为名称的属性
    const obj1Props = Object.getOwnPropertyNames(obj1);
    const obj2Props = Object.getOwnPropertyNames(obj2);

    //自身属性长度相等,
    if (obj1Props.length !== obj2Props.length) return false;

    //递归调用判断每一个属性值是否相等
    return obj1Props.every((prop) => tool.isDeepObjectEqual(obj1[prop], obj2[prop]));
  },

  /* 复制对象 */
  objCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  },
  /* 日期格式化 */
  dateFormat(date, fmt = 'yyyy-MM-dd') {
    if (!date) return '';
    date = new Date(date);
    var o = {
      'M+': date.getMonth() + 1, //月份
      'd+': date.getDate(), //日
      'h+': date.getHours(), //小时
      'm+': date.getMinutes(), //分
      's+': date.getSeconds(), //秒
      'q+': Math.floor((date.getMonth() + 3) / 3), //季度
      S: date.getMilliseconds(), //毫秒
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
      }
    }
    return fmt;
  },

  /**
   * 获取当前日期字符串
   * @param {string} fmt
   * @returns
   */
  getTodayDate(fmt = 'yyyy-MM-dd') {
    return this.dateFormat(new Date(), fmt);
  },

  /**
   * 获取当前登录用户信息
   * @returns 当前登录用户信息
   */
  getCurrentUserInfo() {
    if (!parent.getUserInfo) {
      return {};
    }
    return parent.getUserInfo();
  },

  /**
   * 打开layuimini标签
   * @param {string} href page/tool/jira-info-manage.html或者app/index.html#/releaseDetail
   * @param {string} tabId 用于判断tab是否打开过
   * @param {string} title
   * @param {string} icon
   * @returns
   */
  openLayuiminiTab(href, tabId, title, icon) {
    var loading = parent.layer.load(0, { shade: false, time: 2 * 1000 });

    let mpiKeyValue = 'mpi=m-p-i-1';
    href = '../../view/' + href;
    title = '<i class="' + icon + '"></i><span class="layui-left-nav"> ' + title + '</span>';

    if (tabId.indexOf('?') !== -1) {
      tabId = tabId + '&' + mpiKeyValue;
    } else {
      tabId = tabId + '?' + mpiKeyValue;
    }
    // 判断该窗口是否已经打开过
    var checkTab = parent.layuimini.checkTab(tabId, true);
    if (!checkTab) {
      var layuiminiTabInfo = JSON.parse(sessionStorage.getItem('layuiminiTabInfo'));
      if (layuiminiTabInfo == null) {
        layuiminiTabInfo = {};
      }
      layuiminiTabInfo[tabId] = { href: href, title: title };
      sessionStorage.setItem('layuiminiTabInfo', JSON.stringify(layuiminiTabInfo));
      parent.layui.element.tabAdd('layuiminiTab', {
        title: title + '<i data-tab-close="" class="layui-icon layui-unselect layui-tab-close">ဆ</i>', //用于演示
        content: '<iframe width="100%" height="100%" frameborder="0"  src="' + href + '"></iframe>',
        id: tabId,
      });
    }
    parent.layui.element.tabChange('layuiminiTab', tabId);
    parent.layuimini.tabRoll();
    parent.layer.close(loading);
  },

  /**
   * base64ToFile base64转文件
   * @param {String} urlData base64编码参数
   */
  base64ToFile(baseData) {
    const arr = baseData.split(',');
    const type = arr[0].match(/:(.*?);/)[1]; // 解析图片类型
    const bytes = atob(arr[1]); // 解码base64
    let n = bytes.length;
    const bufferArray = new Uint8Array(n);
    while (n--) {
      bufferArray[n] = bytes.charCodeAt(n);
    }
    const result = {
      file: new File([bufferArray], { type: type }),
      fileType: type.split('/')[1],
    };
    return result;
  },

  downloadBase64(content, fileName) {
    var base64ToBlob = function (code) {
      let parts = code.split(';base64,');
      let contentType = parts[0].split(':')[1];
      let raw = window.atob(parts[1]);
      let rawLength = raw.length;
      let uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      return new Blob([uInt8Array], {
        type: contentType,
      });
    };
    let aLink = document.createElement('a');
    let blob = base64ToBlob(content);
    let evt = document.createEvent('HTMLEvents');
    evt.initEvent('click', true, true);
    aLink.download = fileName;
    aLink.href = URL.createObjectURL(blob);
    aLink.click();
  },

  /**
   * 上传文件
   * @param {File} file 文件对象
   * @param {String} fileName 文件名称
   * @param {String} fileSource 文件来源
   * @returns {string} 可直接访问文件的url
   */
  async uploadFile(file, fileName, fileSource) {
    if (!fileSource) {
      ElMessage.error('请指定文件来源');
      throw Error('请指定文件来源');
    }
    let param = new FormData(); // 创建form对象
    param.append('file', file.file, fileName + '.' + file.fileType);
    param.append('fileSource', fileSource);
    let config = {
      headers: { 'Content-Type': 'multipart/form-data' },
    };
    const { data: res } = await axios.post('admin/file/upload', param, config);
    if (!res.success) {
      ElMessage.error('文件上传失败');
      throw Error('文件上传失败');
    }

    return res.body.url;
  },

  /**
   * 获取指定枚举值列表
   * @param {Array} options 枚举类型
   * @param {String} dictName 枚举类型
   * @returns 枚举值列表
   */
  async getOptions(options, dictName) {
    const { data: res } = await axios.get(`/sys/dict/query/` + dictName);
    if (!res.success) {
      return ElMessage.error(res.msg);
    }
    options.length = 0;
    res.data.forEach((o) => {
      options.push({
        label: o.dictName,
        value: o.dictCode,
      });
    });
  },

  /**
   * 根据value值获取label
   * @param {Array} options el-select的option数据
   * @param {String} value 对应value
   * @returns label值
   */
  getLabelByValue(options, value) {
    for (const option of options) {
      if (option.value === value) {
        return option.label;
      }
    }
  },

  /**
   * 选项去重
   * @param {Array} options el-select的option数据
   */
  removalOptions(options) {
    const map = new Map()
    return  options.filter((option) => !map.has(option.value) && map.set(option.value, option.label));
  },

  /**
   * 将base64文件编码转换成下载文件
   * @param {string} content 文件的base编码
   * @param {string} fileName 文件名称
   */
  downloadFile(content, fileName) {
    var base64ToBlob = function (code) {
      let parts = code.split(';base64,');
      let contentType = parts[0].split(':')[1];
      let raw = window.atob(parts[1]);
      let rawLength = raw.length;
      let uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      return new Blob([uInt8Array], {
        type: contentType,
      });
    };
    let aLink = document.createElement('a');
    let blob = base64ToBlob(content);
    let evt = document.createEvent('HTMLEvents');
    evt.initEvent('click', true, true);
    aLink.download = fileName;
    aLink.href = URL.createObjectURL(blob);
    aLink.click();
  },

  /**
   * 获取url中某个key的value
   * @param url
   * @param key
   * @returns {string}
   */
  getParamValue(url, key) {
    let keyValues = url.split('?')[1];
    let keyValueArray = keyValues.split('&');
    for (const keyValue of keyValueArray) {
      if (keyValue.indexOf(key) == -1) {
        continue;
      }
      return keyValue.split('=')[1];
    }
  },

  /**
   * 复制到剪切板
   * @param {String} text 内容
   */
  copyToClipboard(text) {
    navigator.clipboard?.writeText && navigator.clipboard.writeText(text);
  },

  /**
   * 清空对象属性
   * @param {Object} object 对象
   */
  clearObject(object) {
    for (const key in object) {
      delete object[key];
    }
  },

  // 全类型判断
  typeObj(obj) {
    let type = Object.prototype.toString.call(obj);
    if (type == '[object Number]') {
      return 'Number';
    } else if (type == '[object String]') {
      return 'String';
    } else if (type == '[object Boolean]') {
      return 'Boolean';
    } else if (type == '[object Object]') {
      return 'Object';
    } else if (type == '[object Array]') {
      return 'Array';
    } else if (type == '[object Null]') {
      return 'Null';
    } else if (type == '[object Undefined]') {
      return 'Undefined';
    } else if (type == '[object Function]') {
      return 'Function';
    } else if (type == '[object Symbol]') {
      return 'Symbol';
    } else if (type == '[object Date]') {
      return 'Date';
    } else if (type == '[object RegExp]') {
      return 'RegExp';
    }
  },

  isJSONArray(str) {
    try {
      const parsedObj = JSON.parse(str);
      if (this.typeObj(parsedObj) == 'Array') {
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  },

  // 查询角色枚举
  async queryRoleOption(roleOption, roleCode) {
    const body = { name: roleCode };
    // 查询某个角色下所有子孙角色
    const { data: res } = await axios.post('/admin/role/querySubRoles', body);
    roleOption.length = 0;
    res.body.forEach((role) => {
      roleOption.push({
        label: role.description,
        value: role.name,
      });
    });
  },

  /**
   * 获取远程选项
   */
  getRemoteOptions(val, remoteOptions, options) {
    remoteOptions.length = 0
    options.forEach((item) => {
      if (item.label.toLowerCase().includes(val.toLowerCase())) {
        remoteOptions.push({
          label: item.label,
          value: item.value,
        })
      }
    })
  },

  /**
   * 设置远程选项
   */
  setRemoteOptions(remoteOptions, label, value) {
    remoteOptions.length = 0
    remoteOptions.push({
      label: label,
      value: value,
    })
  }
};

export default tool;
