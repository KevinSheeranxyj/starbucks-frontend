<script setup>
import tool from '@/utils/tool';
import {ref, onMounted, reactive} from 'vue';
import {useRoute} from 'vue-router';
import { getNetworkOptions } from '../device/device';

const route = useRoute();

const compoTableRef = ref(null);
const remoteNetworkOptions = reactive([]);
const networkOptions = reactive([]);

// 表格列
const columns = [
  {label: 'SN', prop: 'sn'},
  {label: 'mac地址', prop: 'mac'},
  {label: '网络', prop: 'network'},
  {label: '型号', prop: 'model'},
  {label: '时间', prop: 'createdTime'}
];

// 查询表单
const queryForm = [
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
  </compo-table>
</template>

<style lang="scss">

</style>
