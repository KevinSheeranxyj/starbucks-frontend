<template>
  <!-- 表格组件 -->
  <compo-table
      :tableParams="table"
      @changeSelect="changeSelect"
      @remoteMethod="remoteMethod"
      @reset="afterReset"
      ref="compoTableRef"
  >


    <!-- 自定义列插槽 -->
    <template #tableDefinedSlot="slotProps">
      <div v-if="slotProps.prop === 'operator'">
        <el-button type="primary" plain @click="clickAction(slotProps.scope.row)">网段维护</el-button>
        <el-button type="primary" plain @click="routerDevicePage(slotProps.scope.row)">交换机配置</el-button>
        <el-button type="primary" plain @click="clickAction(slotProps.scope.row)">RMA 操作</el-button>
        <el-button type="primary" plain @click="clickAction(slotProps.scope.row)">模板修改</el-button>
      </div>
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

import {
  getOrganizationOptions,
  getNetworkOptions,
  getTimespanOptions,
} from '../device/device';

const compoTableRef = ref(null);

const selected = reactive({
  networkId: "",
  organizationId: "",
});
const organizationOptions = reactive([]);
const networkOptions = reactive([]);
const networkStatusOptions = reactive([]);

const timespanOptions = reactive([]);

const rebootDeviceList = reactive([]);

// 远程选项
const remoteNetworkOptions = reactive([]);

const router = useRouter();
const route = useRoute();

const organizationEnum = computed(() => {
  return createEnumByOptions(organizationOptions);
});


// 表格列
const columns = [
  {label: '组织', prop: 'organizationId', sortable: true, minWidth: '150px', showOverflowTooltip: true},
  {label: '网络', prop: 'name', minWidth: '200px', sortable: true, showOverflowTooltip: true},
  {label: '操作', prop: 'operator', type: 'defined', minWidth: '150px'}
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
  }
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
    }
  } else if (typeof val == 'undefined') {
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
 * 跳转设备页
 * @param row
 */
const routerDevicePage = (row) => {
  const routeParams = {
    organizationId:row.organizationId,
    networkId: row.networkId,
    networkName: row.name
  }
  router.push({
    path:'/store/switchConfig',
    query:routeParams
  });
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
    path:'/store/switchConfig',
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
    const queryForm = {
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


function clickAction(v){

  console.log(v);

}


</script>

<style lang="scss">

</style>
