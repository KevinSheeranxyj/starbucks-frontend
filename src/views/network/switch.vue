<script setup>
import {ref, onMounted} from 'vue';
import {useRoute} from 'vue-router';

const route = useRoute();

const compoTableRef = ref(null);

// 表格列
const columns = [
  {label: '交换机', prop: 'name', minWidth: '100px'},
  {label: '公网IP', prop: 'publicIp', minWidth: '100px'},
  {label: 'VLAN', prop: 'vlan', minWidth: '100px'},
  {label: 'LAN IP', prop: 'lanIp', minWidth: '100px'},
  {label: '网关', prop: 'gateway', minWidth: '100px'}
];

// 查询表单
const queryForm = [

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
    @reset="afterReset"
  >
  </compo-table>
</template>

<style lang="scss">

</style>
