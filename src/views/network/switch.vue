<script setup>
import {ref, onMounted, computed, reactive, h, onActivated} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {createEnumByOptions} from "@/utils/enums";
import {getNetworkOptions, getOrganizationOptions} from "@/views/device/device";
import tool from "@/utils/tool";
import {ElMessage, ElMessageBox} from "element-plus/lib/components";
import http from "http";

const route = useRoute();
const defaultOrg = '76';
const compoTableRef = ref(null);
const remoteNetworkOptions = reactive([]);
const organizationOptions = reactive([]);
const networkOptions = reactive([]);
const syncLoading = ref(false);
// 表格列
const columns = [
  {label: '组织', prop: 'organizationId', minWidth: '100px'},
  {label: '网络', prop: 'networkName', minWidth: '100px'},
  {label: '交换机', prop: 'name', minWidth: '100px'},
  {label: '序列', prop: 'serial', minWidth: '100px'},
  {label: '公网IP', prop: 'publicIp', minWidth: '100px'},
  {label: 'VLAN', prop: 'vlan', minWidth: '100px'},
  {label: 'LAN IP', prop: 'lanIp', minWidth: '100px'},
  {label: '网关', prop: 'gateway', minWidth: '100px'},
  {label: 'DNS', prop: 'dns',type:'dns', minWidth: '100px'}
];

// 查询表单
const queryForm = [
  {
    label: '组织', prop: 'organizationId', type: 'select',
    config: {options: organizationOptions, clearable: false},
  },
  {
    label: '网络', prop: 'networkId', type: 'select',
    config: {options: networkOptions, clearable: false},
  },
  {
    label: '交换机', prop: 'name', type: 'input',
    config: {placeholder: '请输入',},
  },
  {
    label: '序列', prop: 'serial', type: 'input',
    config: {placeholder: '请输入',},
  },
  {
    label: 'vlan', prop: 'vlan', type: 'input',
    config: {placeholder: '请输入',},
  },
  {
    label: 'LanIp', prop: 'lanIp', type: 'input',
    config: {placeholder: '请输入',},
  },
  {
    label: '公网IP', prop: 'publicIp', type: 'input',
    config: {placeholder: '请输入',},
  }

];

const table = {
  query: {
    url: '/device/switch/table',
    form: {formItems: queryForm}
  },
  columns: columns,
  config: {page: true,multipleTable: true}
};

function syncNetwork() {
  const selection = compoTableRef.value.getMultipleSelection();
  if (selection.length !== 1) {
    return ElMessage.warning('请选择一条记录!');
  }
  syncLoading.value = true;
  // const syncNum = 4 + selection[0].routerNum + selection[0].wirelessNum * 4 + selection[0].connectClientNum * 2;

  ElMessageBox({
    title: '同步被选中网络以及关联的设备、客户端信息',
    message: h('p', null, [
      h('p', null, "网络：" + selection[0].networkName),
      h('p', null, "交换机：" + selection[0].name),
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
 * 查询表格
 */
function queryTable() {
  compoTableRef.value.query();
}


const organizationEnum = computed(() => {
  return createEnumByOptions(organizationOptions);
});

function initQuery() {
  const queryForm = {
    organizationId: organizationOptions.value = '76'
  };
  compoTableRef.value.setForm(queryForm);
  queryTable();
}

onMounted(() => {
  initQuery();
  getOrganizationOptions(organizationOptions);
  if (Object.keys(route.params).length <= 0) {
    queryTable();
  }
});


/**
 * 重置后
 */
function afterReset() {
  getNetworkOptions(defaultOrg, networkOptions);
}

/**
 * 表单选择器远程方法
 */
function remoteMethod(prop, val) {

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
function changeSelect(prop, val) {
  if (prop === 'organizationId') {
    getNetworkOptions(val, networkOptions);
    queryTable();
  } else if (prop === 'networkId') {
    if (val === '') {
      remoteNetworkOptions.length = 0;
    }
  }
}
const router = useRouter();
function toSwitchHistory() {
  const selection = compoTableRef.value.getMultipleSelection();
  if (selection.length !== 1) {
    return ElMessage.warning('请选择一条记录!');
  }

  const routeParams = {
    name: selection[0].name,
  }
  router.push({
    name: 'networkSwitchHistory',
    params: routeParams,
  });
}


</script>
<template>
  <!-- 表格组件 -->
  <compo-table
    ref="compoTableRef"
    :table-params="table"
    @remoteMethod="remoteMethod"
    @changeSelect="changeSelect"
    @reset="afterReset"
  >
    <template #tableTextSlot="slotProps">
      <div v-if="slotProps.prop === 'organizationId'">
        {{ organizationEnum.getDescFromValue(slotProps.cellValue) }}
      </div>
    </template>
    <template #buttonSlot>
      <el-button type="primary" plain :loading="syncLoading" @click="syncNetwork">同 步</el-button>
      <el-button type="primary" plain @click="toSwitchHistory">历史记录</el-button>
    </template>
  </compo-table>
</template>

<style lang="scss">

</style>
