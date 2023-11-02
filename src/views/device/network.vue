<template>
  <!-- 表格组件 -->
  <compo-table
      :tableParams="table"
      @changeSelect="changeSelect"
      @remoteMethod="remoteMethod"
      @reset="afterReset"
      ref="compoTableRef"
  >
    <!-- 按钮插槽 -->
    <template #buttonSlot>
      <el-button type="primary" plain @click="syncNetwork" :loading="syncLoading">同 步</el-button>
      <el-button type="primary" plain @click="openRebootDialog">AP 重启</el-button>
      <el-button v-if=false type="primary" plain @click="openHistoryDialog">查询历史</el-button>
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
      <div v-else-if="slotProps.prop === 'routerNum'">
        <el-popover
            placement="top-start"
            trigger="hover"
            :auto-close=0
        >
          <template #reference>
            <el-tag
                :type="getDeviceTagType(slotProps.scope.row.alertingRouterNum, slotProps.scope.row.offlineRouterNum, slotProps.scope.row.dormantRouterNum)">
              <el-link
                  :type="getDeviceLinkType(slotProps.scope.row.alertingRouterNum, slotProps.scope.row.offlineRouterNum, slotProps.scope.row.dormantRouterNum)"
                  @click="routerDevicePage(slotProps.scope.row, 'appliance')">
                {{ slotProps.cellValue }}
              </el-link>
            </el-tag>
          </template>
          <template #default>
            <p style="margin: 0;"> {{ '在线: ' + slotProps.scope.row.onlineRouterNum }} </p>
            <p style="margin: 0;"> {{ '告警: ' + slotProps.scope.row.alertingRouterNum }} </p>
            <p style="margin: 0;"> {{ '休眠: ' + slotProps.scope.row.dormantRouterNum }} </p>
            <p style="margin: 0;"> {{ '离线: ' + slotProps.scope.row.offlineRouterNum }} </p>
          </template>
        </el-popover>
      </div>
      <div v-else-if="slotProps.prop === 'switchNum'">
        <el-popover
            placement="top-start"
            trigger="hover"
            :auto-close=0
        >
          <template #reference>
            <el-tag
                :type="getDeviceTagType(slotProps.scope.row.alertingSwitchNum, slotProps.scope.row.offlineSwitchNum, slotProps.scope.row.dormantSwitchNum)">
              <el-link
                  :type="getDeviceLinkType(slotProps.scope.row.alertingSwitchNum, slotProps.scope.row.offlineSwitchNum, slotProps.scope.row.dormantSwitchNum)"
                  @click="routerDevicePage(slotProps.scope.row, 'switch')">
                {{ slotProps.cellValue }}
              </el-link>
            </el-tag>
          </template>
          <template #default>
            <p style="margin: 0;"> {{ '在线: ' + slotProps.scope.row.onlineSwitchNum }} </p>
            <p style="margin: 0;"> {{ '告警: ' + slotProps.scope.row.alertingSwitchNum }} </p>
            <p style="margin: 0;"> {{ '休眠: ' + slotProps.scope.row.dormantSwitchNum }} </p>
            <p style="margin: 0;"> {{ '离线: ' + slotProps.scope.row.offlineSwitchNum }} </p>
          </template>
        </el-popover>
      </div>
      <div v-else-if="slotProps.prop === 'wirelessNum'">
        <el-popover
            placement="top-start"
            trigger="hover"
            :auto-close=0
        >
          <template #reference>
            <el-tag
                :type="getDeviceTagType(slotProps.scope.row.alertingWirelessNum, slotProps.scope.row.offlineWirelessNum, slotProps.scope.row.dormantWirelessNum)">
              <el-link
                  :type="getDeviceLinkType(slotProps.scope.row.alertingWirelessNum, slotProps.scope.row.offlineWirelessNum, slotProps.scope.row.dormantWirelessNum)"
                  @click="routerDevicePage(slotProps.scope.row, 'wireless')">
                {{ slotProps.cellValue }}
              </el-link>
            </el-tag>
          </template>
          <template #default>
            <p style="margin: 0;"> {{ '在线: ' + slotProps.scope.row.onlineWirelessNum }} </p>
            <p style="margin: 0;"> {{ '告警: ' + slotProps.scope.row.alertingWirelessNum }} </p>
            <p style="margin: 0;"> {{ '休眠: ' + slotProps.scope.row.dormantWirelessNum }} </p>
            <p style="margin: 0;"> {{ '离线: ' + slotProps.scope.row.offlineWirelessNum }} </p>
          </template>
        </el-popover>
      </div>
      <div v-else-if="slotProps.prop === 'connectClientNum'">
        <el-tag>
          <el-link type="primary" @click="routerClientPage(slotProps.scope.row)">
            {{ slotProps.cellValue }}
          </el-link>
        </el-tag>
      </div>
    </template>

    <template #dialog>
      <compo-dialog :dialogParams="historyDialog" ref="historyDialogRef">
        <template #dialogSlot>
          <div v-loading="chartLoading" id="areaChart" style="height: 400px"></div>
        </template>
        <template #dialogButtonSlot>
          <el-button type="primary" plain @click="queryHistoryData">查 询</el-button>
        </template>
      </compo-dialog>

      <compo-dialog :dialogParams="rebootDialog" ref="rebootDialogRef">
        <template #dialogSlot>
          <div style="padding: 0px 0px 10px 0px">
            <el-table ref="multipleTableRef"
                      :data="rebootDeviceList"
                      border style="width: 100%"
                      @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="55" align="center"/>
              <el-table-column prop="name" label="无线AP" align="center"/>
              <el-table-column prop="serial" label="序列号" align="center"/>
            </el-table>
          </div>
        </template>
        <template #dialogButtonSlot>
          <el-button type="primary" plain @click="rebootWireless" :loading="restartLoading">AP 重启</el-button>
        </template>
      </compo-dialog>
    </template>

  </compo-table>
</template>

<script setup>
import {reactive, ref, onMounted, onActivated, computed, h,} from 'vue';
import {useRoute, useRouter} from "vue-router";
import http from "@/utils/http";
import {ElMessage, ElMessageBox} from 'element-plus/lib/components';
import {createEnumByOptions} from "@/utils/enums";
import tool from "@/utils/tool";
import * as echarts from "echarts";
import {
  getOrganizationOptions,
  getNetworkOptions,
  getTimespanOptions,
  getTagTypeByStatus,
} from './device';

const compoTableRef = ref(null);
const rebootDialogRef = ref(null);
const historyDialogRef = ref(null);
const chartLoading = ref(false);
const syncLoading = ref(false);
const restartLoading = ref(false);
const selected = reactive({
  networkId: "",
  organizationId: "",
});
const organizationOptions = reactive([]);
const networkOptions = reactive([]);
const networkStatusOptions = reactive([]);
const regionOptions = reactive([
  {label: "华东", value: "EC"},
  {label: "南区", value: "South"},
  {label: "北区", value: "North"},
  {label: "中西", value: "CW"},
]);
const importantOptions = reactive([
  {label: "是", value: "1"},
  {label: "否", value: "0"},
]);
const dataTypeOptions = reactive([
  {label: "延时", value: "latency"},
]);
const timespanOptions = reactive([]);
const resolutionOptions = reactive([
  {label: '10分钟', value: 600},
  {label: "1小时", value: 3600},
  {label: "1天", value: 86400},
]);
const rebootDeviceList = reactive([]);
const multipleSelection = ref(null);
// 远程选项
const remoteNetworkOptions = reactive([]);

const router = useRouter();
const route = useRoute();

const organizationEnum = computed(() => {
  return createEnumByOptions(organizationOptions);
});

const statusEnum = computed(() => {
  return createEnumByOptions(networkStatusOptions);
});

const dataTypeEnum = computed(() => {
  return createEnumByOptions(dataTypeOptions);
});

// 表格列
const columns = [
  {label: '状态', prop: 'status', width: '60px', sortable: true},
  {label: '关注', prop: 'importantFlag', type: 'switch', sortable: true, width: '60px',},
  {label: '组织', prop: 'organizationId', sortable: true, minWidth: '150px', showOverflowTooltip: true},
  {label: '网络', prop: 'name', minWidth: '200px', sortable: true, showOverflowTooltip: true},
  // {label: '流量', prop: 'usedNetflow', sortable: true},
  {label: '路由器数', prop: 'routerNum', sortable: true, width: '80px'},
  {label: '交换机数', prop: 'switchNum', sortable: true, width: '80px'},
  {label: '无线AP数', prop: 'wirelessNum', sortable: true, width: '80px'},
  {label: '连接终端数', prop: 'connectClientNum', sortable: true, width: '90px'},
  {label: '延时/ms', prop: 'latency', sortable: true, width: '80px',},
  {label: '2.4G信道利用率', prop: 'utilization2g', sortable: true, width: '120px',},
  {label: '5G信道利用率', prop: 'utilization5g', sortable: true, width: '120px',},
];

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
    label: '状态', prop: 'statusList', type: 'select',
    config: {options: networkStatusOptions, multiple: true, collapseTags: true},
  },
  {
    label: '关注', prop: 'importantFlag', type: 'select',
    config: {options: importantOptions},
  },
  {
    label: '地区', prop: 'region', type: 'select',
    config: {options: regionOptions},
  },
  {
    label: '延时 ≥', prop: 'latency', type: 'input',
    config: {placeholder: 'ms'},
  },
  {label: '2.4G信道 ≥', prop: 'utilization2g', type: 'input',},
  {label: '5G信道 ≥', prop: 'utilization5g', type: 'input',},
];

const table = {
  query: {
    url: '/network/table',
    form: {formItems: queryForm},
  },
  columns: columns,
  config: {page: true, multipleTable: true,},

  update: {
    url: '/network/update',
  },
};

const rebootDialog = {
  title: '确定重启以下无线AP?',
  form: {formItems: {}},
  button: false,
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
 * 表格查询
 */
function queryTable() {
  compoTableRef.value.query();
}

/**
 * 表单选择器变动
 */
function changeSelect(prop, val) {
  if (prop === 'organizationId') {
    getNetworkOptions(val, networkOptions);
  } else if (prop === 'networkId') {
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
    }
  } else if(typeof val == 'undefined'){
    if (prop === 'networkId') {
      remoteNetworkOptions.length = 0;
    }
  }
}

/**
 * 重置后
 */
function afterReset() {
  getNetworkOptions(null, networkOptions);
}

const getDeviceTagType = (alertingNum, offlineNum, dormantNum) => {
  let tagType = '';
  if (alertingNum === 0 && offlineNum === 0 && dormantNum > 0) {
    tagType = 'warning';
  }
  if (alertingNum === 0 && offlineNum > 0) {
    tagType = 'info'
  }
  if (alertingNum > 0) {
    tagType = 'danger';
  }
  return tagType;
};

const getDeviceLinkType = (alertingNum, offlineNum, dormantNum) => {
  let tagType = 'primary';
  if (alertingNum === 0 && offlineNum === 0 && dormantNum > 0) {
    tagType = 'warning';
  }
  if (alertingNum === 0 && offlineNum > 0) {
    tagType = 'info'
  }
  if (alertingNum > 0) {
    tagType = 'danger';
  }
  return tagType;
};


async function syncNetwork() {
  const selection = compoTableRef.value.getMultipleSelection();
  if (selection.length !== 1) {
    return ElMessage.warning('请选择一条记录!');
  }
  syncLoading.value = true;
  // const syncNum = 4 + selection[0].routerNum + selection[0].wirelessNum * 4 + selection[0].connectClientNum * 2;

  ElMessageBox({
    title: '同步被选中网络以及关联的设备、客户端信息',
    message: h('p', null, [
      h('p', null, "网络：" + selection[0].name),
      // h('p', null, "预计：" + syncNum + "秒"),
    ]),
    confirmButtonText: '确定',
  }).then(async () => {
    const {data: res} = await http.post('/network/sync', {
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
 * 打开重启对话框
 */
async function openRebootDialog() {
  const selection = compoTableRef.value.getMultipleSelection()
  if (selection.length !== 1) {
    return ElMessage.warning('请选择一条记录!');
  }
  await rebootDialogRef.value.openDialog();
  if (selected.networkId !== selection[0].networkId) {
    selected.networkId = selection[0].networkId;
    await listDevice(selection[0].networkId, 'wireless');
  }
}

/**
 * 查询设备列表
 */
async function listDevice(networkId, productType) {
  const {data: res} = await http.post('/device/list', {networkId: networkId, productType: productType});
  if (!res.success) {
    return ElMessage.error(res.msg);
  }
  rebootDeviceList.length = 0;
  res.data.forEach((device) => {
    rebootDeviceList.push({
      name: device.name,
      serial: device.serial,
      organizationId: device.organizationId,
    });
  })
}

/**
 * 监听多选框
 */
function handleSelectionChange(val) {
  multipleSelection.value = val;
}

/**
 * 重启无线AP
 */
async function rebootWireless() {
  if(multipleSelection.value == null || multipleSelection.value.length === 0){
    return ElMessage.warning('请选择无线AP！');
  }

  restartLoading.value = true;
  const {data: res} = await http.post('/network/device/reboot', multipleSelection.value);
  restartLoading.value = false;
  if (!res.success) {
    return ElMessage.error(res.msg);
  }
  rebootDialogRef.value.closeDialog();
  return ElMessage.success(res.msg);
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

  if (selected.networkId !== selection[0].networkId) {
    selected.networkId = selection[0].networkId;
    selected.organizationId = selection[0].organizationId;
    await queryHistoryData();
  }
}

/**
 * 查询历史数据
 */
async function queryHistoryData() {
  const form = historyDialogRef.value.getForm();
  chartLoading.value = true;
  const body = {
    resolution: form.resolution,
    networkId: selected.networkId,
    organizationId: selected.organizationId,
    timespan: form.timespan,
    wirelessDataType: form.wirelessDataType,
  }
  const {data: res} = await http.post('/device/wireless/history', body);
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
 * 跳转设备页
 * @param row
 * @param deviceType
 */
const routerDevicePage = (row, deviceType) => {
  const routeParams = {
    networkId: row.networkId,
    networkName: row.name,
    status: row.status,
  }
  if (deviceType === 'switch') {
    router.push({
      name: 'switch',
      params: routeParams,
    });
  } else if (deviceType === 'appliance') {
    router.push({
      name: 'router',
      params: routeParams,
    });
  } else if (deviceType === 'wireless') {
    router.push({
      name: 'wireless',
      params: routeParams,
    });
  }
};

/**
 * 跳转客户端页
 * @param row
 */
const routerClientPage = (row) => {
  const routeParams = {
    networkId: row.networkId,
    networkName: row.name,
  }

  router.push({
    name: 'client',
    params: routeParams,
  });
};
const routParams = ref();
/**
 * 校验是否页面跳转，设置查询条件
 */
async function setupState() {
  if (Object.keys(route.params).length > 0) {
    console.log("跳转if");
    const query = route.params;
    routParams.value = query;
    const networkId = query.networkId;
    const organizationId = query.organizationId;
    const networkName = query.networkName;
    const queryForm = {
      organizationId:organizationId,
      networkId: networkId,
    };
    // 设置查询表单
    compoTableRef.value.setForm(queryForm);
    queryTable();

    if (networkId) {
      await tool.setRemoteOptions(remoteNetworkOptions, networkName, networkId);
      remoteNetworkOptions.length = 0;
    }
  }
  console.log("跳转else");
}

function initQuery() {
  const queryForm = {
    organizationId: organizationOptions.value = routParams.organizationId?tool.getDefaultOrgID():'76'
  };
  compoTableRef.value.setForm(queryForm);
  queryTable();
}

onMounted(() => {
  initQuery();
  tool.getOptions(networkStatusOptions, 'DEVICE_STATUS');
  getTimespanOptions(timespanOptions);
  getOrganizationOptions(organizationOptions);
  getNetworkOptions(null, networkOptions);

  if (Object.keys(route.params).length <= 0) {
    queryTable();
  }
});

onActivated(() => {
  setupState()
});


</script>

<style lang="scss">

</style>
