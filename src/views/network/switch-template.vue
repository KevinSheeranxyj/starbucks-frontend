<script setup>
import tool from '@/utils/tool';
import {ref, onMounted, reactive} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {getNetworkOptions, getOrganizationOptions} from '../device/device';

const route = useRoute();
const router = useRouter();

const compoTableRef = ref(null);
const remoteNetworkOptions = reactive([]);
const networkOptions = reactive([]);
const organizationOptions = reactive([]);

// 表格列
const columns = [
  {label: '网络', prop: 'networkName'},
  {label: '交换机', prop: 'name'},
  {label: '型号', prop: 'model'},
  {label: '交换机序列号', prop: 'serial'},
  {label: '交换机模板', prop: 'template'}
];

// 查询表单
const queryForm = [
  {
    label: '组织', prop: 'organizationId', type: 'select',
    config: {options: organizationOptions, clearable: false},
  },
  {
    label: '网络', prop: 'network', type: 'input'
  },
  {
    label: '交换机', prop: 'switch', type: 'input'
  },
  {
    label: '型号', prop: 'model', type: 'input'
  },
  {
    label: '交换机模板', prop: 'template', type: 'input'
  }
];

const table = {
  query: {
    url: '/device/switch/table',
    form: {formItems: queryForm}
  },
  columns: columns,
  config: {page: true, multipleTable: true}
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

function toHistory() {
  router.push('/network/switch-template-history')
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
    <!-- 按钮插槽 -->
    <template #buttonSlot>
      <el-button type="primary" plain @click="toHistory">历史记录</el-button>
    </template>
  </compo-table>
</template>

<style lang="scss">

</style>
