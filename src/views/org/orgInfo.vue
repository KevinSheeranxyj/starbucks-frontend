<script setup>
import {ref, onMounted, reactive, computed, onActivated} from 'vue';
import {useRoute} from 'vue-router';
import {ElMessage} from 'element-plus/lib/components';
import {createEnum, createEnumByOptions} from '@/utils/enums';
import {getOrganizationOptions} from "@/views/device/device";
onActivated(()=>{
  console.log("onActivated called")
});

const route = useRoute();
const organizationOptions = reactive([]);

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

const organizationEnum = computed(() => {
  return createEnumByOptions(organizationOptions);
});

// 表格列operateLog/list
const columns = [
  // {label: 'ID', prop: 'id'},
  {label: '组织 ID', prop: 'organizationId'},
  {label: '组织', prop: 'name'},
  {
    label: '组织类型', prop: 'organizationType', type: 'select',
    config: {options: organizationTypeOptions, clearable: false}
  }
];

// 查询表单
const queryForm = [
  {
    label: '组织', prop: 'organizationId', type: 'select',
    config: {options: organizationOptions},
  },
  // {
  //   label: '名称', prop: 'name', type: 'input'
  // },
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
  config: {
    page: true,
    multipleTable: true
  },
  hideAllowed: true,
  update: {
    url: '/organization/update',
  }
};

const getTagTypeByOrganizationType = (value) => {
  if (value === "OFFICE") {
      return "办公室";
  } else if (value === "STORE") {
      return "门店";
  }
};


/**
 * 查询表格
 */
function queryTable() {
  compoTableRef.value.query();
}

function initQuery() {
  const queryForm = {
    organizationId: organizationOptions.value
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
    @changeSelect="queryTable"
    :table-params="table"
  >

    <template #tableSelectSlot="slotProps">
      <div v-if="slotProps.prop === 'organizationType'">
        <el-tag :type="getTagTypeByOrganizationType(slotProps.cellValue)">
          {{ organizationTypeEnum.getDescFromValue(slotProps.cellValue) }}
        </el-tag>
      </div>
    </template>

  </compo-table>
</template>

<style lang="scss">

</style>
