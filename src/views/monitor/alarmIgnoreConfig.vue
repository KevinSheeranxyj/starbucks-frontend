<template>
  <!-- 表格组件 -->
  <compo-table
      :tableParams="table"
      ref="compoTableRef"
  >
    <!-- 按钮插槽 -->
    <template #buttonSlot>
      <el-button type="primary" plain @click="openAddDialog">新 增</el-button>
    </template>

    <template #tableTextSlot="slotProps">
      <div v-if="slotProps.prop === 'alarmCfgId'">
        {{ alarmEnum.getDescFromValue(slotProps.cellValue) }}
      </div>

    </template>


    <template #dialog>
      <!-- 新增对话框 -->
      <compo-dialog :dialogParams="addDialog" ref="addDialogRef" @confirmSuccess="addSuccess"></compo-dialog>
    </template>

  </compo-table>
</template>

<script setup>
import {ref, reactive, onMounted, computed,} from 'vue';
import http from "@/utils/http";
import {ElMessage} from "element-plus/lib/components";
import {createEnum} from "@/utils/enums";

const compoTableRef = ref(null);
const addDialogRef = ref(null);
const alarmOptions = reactive([]);

async function getAlarmOptions() {
  const {data: res} = await http.post(`/alarm/config/list`, {});
  alarmOptions.length = 0;
  res.data.forEach((alarmConfig) => {
    alarmOptions.push({
      value: alarmConfig.id,
      label: alarmConfig.alarmName,
    });
  });
}

// 表格列
const columns = [
  {label: 'ID', prop: 'id', width: '40px'},
  {label: '启用状态', prop: 'enableFlag', type: 'switch', width: '60px',},
  {label: '组织', prop: 'organizationId',},
  {label: '网络', prop: 'networkId',},
  {label: '告警名称', prop: 'alarmCfgId', minWidth: '120px', showOverflowTooltip: true},
  {label: '忽略值', prop: 'ignoreValue', type: 'input', showOverflowTooltip: true},
  {
    label: '失效时间', prop: 'disableTime', type: 'datetime',
    config: {style: "yyyy-MM-dd hh:mm:ss", clearable: false},
  },
];

// 查询表单
const queryForm = [
  {
    label: '告警名称', prop: 'alarmCfgId', type: 'select',
    config: {options: alarmOptions},
  },
];

const table = {
  query: {
    url: '/alarm/ignore/config/table',
    form: {formItems: queryForm},
  },
  columns: columns,
  config: {
    page: true,
    multipleTable: true,
  },
  update: {
    url: '/alarm/ignore/config/update',
  },
  delete: {
    url: '/alarm/ignore/config/batchArchive',
  },
};

const addForm = [
  {
    label: '告警名称', prop: 'alarmCfgId', type: 'select', rules: true,
    config: {options: alarmOptions},
  },
  {
    label: '失效时间', prop: 'disableTime', type: 'datetime',
  },
  {
    label: '忽略值', prop: 'ignoreValue', type: 'input', rules: true, fixedSpan: 24,
    config: {placeholder: '忽略网络请填名称，忽略设备请填序列号'}
  },
]

const addDialog = {
  title: '新增',
  url: '/alarm/ignore/config/add',
  form: {formItems: addForm},
}

/**
 * 初始化查询
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
 * 新增成功后的处理
 */
function addSuccess() {
  ElMessage.success("新增成功");
  queryTable()
}

const alarmEnum = computed(() => {
  const enumData = {};
  alarmOptions.forEach((o) => {
    enumData[o.label] = [o.value, o.label];
  });
  return createEnum(enumData);
});

onMounted(() => {
  queryTable();
  getAlarmOptions();
});


</script>

<style lang="scss">

</style>
