<script setup>
import {ref, onMounted, reactive} from 'vue';
import {useRoute} from 'vue-router';
import {getOrganizationOptions} from '../device/device';

const route = useRoute();

const compoTableRef = ref(null);
const organizationOptions = reactive([]);

// 表格列
const columns = [
  {label: '网络', prop: 'network'},
  {label: '模板', prop: 'template'},
  {label: '时间', prop: 'createdTime'}
];

// 查询表单
const queryForm = [
  {
    label: '组织', prop: 'organizationId', type: 'select',
    config: {options: organizationOptions}
  },
  {
    label: '模板名称', prop: 'name', type: 'input'
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
  getOrganizationOptions(organizationOptions);
}

onMounted(() => {
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
  </compo-table>
</template>

<style lang="scss">

</style>
