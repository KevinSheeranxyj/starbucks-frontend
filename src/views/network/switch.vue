<script setup>
import {ref, onMounted, computed, reactive} from 'vue';
import {useRoute} from 'vue-router';
import {createEnumByOptions} from "@/utils/enums";
import {getOrganizationOptions} from "@/views/device/device";

const route = useRoute();

const compoTableRef = ref(null);
const organizationOptions = reactive([]);

// 表格列
const columns = [
  {label: '交换机', prop: 'name', minWidth: '100px'},
  {label: '公网IP', prop: 'publicIp', minWidth: '100px'},
  {label: 'VLAN', prop: 'vlan', minWidth: '100px'},
  {label: 'LAN IP', prop: 'lanIp', minWidth: '100px'},
  {label: '网关', prop: 'gateway', minWidth: '100px'}
];

// 查询表单
const queryForm = [
  {
    label: '组织', prop: 'organizationId', type: 'select',
    config: {options: organizationOptions, clearable: false},
  },
];

const table = {
  query: {
    url: '/device/switch/table',
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


const organizationEnum = computed(() => {
  return createEnumByOptions(organizationOptions);
});

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

</script>
<template>
  <!-- 表格组件 -->
  <compo-table
    ref="compoTableRef"
    :table-params="table"
    @reset="afterReset"
  >
    <template #tableTextSlot="slotProps">
      <div v-if="slotProps.prop === 'organizationId'">
        {{ organizationEnum.getDescFromValue(slotProps.cellValue) }}
      </div>
    </template>
  </compo-table>
</template>

<style lang="scss">

</style>
