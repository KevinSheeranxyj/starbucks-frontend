<template>
  <!-- 表格组件 -->
  <compo-table
      :tableParams="table"
      ref="compoTableRef"
  >

    <template #tableTextSlot="slotProps">
      <div v-if="slotProps.prop === 'startTime'">
        {{ tool.dateFormat(slotProps.cellValue, 'yyyy-MM-dd hh:mm:ss') }}
      </div>
      <div v-else-if="slotProps.prop === 'endTime'">
        {{ tool.dateFormat(slotProps.cellValue, 'yyyy-MM-dd hh:mm:ss') }}
      </div>
      <div v-else-if="slotProps.prop === 'executionStatus'">
        <el-tag :type="getTagTypeByStatus(slotProps.cellValue)">
          {{ executionStatusEnum.getDescFromValue(slotProps.cellValue) }}
        </el-tag>
      </div>
    </template>

  </compo-table>
</template>

<script setup>
import {reactive, ref, onMounted, computed, onActivated} from 'vue';
import {useRoute} from "vue-router";
import http from "@/utils/http";
import tool from "@/utils/tool";
import {createEnum} from "@/utils/enums";

const route = useRoute();
const compoTableRef = ref(null);
const executionStatusOptions = reactive([{}]);
const jobOptions = reactive([{}]);

// 表格列
const columns = [
  {label: 'ID', prop: 'id', width: '60px',},
  {label: '任务编号', prop: 'jobId', width: '60px',},
  {label: '任务名称', prop: 'jobName', minWidth: '120px'},
  {label: '执行状态', prop: 'executionStatus', minWidth: '80px',},
  {label: '开始时间', prop: 'startTime', minWidth: '130px',},
  {label: '结束时间', prop: 'endTime', minWidth: '130px',},
  {label: '执行耗时', prop: 'execDuration', minWidth: '100px',},
  // {label: '异常信息', prop: 'exceptionInfo', minWidth: '250px',},
];

// 查询表单
const queryForm = [
  {label: '任务编号', prop: 'jobId', type: 'input',},
  {
    label: '任务名称', prop: 'jobName', type: 'select',
    config: {options: jobOptions},
  },
  {
    label: '执行状态', prop: 'executionStatusList', type: 'select',
    config: {options: executionStatusOptions, multiple: true, collapseTags: true},
  },
];

const table = {
  query: {
    url: '/sys/job/log/table',
    form: {formItems: queryForm},
  },
  columns: columns,
  config: {
    page: true,
  },
};

/**
 * 查询表格
 */
function queryTable() {
  compoTableRef.value.query();
}

/**
 * 获取网络列表
 */
async function getJobOptions() {
  const {data: res} = await http.post('/sys/job/list', {});
  jobOptions.length = 0;
  res.data.forEach((job) => {
    const data = {
      label: job.jobName,
      value: job.jobName,
      name: job.jobName,
    };
    jobOptions.push(data);
  });
}

const getTagTypeByStatus = (value) => {
  if (value === 'SUCCESS') {
    return 'success';
  } else if (value === 'FAIL') {
    return 'danger';
  } else if (value === 'EXECUTING') {
    return 'warning';
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
 * 校验是否页面跳转，设置查询条件
 */
function setupState() {
  if (Object.keys(route.params).length > 0) {
    const query = route.params;
    const queryForm = {
      jobId: query.jobId,
    };
    // 设置查询表单
    compoTableRef.value.setForm(queryForm);
    queryTable()
  }
}


onMounted(() => {
  queryTable();
  getJobOptions();
  tool.getOptions(executionStatusOptions, 'JOB_EXECUTION_STATUS');
});

onActivated(() => {
  setupState()
});

</script>

<style lang="scss">

</style>
