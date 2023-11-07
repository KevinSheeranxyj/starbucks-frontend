<template>
  <!-- 表格组件 -->
  <compo-table
      :tableParams="table"
      ref="compoTableRef"
      @remoteMethod="remoteMethod"
      @changeSelect="changeSelect"
      @reset="afterReset"
  >

    <template #tableTextSlot="slotProps">
      <div v-if="slotProps.prop === 'alarmDate'">
        {{ tool.dateFormat(slotProps.cellValue, 'yyyy-MM-dd') }}
      </div>

      <div v-else-if="slotProps.prop === 'confirmedProgress'">
        <el-progress :text-inside="true" :stroke-width="14"
                     :percentage="slotProps.cellValue"
                     status="success"
                     @click="routerAlarmLogPage(slotProps.scope.row)">
          <el-link>{{ slotProps.cellValue + '%' }}</el-link>
        </el-progress>
      </div>
    </template>

  </compo-table>


</template>

<script setup>
import {ref, onMounted, onActivated, computed, reactive,} from 'vue';
import {useRoute, useRouter} from "vue-router";
import tool from "@/utils/tool";
import {createEnumByOptions} from "@/utils/enums";
import {getNetworkOptions, getOrganizationOptions} from "@/views/device/device";

const route = useRoute();
const router = useRouter();
const compoTableRef = ref(null);
const organizationOptions = reactive([]);

const organizationEnum = computed(() => {
  return createEnumByOptions(organizationOptions);
});
// const networkOptions = reactive([]);
// const remoteNetworkOptions = reactive([]);
// 表格列
const columns = [
  {label: '告警配置ID', prop: 'alarmCfgId',},
  // {label: '组织', prop: 'organizationId',},
  // {label: '网络', prop: 'networkId',},
  {label: '告警名称', prop: 'alarmName',},
  {label: '告警日期', prop: 'alarmDate',},
  {label: '告警总数', prop: 'alarmTotal',},
  {label: '确认进度', prop: 'confirmedProgress',},
];

// 查询表单
const queryForm = [
  // {
  //   label: '组织', prop: 'organizationId', type: 'select',
  //   config: {options: organizationOptions, clearable: false},
  // },
  // {
  //   label: '网络', prop: 'networkId', type: 'select',
  //   config: {options: remoteNetworkOptions, remote: true, placeholder: '请输入'}
  // },
  {label: '告警配置ID', prop: 'alarmCfgId', type: 'input',},
  {
    label: '开始日期', prop: 'startDate', type: 'date',
    config: {valueFormat: "YYYY-MM-DD"},
  },
  {label: '结束日期', prop: 'endDate', type: 'date',
    config: {valueFormat: "YYYY-MM-DD"},
  },
];

const table = {
  query: {
    url: '/alarm/count/table',
    form: {formItems: queryForm},
  },
  columns: columns,
  config: {
    page: true,
  },
};

/**
 * 初始化查询
 */
function initQuery() {
  const queryForm = {
    startDate: tool.dateFormat(new Date(), 'yyyy-MM-dd'),
    endDate: tool.dateFormat(new Date(), 'yyyy-MM-dd'),
    organizationId: organizationOptions.value = '76' // default value: Starbucks China = 76
  };
  compoTableRef.value.setForm(queryForm);
  queryTable();
}
// function afterReset() {
//   getNetworkOptions(null, networkOptions);
// }
//
// function changeSelect(prop, val) {
//   if (prop === 'organizationId') {
//     getNetworkOptions(val, networkOptions);
//   } else if (prop === 'networkId') {
//     if(val === ''){
//       remoteNetworkOptions.length = 0;
//     }
//   }
// }
// /**
//  * 表单选择器远程方法
//  */
// function remoteMethod(prop, val) {
//
//   if (val) {
//     if (prop === 'networkId') {
//       tool.getRemoteOptions(val, remoteNetworkOptions, networkOptions);
//     }
//   } else if (typeof val === 'undefined') {
//     if (prop === 'networkId') {
//       remoteNetworkOptions.length = 0;
//     }
//   }
// }

/**
 * 表格查询
 */
function queryTable() {
  compoTableRef.value.query();
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
      endDate: query.endDate,
    };
    // 设置查询表单
    compoTableRef.value.setForm(queryForm);
    queryTable()
  }
}

/**
 * 跳转告警记录页
 * @param id
 */
const routerAlarmLogPage = (row) => {
  const routeParams = {
    alarmCfgId: row.alarmCfgId,
    startDate: tool.dateFormat(row.alarmDate, 'yyyy-MM-dd'),
    endDate: tool.dateFormat(row.alarmDate, 'yyyy-MM-dd'),
  }

  router.push({
    name: 'alarmLog',
    params: routeParams,
  });
};

onMounted(() => {
  initQuery();
  getOrganizationOptions(organizationOptions);
});

onActivated(() => {
  setupState()
});

</script>

<style lang="scss">

</style>
