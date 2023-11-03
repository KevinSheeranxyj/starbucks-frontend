<template>
  <!-- 表格组件 -->
  <compo-table
      :tableParams="table"
      ref="compoTableRef"
      @changeSelect="changeSelect"
      @remoteMethod="remoteMethod"
      @reset="afterReset"
  >
    <!-- 按钮插槽 -->
    <template #buttonSlot>
      <el-button type="primary" plain @click="syncNetwork" :loading="syncLoading">同 步</el-button>
      <el-button type="primary" plain @click="openHistoryDialog">查询历史</el-button>
    </template>

    <template #tableTextSlot="slotProps">
      <div v-if="slotProps.prop === 'recentDeviceType'">
        {{ deviceTypeEnum.getDescFromValue(slotProps.cellValue) }}
      </div>
      <div v-else-if="slotProps.prop === 'networkName'">
        <el-link type="primary" @click="routerNetworkPage(slotProps.scope.row)">
          {{ slotProps.cellValue }}
        </el-link>
      </div>
      <div v-else-if="slotProps.prop === 'lastSeen'">
        {{ tool.dateFormat(slotProps.cellValue, 'yyyy-MM-dd hh:mm:ss') }}
      </div>
      <div v-else-if="slotProps.prop === 'recentDeviceSerial'">
        <el-link type="primary" @click="routerDevicePage(slotProps.scope.row)">
          {{ slotProps.cellValue }}
        </el-link>
      </div>
      <div v-else-if="slotProps.prop === 'organizationId'">
        {{ organizationEnum.getDescFromValue(slotProps.cellValue) }}
      </div>

    </template>

    <template #dialog>
      <!-- 对话框组件 -->
      <compo-dialog :dialogParams="syncDialog" ref="syncDialogRef"></compo-dialog>

      <compo-dialog :dialogParams="historyDialog" ref="historyDialogRef">
        <template #dialogSlot>
          <div v-loading="chartLoading" id="areaChart" style="height: 400px"></div>
        </template>
        <template #dialogButtonSlot>
          <el-button type="primary" plain @click="queryHistoryData">查 询</el-button>
        </template>
      </compo-dialog>
    </template>
  </compo-table>
</template>

<script setup>
import {reactive, ref, onMounted, computed, onActivated, h,} from 'vue';
import {useRouter, useRoute} from 'vue-router';
import http from "@/utils/http";
import {ElMessage, ElMessageBox} from 'element-plus/lib/components';
import tool from "@/utils/tool";
import {createEnumByOptions} from "@/utils/enums";
import * as echarts from "echarts";
import {getOrganizationOptions, getTimespanOptions} from './device';

const router = useRouter();
const route = useRoute();

const compoTableRef = ref(null);
const syncLoading = ref(false);
const selected = reactive({
  networkId: "",
  clientId: "",
  organizationId: "",
});
const remoteNetworkOptions = reactive([]);
const historyDialogRef = ref(null);
const networkOptions = reactive([]);
const deviceNameOptions = reactive([]);
const macOptions = reactive([]);
const ipOptions = reactive([]);
const deviceTypeOptions = reactive([]);
const deviceSerialOptions = reactive([]);
const importantOptions = reactive([
  {label: "是", value: "1"},
  {label: "否", value: "0"},
]);
const dataTypeOptions = reactive([
  {label: "延时", value: "latency"},
  {label: "信噪比", value: "snr"},
  {label: "信号强度", value: "rssi"},
]);
const timespanOptions = reactive([]);
const resolutionOptions = reactive([
  {label: '10分钟', value: 600},
  {label: "1小时", value: 3600},
  {label: "1天", value: 86400},
]);
const chartLoading = ref(false);
// 远程选项
const remoteMacOptions = reactive([]);
const remoteIpOptions = reactive([]);

const dataTypeEnum = computed(() => {
  return createEnumByOptions(dataTypeOptions);
});

const deviceTypeEnum = computed(() => {
  return createEnumByOptions(deviceTypeOptions);
});

// 表格列
const columns = [
  {label: '关注', prop: 'importantFlag', type: 'switch', sortable: true, width: '60px',},
  {label: '连接类型', prop: 'recentDeviceType', sortable: true, width: '80px'},
  {label: '网络', prop: 'networkName', sortable: true, minWidth: '200px', showOverflowTooltip: true},
  {label: '描述', prop: 'description', sortable: true, minWidth: '150px', showOverflowTooltip: true},
  {label: '连接设备', prop: 'recentDeviceName', sortable: true, minWidth: '100px'},
  {label: '连接至', prop: 'recentDeviceSerial', width: '120px'},
  {label: '信噪比/dB', prop: 'snr', sortable: true, width: '100px',},
  {label: '信号强度/dBm', prop: 'rssi', sortable: true, width: '110px',},
  {label: '延时/ms', prop: 'latency', sortable: true, width: '80px',},
  {label: '最近连接时间', prop: 'lastSeen', sortable: true, width: '130px',},
  {label: 'MAC', prop: 'mac', width: '110px'},
  {label: 'IP', prop: 'ip', width: '100px'},
  // {label: '2.4G信道利用率', prop: 'utilization2g', sortable: true,},
  // {label: '5G信道利用率', prop: 'utilization5g', sortable: true,},
];

const organizationOptions = reactive([]);

const organizationEnum = computed(() => {
  return createEnumByOptions(organizationOptions);
});

// 查询表单
const queryForm = [
  {
    label: '组织', prop: 'organizationId', type: 'select',
    config: {options: organizationOptions, clearable: false},
  },
  {
    label: '网络', prop: 'networkId', type: 'select',
    config: {options: remoteNetworkOptions, remote: true, placeholder: '请输入'},
  },
  {
    label: '连接设备', prop: 'deviceName', type: 'select',
    config: {options: deviceNameOptions, },
  },
  {
    label: '连接序列', prop: 'deviceSerial', type: 'select',
    config: {options: deviceSerialOptions, },
  },
  {
    label: '连接类型', prop: 'recentDeviceType', type: 'select',
    config: {options: deviceTypeOptions, },
  },
  {
    label: '关注', prop: 'importantFlag', type: 'select',
    config: {options: importantOptions},
  },
  {
    label: 'MAC', prop: 'mac', type: 'select',
    config: {options: remoteMacOptions, remote: true, placeholder: '请输入',},
  },
  {
    label: 'IP', prop: 'ip', type: 'select',
    config: {options: remoteIpOptions, remote: true, placeholder: '请输入',},
  },
  {
    label: '信噪比 ≤', prop: 'snr', type: 'input',
    config: {placeholder: 'dB'},
  },
  {
    label: '信号强度 ≤', prop: 'rssi', type: 'input',
    config: {placeholder: 'dBm'},
  },
  {
    label: '延时 ≥', prop: 'latency', type: 'input',
    config: {placeholder: 'ms'},
  },
];

const table = {
  query: {
    url: '/client/online/table',
    form: {formItems: queryForm},
  },
  columns: columns,
  config: {page: true, multipleTable: true,},
  update: {
    url: '/client/update',
  },
};

const syncForm = [
  {
    label: '网络', prop: 'networkIds', type: 'select', rules: true,
    config: {options: networkOptions, multiple: true, collapseTags: true},
  },
]

const syncDialog = {
  title: '同步',
  url: '/client/sync',
  form: {formItems: syncForm},
}

const historyForm = [
  {
    label: '数据类型', prop: 'wirelessDataType', type: 'select', fixedSpan: 6,
    config: {options: dataTypeOptions, clearable: false},
  },
  {
    label: '时间范围', prop: 'timespan', type: 'select', fixedSpan: 6,
    config: {options: timespanOptions, clearable: false},
  },
  {
    label: '时间间隔', prop: 'resolution', type: 'select', fixedSpan: 6,
    config: {options: resolutionOptions, clearable: false},
  },
]

const historyDialog = {
  title: '历史数据查询',
  form: {formItems: historyForm},
  button: false,
  fullscreen: true,
}


/**
 * 表单选择器变动
 */
function changeSelect(prop, val) {
  if (prop === 'networkId') {
    getDeviceOptions(val);
    getClientOptions({'networkId': val});
  }
  if (prop === 'deviceSerial') {
    getClientOptions({'deviceSerial': val});
  }
  if (prop === 'organizationId') {
    getNetworkOptions(val, networkOptions);
    queryTable();
  }
}

/**
 * 表单选择器远程方法
 */
function remoteMethod(prop, val) {
  if (val) {
    if (prop === 'mac') {
      tool.getRemoteOptions(val, remoteMacOptions, macOptions);
    } else if (prop === 'ip') {
      tool.getRemoteOptions(val, remoteIpOptions, ipOptions);
    }
  } else if(typeof val == 'undefined'){
    if (prop === 'mac') {
      remoteMacOptions.length = 0;
    } else if (prop === 'ip') {
      remoteIpOptions.length = 0;
    }
  }

  if (val) {
    if (prop === 'networkId') {
      tool.getRemoteOptions(val, remoteNetworkOptions, networkOptions);
    }
  } else if (typeof val === 'undefined') {
    if (prop === 'networkId') {
      remoteNetworkOptions.length = 0;
    }
  }
}

/**
 * 获取客户端连接设备列表
 */
async function getClientOptions(req) {
  const body = {
    'status': 'Online',
    'networkId': req.networkId,
    'deviceSerial': req.deviceSerial,
  }
  const {data: res} = await http.post('/client/option/list', body);
  macOptions.length = 0;
  ipOptions.length = 0;
  const ipList = [];
  res.data.forEach((client) => {
    macOptions.push({
      label: client.mac,
      value: client.mac,
    });

    if (client.ip) {
      ipList.push({
        label: client.ip,
        value: client.ip,
      });
    }
  });

  tool.removalOptions(ipList).forEach((ip) => {
    ipOptions.push({
      label: ip.label,
      value: ip.label,
    })
  });

}

/**
 * 获取设备列表
 */
async function getDeviceOptions(networkId) {
  const { data: office } = await http.post('/sys/redis/value', {key: 'DICT:OFFICE_ORG_ID'});
  const officeOrgId = office.data.value;

  const body = {
    'networkId': networkId,
    'organizationId': officeOrgId,
  }
  const {data: res} = await http.post('/device/option/list', body);
  deviceNameOptions.length = 0;
  deviceSerialOptions.length = 0;
  res.data.forEach((device) => {
    if (device.name) {
      deviceNameOptions.push({
        label: device.name,
        value: device.name,
      });
    }

    deviceSerialOptions.push({
      label: device.serial,
      value: device.serial,
    });
  });
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
  getClientOptions({});
  getDeviceOptions();
  getNetworkOptions(null, networkOptions);
}

async function syncNetwork() {
  const selection = compoTableRef.value.getMultipleSelection();
  if (selection.length !== 1) {
    return ElMessage.warning('请选择一条记录!');
  }

  syncLoading.value = true;
  ElMessageBox({
    title: '同步被选中网络的客户端信息',
    message: h('p', null, [
      h('p', null, "网络：" + selection[0].networkName),
    ]),
    confirmButtonText: '确定',
  }).then(async () => {
    const {data: res} = await http.post('/client/sync', {
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
    wirelessDataType: 'latency',
  });

  if (selected.clientId !== selection[0].clientId) {
    selected.clientId = selection[0].clientId;
    selected.networkId = selection[0].networkId;
    selected.organizationId = selection[0].organizationId;
    queryHistoryData();
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
    networkId: selected.networkId,
    clientId: selected.clientId,
    organizationId: selected.organizationId,
    timespan: form.timespan,
    wirelessDataType: form.wirelessDataType,
  }
  const {data: res} = await http.post('/device/wireless/history', historyBody);
  chartLoading.value = false;
  if (!res.success) {
    return ElMessage.error(res.msg);
  }
  const chart = {
    title: dataTypeEnum.value.getDescFromValue(form.wirelessDataType),
    data: [],
    xAxis: [],
  };

  res.data.forEach((history) => {
    chart.data.push(history.value);
    chart.xAxis.push(history.endTime);
  })

  getAreaChart(chart);
}

/**
 * 面积图
 */
function getAreaChart(chart) {
  const chartDom = document.getElementById('areaChart');
  const chartOption = echarts.init(chartDom);
  chartOption.setOption({
    tooltip: {
      trigger: 'axis',
      position: function (pt) {
        return [pt[0], '10%'];
      }
    },
    title: {
      left: 'center',
      text: chart.title
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chart.xAxis,
    },
    yAxis: {
      type: 'value',
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
        data: chart.data
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
    networkName: row.networkName,
  }
  router.push({
    name: 'network',
    params: routeParams,
  });
};


/**
 * 跳转设备页
 * @param row
 */
const routerDevicePage = (row) => {
  const recentDeviceType = row.recentDeviceType;
  const routeParams = {
    serial: row.recentDeviceSerial,
  }
  if (recentDeviceType === 'switch') {
    router.push({
      name: 'switch',
      params: routeParams,
    });
  } else if (recentDeviceType === 'appliance') {
    router.push({
      name: 'router',
      params: routeParams,
    });
  } else if (recentDeviceType === 'wireless') {
    router.push({
      name: 'wireless',
      params: routeParams,
    });
  }
};

/**
 * 查询办公室网络选项
 */
async function getOfficeNetworkOptions(options) {
  const { data: office } = await http.post('/sys/redis/value', {key: 'DICT:OFFICE_ORG_ID'});
  const officeOrgId = office.data.value;
  const { data: officeRes } = await http.post('/sys/redis/value', {key: 'DICT:NETWORK_NAME:ORG_ID:'+ officeOrgId});
  const officeNetworkNameDict = JSON.parse(officeRes.data.value);

  options.length = 0;
  for(let networkId in officeNetworkNameDict) {
    const data = {
      label: officeNetworkNameDict[networkId],
      value: networkId,
    };
    options.push(data);
  }
}

/**
 * 校验是否页面跳转，设置查询条件
 */
async function setupState() {
  if (Object.keys(route.params).length > 0) {
    const query = route.params;
    const networkId = query.networkId;
    const deviceSerial = query.deviceSerial;
    const queryForm = {
      networkId: networkId,
      recentDeviceType: query.recentDeviceType,
      deviceSerial: deviceSerial,
    };
    // 设置查询表单
    compoTableRef.value.setForm(queryForm);
    queryTable();

    if (networkId) {
      changeSelect('networkId', networkId);
    }
    if (deviceSerial) {
      getDeviceOptions();
      changeSelect('deviceSerial', deviceSerial);
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
  console.log("onMounted")
  tool.getOptions(deviceTypeOptions, 'DEVICE_TYPE');
  getTimespanOptions(timespanOptions);
  getOfficeNetworkOptions(networkOptions);
  getOrganizationOptions(organizationOptions);

  if (Object.keys(route.params).length <= 0) {
    getClientOptions({});
    getDeviceOptions();
    queryTable();
  }
});

onActivated(() => {
  console.log("onActivated")
  setupState()
});

</script>

<style lang="scss">

</style>
