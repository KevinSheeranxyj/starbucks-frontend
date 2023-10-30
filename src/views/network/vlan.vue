<script setup>
import {ref, onMounted, reactive} from 'vue';
import {useRoute} from 'vue-router';
import {getOrganizationOptions} from '../device/device';

const route = useRoute();

const compoTableRef = ref(null);
const organizationOptions = reactive([]);
const syncLoading = ref(false);

const cellWidth = 180;
// 表格列
const columns = [
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
    label: '网络', prop: 'network', type: 'input'
  },
  {
    label: 'Vlan2', prop: 'vlan2', type: 'input'
  },
  {
    label: 'Vlan98', prop: 'vlan98', type: 'input'
  },
  {
    label: 'Vlan99', prop: 'vlan99', type: 'input'
  },
  {
    label: 'Vlan100', prop: 'vlan100', type: 'input'
  },
  {
    label: 'Vlan101', prop: 'vlan101', type: 'input'
  },
  {
    label: 'Vlan102', prop: 'vlan102', type: 'input'
  }
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
  config: {page: true}
};

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
  getOrganizationOptions(organizationOptions);
}

function syncNetwork() {
  syncLoading.value = true;
  console.log('同步');
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
  >
    <!-- 按钮插槽 -->
    <template #buttonSlot>
      <el-button type="primary" plain :loading="syncLoading" @click="syncNetwork">同 步</el-button>
    </template>
  </compo-table>
</template>

<style lang="scss">

</style>
