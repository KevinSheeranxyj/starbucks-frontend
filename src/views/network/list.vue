<script setup>
import tool from '@/utils/tool';
import {ref, onMounted, reactive, computed, h} from 'vue';
import {useRoute} from 'vue-router';
import {getNetworkOptions, getOrganizationOptions} from '../device/device';
import {createEnumByOptions} from "@/utils/enums";
import {ElMessage, ElMessageBox} from "element-plus/lib/components";
import http from "@/utils/http";

const route = useRoute();

const compoTableRef = ref(null);
const remoteNetworkOptions = reactive([]);
const networkOptions = reactive([]);
const syncLoading = ref(false);
const organizationOptions = reactive([]);

// 表格列
const columns = [
  {label: '组织', prop: 'organizationId'},
  {label: '网络', prop: 'name'},
  {label: '网络类型', prop: 'productTypes'},
  {label: '模板', prop: 'templateName'}
];

/*
      case 'appliance': return '路由器';
      case 'switch': return '交换机';
      case 'wireless': return '无线';
      case 'appliance,switch,wireless': return '混合设备';
* */
const productTypesOptions = [
  {label:"路由器",value:"appliance"},
  {label:"交换机",value:"switch"},
  {label:"无线",value:"wireless"},
  {label:"混合设备",value:"appliance,switch,wireless"},

]

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
    label: '模板', prop: 'templateName', type: 'input'
  },
  {
    label: '网络类型', prop: 'productTypes', type: 'select',
    config: {options: productTypesOptions}
  }
];

const table = {
  query: {
    url: '/network/table',
    form: {formItems: queryForm}
  },
  columns: columns,
  config: {page: true, multipleTable: true}
};

/**
 * 查询表格
 */
function queryTable() {
  compoTableRef.value.query();
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
/**
 * 重置后
 */
function afterReset() {
  getNetworkOptions(tool.getDefaultOrgID(), networkOptions);
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

function syncNetwork() {
  const selection = compoTableRef.value.getMultipleSelection();
  if (selection.length !== 1) {
    return ElMessage.warning('请选择一条记录!');
  }
  syncLoading.value = true;
  // const syncNum = 4 + selection[0].routerNum + selection[0].wirelessNum * 4 + selection[0].connectClientNum * 2;

  ElMessageBox({
    title: '同步被选中网络以及关联的设备、客户端信息',
    message: h('p', null, [
      h('p', null, "网络：" + selection[0].name),
      // h('p', null, "预计：" + syncNum + "秒"),
    ]),
    confirmButtonText: '确定',
  }).then(async () => {
    const {data: res} = await http.post('/network/sync', {
      networkIds: [selection[0].networkId],
      organizationId: selection[0].organizationId
    });
    syncLoading.value = false;
    if (!res.success) {
      return ElMessage.error(res.msg);
    }
    ElMessage.success(res.msg);
    queryTable();
  }).catch(() => {
    syncLoading.value = false;
  })
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
  const TYPE_MAP = {
    'appliance': '路由器',
    'switch': '交换机',
    'wireless': '无线'
  };
  if (!productTypes) return '';

  let types;
  try {
    types = JSON.parse(productTypes);
  } catch (e) {
    console.error('Failed to parse productTypes:', e);
    return '';
  }

  if (types.length > 1) return '混合设备';

  const typeName = types[0];
  return TYPE_MAP[typeName] || '';
}

onMounted(() => {
  initQuery();
  getOrganizationOptions(organizationOptions);
  getNetworkOptions(tool.getDefaultOrgID(), networkOptions);
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
    @changeSelect="changeSelect"
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
