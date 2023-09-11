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
  </compo-table>
</template>

<script setup>
import {reactive, ref, onMounted, computed, onActivated, h,} from 'vue';
import {useRouter, useRoute} from 'vue-router';
import http from "@/utils/http";
import {ElMessage, ElMessageBox} from 'element-plus/lib/components';
import tool from "@/utils/tool";
import {createEnumByOptions} from '@/utils/enums.js';
import {getOrganizationOptions, getNetworkOptions, getDeviceOptions, getTagTypeByStatus} from './device';

const router = useRouter();
const route = useRoute();

const compoTableRef = ref(null);
const syncLoading = ref(false);
const organizationOptions = reactive([]);
const networkOptions = reactive([]);
const deviceNameOptions = reactive([]);
const deviceSerialOptions = reactive([]);
const deviceStatusOptions = reactive([]);
const macOptions = reactive([]);
const publicIpOptions = reactive([]);
const regionOptions = reactive([
  {label: "华东", value: "EC"},
  {label: "南区", value: "South"},
  {label: "北区", value: "North"},
  {label: "中西", value: "CW"},
]);
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

// 表格列
const columns = [
  {label: '状态', prop: 'status', sortable: true, width: '60px'},
  {
    label: '自定义状态', prop: 'customStatus', type: 'select',
    config: {options: deviceStatusOptions, },
  },
  {label: '组织', prop: 'organizationId', sortable: true, minWidth: '120px', showOverflowTooltip: true},
  {label: '网络', prop: 'networkName', sortable: true, minWidth: '150px', showOverflowTooltip: true},
  {label: '交换机', prop: 'name', sortable: true, minWidth: '120px', showOverflowTooltip: true},
  {label: '序列', prop: 'serial', minWidth: '120px',},
  {label: '终端数量', prop: 'connectClientNum', width: '60px',},
  {label: 'MAC', prop: 'mac', minWidth: '105px',},
  {label: '公网IP', prop: 'publicIp', minWidth: '100px',},
  {label: 'LAN IP', prop: 'lanIp', minWidth: '100px',},
  {label: '网关', prop: 'gateway', minWidth: '100px',},
  {label: '地理位置信息', prop: 'address', minWidth: '100px',},
  {label: '掩码', prop: 'mask', minWidth: '100px',},
  {label: '主DNS', prop: 'primaryDns', minWidth: '100px',},
  {label: '次DNS', prop: 'secondaryDns', minWidth: '100px',},
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
    label: '交换机', prop: 'name', type: 'select',
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
    label: '公网IP', prop: 'publicIp', type: 'input',
    config: {placeholder: '请输入',},
  }
];

const table = {
  query: {
    url: '/device/switch/table',
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
  console.log('changeSelect', prop, val)
  if (prop === 'organizationId') {
    getNetworkOptions(val, networkOptions);
    getDeviceOptions({'organizationId': val, productType: 'switch'}, deviceNameOptions, deviceSerialOptions, macOptions, publicIpOptions);
  } else if (prop === 'networkId') {
    getDeviceOptions({'networkId': val, productType: 'switch'}, deviceNameOptions, deviceSerialOptions, macOptions, publicIpOptions);
    if(val === ''){
      remoteNetworkOptions.length = 0;
    }
  }
}

/**
 * 表单选择器远程方法
 */
function remoteMethod(prop, val) {
  console.log('remoteMethod', prop, val)
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
  getDeviceOptions({productType: 'switch'}, deviceNameOptions, deviceSerialOptions, macOptions, publicIpOptions);
}

async function syncNetwork() {
  const selection = compoTableRef.value.getMultipleSelection();
  if (selection.length !== 1) {
    return ElMessage.warning('请选择一条记录!');
  }

  syncLoading.value = true;
  ElMessageBox({
    title: '同步被选中网络的交换机信息',
    message: h('p', null, [
      h('p', null, "网络：" + selection[0].networkName),
    ]),
    confirmButtonText: '确定',
  }).then(async () => {
    const {data: res} = await http.post('/device/switch/sync', {
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
 * @param row
 */
const routerClientPage = (row) => {
  const routeParams = {
    recentDeviceType: 'switch',
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
    const networkId = query.networkId;
    const networkName = query.networkName;
    const serial = query.serial;
    const queryForm = {
      networkId: networkId,
      serial: serial,
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
      getDeviceOptions({productType: 'switch'}, deviceNameOptions, deviceSerialOptions, macOptions, publicIpOptions);
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
  getNetworkOptions(null, networkOptions);

  if (Object.keys(route.params).length <= 0) {
    getDeviceOptions({productType: 'switch'}, deviceNameOptions, deviceSerialOptions, macOptions, publicIpOptions);
    queryTable();
  }
});

onActivated(() => {
  setupState()
});


</script>

<style lang="scss">

</style>
