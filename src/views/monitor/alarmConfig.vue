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
      <div v-if="slotProps.prop === 'id'">
        <el-link type="primary" @click="routerAlarmLogPage(slotProps.cellValue)">
          {{ slotProps.cellValue }}
        </el-link>
      </div>
      <div v-else-if="slotProps.prop === 'channelType'">
        {{ channelEnum.getDescFromValue(slotProps.cellValue) }}
      </div>
      <div v-else-if="slotProps.prop === 'organizationType'">
        {{ organizationTypeEnum.getDescFromValue(slotProps.cellValue) }}
      </div>
      <div v-else-if="slotProps.prop === 'monitorRange'">
        {{ monitorRangeEnum.getDescFromValue(slotProps.cellValue) }}
      </div>
      <div v-else-if="slotProps.prop === 'beanName'">
        {{ classEnum.getDescFromValue(slotProps.cellValue) }}
      </div>
      <div v-else-if="slotProps.prop === 'checkField'">
        {{ fieldEnum.getDescFromValue(slotProps.cellValue) }}
      </div>
      <div v-else-if="slotProps.prop === 'alarmObject'">
        <span v-for="(item, index) in JSON.parse(slotProps.cellValue)" :key="index">
          {{ item }}
          <br>
        </span>
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
      <!-- 新增对话框 -->
      <compo-dialog ref="addDialogRef" :dialog-params="addDialog" @initDialog="initDialog" @confirmSuccess="addSuccess">
        <template #dialogSlot>
          <el-button class="add-button" type="primary" plain @click="addItems">+</el-button>
        </template>
      </compo-dialog>
      <!-- 更新对话框 -->
      <compo-dialog ref="updateDialogRef" :dialog-params="updateDialog"
                    @initDialog="initDialog" @confirmSuccess="updateSuccess">
        <template #dialogSlot>
          <el-button class="add-button" type="primary" plain @click="addItems">+</el-button>
        </template>
      </compo-dialog>
    </template>

  </compo-table>
</template>

<script setup>
import {ref, reactive, onMounted, computed } from 'vue';
import {useRouter} from 'vue-router';
import http from '@/utils/http';
import {ElMessage} from 'element-plus/lib/components';
import {createEnum} from '@/utils/enums';
import tool from '@/utils/tool';

const compoTableRef = ref(null);
const addDialogRef = ref(null);
const updateDialogRef = ref(null);
const alarmOptions = reactive([{}]);
const emailOptions = reactive([{}]);
const organizationTypeOptions = reactive([
  {label: '办公室', value: 'OFFICE' },
  {label: '门店', value: 'STORE' }

]);
const channelOptions = reactive([
  {label: '邮件', value: 'MAIL' },
  {label: '不通知', value: 'NONE' }
]);

const operatorOptions = reactive([
  {label: '≥', value: '≥' },
  {label: '>', value: '>' },
  {label: '=', value: '=' },
  {label: '<', value: '<' },
  {label: '≤', value: '≤' }
]);
const classOptions = reactive([]);
const monitorRangeOptions = reactive([
  {label: '全部设备', value: 'ALL' },
  {label: '重点设备', value: 'IMPORTANT' },
  {label: '告警网络下的设备', value: 'ALERTING_NETWORK' }
]);
const fieldOptions = reactive([
  {label: '2.4G信道利用率', value: 'utilization2g' },
  {label: '5G信道利用率', value: 'utilization5g' },
  {label: '终端连接数', value: 'connectClientNum' },
  {label: '延时', value: 'latency' },
  {label: '信号质量', value: 'rssi' },
  {label: '信噪比', value: 'snr' },
  {label: '流量', value: 'traffic'}
]);

const router = useRouter();

async function getUserOptions() {
  const {data: res} = await http.post(`/sys/user/list`, {});
  emailOptions.length = 0;
  res.data.forEach((user) => {
    emailOptions.push({
      value: user.email,
      label: user.email
    });
  });
}

async function getAlarmOptions() {
  const {data: res} = await http.post(`/alarm/config/list`, {});
  alarmOptions.length = 0;
  res.data.forEach((user) => {
    alarmOptions.push({
      value: user.alarmName,
      label: user.alarmName
    });
  });
}

// 表格列
const columns = [
  {label: 'ID', prop: 'id', width: '40px'},
  {label: '启用状态', prop: 'enableFlag', type: 'switch', width: '60px' },
  {label: '监控组织', prop: 'organizationType', width: '60px'},
  {label: '监控对象', prop: 'beanName', width: '60px'},
  {label: '监控范围', prop: 'monitorRange', width: '80px', showOverflowTooltip: true},
  {label: '告警名称', prop: 'alarmName', minWidth: '120px', showOverflowTooltip: true},
  {label: '检查项', prop: 'checkField', minWidth: '100px'},
  // {label: '内容模板', prop: 'alarmTemplate', minWidth: '200px'},
  // {label: '渠道告警等级', prop: 'channelAlarmLevel', width: '80px',},
  {label: '阈值运算符', prop: 'thresholdOperator', width: '70px' },
  {label: '阈值', prop: 'highThreshold', width: '60px' },
  // {label: '渠道类型', prop: 'channelType', width: '60px',},
  {label: '告警对象', prop: 'alarmObject', width: '170px' },
  {
    label: '生效时间', prop: 'monitorStartTime', type: 'datetime', width: '130px',
    config: {style: 'yyyy-MM-dd hh:mm:ss'}
  },
  {label: '操作', prop: 'operator', width: '60px', type: 'defined' }
];

// 查询表单
const queryForm = [
  {
    label: '告警名称', prop: 'alarmName', type: 'select',
    config: {options: alarmOptions}
  },
  {
    label: '监控对象', prop: 'beanName', type: 'select',
    config: {options: classOptions}
  }
];

const table = {
  query: {
    url: '/alarm/config/table',
    form: {formItems: queryForm}
  },
  columns: columns,
  config: {
    page: true,
    multipleTable: true
  },
  update: {
    url: '/alarm/config/updateByPrimaryKeySelective'
  },
  delete: {
    url: '/alarm/config/batchArchive'
  }
};

const defaultAddForm = [
  {label: '告警名称', prop: 'alarmName', type: 'input', minWidth: '120px', fixedSpan: 24, rules: true },
  {
    label: '内容模板', prop: 'alarmTemplate', type: 'input', fixedSpan: 24,
    config: {type: 'textarea'}
  },
  {
    label: '监控组织', prop: 'organizationType', type: 'select', rules: true, fixedSpan: 12,
    config: {options: organizationTypeOptions}
  },
  {
    label: '监控对象', prop: 'beanName', type: 'select', rules: true, fixedSpan: 12,
    config: {options: classOptions}
  },
  {
    label: '渠道类型', prop: 'channelType', type: 'select', rules: true, fixedSpan: 12,
    config: {options: channelOptions}
  },
  {
    label: '生效时间', prop: 'monitorStartTime', type: 'datetime', width: '120px', fixedSpan: 12,
    config: {clearable: false}
  },
  {
    label: '告警对象', prop: 'alarmObject', type: 'select', rules: true, fixedSpan: 24,
    config: {options: emailOptions, multiple: true, collapseTags: true, allowCreate: true}
  },
  {
    label: '监控范围', prop: `monitorRange`, type: 'select', rules: true, fixedSpan: 24,
    config: {options: monitorRangeOptions}
  },
]

const extraItems = ref([])

const addDialog = computed(() => ({
  title: '新增',
  url: '/alarm/config/add',
  form: {
    formItems: [
      ...defaultAddForm,
      ...extraItems.value
    ]
  }
}))

const updateDialog = computed(() => ({
  title: '更新',
  url: '/alarm/config/updateByPrimaryKey',
  form: {
    formItems: [
      ...defaultAddForm,
      ...extraItems.value
    ]
  }
}))

const resemble = computed(() => {
    extraItems.value
    });

function addItems() {
  extraItems.value = extraItems.value.concat([{
    label: '检查项', prop: `checkField${extraItems.value.length ? extraItems.value.length / 4 : ''}`, type: 'select', rules: true, fixedSpan: 24,
    config: {options: fieldOptions}
  },
  {
    label: '运算符', prop: `thresholdOperator${extraItems.value.length ? extraItems.value.length / 4 : ''}`, type: 'select', rules: true, fixedSpan: 12,
    config: {options: operatorOptions}
  },
  {
    label: '阈值', prop: `highThreshold${extraItems.value.length ? extraItems.value.length / 4 : ''}`, type: 'input', rules: true, fixedSpan: 12,
    config: {placeholder: '请输入整数'}
  }])
  console.log(extraItems.value)
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
 * 打开更新对话框
 */
async function openUpdateDialog(row) {
  // 调用对话框组件，打开对话框后，再传参给对话框表单
  await updateDialogRef.value.openDialog();
  const body = {
    id: row.id,
    alarmName: row.alarmName,
    alarmTemplate: row.alarmTemplate,
    organizationType: row.organizationType,
    beanName: row.beanName,
    checkField: row.checkField,
    thresholdOperator: row.thresholdOperator,
    highThreshold: row.highThreshold,
    channelType: row.channelType,
    alarmObject: JSON.parse(row.alarmObject),
    monitorStartTime: row.monitorStartTime,
    monitorRange: row.monitorRange
  }
  updateDialogRef.value.setForm(body);
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

function initDialog() {
  extraItems.value = [];
  addItems();
}

const organizationTypeEnum = computed(() => {
  const enumData = {};
  organizationTypeOptions.forEach((o) => {
    enumData[o.label] = [o.value, o.label];
  });
  return createEnum(enumData);
});

const channelEnum = computed(() => {
  const enumData = {};
  channelOptions.forEach((o) => {
    enumData[o.label] = [o.value, o.label];
  });
  return createEnum(enumData);
});

const classEnum = computed(() => {
  const enumData = {};
  classOptions.forEach((o) => {
    enumData[o.label] = [o.value, o.label];
  });
  return createEnum(enumData);
});

const fieldEnum = computed(() => {
  const enumData = {};
  fieldOptions.forEach((o) => {
    enumData[o.label] = [o.value, o.label];
  });
  return createEnum(enumData);
});

const monitorRangeEnum = computed(() => {
  const enumData = {};
  monitorRangeOptions.forEach((o) => {
    enumData[o.label] = [o.value, o.label];
  });
  return createEnum(enumData);
});

/**
 * 跳转告警记录页
 * @param id
 */
const routerAlarmLogPage = (id) => {
  const routeParams = {
    alarmCfgId: id,
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString()
  }

  router.push({
    name: 'alarmCount',
    params: routeParams
  });
};

onMounted(() => {
  queryTable();
  getUserOptions();
  getAlarmOptions();
  tool.getOptions(classOptions, 'BEAN_NAME');
});

</script>

<style lang="scss" scoped>

</style>
