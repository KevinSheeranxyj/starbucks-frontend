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
      <div v-if="slotProps.prop === 'id'">
        <el-link type="primary" @click="routerJobLogPage(slotProps.scope.row)">
          {{ slotProps.cellValue }}
        </el-link>
      </div>
      <div v-else-if="slotProps.prop === 'nextExecutionTime'">
        {{ tool.dateFormat(slotProps.cellValue, 'yyyy-MM-dd hh:mm:ss') }}
      </div>
      <div v-else-if="slotProps.prop === 'executionStatus'">
        <el-tag :type="getTagTypeByStatus(slotProps.cellValue)">
          {{ executionStatusEnum.getDescFromValue(slotProps.cellValue) }}
        </el-tag>
      </div>
    </template>

    <!-- 自定义列插槽 -->
    <template #tableDefinedSlot="slotProps">
      <div v-if="slotProps.prop === 'operator'">
        <el-link type="primary" @click="queryExecutionPlan2(slotProps.scope.row.cronExpression)"
                 href="javascript:;">执行计划
        </el-link>
        |
        <el-link type="primary" @click="run(slotProps.scope.row)" href="javascript:;">立即执行</el-link>
      </div>
    </template>

    <template #dialog>
      <!-- 对话框组件 -->
      <compo-dialog :dialogParams="addDialog" ref="addDialogRef" @confirmSuccess="addSuccess">
        <!-- 对话框按钮插槽 -->
        <template #dialogButtonSlot>
          <el-button type="primary" plain @click="queryExecutionPlan('addDialog', null)">执行计划</el-button>
        </template>
      </compo-dialog>
    </template>
  </compo-table>
</template>

<script setup>
import {reactive, ref, onMounted, h, computed} from 'vue';
import {useRouter} from "vue-router";
import {ElMessage, ElMessageBox} from 'element-plus/lib/components';
import http from "@/utils/http";
import tool from "@/utils/tool";
import {createEnum} from "@/utils/enums";

const router = useRouter();
const compoTableRef = ref(null);
const addDialogRef = ref(null);
const policyOptions = reactive([
  {label: '立即执行', value: '1',},
  {label: '执行一次', value: '2',},
  {label: '放弃执行', value: '3',}
]);

const concurrentOptions = reactive([
  {label: '允许', value: '0',},
  {label: '禁止', value: '1',}
]);
// const groupOptions = reactive([
//   {label: 'DEFAULT', value: 'DEFAULT',}
// ]);
const executionStatusOptions = reactive([{}]);


// 表格列
const columns = [
  {
    label: '启用状态', prop: 'status', type: 'switch', width: '60px',
    config: {activeValue: '0', inactiveValue: '1'}
  },
  {label: '任务编号', prop: 'id', width: '60px',},
  {label: '任务名称', prop: 'jobName', type: 'input', showOverflowTooltip: true},
  // {label: '任务组名', prop: 'jobGroup',},
  {label: '调用方法', prop: 'invokeTarget', type: 'input', minWidth: '120px', showOverflowTooltip: true},
  {label: '执行状态', prop: 'executionStatus', width: '70px'},
  {label: 'cron表达式', prop: 'cronExpression', type: 'input',},
  {label: '下次执行时间', prop: 'nextExecutionTime', width: '120px'},
  {
    label: '是否并发执行', prop: 'concurrent', type: 'select', width: '80px',
    config: {options: concurrentOptions},
  },
  {
    label: '失败执行策略', prop: 'misfirePolicy', type: 'select', width: '80px',
    config: {options: policyOptions},
  },
  {label: '操作', prop: 'operator', width: '120px', type: 'defined',}
];

const table = {
  query: {
    url: '/sys/job/table',
    form: {formItems: []},
    reset: false,
  },
  columns: columns,
  config: {
    page: true,
    multipleTable: true,
  },
  update: {
    url: '/sys/job/update',
  },
  delete: {
    url: '/sys/job/batchArchive',
  },
};

const addForm = [
  {label: '任务名称', prop: 'jobName', type: 'input', rules: true,},
  // {
  //   label: '任务组名', prop: 'jobGroup', type: 'select', rules: true,
  //   config: {options: groupOptions},
  // },
  {label: 'cron表达式', prop: 'cronExpression', type: 'input', rules: true,},
  {
    label: '是否并发执行', prop: 'concurrent', type: 'select', clearable: false,
    config: {options: concurrentOptions},
  },
  {
    label: '失败执行策略', prop: 'misfirePolicy', type: 'select', clearable: false,
    config: {options: policyOptions},
  },
  {label: '调用方法', prop: 'invokeTarget', type: 'input', rules: true, fixedSpan: 24},
]

const addDialog = {
  title: '新增',
  url: '/sys/job/add',
  form: {formItems: addForm, labelWidth: 90,},

}


/**
 * 查询表格
 */
function queryTable() {
  compoTableRef.value.query();
}

const getTagTypeByStatus = (value) => {
  if (value === 'SUCCESS') {
    return 'success';
  } else if (value === 'FAIL') {
    return 'danger';
  } else if (value === 'EXECUTING') {
    return 'warning';
  } else if (value === 'WAITING') {
    return 'info';
  }
};

const executionStatusEnum = computed(() => {
  const enumData = {};
  executionStatusOptions.forEach((o) => {
    enumData[o.label] = [o.value, o.label];
  });
  return createEnum(enumData);
});

/**
 * 跳转任务日志页
 * @param row
 */
const routerJobLogPage = (row) => {
  const routeParams = {
    jobId: row.id,
  }

  router.push({
    name: 'jobLog',
    params: routeParams,
  });
};


/**
 * 打开新增对话框
 */
async function openAddDialog() {
  await addDialogRef.value.openDialog();
  const initAddForm = {
    cronExpression: '0 0 * * * ?',
    misfirePolicy: '3',
    concurrent: '1',
  }
  addDialogRef.value.setForm(initAddForm);
}

/**
 * 新增成功后的处理
 */
function addSuccess() {
  ElMessage.success("新增成功");
  queryTable()
}

/**
 * 查询cron表达式执行计划
 */
async function queryExecutionPlan() {
  const body = addDialogRef.value.getForm();
  const {data: res} = await http.post('/sys/job/plan', body);
  if (!res.success) {
    return ElMessage.error(res.msg);
  }
  let time1 = res.data[0]
  let time2 = res.data[1]
  let time3 = res.data[2]
  let time4 = res.data[3]
  let time5 = res.data[4]

  ElMessageBox({
    title: '执行计划',
    message: h('p', null, [
      h('p', null, time1),
      h('p', null, time2),
      h('p', null, time3),
      h('p', null, time4),
      h('p', null, time5),
    ]),
    confirmButtonText: '确定',
  }).then(() => {
  })
}

async function queryExecutionPlan2(cronExpression) {
  const body = {
    cronExpression: cronExpression
  };
  const {data: res} = await http.post('/sys/job/plan', body);
  if (!res.success) {
    return ElMessage.error(res.msg);
  }
  let time1 = res.data[0]
  let time2 = res.data[1]
  let time3 = res.data[2]
  let time4 = res.data[3]
  let time5 = res.data[4]

  ElMessageBox({
    title: '执行计划',
    message: h('p', null, [
      h('p', null, time1),
      h('p', null, time2),
      h('p', null, time3),
      h('p', null, time4),
      h('p', null, time5),
    ]),
    confirmButtonText: '确定',
  }).then(() => {
  })
}

/**
 * 执行任务
 * @param row
 */
async function run(row) {
  if (row.status !== "0") {
    ElMessage.warning("任务未启用！");
    return
  }
  ElMessage.success("任务触发成功，请稍等...");
  const {data: res} = await http.post('/sys/job/run', row);
  if (!res.success) {
    return ElMessage.error(res.msg);
  }
  queryTable();
}


onMounted(() => {
  queryTable();
  tool.getOptions(executionStatusOptions, 'JOB_EXECUTION_STATUS');
});


</script>

<style lang="scss">

</style>
