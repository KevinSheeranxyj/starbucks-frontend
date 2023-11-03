<script setup>
import tool from '@/utils/tool';
import {ref, onMounted, reactive, onActivated, computed} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {getNetworkOptions, getOrganizationOptions} from '../device/device';
import {createEnumByOptions} from "@/utils/enums";

const route = useRoute();

const compoTableRef = ref(null);
const remoteNetworkOptions = reactive([]);
const networkOptions = reactive([]);
const networkInput = ref('');
// 表格列
const columns = [
  {label: '序列号', prop: 'devSn', minWidth: '100px'},
  {label: '设备模型', prop: 'devModel', minWidth: '100px'},
  {label: '别名', prop: 'aliasName', minWidth: '100px'},
  {label: '设备类型', prop: 'devType', minWidth: '100px'}
];
// 查询表单
const queryForm = [
  {
    label: '网络', prop: 'network', type: 'input'
  },
  {
    label: '交换机', prop: 'name', type: 'input',defaultValue:networkInput
  },
  {
    label: '型号', prop: 'model', type: 'input'
  },
  {
    label: '交换机模板', prop: 'template', type: 'input'
  }
];

const table = {
  query: {
    url: '/h3c/device/table',
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

function toHistory() {

}
const router = useRouter();
const organizationOptions = reactive([]);

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
    </template>
    <!-- 按钮插槽 -->
    <template #buttonSlot>
      <el-button type="primary" plain @click="toHistory">历史记录</el-button>
    </template>
  </compo-table>
</template>

<style lang="scss">

</style>
