<script setup>
import {ref, onMounted, reactive, computed} from 'vue';
import {useRoute} from 'vue-router';
import {getNetworkOptions, getOrganizationOptions} from "@/views/device/device";
import tool from "@/utils/tool";
import {createEnumByOptions} from "@/utils/enums";

const route = useRoute();
const remoteNetworkOptions = reactive([]);
const networkOptions = reactive([]);
const compoTableRef = ref(null);
const organizationOptions = reactive([]);
const organizationEnum = computed(() => {
  return createEnumByOptions(organizationOptions);
});
// 表格列
const columns = [
  {label: '组织', prop: 'organizationId'},
  {label: 'MAC', prop: 'mac'},
  {label: '序列', prop: 'serial'},
  {label: '网络', prop: 'networkName'},
  {label: '型号', prop: 'model'},
  {label: '快照时间', prop: 'claimedAt'}
];

// 查询表单
const queryForm = [
  {
    label: '组织', prop: 'organizationId', type: 'select',
    config: {options: organizationOptions, clearable: false},
  },
  {
    label: '网络', prop: 'networkId', type: 'select',
    config: {options: remoteNetworkOptions, remote: true, placeholder: '请输入'},
  },
  {
    label: 'MAC', prop: 'mac', type: 'input',
  },
  {
    label: '序列', prop: 'serial', type: 'input',
  },
  {
    label: '型号', prop: 'model', type: 'input',
  },
  {
    label: '开始日期', prop: 'startDate', type: 'date',
    config: {valueFormat: "YYYY-MM-DD"},
  },
  {label: '结束日期', prop: 'endDate', type: 'date',
    config: {valueFormat: "YYYY-MM-DD"},
  }
];

const table = {
  query: {
    url: '/device/inventory/table',
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
function afterReset() {
  getNetworkOptions(null, networkOptions);
}

function changeSelect(prop, val) {
  if (prop === 'organizationId') {
    getNetworkOptions(val, networkOptions);
  } else if (prop === 'networkId') {
    if(val === ''){
      remoteNetworkOptions.length = 0;
    }
  }
}
/**
 * 表单选择器远程方法
 */
function remoteMethod(prop, val) {

  if (val) {
    if (prop === 'networkId') {
      tool.getRemoteOptions(val, remoteNetworkOptions, networkOptions);
    }
  } else if (typeof val === 'undefined') {
    if (prop === 'networkId') {
      remoteNetworkOptions.length = 0;
    }
  }
}
</script>
<template>
  <!-- 表格组件 -->
  <compo-table
    ref="compoTableRef"
    @remoteMethod="remoteMethod"
    @changeSelect="changeSelect"
    @reset="afterReset"
    :table-params="table"
  >
    <template #tableTextSlot="slotProps">
      <div v-if="slotProps.prop === 'organizationId'">
        {{ organizationEnum.getDescFromValue(slotProps.cellValue) }}
      </div>
      <div v-if="slotProps.prop === 'claimedAt'">
        {{ tool.dateFormat(slotProps.cellValue, 'yyyy-MM-dd hh:mm:ss') }}
      </div>
    </template>
  </compo-table>
</template>

<style lang="scss">

</style>
