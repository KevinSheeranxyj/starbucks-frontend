<script setup>
import {ref, onMounted} from 'vue';
import {useRoute} from 'vue-router';

const route = useRoute();

const compoTableRef = ref(null);

// 表格列
const columns = [
  {label: '名称', prop: 'name'},
  {label: 'ID', prop: 'id'}

];

// 查询表单
const queryForm = [
  {
    label: '名称', prop: 'name', type: 'input'
  },
  {
    label: 'ID', prop: 'id', type: 'input'
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
