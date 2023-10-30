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
const syncLoading = ref(false);
const organizationOptions = reactive([]);

// 表格列
const columns = [
  {label: '组织', prop: 'organizationId'},
  {label: '网络', prop: 'networkName'},
  {label: '网络类型', prop: 'productTypes'},
  // {label: '原模板', prop: 'orgTemplateName'},
  {label: '模板', prop: 'tagTemplateName'}
];

// 查询表单
const queryForm = [
  {
    label: '组织', prop: 'organizationId', type: 'select',
    config: {options: organizationOptions, clearable: false},
  },
  {
    label: '模板', prop: 'tagTemplateName', type: 'input'
  }
];

const table = {
  query: {
    url: '/network/networkTemplateHistory',
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
function afterReset() {
  getNetworkOptions(null, networkOptions);
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

function syncNetwork() {
  syncLoading.value = true;
  console.log('同步');
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
function getProductTypesText(productTypes) {
  if (!productTypes) return '';

  try {
    const types = JSON.parse(productTypes);
    const typesString = types.sort().join(',');

    switch(typesString) {
      case 'appliance': return '路由器';
      case 'switch': return '交换机';
      case 'wireless': return '无线';
      case 'appliance,switch,wireless': return '混合设备';
      default: return '';
    }
  } catch (e) {
    console.error('Failed to parse productTypes:', e);
    return '';
  }
}

onMounted(() => {
  initQuery();
  getOrganizationOptions(organizationOptions);
  getNetworkOptions(null, networkOptions);
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
    @remoteMethod="remoteMethod"
    @reset="afterReset"
  >
    <!-- 按钮插槽 -->
    <template #buttonSlot>
      <el-button type="primary" plain :loading="syncLoading" @click="syncNetwork">同 步</el-button>
    </template>
    <template #tableTextSlot="slotProps">
      <div v-if="slotProps.prop === 'organizationId'">
        {{ organizationEnum.getDescFromValue(slotProps.cellValue) }}
      </div>
      <div v-if="slotProps.prop === 'productTypes'">
        {{ getProductTypesText(slotProps.cellValue) }}
      </div>
    </template>
  </compo-table>
</template>

<style lang="scss">

</style>
