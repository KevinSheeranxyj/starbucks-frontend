<template>
  <div class="field-editor">
    <div class="table-container">
      <el-table
        :border="true"
        :data="tableData"
        style="width: 100%"
        height="100%"
        highlight-current-row
        @current-change="handleCurrentChange"
        @cell-click="cellClick"
        :row-class-name="tableRowClassName"
      >
        <el-table-column
          v-for="(item, index) in columnData"
          :key="index"
          :prop="item.prop"
          :label="item.label"
          :min-width="item.minWidth"
          header-align="center"
          :align="item.type == 'boolean' ? 'center' : 'left'"
        >
          <template #default="scope">
            <div v-if="item.type == 'string'">
              <div class="table-content" v-show="!getCellEditFlag(scope.row, scope.column)">
                {{ scope.row[item.prop] }}
              </div>
              <div class="input-container">
                <el-input
                  v-if="getCellEditFlag(scope.row, scope.column)"
                  @blur="updateCell(scope.row, scope.column)"
                  v-model="scope.row[item.prop]"
                  type="text"
                  ref="cellInputRef"
                ></el-input>
              </div>
            </div>

            <div v-if="item.type == 'boolean'">
              <el-checkbox v-model="scope.row[item.prop]" label="" size="large" />
            </div>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="xxx" label="操作" width="80" align="center">
        <template #default="scope">
          <el-link type="danger" @click="deleteRow(scope.row)">删除</el-link>
        </template>
      </el-table-column> -->
      </el-table>
    </div>

    <div class="action-bar">
      <el-button type="info" bg plain @click="addRow">新增</el-button>
      <el-button type="danger" bg plain @click="deleteRow" :disabled="isRowNotSelected">删除</el-button>
      <el-button type="info" bg plain @click="upRow" :disabled="isRowNotSelected">上移</el-button>
      <el-button type="info" bg plain @click="downRow" :disabled="isRowNotSelected">下移</el-button>
    </div>
  </div>
</template>

<script setup>
// import tool from '@/utils/tool';
import {
  ref,
  reactive,
  toRefs,
  onMounted,
  onBeforeUnmount,
  nextTick,
  // watch,
  computed,
  defineProps,
  // defineEmits,
} from 'vue';

const cellInputRef = ref(null);

const props = defineProps({
  tableData: {
    type: Array,
    default: () => [],
    validator(value) {
      return value.filter((o) => !o.id).length <= 0;
    },
  },
  columns: {
    type: Array,
    default: () => [
      {
        prop: 'key',
        label: 'key',
        minWidth: '100',
        type: 'string',
        default: '',
      },
      {
        prop: 'value',
        label: 'value',
        minWidth: '100',
        type: 'string',
        default: '',
      },
    ],
  },
});

// const emit = defineEmits(['update:tableData']);
const { tableData } = toRefs(props);
const columnData = reactive([]);

// const tableData = reactive([]);

const beforeValue = ref('');
const tableEdit = reactive({});
// const editingRow = reactive({});
const editingCellId = ref('');
const currentRow = ref();

const isRowNotSelected = computed(() => {
  return currentRow.value == undefined;
});

// const tableDataWithId = computed(() => {
//   const dataList = [];
//   for (let i = 0; i < tableData.value.length; i++) {
//     dataList[i] = tableData[i];
//     dataList[i].id = i;
//   }

//   console.log(dataList);
//   return dataList;
// });

// watch(
//   tableData,
//   (value, oldValue) => {
//     // 第一次触发时不是同一个对象
//     if (value != oldValue) {
//       return;
//     }
//     console.log(value);
//     const result = [];
//     for (const row of value) {
//       const item = tool.objCopy(row);
//       delete item.id;
//       result.push(item);
//     }
//     emit('update:data', result);
//   },
//   { deep: true, immediate: false }
// );

// watch(
//   data,
//   (value) => {
//     console.log(JSON.stringify(value));
//     console.log(value);
//     const list = tool.objCopy(value);
//     for (let i = 0; i < list.length; i++) {
//       list[i].id = i;
//     }
//     tableData.length = 0;
//     list.forEach((o) => tableData.push(o));
//     console.log(list);
//     console.log(tableData);
//   },
//   { deep: true, immediate: false }
// );

onMounted(() => {
  // 表格列
  columnData.length = 0;
  for (const item of props.columns) {
    columnData.push(item);
  }

  // 表格数据
  // const list = tool.objCopy(props.data);
  // for (let i = 0; i < list.length; i++) {
  //   list[i].id = i;
  // }

  // tableData.value = list;
});

onBeforeUnmount(() => {});

const tableRowClassName = ({ row, rowIndex }) => {
  // 把每一行的索引放进row
  row.id = rowIndex;
};

const handleCurrentChange = (newRow) => {
  currentRow.value = newRow;
};

const addRow = () => {
  const row = {};
  for (const column of props.columns) {
    row[column.prop] = column.default;
  }
  // let newIndex = 1;
  // if (tableData.value.length > 0) {
  //   const lastRow = tableData.value[tableData.value.length - 1];
  //   newIndex = lastRow.id + 1;
  // }
  // row.id = newIndex;
  tableData.value.push(row);
};

const getCurrentRowIndex = () => {
  let index = -1;
  for (let i = 0; i < tableData.value.length; i++) {
    const row = tableData.value[i];
    if (currentRow.value.id == row.id) {
      index = i;
      break;
    }
  }
  return index;
};

const deleteRow = () => {
  const targetIndex = getCurrentRowIndex();
  if (targetIndex !== -1) {
    tableData.value.splice(targetIndex, 1);
  }
};

const upRow = () => {
  const index = getCurrentRowIndex();
  if (index != 0) {
    tableData.value[index] = tableData.value.splice(index - 1, 1, tableData.value[index])[0];
  }
};

const downRow = () => {
  const index = getCurrentRowIndex();
  if (index != tableData.value.length - 1) {
    tableData.value[index] = tableData.value.splice(index + 1, 1, tableData.value[index])[0];
  }
};

/**
 * 获取单元格编辑状态
 */
const getCellEditFlag = (row, column) => {
  return tableEdit[column.id + '_' + row.id];
};

/**
 * 重置单元格编辑状态
 */
const initTableEdit = () => {
  editingCellId.value = '';
  for (const key in tableEdit) {
    tableEdit[key] = false;
  }
};

/**
 * 点击单元格,标识该单元格编辑
 */
const cellClick = async (row, column, cell) => {
  console.log(cell);
  const id = column.id + '_' + row.id;
  beforeValue.value = row[column.property];
  if (id == editingCellId.value) {
    return;
  }
  // 初始化表格编辑
  initTableEdit();
  tableEdit[id] = true;
  editingCellId.value = id;

  // 等页面渲染好再调用
  await nextTick();
  if (cellInputRef.value) {
    if (cellInputRef.value.length > 0) {
      cellInputRef.value[0].focus();
    }
  }
  // if (this.$refs.cellSelection) {
  //   this.$refs.cellSelection.toggleMenu();
  // }
};

/**
 * 更新单元格
 */
const updateCell = (row, column) => {
  // let key = column.property;
  let value = row[column.property];

  // 单元格内容不变，不更新
  if (beforeValue.value === value) {
    initTableEdit();
    return;
  }
  initTableEdit();
};
</script>

<style lang="scss" scoped>
.field-editor {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .table-container {
    overflow: auto;
    flex: 1;

    :deep(.el-table__cell) {
      padding: 0;
    }

    :deep(.el-input) {
      --el-input-focus-border-color: #ffffff00;
      // --el-input-bg-color: #ffffff00;
    }

    :deep(.el-input__inner) {
      font-size: 12px;
      font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, SimSun, sans-serif;
    }

    :deep(.el-checkbox.el-checkbox--large) {
      height: 18px;
    }
    .table-content {
      height: 26px;
      padding: 1px 8px;
      font-size: 12px;
      font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, SimSun, sans-serif;
    }

    .input-container {
      padding: 0 1px;
    }
  }

  .action-bar {
    height: 26px;
    margin: 10px 0 5px 0;
    width: 100%;
    display: flex;

    justify-content: center;
  }
}
</style>
