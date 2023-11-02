<script setup>
import {ref, onMounted, reactive, h, computed} from 'vue';
import {useRoute} from 'vue-router';
import {getNetworkOptions, getOrganizationOptions} from '../device/device';
import tool from "@/utils/tool";
import {ElMessage, ElMessageBox} from "element-plus/lib/components";
import * as http from "http";
import {createEnumByOptions} from "@/utils/enums";

const route = useRoute();

const compoTableRef = ref(null);
const organizationOptions = reactive([]);
const syncLoading = ref(false);
const networkOptions = reactive([]);
const remoteNetworkOptions = reactive([]);
const cellWidth = 180;
const organizationEnum = computed(() => {
  return createEnumByOptions(organizationOptions);
});
// 表格列
const columns = [
  {label: '组织', prop: 'organizationId',width:cellWidth},
  {label: '网络', prop: 'networkName',width:cellWidth},
  {label: 'Vlan2', prop: 'vlan2',width:cellWidth},
  {label: 'vlan2MxIp', prop: 'vlan2MxIp',width:cellWidth},
  {label: 'Vlan98', prop: 'vlan98',width:cellWidth},
  {label: 'Vlan98MxIp', prop: 'vlan98MxIp',width:cellWidth},
  {label: 'Vlan99', prop: 'vlan99',width:cellWidth},
  {label: 'Vlan99MxIp', prop: 'vlan99MxIp',width:cellWidth},
  {label: 'Vlan100', prop: 'vlan100',width:cellWidth},
  {label: 'Vlan100MxIp', prop: 'vlan100MxIp',width:cellWidth},
  {label: 'Vlan101', prop: 'vlan101',width:cellWidth},
  {label: 'Vlan101MxIp', prop: 'vlan101MxIp',width:cellWidth},
  {label: 'Vlan102', prop: 'vlan102',width:cellWidth},
  {label: 'Vlan102MxIp', prop: 'vlan102MxIp',width:cellWidth}
];

// 查询表单
const queryForm = [
  {
    label: '组织', prop: 'organizationId', type: 'select',
    config: {options: organizationOptions, clearable: false}
  },
  {
    label: '网络', prop: 'networkId', type: 'input',
    config: {options: networkOptions, remoteMethod:true, clearable: false},
  },
  {
    label: 'Vlan2', prop: 'vlan2', type: 'input'
  },
  {label: 'vlan2MxIp', prop: 'vlan2MxIp',type: 'input'},
  {
    label: 'Vlan98', prop: 'vlan98', type: 'input'
  },
  {label: 'Vlan98MxIp', prop: 'vlan98MxIp',type: 'input'},
  {
    label: 'Vlan99', prop: 'vlan99', type: 'input'
  },
  {label: 'Vlan99MxIp', prop: 'vlan99MxIp',type: 'input'},
  {
    label: 'Vlan100', prop: 'vlan100', type: 'input'
  },
  {label: 'Vlan100MxIp', prop: 'vlan100MxIp',type: 'input'},
  {
    label: 'Vlan101', prop: 'vlan101', type: 'input'
  },
  {label: 'Vlan101MxIp', prop: 'vlan101MxIp',type: 'input'},
  {
    label: 'Vlan102', prop: 'vlan102', type: 'input'
  },{label: 'Vlan102MxIp', prop: 'vlan102MxIp',type: 'input'}
];

const table = {
  query: {
    url: '/network/vlan/table',
    form: {formItems: queryForm}
  },
  export: {
    url: '/alarm/log/export'
  },
  columns: columns,
  hideAllowed: true,
  config: {page: true, multipleTable: true}
};

/**
 * 查询表格
 */
function queryTable() {
  compoTableRef.value.query();
}
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

/**
 * 重置后
 */
function afterReset() {
  getOrganizationOptions(organizationOptions);
}

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
  getNetworkOptions(tool.getDefaultOrgID(), networkOptions);
  if (Object.keys(route.params).length <= 0) {
    queryTable();
  }
});

</script>
<template>
  <!-- 表格组件 -->
  <compo-table
    ref="compoTableRef"
    :table-params="table"
    @reset="afterReset"
    @remoteMethod="remoteMethod"
    @changeSelect="changeSelect"
  >
    <template #tableTextSlot="slotProps">
      <div v-if="slotProps.prop === 'organizationId'">
      {{ organizationEnum.getDescFromValue(slotProps.cellValue) }}
     </div>
    </template>
    <!-- 按钮插槽 -->
    <template #buttonSlot>

      <el-button type="primary" plain :loading="syncLoading" @click="syncNetwork">同 步</el-button>
    </template>
  </compo-table>
</template>

<style lang="scss">

</style>
