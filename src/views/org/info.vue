<script setup>
import {ref, onMounted, reactive, computed} from 'vue';
import {useRoute} from 'vue-router';
import {ElMessage} from 'element-plus/lib/components';
import {createEnum, createEnumByOptions} from '@/utils/enums';
import {getOrganizationOptions} from "@/views/device/device";

const route = useRoute();
const organizationOptions = reactive([]);
const updateDialogRef = ref(null);

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
  {label: 'ID', prop: 'id'},
  {label: '组织 ID', prop: 'organizationId'},
  {label: '名称', prop: 'name'},
  {
    label: '组织类型', prop: 'organizationType'
  },
  {label: '操作', prop: 'operator', width: '60px', type: 'defined' }
];

// 查询表单
const queryForm = [
  {
    label: '组织', prop: 'organizationId', type: 'select',
    config: {options: organizationOptions},
  },
  {
    label: '名称', prop: 'name', type: 'input'
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
  if (Object.keys(route.params).length <= 0) {
    queryTable();
  }
});

async function openUpdateDialog(row) {
// 调用对话框组件，打开对话框后，再传参给对话框表单
  await updateDialogRef.value.openDialog();
  const body = {
    id: row.id,
    organizationId: row.organizationId,
    name: row.name,
    organizationType: row.organizationType
  }
  updateDialogRef.value.setForm(body);
}

function updateSuccess() {
  ElMessage.success('更新成功');
  queryTable()
}

const updateForm = [
  {
    label: '组织类型', prop: 'organizationType', type: 'select', rules: true,
    config: {options: organizationTypeOptions}
  }
]

const updateDialog = {
  title: '更新',
  url: '/organization/update',
  form: {formItems: updateForm}
}

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
      <div v-else-if="slotProps.prop === 'organizationId'">
        {{ organizationEnum.getDescFromValue(slotProps.cellValue) }}
      </div>
    </template>

    <!-- 自定义列插槽 -->
    <template #tableDefinedSlot="slotProps">
      <div v-if="slotProps.prop === 'operator'">
        <el-link
            type="primary"
            href="javascript:;"
            @click="openUpdateDialog(slotProps.scope.row)"
        >更新
        </el-link>
      </div>
    </template>

    <template #dialog>
      <!-- Update Dialogue -->
      <compo-dialog ref="updateDialogRef" :dialog-params="updateDialog" @confirmSuccess="updateSuccess"></compo-dialog>
    </template>
  </compo-table>
</template>

<style lang="scss">

</style>
