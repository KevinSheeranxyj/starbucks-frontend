<template>
  <!-- 表格组件 -->
  <compo-table
    ref="compoTableRef"
    :table-params="table"
    @changeSelect="changeSelect"
    @remoteMethod="remoteMethod"
    @reset="afterReset"
  >
    <!-- 按钮插槽 -->
    <template #buttonSlot>
      <el-button type="primary" plain :loading="syncLoading" @click="syncNetwork">同 步</el-button>
      <el-button type="primary" plain @click="openHistoryDialog">查询历史</el-button>
    </template>

    <template #tableTextSlot="slotProps">
      <div v-if="slotProps.prop === 'status'">
        <el-tag :type="getTagTypeByStatus(slotProps.cellValue)">
          {{ statusEnum.getDescFromValue(slotProps.cellValue) }}
        </el-tag>
      </div>
      <div v-else-if="slotProps.prop === 'organizationId'">
        {{ organizationEnum.getDescFromValue(slotProps.cellValue) }}
      </div>
      <div v-else-if="slotProps.prop === 'networkName'">
        <el-link type="primary" @click="routerNetworkPage(slotProps.scope.row)">
          {{ slotProps.cellValue }}
        </el-link>
      </div>
      <div v-else-if="slotProps.prop === 'connectClientNum'">
        <el-link type="primary" @click="routerClientPage(slotProps.scope.row)">
          {{ slotProps.cellValue }}
        </el-link>
      </div>
    </template>

    <template #tableSelectSlot="slotProps">
      <div v-if="slotProps.prop === 'customStatus'">
        <div v-if="slotProps.cellValue">
          <el-tag :type="getTagTypeByStatus(slotProps.cellValue)">
            {{ statusEnum.getDescFromValue(slotProps.cellValue) }}
          </el-tag>
        </div>
      </div>
    </template>

    <template #dialog>
      <!-- 对话框组件 -->
      <compo-dialog ref="historyDialogRef" :dialog-params="historyDialog">
        <template #dialogSlot>
          <div id="areaChart" v-loading="chartLoading" style="height: 400px"></div>
        </template>
        <template #dialogButtonSlot>
          <el-button type="primary" plain @click="queryHistoryData">查 询</el-button>
        </template>
      </compo-dialog>
    </template>
  </compo-table>

</template>

<script setup>
import {reactive, ref, onMounted, computed, onActivated, h} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import http from '@/utils/http';
import {ElMessage, ElMessageBox} from 'element-plus/lib/components';
import tool from '@/utils/tool';
import {createEnumByOptions} from '@/utils/enums';
import * as echarts from 'echarts';
import {getOrganizationOptions, getNetworkOptions, getDeviceOptions, getTagTypeByStatus, getTimespanOptions} from './device';

const router = useRouter();
const route = useRoute();

const compoTableRef = ref(null);
const historyDialogRef = ref(null);
const syncLoading = ref(false);
const selected = reactive({
  networkId: '',
  organizationId: '',
  serial: ''
});
const organizationOptions = reactive([]);
const networkOptions = reactive([]);
const deviceNameOptions = reactive([]);
const deviceSerialOptions = reactive([]);
const deviceStatusOptions = reactive([]);
const macOptions = reactive([]);
const publicIpOptions = reactive([]);
const importantOptions = reactive([
  {label: '是', value: '1'},
  {label: '否', value: '0'}
]);
const dataTypeOptions = reactive([
  {label: '2.4G信道利用率', value: 'utilization2g'},
  {label: '5G信道利用率', value: 'utilization5g'},
  {label: '信噪比', value: 'snr'},
  {label: '信号强度', value: 'rssi'},
  {label: '延时', value: 'latency'},
  {label: 'AP流量', value: 'usage'},
  {label: 'AP连接数', value: 'clientCount'}
]);
const timespanOptions = reactive([]);
const resolutionOptionsAll = reactive([
  {label: '10分钟', value: 600},
  {label: '1小时', value: 3600},
  {label: '1天', value: 86400}
]);
const resolutionOptions = computed(() => {
  if (historyDialogRef.value.timespan === 86400) {  // 1天
    return resolutionOptionsAll.filter(option => option.value !== 600); // 过滤掉 10 分钟
  }
  return resolutionOptionsAll; // 如果没有特殊条件，则返回所有选项
});
const chartLoading = ref(false);
// 远程选项
const remoteNetworkOptions = reactive([]);
const remoteNameOptions = reactive([]);
const remoteSerialOptions = reactive([]);
const remoteMacOptions = reactive([]);
const remotePublicIpOptions = reactive([]);

const organizationEnum = computed(() => {
  return createEnumByOptions(organizationOptions);
});

const statusEnum = computed(() => {
  return createEnumByOptions(deviceStatusOptions);
});

const dataTypeEnum = computed(() => {
  return createEnumByOptions(dataTypeOptions);
});

// 表格列
const columns = [
  {label: '状态', prop: 'status', sortable: true, width: '60px'},
  {
    label: '自定义状态', prop: 'customStatus', type: 'select',
    config: {options: deviceStatusOptions }
  },
  {label: '关注', prop: 'importantFlag', type: 'switch', sortable: true, width: '60px' },
  {label: '组织', prop: 'organizationId', sortable: true, width: '150px', showOverflowTooltip: true},
  {label: '网络', prop: 'networkName', sortable: true, minWidth: '220px', showOverflowTooltip: true},
  {label: '无线AP', prop: 'name', sortable: true, width: '100px', showOverflowTooltip: true},
  {label: '序列', prop: 'serial', width: '120px' },
  {label: '终端数量', prop: 'connectClientNum', sortable: true, width: '80px' },
  {label: '信噪比/dB', prop: 'snr', sortable: true, width: '100px' },
  {label: '信号强度/dBm', prop: 'rssi', sortable: true, width: '110px' },
  {label: '延时/ms', prop: 'latency', sortable: true, width: '80px' },
  {label: '2.4G信道利用率', prop: 'utilization2g', sortable: true, width: '120px' },
  {label: '5G信道利用率', prop: 'utilization5g', sortable: true, width: '120px' },
  {label: 'MAC', prop: 'mac', width: '105px' },
  {label: '公网IP', prop: 'publicIp', width: '100px' },
  {label: 'LAN IP', prop: 'lanIp', width: '100px' },
  {label: '网关', prop: 'gateway', width: '100px' },
  {label: '地理位置信息', prop: 'address', minWidth: '100px',},
  {label: '掩码', prop: 'mask', minWidth: '100px',},
  {label: '主DNS', prop: 'primaryDns', minWidth: '100px',},
  {label: '次DNS', prop: 'secondaryDns', minWidth: '100px',},
];

// 查询表单
const queryForm = [
  {
    label: '组织', prop: 'organizationId', type: 'select',
    config: {options: organizationOptions, clearable: false}
  },
  {
    label: '网络', prop: 'networkId', type: 'select',
    config: {options: remoteNetworkOptions, remote: true, placeholder: '请输入'}
  },
  {
    label: '无线AP', prop: 'name', type: 'select',
    config: {options: remoteNameOptions, remote: true, placeholder: '请输入' }
  },
  {
    label: '关注', prop: 'importantFlag', type: 'select',
    config: {options: importantOptions}
  },
  {
    label: '序列', prop: 'serial', type: 'select',
    config: {options: remoteSerialOptions, remote: true, placeholder: '请输入' }
  },
  {
    label: '状态', prop: 'statusList', type: 'select',
    config: {options: deviceStatusOptions, multiple: true, collapseTags: true}
  },
  {
    label: 'MAC', prop: 'mac', type: 'select',
    config: {options: remoteMacOptions, remote: true, placeholder: '请输入' }
  },
  // {
  // label: '公网IP', prop: 'publicIp', type: 'select',
  //   config: {options: remotePublicIpOptions, remote: true, placeholder: '请输入',},
  // },
  {
    label: '信噪比 ≤', prop: 'snr', type: 'input',
    config: {placeholder: 'dB'}
  },
  {
    label: '信号强度 ≤', prop: 'rssi', type: 'input',
    config: {placeholder: 'dBm'}
  },
  {
    label: '延时 ≥', prop: 'latency', type: 'input',
    config: {placeholder: 'ms'}
  },
  {label: '2.4G信道 ≥', prop: 'utilization2g', type: 'input' },
  {label: '5G信道 ≥', prop: 'utilization5g', type: 'input' }
];

const table = {
  query: {
    url: '/device/wireless/table',
    form: {formItems: queryForm}
  },
  columns: columns,
  config: {
    page: true,
    multipleTable: true
  },
  update: {
    url: '/device/update'
  }

};

const historyForm = [
  {
    label: '数据类型', prop: 'wirelessDataType', type: 'select', fixedSpan: 6,
    config: {options: dataTypeOptions, clearable: false}
  },
  {
    label: '时间范围', prop: 'timespan', type: 'select', fixedSpan: 6,
    config: {options: timespanOptions, clearable: false}
  },
  {
    label: '时间间隔', prop: 'resolution', type: 'select', fixedSpan: 6,
    config: {options: resolutionOptions, clearable: false}
  }
]

const historyDialog = {
  title: '历史数据查询',
  form: {formItems: historyForm},
  button: false,
  fullscreen: true
}

/**
 * 表单选择器变动
 */
function changeSelect(prop, val) {
  if (prop === 'organizationId') {
    getNetworkOptions(val, networkOptions);
    getDeviceOptions({'organizationId': val, productType: 'wireless'}, deviceNameOptions, deviceSerialOptions, macOptions, publicIpOptions);
  } else if (prop === 'networkId') {
    getDeviceOptions({'networkId': val, productType: 'wireless'}, deviceNameOptions, deviceSerialOptions, macOptions, publicIpOptions);
    if (val === '') {
      remoteNetworkOptions.length = 0;
    }
  }
}

/**
 * 表单选择器远程方法
 */
function remoteMethod(prop, val) {
  if (val) {
    if (prop === 'networkId') {
      tool.getRemoteOptions(val, remoteNetworkOptions, networkOptions);
    } else if (prop === 'name') {
      tool.getRemoteOptions(val, remoteNameOptions, deviceNameOptions);
    } else if (prop === 'serial') {
      tool.getRemoteOptions(val, remoteSerialOptions, deviceSerialOptions);
    } else if (prop === 'mac') {
      tool.getRemoteOptions(val, remoteMacOptions, macOptions);
    } else if (prop === 'publicIp') {
      tool.getRemoteOptions(val, remotePublicIpOptions, publicIpOptions);
    }
  } else if (typeof val === 'undefined') {
    if (prop === 'networkId') {
      remoteNetworkOptions.length = 0;
    } else if (prop === 'name') {
      remoteNameOptions.length = 0;
    } else if (prop === 'serial') {
      remoteSerialOptions.length = 0;
    } else if (prop === 'mac') {
      remoteMacOptions.length = 0;
    } else if (prop === 'publicIp') {
      remotePublicIpOptions.length = 0;
    }
  }
}

/**
 * 查询表格
 */
function queryTable() {
  compoTableRef.value.query();
}

/**
 * 重置后
 */
function afterReset() {
  getNetworkOptions(null, networkOptions);
  getDeviceOptions({productType: 'wireless'}, deviceNameOptions, deviceSerialOptions, macOptions, publicIpOptions);
}

async function syncNetwork() {
  const selection = compoTableRef.value.getMultipleSelection();
  if (selection.length !== 1) {
    return ElMessage.warning('请选择一条记录!');
  }

  syncLoading.value = true;

  ElMessageBox({
    title: '同步被选中网络的无线AP信息',
    message: h('p', null, [
      h('p', null, '网络：' + selection[0].networkName)
    ]),
    confirmButtonText: '确定'
  }).then(async() => {
    const {data: res} = await http.post('/device/wireless/sync', {
      networkIds: [selection[0].networkId],
      organizationId: selection[0].organizationId
    });
    syncLoading.value = false;
    if (!res.success) {
      return ElMessage.error(res.msg);
    }
    ElMessage.success(res.msg);
    queryTable();
  }).catch(() => {
    syncLoading.value = false;
  })
}

/**
 * 打开历史对话框
 */
async function openHistoryDialog() {
  const selection = compoTableRef.value.getMultipleSelection()
  if (selection.length !== 1) {
    return ElMessage.warning('请选择一条记录!');
  }
  await historyDialogRef.value.openDialog();
  await historyDialogRef.value.setForm({
    resolution: 600,
    timespan: 86400,
    wirelessDataType: 'utilization2g'
  });

  if (selected.serial !== selection[0].serial) {
    selected.organizationId = selection[0].organizationId;
    selected.networkId = selection[0].networkId;
    selected.serial = selection[0].serial;
    queryHistoryData();
  }
}

// 根据数据类型获取单位
function getUnitForDataType(dataType) {
  const option = dataTypeOptions.find(opt => opt.value === dataType);
  switch (option.value) {
    case 'utilization2g':
    case 'utilization5g':
      return '%';
    case 'snr':
    case 'rssi':
      return 'dB';
    case 'latency':
      return 'ms';
    case 'usage':
      return 'MB';
    case 'clientCount':
      return '个';
    default:
      return '';
  }
}

/**
 * 查询历史数据
 */
async function queryHistoryData() {
  const form = historyDialogRef.value.getForm();
  chartLoading.value = true;
  const historyBody = {
    resolution: form.resolution,
    organizationId: selected.organizationId,
    networkId: selected.networkId,
    deviceSerial: selected.serial,
    timespan: form.timespan,
    wirelessDataType: form.wirelessDataType
  }
  console.log(historyBody)
  const {data: res} = await http.post('/device/wireless/history', historyBody);
  chartLoading.value = false;
  if (!res.success) {
    return ElMessage.error(res.msg);
  }
  // 根据选择的数据类型设置标题
  let titles;
  if (form.wirelessDataType === 'usage') {
    titles = {
      title1: '上行流量',
      title2: '下行流量',
      title3: '总流量',
    };
  } else {
    titles = {
      title1: '',
      title2: '',
      title3: '',
    };
  }
  const chart = {
    title: dataTypeEnum.value.getDescFromValue(form.wirelessDataType),
    ...titles,
    valueData: [],
    value2Data: [],
    value3Data: [],
    xAxis: []
  };
  // 根据选择的数据类型设置单位
  const unit = getUnitForDataType(form.wirelessDataType);

  chart.xAxis = res.data.map(item => item.endTime);
  chart.valueData = res.data.map(item => item.value);
  chart.value2Data = res.data.map(item => item.value2);
  chart.value3Data = res.data.map(item => item.value3);
  if (res.data.every(item => item.value2 == null) && res.data.every(item => item.value3 == null)) {
    getAreaChart(chart,unit);
  } else {
    getAPUsageAreaChart(chart,unit);
  }

}

function getAPUsageAreaChart(chart,unit) {
  const chartDom = document.getElementById('areaChart');
  const chartOption = echarts.init(chartDom);
  chartOption.clear();
  chartOption.setOption({
    tooltip: {
      trigger: 'axis',
      position: function(pt) {
        return [pt[0], '10%'];
      },formatter: function (params) {
        return params.map(param => {
          return `${param.seriesName}: ${param.value} ${unit}`;
        }).join('<br>');
      }
    },
    title: {
      left: 'center',
      text: chart.title
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chart.xAxis
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} MB'
      },
      boundaryGap: [0, '100%']
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        start: 0,
        end: 10
      }
    ],
    series: [
      {
        name: chart.title1,
        type: 'line',
        symbol: 'none',
        sampling: 'lttb',
        itemStyle: {
          color: 'rgb(255, 70, 131)'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgb(68, 206, 255)'
            },
            {
              offset: 1,
              color: 'rgb(70, 158, 255)'
            }
          ])
        },
        data: chart.valueData
      },
      {
        name: chart.title2,
        type: 'line',
        symbol: 'none',
        sampling: 'lttb',
        itemStyle: {
          color: 'rgb(70, 158, 255)'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgb(68, 206, 255)'
            },
            {
              offset: 1,
              color: 'rgb(70, 158, 255)'
            }
          ])
        },
        data: chart.value2Data
      },
      {
        name: chart.title3,
        type: 'line',
        symbol: 'none',
        sampling: 'lttb',
        itemStyle: {
          color: 'rgb(131, 70, 255)'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgb(255, 206, 68)'
            },
            {
              offset: 1,
              color: 'rgb(255, 158, 70)'
            }
          ])
        },
        data: chart.value3Data
      }
    ]
  });
}

/**
 * 面积图
 */
function getAreaChart(chart,unit) {
  const chartDom = document.getElementById('areaChart');
  const chartOption = echarts.init(chartDom);
  chartOption.clear();
  chartOption.setOption({
    tooltip: {
      trigger: 'axis',
      position: function(pt) {
        return [pt[0], '10%'];
      },
      formatter: function (params) {
        return params.map(param => {
          return `${param.seriesName}: ${param.value} ${unit}`;
        }).join('<br>');
      }
    },
    title: {
      left: 'center',
      text: chart.title
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chart.xAxis
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} MB'
      },
      boundaryGap: [0, '100%']
    },

    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        start: 0,
        end: 10
      }
    ],
    series: [
      {
        name: chart.title,
        type: 'line',
        symbol: 'none',
        sampling: 'lttb',
        itemStyle: {
          color: 'rgb(255, 70, 131)'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgb(255, 158, 68)'
            },
            {
              offset: 1,
              color: 'rgb(255, 70, 131)'
            }
          ])
        },
        data: chart.valueData
      }
    ]
  });
}

/**
 * 跳转网络页
 * @param row
 */
const routerNetworkPage = (row) => {
  const routeParams = {
    networkId: row.networkId,
    organizationId:row.organizationId,
    networkName: row.networkName
  }
  router.push({
    name: 'network',
    params: routeParams
  });
};

/**
 * 跳转客户端页
 * @param row
 */
const routerClientPage = (row) => {
  const routeParams = {
    recentDeviceType: 'wireless',
    organizationId:row.organizationId,
    deviceSerial: row.serial
  }

  router.push({
    name: 'client',
    params: routeParams
  });
};
const routParams = ref();
/**
 * 校验是否页面跳转，设置查询条件
 */
async function setupState() {
  if (Object.keys(route.params).length > 0) {
    const query = route.params;
    routParams.value = query;
    const networkId = query.networkId;
    const networkName = query.networkName;
    const organizationId = query.organizationId;
    const serial = query.serial;
    const queryForm = {
      organizationId:organizationId,
      serial: serial,
      networkId: networkId,
      statusList: query.status ? [query.status] : null
    };
    // 设置查询表单
    compoTableRef.value.setForm(queryForm);
    queryTable();

    if (networkId) {
      await tool.setRemoteOptions(remoteNetworkOptions,organizationId, networkName, networkId);
      changeSelect('networkId', networkId);
      changeSelect('organizationId', organizationId);
      remoteNetworkOptions.length = 0;
    }
    if (serial) {
      getDeviceOptions({productType: 'wireless'}, deviceNameOptions, deviceSerialOptions, macOptions, publicIpOptions);
    }
  }
}

function initQuery() {
  const queryForm = {
    organizationId: organizationOptions.value = '76'
  };
  compoTableRef.value.setForm(queryForm);
  queryTable();
}

onMounted(() => {
  initQuery();
  tool.getOptions(deviceStatusOptions, 'DEVICE_STATUS');
  getOrganizationOptions(organizationOptions);
  getTimespanOptions(timespanOptions);
  getNetworkOptions(null, networkOptions);

  if (Object.keys(route.params).length <= 0) {
    getDeviceOptions({productType: 'wireless'}, deviceNameOptions, deviceSerialOptions, macOptions, publicIpOptions);
    queryTable();
  }
});

onActivated(() => {
  setupState()
});

</script>

<style lang="scss">

</style>
