<script setup>
import {ref, onMounted, reactive, computed} from 'vue';
import {useRoute} from 'vue-router';
import {ElMessage} from 'element-plus/lib/components';
import {createEnum} from '@/utils/enums';
import http from '@/utils/http';

const route = useRoute();

const compoTableRef = ref(null);
const addDialogRef = ref(null);
const updateDialogRef = ref(null);
const deleteLoading = ref(false);
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
  {label: '操作', prop: 'operator', type: 'defined'}
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

const addForm = [
  {
    label: '组织名称', prop: 'name', type: 'input', rules: true
  },
  {
    label: '组织类型', prop: 'organizationType', type: 'select', rules: true,
    config: {options: organizationTypeOptions}
  }
]

const addDialog = {
  title: '新增',
  url: '/organization/add',
  form: {formItems: addForm}
}

const updateDialog = {
  title: '更新',
  url: '/organization/update',
  form: {formItems: addForm}
}

/**
 * 查询表格
 */
function queryTable() {
  compoTableRef.value.query();
}

/**
 * 打开新增对话框
 */
function openAddDialog() {
  addDialogRef.value.openDialog();
}

/**
 * 打开更新对话框
 */
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

async function del(row) {
  if (deleteLoading.value) return;
  deleteLoading.value = true;
  const { data: res } = await http.post(
    '/organization/delete',
    {organizationId: row.organizationId, id: row.id}
  );
  deleteLoading.value = false;
  if (!res.success) {
    return ElMessage.error('删除失败');
  }
  ElMessage.success('删除成功');
  queryTable();
}

/**
 * 新增成功后的处理
 */
function addSuccess() {
  ElMessage.success('新增成功');
  queryTable()
}

/**
 * 更新成功后的处理
 */
function updateSuccess() {
  ElMessage.success('更新成功');
  queryTable()
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
    <!-- 按钮插槽 -->
    <template #buttonSlot>
      <el-button type="primary" plain @click="openAddDialog">新 增</el-button>
    </template>

    <template #tableTextSlot="slotProps">
      <div v-if="slotProps.prop === 'organizationType'">
        {{ organizationTypeEnum.getDescFromValue(slotProps.cellValue) }}
      </div>
    </template>

    <!-- 自定义列插槽 -->
    <template #tableDefinedSlot="slotProps">
      <div v-if="slotProps.prop === 'operator'">
        <el-link
          type="primary"
          href="javascript:;"
          style="margin-right: 10px"
          @click="openUpdateDialog(slotProps.scope.row)"
        >更新
        </el-link>
        <el-link
          type="danger"
          href="javascript:;"
          :loading="deleteLoading"
          @click="del(slotProps.scope.row)"
        >删除
        </el-link>
      </div>
    </template>

    <template #dialog>
      <!-- 新增对话框 -->
      <compo-dialog ref="addDialogRef" :dialog-params="addDialog" @confirmSuccess="addSuccess"></compo-dialog>
      <!-- 更新对话框 -->
      <compo-dialog ref="updateDialogRef" :dialog-params="updateDialog" @confirmSuccess="updateSuccess"></compo-dialog>
    </template>
  </compo-table>
</template>

<style lang="scss">

</style>
