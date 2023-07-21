<template>
  <!-- 表格组件 -->
  <compo-table
    ref="compoTableRef"
    :table-params="table"
  >
    <!-- 按钮插槽 -->
    <template #buttonSlot>
      <el-button type="primary" plain @click="batchUpdate('RESOLVED')">批量解决</el-button>
      <el-button type="primary" plain @click="batchUpdate('IGNORE')">批量忽略</el-button>
    </template>

    <template #tableTextSlot="slotProps">
      <div v-if="slotProps.prop === 'alarmText'">
        <div @click="openAlarmDialog(slotProps.scope.row)">
          <div v-html="sliceStr(slotProps.cellValue)"></div>
        </div>
      </div>
      <div v-else-if="slotProps.prop === 'alarmTime'">
        {{ tool.dateFormat(slotProps.cellValue, 'yyyy-MM-dd hh:mm:ss') }}
      </div>
      <div v-else-if="slotProps.prop === 'notificationStatus'">
        <el-tag :type="getTagTypeByNotificationStatus(slotProps.cellValue)">
          {{ notificationStatusEnum.getDescFromValue(slotProps.cellValue) }}
        </el-tag>
      </div>
      <div v-else-if="slotProps.prop === 'updatedAt'">
        {{ tool.dateFormat(slotProps.cellValue, 'yyyy-MM-dd hh:mm:ss') }}
      </div>
    </template>

    <template #tableSelectSlot="slotProps">
      <div v-if="slotProps.prop === 'alarmStatus'">
        <el-tag :type="getTagTypeByAlarmStatus(slotProps.cellValue)">
          {{ alarmStatusEnum.getDescFromValue(slotProps.cellValue) }}
        </el-tag>
      </div>
    </template>

    <template #dialog>
      <el-dialog
        v-model="alarmDialogVisible"
        :title="alarmDialogTitle"
        width="30%"
      >
        <span style="color:rgb(217,217,217);" v-html="alarmDialogText"></span>
        <template #footer>
          <el-button type="primary" plain @click="alarmDialogVisible = false">
            关 闭
          </el-button>
        </template>
      </el-dialog>
    </template>
  </compo-table>
</template>

<script setup>
import {ref, reactive, onMounted, computed, onActivated } from 'vue';
import tool from '@/utils/tool';
import http from '@/utils/http';
import {ElMessage} from 'element-plus/lib/components';
import {createEnum} from '@/utils/enums';
import {useRoute} from 'vue-router';

const route = useRoute();
const compoTableRef = ref(null);
const alarmStatusOptions = reactive([
  {label: '待确认', value: 'WAITING' },
  {label: '已解决', value: 'RESOLVED' },
  {label: '已忽略', value: 'IGNORE' }
]);
const notificationStatusOptions = reactive([
  {label: '待通知', value: 'WAITING' },
  {label: '通知成功', value: 'SUCCESS' },
  {label: '通知失败', value: 'FAIL' }
]);
const alarmDialogVisible = ref(false)
const alarmDialogText = ref('')
const alarmDialogTitle = ref('')

// 表格列
const columns = [
  {label: '告警配置ID', prop: 'alarmCfgId', width: '70px'},
  {label: '告警名称', prop: 'alarmName', minWidth: '120px'},
  {label: '通知状态', prop: 'notificationStatus', width: '70px' },
  {
    label: '告警状态', prop: 'alarmStatus', type: 'select', width: '70px',
    config: {options: alarmStatusOptions}
  },
  {label: '告警时间', prop: 'alarmTime', width: '150px' },
  {label: '告警内容', prop: 'alarmText', minWidth: '200px' },
  {label: '网络', prop: 'network', minWidth: '200px' },
  {label: '路由器', prop: 'router', minWidth: '120px' },
  {label: '交换机', prop: 'switch', minWidth: '120px' },
  {label: '无线AP', prop: 'wireless', minWidth: '100px' },
  {label: '客户端', prop: 'client', minWidth: '120px' },
  {label: '处理人', prop: 'updatedBy', width: '100px' },
  {label: '处理时间', prop: 'updatedAt', width: '150px' }
];

// 查询表单
const queryForm = [
  {label: '告警配置ID', prop: 'alarmCfgId', type: 'input' },
  {
    label: '告警状态', prop: 'alarmStatusList', type: 'select',
    config: {options: alarmStatusOptions, multiple: true, collapseTags: true}
  },
  {label: '网络', prop: 'network', type: 'input'},
  {label: '路由器', prop: 'router', type: 'input'},
  {label: '交换机', prop: 'switch', type: 'input'},
  {label: '无线AP', prop: 'wireless', type: 'input'},
  {label: '客户端', prop: 'client', type: 'input'},
  {
    label: '开始日期', prop: 'startDate', type: 'date',
    config: {valueFormat: 'YYYY-MM-DD'}
  },
  {label: '结束日期', prop: 'endDate', type: 'date',
    config: {valueFormat: 'YYYY-MM-DD'}
  }
];

const table = {
  query: {
    url: '/alarm/log/table',
    form: {formItems: queryForm}
  },
  export: {
    url: '/alarm/log/export'
  },
  columns: columns,
  config: {
    page: true,
    multipleTable: true
  },
  update: {
    url: '/alarm/log/update'
  }
};

/**
 * 初始化查询
 */
function initQuery() {
  const queryForm = {
    startDate: tool.dateFormat(new Date(), 'yyyy-MM-dd'),
    endDate: tool.dateFormat(new Date(), 'yyyy-MM-dd')
  };
  compoTableRef.value.setForm(queryForm);
  queryTable();
}

/**
 * 表格查询
 */
function queryTable() {
  compoTableRef.value.query();
}

const getTagTypeByAlarmStatus = (value) => {
  if (value === 'WAITING') {
    return 'warning';
  } else if (value === 'RESOLVED') {
    return 'success';
  } else if (value === 'IGNORE') {
    return 'info';
  }
};

const getTagTypeByNotificationStatus = (value) => {
  if (value === 'WAITING') {
    return 'warning';
  } else if (value === 'SUCCESS') {
    return 'success';
  } else if (value === 'FAIL') {
    return 'danger';
  } else if (value === 'WITHOUT') {
    return 'info';
  }
};

const alarmStatusEnum = computed(() => {
  const enumData = {};
  alarmStatusOptions.forEach((o) => {
    enumData[o.label] = [o.value, o.label];
  });
  return createEnum(enumData);
});

const notificationStatusEnum = computed(() => {
  const enumData = {};
  notificationStatusOptions.forEach((o) => {
    enumData[o.label] = [o.value, o.label];
  });
  return createEnum(enumData);
});

/**
 * 批量更新
 */
async function batchUpdate(alarmStatus) {
  const ids = compoTableRef.value.getTableIds();
  if (ids === '') {
    return ElMessage.warning('请选择需要更新的数据');
  }

  const {data: res} = await http.post('/alarm/log/batchUpdate', {
    ids: ids,
    alarmStatus: alarmStatus
  });
  if (!res.success) {
    return ElMessage.error(res.msg);
  }
  ElMessage.success(res.msg);
  queryTable();
}

/**
 * 文本仅截取前100个字符
 */
function sliceStr(text) {
  if (text === null) {
    return '';
  }
  if (text.length > 100) {
    return text.slice(0, 100).replace(/^\s+|\s+$/g, '') + '...';
  }
  return text;
}

function openAlarmDialog(row) {
  alarmDialogVisible.value = true;
  alarmDialogTitle.value = row.alarmName;
  alarmDialogText.value = row.alarmText;
}

/**
 * 校验是否页面跳转，设置查询条件
 */
function setupState() {
  if (Object.keys(route.params).length > 0) {
    const query = route.params;
    const queryForm = {
      alarmCfgId: query.alarmCfgId,
      startDate: query.startDate,
      endDate: query.endDate
    };
    // 设置查询表单
    compoTableRef.value.setForm(queryForm);
    queryTable()
  }
}

onMounted(() => {
  initQuery();
});

onActivated(() => {
  setupState()
});

</script>

<style lang="scss">

</style>
