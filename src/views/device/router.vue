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
      <div v-else-if="slotProps.prop === 'wanStatus'">
        <div v-if="slotProps.cellValue">
          <el-tag :type="getTagTypeByWanStatus(slotProps.cellValue)">
            {{ wanStatusEnum.getDescFromValue(slotProps.cellValue) }}
          </el-tag>
        </div>
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
import {reactive, ref, onMounted, computed, onActivated, h} from 'vue';
import {useRouter, useRoute} from 'vue-router';
import http from "@/utils/http";
import tool from '@/utils/tool';
import {createEnumByOptions} from '@/utils/enums.js';
import {ElMessage, ElMessageBox} from 'element-plus/lib/components';
import {getOrganizationOptions, getNetworkOptions, getDeviceOptions, getTagTypeByStatus, getTagTypeByWanStatus,
  getTimespanOptions} from './device';
import * as echarts from "echarts";

const router = useRouter();
const route = useRoute();

const compoTableRef = ref(null);
const historyDialogRef = ref(null);
const syncLoading = ref(false);
const selected = reactive({
  networkId: "",
  organizationId: "",
  serial: "",
});
const organizationOptions = reactive([]);
const networkOptions = reactive([]);
const deviceNameOptions = reactive([]);
const deviceSerialOptions = reactive([]);
const deviceStatusOptions = reactive([]);
const wanStatusOptions = reactive([]);
const macOptions = reactive([]);
const publicIpOptions = reactive([]);
const dataTypeOptions = reactive([
  {label: "流量", value: "traffic"},
]);
const regionOptions = reactive([
  {label: "华东", value: "EC"},
  {label: "南区", value: "South"},
  {label: "北区", value: "North"},
  {label: "中西", value: "CW"},
]);
const timespanOptions = reactive([]);
const resolutionOptions = reactive([
  {label: '1分钟', value: 60},
  {label: '10分钟', value: 600},
  {label: "1小时", value: 3600},
  {label: "1天", value: 86400},
]);
const chartLoading = ref(false);
// 远程选项
const remoteNetworkOptions = reactive([]);
const remoteNameOptions = reactive([]);
const remoteSerialOptions = reactive([]);
const remoteMacOptions = reactive([]);
const remotePublicIpOptions = reactive([]);

// const dataTypeEnum = computed(() => {
//   return createEnumByOptions(dataTypeOptions);
// });

const organizationEnum = computed(() => {
  return createEnumByOptions(organizationOptions);
});

const statusEnum = computed(() => {
  return createEnumByOptions(deviceStatusOptions);
});

const wanStatusEnum = computed(() => {
  return createEnumByOptions(wanStatusOptions);
});

// 表格列
const columns = [
  {label: '状态', prop: 'status', sortable: true, width: '60px',},
  {
    label: '自定义状态', prop: 'customStatus', type: 'select',
    config: {options: deviceStatusOptions,},
  },
  {label: '组织', prop: 'organizationId', sortable: true, minWidth: '120px', showOverflowTooltip: true},
  {label: '网络', prop: 'networkName', sortable: true, minWidth: '150px', showOverflowTooltip: true},
  {label: '路由器', prop: 'name', sortable: true, minWidth: '120px', showOverflowTooltip: true},
  {label: '序列', prop: 'serial', minWidth: '120px'},
  {label: '终端数量', prop: 'connectClientNum', width: '60px'},
  {label: 'WAN口状态', prop: 'wanStatus', width: '80px'},
  {label: 'WAN口离线时长', prop: 'wanOfflineDuration', minWidth: '110px'},
  {label: '地理位置信息', prop: 'address', minWidth: '100px',},
  {label: 'MAC', prop: 'mac', minWidth: '105px'},
  {label: '公网IP', prop: 'publicIp', minWidth: '100px'},
];

// 查询表单
const queryForm = [
  {
    label: '组织', prop: 'organizationId', type: 'select',
    config: {options: organizationOptions},
  },
  {
    label: '网络', prop: 'networkId', type: 'select',
    config: {options: remoteNetworkOptions, remote: true, placeholder: '请输入'},
  },
  {
    label: '路由器', prop: 'name', type: 'select',
    config: {options: remoteNameOptions, remote: true, placeholder: '请输入',},
  },
  {
    label: '序列', prop: 'serial', type: 'select',
    config: {options: remoteSerialOptions, remote: true, placeholder: '请输入',},
  },
  {
    label: '地区', prop: 'region', type: 'select',
    config: {options: regionOptions},
  },
  {
    label: '状态', prop: 'statusList', type: 'select',
    config: {options: deviceStatusOptions, multiple: true, collapseTags: true},
  },
  {
    label: 'MAC', prop: 'mac', type: 'select',
    config: {options: remoteMacOptions, remote: true, placeholder: '请输入',},
  },
  {
    label: '公网IP', prop: 'publicIp', type: 'select',
    config: {options: remotePublicIpOptions, remote: true, placeholder: '请输入',},
  },
];

const table = {
  query: {
    url: '/device/router/table',
    form: {formItems: queryForm},
  },
  columns: columns,
  config: {page: true, multipleTable: true,},
  update: {
    url: '/device/update',
  },
};

/**
 * 表单选择器变动
 */
function changeSelect(prop, val) {
  if (prop === 'organizationId') {
    getNetworkOptions(val, networkOptions);
    getDeviceOptions({'organizationId': val, productType: 'appliance'}, deviceNameOptions, deviceSerialOptions, macOptions, publicIpOptions);
  } else if (prop === 'networkId') {
    getDeviceOptions({'networkId': val, productType: 'appliance'}, deviceNameOptions, deviceSerialOptions, macOptions, publicIpOptions);
    if(val === ''){
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
  } else if(typeof val == 'undefined'){
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
  getDeviceOptions({productType: 'appliance'}, deviceNameOptions, deviceSerialOptions, macOptions, publicIpOptions);
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

async function syncNetwork() {
  const selection = compoTableRef.value.getMultipleSelection();
  if (selection.length !== 1) {
    return ElMessage.warning('请选择一条记录!');
  }

  syncLoading.value = true;

  ElMessageBox({
    title: '同步被选中网络的路由器信息',
    message: h('p', null, [
      h('p', null, "网络：" + selection[0].networkName),
    ]),
    confirmButtonText: '确定',
  }).then(async () => {
    const {data: res} = await http.post('/device/router/sync', {
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
    resolution: 60,
    timespan: 86400,
    wirelessDataType: 'traffic',
  });

  if (selected.serial !== selection[0].serial) {
    selected.organizationId = selection[0].organizationId;
    selected.networkId = selection[0].networkId;
    selected.serial = selection[0].serial;
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
    organizationId: selected.organizationId,
    networkId: selected.networkId,
    deviceSerial: selected.serial,
    timespan: form.timespan,
    wirelessDataType: form.wirelessDataType,
  }
  const {data: res} = await http.post('/device/appliance/history', historyBody);
  chartLoading.value = false;
  if (!res.success) {
    return ElMessage.error(res.msg);
  }
  const chart = {
    title: "发送",
    data: [],
    title2: "接收",
    data2: [],
    xAxis: [],
  };

  res.data.forEach((history) => {
    chart.data.push(history.value);
    chart.data2.push(history.value2);
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
      },
      formatter: function (list) {
        console.log("list: {}", list)
        let msg = list[0].name + "<br>";
        for (let i in list) {
          if (i === "0") {
            msg += list[i].marker + list[i].seriesName + "   " + list[i].data + " Mb/s" + "<br>";
          }
          if (i === "1") {
            msg += list[i].marker + list[i].seriesName + "   " + list[i].data + " Mb/s" + "<br>";
          }
        }
        return msg;
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
          color: '#67C23A'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: '#E6A23C'
            },
            {
              offset: 1,
              color: '#67C23A'
            }
          ])
        },
        data: chart.data
      },
      {
        name: chart.title2,
        type: 'line',
        symbol: 'none',
        sampling: 'lttb',
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: '#E6A23C'
            },
            {
              offset: 1,
              color: '#409EFF'
            }
          ])
        },
        data: chart.data2
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
 * 跳转客户端页
 */
const routerClientPage = (row) => {
  const routeParams = {
    recentDeviceType: 'appliance',
    deviceSerial: row.serial,
  }

  router.push({
    name: 'client',
    params: routeParams,
  });

};

/**
 * 校验是否页面跳转，设置查询条件
 */
async function setupState() {
  if (Object.keys(route.params).length > 0) {
    const query = route.params;
    const networkName = query.networkName;
    const networkId = query.networkId;
    const serial = query.serial;
    const queryForm = {
      serial: serial,
      networkId: networkId,
      statusList: query.status ? [query.status] : null,
    };
    // 设置查询表单
    compoTableRef.value.setForm(queryForm);
    queryTable();

    if (networkId) {
      await tool.setRemoteOptions(remoteNetworkOptions, networkName, networkId);
      changeSelect('networkId', networkId);
      remoteNetworkOptions.length = 0;
    }
    if(serial){
      getDeviceOptions({productType: 'appliance'}, deviceNameOptions, deviceSerialOptions, macOptions, publicIpOptions);
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
  tool.getOptions(wanStatusOptions, 'WAN_STATUS');
  getOrganizationOptions(organizationOptions);
  getNetworkOptions(null, networkOptions);

  getTimespanOptions(timespanOptions);
  if (Object.keys(route.params).length <= 0) {
    getDeviceOptions({productType: 'appliance'}, deviceNameOptions, deviceSerialOptions, macOptions, publicIpOptions);
    queryTable();
  }
});

onActivated(() => {
  setupState()
});

</script>

<style lang="scss">

</style>
