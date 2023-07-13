<template>
  <!-- 表格组件 -->
  <compo-table
      :tableParams="table"
      ref="compoTableRef"
      @querySuccess="afterQuerySuccess"
      :span-method="objectSpanMethod"
  >
    <!-- 按钮插槽 -->
    <template #buttonSlot>
      <el-button type="primary" plain @click="openAddDialog">新 增</el-button>
    </template>

    <template #dialog>
      <!-- 对话框组件 -->
      <compo-dialog :dialogParams="addDialog" ref="addDialogRef" @confirmSuccess="initQuery"></compo-dialog>
    </template>
  </compo-table>
</template>

<script setup>
import {reactive, ref, onMounted,} from 'vue';

const compoTableRef = ref(null);
const addDialogRef = ref(null);
const pageOptions = reactive([]);
// 单元格合并数据
const spanData = ref([]);

// 表格列
const columns = [
  {label: '页面名称', prop: 'page',},
  {label: '控件名称', prop: 'name', type: 'input',},
  {label: '接口地址', prop: 'path', type: 'input',},
];

// 查询表单
const queryForm = [
  {
    label: '页面名称', prop: 'page', type: 'select',
    config: {options: pageOptions},
  },
];

const table = {
  query: {
    url: '/sys/resource/table',
    form: {formItems: queryForm},
  },
  columns: columns,
  config: {page: true, stripe: false, border: true},
  // 更新
  update: {
    url: '/sys/resource/update',
  },
};

const addForm = [
  {label: '页面名称', prop: 'page', type: 'input', rules: true},
  {label: '控件名称', prop: 'name', type: 'input', rules: true},
  {label: '接口地址', prop: 'path', type: 'input', rules: true},
]

const addDialog = {
  title: '新增',
  url: '/sys/resource/add',
  form: {formItems: addForm, labelWidth: 100},
}

/**
 * 初始化查询
 */
function initQuery() {
  compoTableRef.value.query();
}

/**
 * 表格查询成功后，进行操作
 */
function afterQuerySuccess(tableData) {
  setSpanData(tableData);
}

function openAddDialog() {
  addDialogRef.value.openDialog();
}

/**
 * 合并单元格
 */
function objectSpanMethod({rowIndex, columnIndex}) {
  return spanData.value[rowIndex][columnIndex];
}

function setSpanData(tableData) {
  const rowNum = tableData.length;
  const colNum = columns.length;
  const newSpanData = [];
  for (let i = 0; i < rowNum; i++) {
    const rowSpanData = [];
    for (let j = 0; j < colNum; j++) {
      rowSpanData.push([1, 1]);
    }
    newSpanData.push(rowSpanData);
  }

  let prevRow = {};
  let startSpanRow = [];
  for (let i = 0; i < tableData.length; i++) {
    if (tableData[i].page === prevRow.page) {
      for (let index = 0; index < 1; index++) {
        newSpanData[i][index] = [0, 0];
        startSpanRow[index][0]++;
      }
    } else {
      for (let index = 0; index < 1; index++) {
        startSpanRow[index] = newSpanData[i][index];
      }
    }
    prevRow = tableData[i];
  }

  spanData.value = newSpanData;
}

onMounted(() => {
  initQuery();
});

</script>

<style lang="scss">

</style>
