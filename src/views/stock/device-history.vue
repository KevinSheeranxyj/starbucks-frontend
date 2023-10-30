<script setup>
import tool from '@/utils/tool';
import {ref, onMounted, reactive} from 'vue';
import {useRoute} from 'vue-router';
import {getNetworkOptions, getOrganizationOptions} from '../device/device';

const route = useRoute();
const organizationOptions = reactive([]);
const compoTableRef = ref(null);
const remoteNetworkOptions = reactive([]);
const networkOptions = reactive([]);

// 表格列
const columns = [
  {label: 'SN', prop: 'serial'},
  {label: 'mac地址', prop: 'mac'},
  {label: '网络', prop: 'networkName'},
  {label: '型号', prop: 'model'},
  {label: '时间', prop: 'createdTime'}
];

// 查询表单
const queryForm = [
  {
    label: '组织', prop: 'organizationId', type: 'select',
    config: {options: organizationOptions, clearable: false},
  },
  {
    label: 'SN', prop: 'sn', type: 'input'
  },
  {
    label: 'MAC', prop: 'mac', type: 'input'
  },
  {
    label: '网络', prop: 'networkId', type: 'select',
    config: {options: remoteNetworkOptions, remote: true, placeholder: '请输入'}
  },
  {
    label: '型号', prop: 'model', type: 'input'
  },
  {
    label: '开始日期', prop: 'startDate', type: 'date',
    config: {valueFormat: "YYYY-MM-DD"},
  },
  {label: '结束日期', prop: 'endDate', type: 'date',
    config: {valueFormat: "YYYY-MM-DD"},
  },
];

const table = {
  query: {
    url: '/device/switch/table',
    form: {formItems: queryForm}
  },
  columns: columns,
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
  getNetworkOptions(null, networkOptions);
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
  getNetworkOptions(null, networkOptions);
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
    @remoteMethod="remoteMethod"
    @reset="afterReset"
  >
  </compo-table>
</template>

<style lang="scss">

</style>
