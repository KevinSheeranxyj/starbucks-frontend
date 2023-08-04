<script setup>
import {ref, onMounted} from 'vue';
import {useRoute} from 'vue-router';

const route = useRoute();

const compoTableRef = ref(null);

// 表格列
const columns = [
  {label: 'mac地址', prop: 'mac'},
  {label: '序列号', prop: 'serial'},
  {label: '归属网络', prop: 'networkName'},
  {label: '型号', prop: 'model'},
  {label: '申领时间', prop: 'claimedTime'}
];

// 查询表单
const queryForm = [

];

const table = {
  query: {
    url: '/device/inventory/table',
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

onMounted(() => {
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
  >
  </compo-table>
</template>

<style lang="scss">

</style>
