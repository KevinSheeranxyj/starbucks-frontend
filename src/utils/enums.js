
/**
 * 枚举定义工具
 * 示例：
 * const STATUS = createEnum({
 *     AUDIT_WAIT: ['01', '审核中'],
 *     AUDIT_PASS: ['02', '审核通过']
 * })
 * 获取枚举值：STATUS.AUDIT_WAIT
 * 获取枚举描述：STATUS.getDesc('AUDIT_WAIT')
 * 通过枚举值获取描述：STATUS.getDescFromValue(STATUS.WAIT)
 *
 */
function createEnum(definition) {
  const strToValueMap = {};
  const numToDescMap = {};
  for (const enumName of Object.keys(definition)) {
    const [value, desc] = definition[enumName];
    strToValueMap[enumName] = value;
    numToDescMap[value] = desc;
  }
  return {
    ...strToValueMap,
    getDesc(enumName) {
      return (definition[enumName] && definition[enumName][1]) || '';
    },
    getDescFromValue(value) {
      return numToDescMap[value] || '';
    },
    getDescsFromValues(values) {
      let descs = [];
      values.forEach((o) => {
        descs.push(numToDescMap[o] || '');
      });
      return descs;
    }
  };
}

/**
 * 根据options创建枚举
 * @param {Array} options options
 * @returns 枚举
 */
function createEnumByOptions(options) {
  const enumData = {};
  options.forEach((o) => {
    enumData[o.value] = [o.value, o.label];
  });
  return createEnum(enumData);
}

/**
 * 匹配表格列中的options，并创建枚举
 * @param {Array} options options
 * @returns 枚举
 */
 function createEnumByTableColumns(tableColumns, prop) {
  for (let i in tableColumns){
    if (tableColumns[i].prop === prop){
      return createEnumByOptions(tableColumns[i].config.options);
    }
  }
}

export { createEnum, createEnumByOptions, createEnumByTableColumns, };
