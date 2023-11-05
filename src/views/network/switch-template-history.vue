<script setup>
import tool from '@/utils/tool';
import {ref, onMounted, reactive, computed} from 'vue';
import {useRoute} from 'vue-router';
import {getNetworkOptions, getOrganizationOptions} from '../device/device';
import {createEnumByOptions} from "@/utils/enums";

const route = useRoute();

const compoTableRef = ref(null);
const remoteNetworkOptions = reactive([]);
const networkOptions = reactive([]);

// 表格列
const columns = [
  {label: '组织', prop: 'organizationId', minWidth: '100px'},
  {label: '网络', prop: 'networkName', minWidth: '100px'},
  {label: '交换机', prop: 'name', minWidth: '100px'},
  {label: '序列', prop: 'serial', minWidth: '100px'},
  {label: '型号', prop: 'model', minWidth: '100px'},
  {label: '交换机模板', prop: 'switchProfileName', minWidth: '100px'},
  {label: '快照时间', prop: 'createdAt', minWidth: '100px'},
];

// 查询表单
const queryForm = [
  {
    label: '网络', prop: 'network', type: 'input'
  },
  {
    label: '交换机', prop: 'switch', type: 'input'
  },
  {
    label: '型号', prop: 'model', type: 'input'
  },
  {
    label: '交换机模板', prop: 'template', type: 'input'
  },
  {
    label: '快照开始日期', prop: 'startDate', type: 'date',
    config: {valueFormat: 'YYYY-MM-DD'}
  },
  {label: '快照结束日期', prop: 'endDate', type: 'date',
    config: {valueFormat: 'YYYY-MM-DD'}
  }
];

const table = {
  query: {
    url: '/device/history/switch/table',
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

/**
 * 重置后
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
function changeSelect(prop, val) {
  if (prop === 'organizationId') {
    getNetworkOptions(val, networkOptions);
    queryTable();
  } else if (prop === 'networkId') {
    if (val === '') {
      remoteNetworkOptions.length = 0;
    }
  }
}

/**
 * 重置后
 */
function afterReset() {
  getOrganizationOptions(organizationOptions);
}


onMounted(() => {
  getOrganizationOptions(organizationOptions);
  getNetworkOptions(null, networkOptions);

  if (Object.keys(route.params).length <= 0) {
    queryTable();
  }else{
    const query = route.params;
    const name = query.name;
    const queryForm = {
      name: name,
    };
    compoTableRef.value.setForm(queryForm);
    queryTable();
  }
});
const organizationOptions = reactive([]);
const organizationEnum = computed(() => {
  return createEnumByOptions(organizationOptions);
});
</script>
<template>
  <!-- 表格组件 -->
  <compo-table
    ref="compoTableRef"
    :table-params="table"
    @remoteMethod="remoteMethod"
    @changeSelect="changeSelect"
    @reset="afterReset"
  >
    <template #tableTextSlot="slotProps">
      <div v-if="slotProps.prop === 'organizationId'">
        {{ organizationEnum.getDescFromValue(slotProps.cellValue) }}
      </div>

      <div v-if="slotProps.prop === 'createdAt'">
        {{ tool.dateFormat(slotProps.cellValue, 'yyyy-MM-dd hh:mm:ss') }}
      </div>

    </template>

  </compo-table>
</template>

<style lang="scss">

</style>
