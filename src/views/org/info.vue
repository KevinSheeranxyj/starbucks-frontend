<script setup>
import {ref, onMounted, reactive, computed} from 'vue';
import {useRoute} from 'vue-router';
import {ElMessage} from 'element-plus/lib/components';
import {createEnum} from '@/utils/enums';
import http from '@/utils/http';

const route = useRoute();

const compoTableRef = ref(null);
const organizationTypeOptions = reactive([
  {label: '办公室', value: 'OFFICE' },
  {label: '门店', value: 'STORE' }
]);

const organizationTypeEnum = computed(() => {
  const enumData = {};
  organizationTypeOptions.forEach((o) => {
    enumData[o.label] = [o.value, o.label];
  });
  return createEnum(enumData);
});

// 表格列operateLog/list
const columns = [
  {label: 'ID', prop: 'id'},
  {label: '组织 ID', prop: 'organizationId'},
  {label: '名称', prop: 'name'},
  {
    label: '组织类型', prop: 'organizationType'
  },
];

// 查询表单
const queryForm = [
  {
    label: '名称', prop: 'name', type: 'input'
  },
  {
    label: '组织 ID', prop: 'organizationId', type: 'input'
  },
  {
    label: '组织类型', prop: 'organizationType', type: 'select',
    config: {options: organizationTypeOptions}
  }
];

const table = {
  query: {
    url: '/organization/list',
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
    <template #tableTextSlot="slotProps">
      <div v-if="slotProps.prop === 'organizationType'">
        {{ organizationTypeEnum.getDescFromValue(slotProps.cellValue) }}
      </div>
    </template>
  </compo-table>
</template>

<style lang="scss">

</style>
