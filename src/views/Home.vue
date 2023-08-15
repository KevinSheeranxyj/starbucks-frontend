<template>
  <div class="app-container">
    <el-row>
      <el-col :span="4">
        <el-card class="count-card">
          <el-row justify="space-evenly">
            <el-switch
                v-model="orgSwitch" inline-prompt size="large" width="80px"
                v-loading.fullscreen.lock="fullscreenLoading"
                style="--el-switch-on-color: #409EFF; --el-switch-off-color: #E6A23C"
                active-text="办公室"
                inactive-text="门店"
                @change="changeOrgSwitch"
            />
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="20">
        <el-card class="count-card">
          <el-row :gutter="6" justify="space-evenly">
            <el-col :span="3">
              <div v-if="initFlag">
                <el-button type="primary" size="large"
                           v-loading.fullscreen.lock="fullscreenLoading"
                           @click="countNetworkStatus">
                  {{ '网络: ' + deviceCount.networkNum }}
                </el-button>
              </div>
              <div v-else>
                <el-button type="primary" plain size="large"
                           v-loading.fullscreen.lock="fullscreenLoading"
                           @click="countNetworkStatus">
                  {{ '网络: ' + deviceCount.networkNum }}
                </el-button>
              </div>
            </el-col>
            <el-col :span="3">
              <el-button type="primary" plain size="large"
                         v-loading.fullscreen.lock="fullscreenLoading"
                         @click="countDeviceStatus('appliance')">
                {{ '路由器: ' + deviceCount.routerNum }}
              </el-button>
            </el-col>
            <el-col :span="3">
              <el-button type="primary" plain size="large"
                         v-loading.fullscreen.lock="fullscreenLoading"
                         @click="countDeviceStatus('switch')">
                {{ '交换机: ' + deviceCount.switchNum }}
              </el-button>
            </el-col>
            <el-col :span="3">
              <el-button type="primary" plain size="large"
                         v-loading.fullscreen.lock="fullscreenLoading"
                         @click="countDeviceStatus('wireless')">
                {{ '无线AP: ' + deviceCount.wirelessNum }}
              </el-button>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="chart-card">
      <el-row>
        <!--饼图：设备状态-->
        <el-col :span="12">
          <div id="statusChart" style="height: 285px"></div>
        </el-col>
        <!--饼图：客户端连接数-->
        <!--        <el-col :span="12">-->
        <!--          <div id="clientsChart" style="height: 285px"></div>-->
        <!--        </el-col>-->
        <!--饼图：设备-->
        <el-col :span="12">
          <div id="devicesChart" style="height: 285px"></div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="item-card">
      <div class="model">
        <div v-for="(item,index) in networkList.data" :key=index>
          <div class="logo">
            <el-popover
                placement="top-start"
                :title="item.name"
                trigger="hover"
                :auto-close=0
                :width="400"
            >
              <template #reference>
                <div @click="routerPage(item)">
                  <el-button v-if="item.status  === 'alerting'"
                             type="danger" plain
                             size="large"
                             style="padding: 10px 10px">
                    <el-icon size="20px">
                      <WarningFilled/>
                    </el-icon>
                  </el-button>
                </div>
              </template>
              <template #default>
                <p v-if='item.networkName' style="margin: 0;"> {{ '所属网络: ' + item.networkName }} </p>
                <p v-if='item.serial' style="margin: 0;"> {{ '设备序列: ' + item.serial }} </p>
                <p v-if='item.utilization2g' style="margin: 0;"> {{ '2.4G信道利用率: ' + item.utilization2g }} </p>
                <p v-if='item.utilization5g' style="margin: 0;"> {{ '5G信道利用率: ' + item.utilization5g }} </p>
                <p v-if='item.connectClientNum' style="margin: 0;"> {{ '客户端连接数: ' + item.connectClientNum }} </p>
                <p v-if='item.latency' style="margin: 0;"> {{ '延时(ms): ' + item.latency }} </p>
              </template>
            </el-popover>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import {onMounted, onBeforeUnmount, ref, reactive} from "vue";
import {useRouter} from "vue-router";
import http from "@/utils/http";
import {ElMessage} from "element-plus/lib/components";
import {WarningFilled} from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import {getOrganizationOptions} from "@/views/device/device";

const fullscreenLoading = ref(false)
const router = useRouter();
const orgSwitch = ref(true);
const orgId = ref(null);
const officeOrgId = ref(null);
const storeOrgId = ref(null);
const initFlag = ref(1);
const deviceCount = reactive({
  networkNum: 0,
  wirelessNum: 0,
  routerNum: 0,
  switchNum: 0,
  clientNum: 0,
});
let statusChartDom = null;
const statusChart = reactive({
  title: '',
  data: [],
  color: ['#67C23A', '#F56C6C', '#E6A23C', '#909399'],
});

const organizationOptions = reactive([]);
// const clientsChart = reactive({
//   title: '客户端连接数',
//   data: [],
// });
let deviceChartDom = null;
const devicesChart = reactive({
  title: '设备数',
  data: [],
});
const networkList = reactive({
  data: []
});

/**
 * 查询组织ID
 */
async function queryOrgId() {
  const {data: res} = await http.post('/organization/list', {});
  res.data.forEach((organization) => {
    if (organization.organizationType === "STORE") {
      storeOrgId.value = organization.organizationId
    } else if (organization.organizationType === "OFFICE") {
      officeOrgId.value = organization.organizationId
    }
  });
}

/**
 * 组织开关切换
 */
function changeOrgSwitch(val) {
  if (val) {
    orgId.value = officeOrgId.value;
  } else {
    orgId.value = storeOrgId.value;
  }
  initFlag.value = 1;
  countDevice();
  countNetworkStatus();
}

/**
 * 饼图
 */
function getStatusChart() {
  const chartDom = document.getElementById('statusChart');
  deviceChartDom = echarts.init(chartDom);
  deviceChartDom.setOption({
    title: {
      text: statusChart.title,
      left: 'center',
      textStyle: {
        color: '#E5EAF3'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        color: '#E5EAF3',
      },
    },
    color: statusChart.color,
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '57%'],
        avoidLabelOverlap: false,
        data: statusChart.data,
        label: {
          color: '#E5EAF3'
        },
        itemStyle: {
          borderRadius: 10,
          borderColor: '#111',
          borderWidth: 2
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          }
        }
      }
    ]
  });
}

// /**
//  * 客户端连接数-生成饼图
//  */
// function getClientsChart() {
//   const chartDom = document.getElementById('clientsChart');
//   const chartOption = echarts.init(chartDom);
//   chartOption.setOption({
//     title: {
//       text: clientsChart.title,
//       left: 'center',
//       textStyle: {
//         color: '#E5EAF3'
//       }
//     },
//     tooltip: {
//       trigger: 'item',
//       formatter: '{b}',
//     },
//     legend: {
//       orient: 'vertical',
//       left: 'left',
//       textStyle: {
//         color: '#E5EAF3',
//       },
//     },
//     series: [
//       {
//         type: 'pie',
//         radius: '70%',
//         data: clientsChart.data,
//         label: {
//           color: '#E5EAF3'
//         },
//         emphasis: {
//           itemStyle: {
//             shadowBlur: 10,
//             shadowOffsetX: 0,
//             shadowColor: 'rgba(0, 0, 0, 0.5)',
//           }
//         }
//       }
//     ]
//   });
// }

// /**
//  * 统计设备连接客户端数
//  */
// async function countDeviceClient() {
//   const {data: res} = await http.post('/network/device/client/count', {organizationId: orgId.value});
//   if (!res.success) {
//     return ElMessage.error(res.msg);
//   }
//   clientsChart.data = [
//     {value: res.data.routerClientNum, name: '路由器: ' + res.data.routerClientNum,},
//     {value: res.data.switchClientNum, name: '交换机: ' + res.data.switchClientNum,},
//     {value: res.data.wirelessClientNum, name: '无线AP: ' + res.data.wirelessClientNum,},
//   ]
//   getClientsChart();
// }


/**
 * 设备数-生成饼图
 */
function getDevicesChart() {
  const chartDom = document.getElementById('devicesChart');
  statusChartDom = echarts.init(chartDom);
  statusChartDom.setOption({
    title: {
      text: devicesChart.title,
      left: 'center',
      textStyle: {
        color: '#E5EAF3'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        color: '#E5EAF3',
      },
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '57%'],
        data: devicesChart.data,
        label: {
          color: '#E5EAF3'
        },
        itemStyle: {
          borderRadius: 10,
          borderColor: '#111',
          borderWidth: 2
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          }
        }
      }
    ]
  });
}

/**
 * 统计设备数
 */
async function countDevice() {
  const {data: res} = await http.post('/network/device/count', {organizationId: orgId.value});

  if (!res.success) {
    return ElMessage.error(res.msg);
  }
  deviceCount.networkNum = res.data.networkNum;
  deviceCount.wirelessNum = res.data.wirelessNum;
  deviceCount.routerNum = res.data.routerNum;
  deviceCount.switchNum = res.data.switchNum;

  devicesChart.data = [
    {value: res.data.networkNum, name: '网络: ' + res.data.networkNum,},
    {value: res.data.routerNum, name: '路由器: ' + res.data.routerNum,},
    {value: res.data.switchNum, name: '交换机: ' + res.data.switchNum,},
    {value: res.data.wirelessNum, name: 'AP: ' + res.data.wirelessNum,},
  ]
  getDevicesChart();
}


/**
 * 统计各状态网络数
 */
async function countNetworkStatus() {
  fullscreenLoading.value = true
  const {data: res} = await http.post('/network/status/count', {organizationId: orgId.value});
  if (!res.success) {
    fullscreenLoading.value = false
    return ElMessage.error(res.msg);
  }
  statusChart.title = '网络状态统计';
  statusChart.data = [
    {value: res.data.onlineNum, name: '在线: ' + res.data.onlineNum,},
    {value: res.data.alertingNum, name: '告警: ' + res.data.alertingNum,},
    {value: res.data.dormantNum, name: '休眠: ' + res.data.dormantNum,},
    {value: res.data.offlineNum, name: '离线: ' + res.data.offlineNum,},
  ]
  await listNetwork();
  fullscreenLoading.value = false
  getStatusChart();
}

/**
 * 统计各状态设备数
 */
async function countDeviceStatus(productType) {
  fullscreenLoading.value = true
  const {data: res} = await http.post('/device/status/count', {productType: productType, organizationId: orgId.value});
  if (!res.success) {
    fullscreenLoading.value = false
    return ElMessage.error(res.msg);
  }
  if (productType === 'appliance') {
    statusChart.title = '路由器状态统计';
  } else if (productType === 'switch') {
    statusChart.title = '交换机状态统计';
  } else if (productType === 'wireless') {
    statusChart.title = '无线AP状态统计';
  }
  statusChart.data = [
    {value: res.data.onlineNum, name: '在线: ' + res.data.onlineNum,},
    {value: res.data.alertingNum, name: '告警: ' + res.data.alertingNum,},
    {value: res.data.dormantNum, name: '休眠: ' + res.data.dormantNum,},
    {value: res.data.offlineNum, name: '离线: ' + res.data.offlineNum,},
  ]
  await listAlarmDevice(productType);
  fullscreenLoading.value = false
  getStatusChart();
  initFlag.value = 0;
}

/**
 * 获取告警网络列表
 */
async function listNetwork() {
  const {data: res} = await http.post('/network/list', {statusList: ['alerting'], organizationId: orgId.value});
  if (!res.success) {
    fullscreenLoading.value = false
    return ElMessage.error(res.msg);
  }
  networkList.data = res.data;
}

/**
 * 获取告警设备列表
 */
async function listAlarmDevice(productType) {
  const {data: res} = await http.post('/device/alarm/list', {
    organizationId: orgId.value,
    productType: productType,
  });
  if (!res.success) {
    fullscreenLoading.value = false
    return ElMessage.error(res.msg);
  }
  networkList.data = res.data;
}

/**
 * 跳转页面
 */
const routerPage = (row) => {
  if (row.productType) {
    routerDevicePage(row.serial, row.productType);
  } else {
    routerNetworkPage(row.networkId, row.name);
  }
};

/**
 * 跳转网络页
 */
const routerNetworkPage = (networkId, networkName) => {
  const routeParams = {
    networkId: networkId,
    networkName: networkName,
  }
  router.push({
    name: 'network',
    params: routeParams,
  });
};

/**
 * 跳转设备页
 */
const routerDevicePage = (serial, deviceType) => {
  const routeParams = {
    serial: serial,
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

async function init() {
  await queryOrgId();
  await changeOrgSwitch(true);
}

onMounted(() => {
  getOrganizationOptions(organizationOptions);
  init();
});

onBeforeUnmount(() => {
  console.log('beforeUnmount')
  echarts.dispose(deviceChartDom)
  echarts.dispose(statusChartDom)
});

</script>
<style lang="scss" scoped>

.logo {
  //background-size: 100%;
  width: 40px;
  //height: 50px;
  margin-right: 10px;
  margin-bottom: 10px
}

.model {
  margin-left: 10px;
  margin-top: 10px;
  height: auto;
  display: flex;
  flex-wrap: wrap;
}


.count-card {
  background: #000000;
}

.chart-card {
  background: #000000;
}

.item-card {
  background: #000000;
  border: 0px
}
</style>
