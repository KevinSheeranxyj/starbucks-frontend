<template>
  <!-- 表格组件 -->
  <compo-table
      :tableParams="table"
      ref="compoTableRef"
      @changeSelect="changeSelect"
      @remoteMethod="remoteMethod"
      @reset="afterReset"
  >

    <template #tableTextSlot="slotProps">
      <div v-if="slotProps.prop === 'organizationId'">
        {{ organizationEnum.getDescFromValue(slotProps.cellValue) }}
      </div>
    </template>

    <!-- 自定义列插槽 -->
    <template #tableDefinedSlot="slotProps">
      <div v-if="slotProps.prop === 'operator'">
        <el-button type="primary" plain @click="changePort(slotProps.scope.row)">端口修改</el-button>
      </div>

    </template>

    <template #tableDNSSlot="scope">
      <div v-if="scope.prop === 'primaryDns'"></div>
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
import {getOrganizationOptions, getNetworkOptions, getDeviceOptions, getTagTypeByStatus} from '../device/device';


const router = useRouter();
const route = useRoute();

const compoTableRef = ref(null);
const syncLoading = ref(false);
const organizationOptions = reactive([]);
const networkOptions = reactive([]);
const deviceNameOptions = reactive([]);
const deviceSerialOptions = reactive([]);

const macOptions = reactive([]);
const publicIpOptions = reactive([]);

// 远程选项
const remoteNetworkOptions = reactive([]);
const remoteNameOptions = reactive([]);
const remoteSerialOptions = reactive([]);
const remoteMacOptions = reactive([]);
const remotePublicIpOptions = reactive([]);

const organizationEnum = computed(() => {
  return createEnumByOptions(organizationOptions);
});



// 表格列
const columns = [
  {label: '状态', prop: 'status', sortable: true, width: '60px'},
  {label: '组织', prop: 'organizationId', sortable: true, minWidth: '120px' },
  {label: '网络', prop: 'networkName', sortable: true, minWidth: '150px'},
  {label: '交换机', prop: 'name', sortable: true, minWidth: '120px'},
  {label: '序列', prop: 'serial', minWidth: '120px',},
  {label: '公网IP', prop: 'publicIp', minWidth: '100px',},
  {label: 'LAN IP', prop: 'lanIp', minWidth: '100px',},
  {label: '网关', prop: 'gateway', minWidth: '100px',},
  {label: '地理位置信息', prop: 'address', minWidth: '100px',},
  {label: 'DNS', prop: 'primaryDns', type: 'dns', minWidth: '100px',},
  {label: '操作', prop: 'operator', type: 'defined', minWidth: '150px'}
];

// 查询表单
const queryForm = [

  {
    label: '交换机', prop: 'name', type: 'select',
    config: {options: remoteNameOptions, remote: true, placeholder: '请输入',},
  },
  {
    label: '序列', prop: 'serial', type: 'select',
    config: {options: remoteSerialOptions, remote: true, placeholder: '请输入',},
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
  getOrganizationOptions(organizationOptions);
}

/**
 * 查询表格
 */
function queryTable() {
  compoTableRef.value.query();
  getOrganizationOptions(organizationOptions);
}

/**
 * 重置后
 */
function afterReset() {
  getNetworkOptions(null, networkOptions);
  getDeviceOptions({productType: 'switch'}, deviceNameOptions, deviceSerialOptions, macOptions, publicIpOptions);

}



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
    console.log("====",queryForm);
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


///
function changePort(row){
  // const params = {
  //   params:row
  // }
  /// 跳转到端口修改
  console.log("====",row);
  router.push({
    name:'switchPortList',
    query:row
  });
}


async function initQuery() {

  if (Object.keys(route.query).length > 0) {
    const query = route.query;
    const networkId = query.networkId;
    const organizationId = query.organizationId;
    const queryForm = {
      statusList:[],
      networkId:networkId,
      organizationId:organizationId
    };
    compoTableRef.value.setForm(queryForm);
    queryTable();
  }
  getOrganizationOptions(organizationOptions);
}

onMounted(() => {
  initQuery();
  getOrganizationOptions(organizationOptions);
});



</script>

<style lang="scss">

</style>
