<script setup>
import tool from '@/utils/tool';
import {ref, onMounted, reactive} from 'vue';
import {useRoute} from 'vue-router';
import { getNetworkOptions } from '../device/device';

const route = useRoute();

const compoTableRef = ref(null);
const remoteNetworkOptions = reactive([]);
const networkOptions = reactive([]);
const syncLoading = ref(false);

// 表格列
const columns = [
  {label: '网络', prop: 'network'},
  {label: '对应模板', prop: 'templete'},
  {label: '网络类型', prop: 'type'}
];

// 查询表单
const queryForm = [
  {
    label: '网络', prop: 'networkId', type: 'select',
    config: {options: remoteNetworkOptions, remote: true, placeholder: '请输入'}
  },
  {
    label: '模板', prop: 'templete', type: 'input'
  },
  {
    label: '网络类型', prop: 'type', type: 'input'
  }
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

function syncNetwork() {
  syncLoading.value = true;
  console.log('同步');
}

onMounted(() => {
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
      <el-button type="primary" plain :loading="syncLoading" @click="syncNetwork">同 步</el-button>
    </template>
  </compo-table>
</template>

<style lang="scss">

</style>
