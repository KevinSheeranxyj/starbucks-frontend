<template>
  <!-- 表格组件 -->
  <compo-table
      :tableParams="table"
      ref="compoTableRef"
      @changeSelect="changeSelect"
      @remoteMethod="remoteMethod"
      @reset="afterReset"
  >

    <template #tableTextSlot="slotProps">

      <div v-if="slotProps.prop === 'status'">
        <el-tag :type="getTagTypeByStatus(slotProps.cellValue)">
          {{ statusEnum.getDescFromValue(slotProps.cellValue) }}
        </el-tag>
      </div>

      <div v-if="slotProps.prop === 'organizationId'">
        {{ organizationEnum.getDescFromValue(slotProps.cellValue) }}
      </div>
    </template>

    <!-- 自定义列插槽 -->
    <template #tableDefinedSlot="slotProps">
      <div v-if="slotProps.prop === 'operator'">
        <el-button type="primary" plain @click="changePort(slotProps.scope.row)">端口修改</el-button>
        <el-button type="primary" plain @click="changeSwitchTemplate(slotProps.scope.row)">模板修改</el-button>
      </div>

    </template>

    <template #tableDNSSlot="scope">
      <div v-if="scope.prop === 'primaryDns'"></div>
    </template>

  </compo-table>

  <el-dialog
      title="修改交换机模板"
      v-model="isDialogVisible"
      width="30%"
      :close-on-press-escape="false"
      :close-on-click-modal="false">
    <el-row>
      <el-col style="padding: 20px">
        <span>您即将修改 <strong>{{currentSwitch.serial}}</strong>的模板配置</span>
      </el-col>
      <el-col style="padding: 20px">
        <el-form-item label="选择模板">
          <el-select v-model="templateID" placeholder="选择网络模板">
            <el-option
                v-for="role in templateOption"
                :key="role.value"
                :label="role.label"
                :value="role.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col style="padding: 20px">
        <center><el-button @click="summitTemplate">提交</el-button></center>
      </el-col>
    </el-row>



  </el-dialog>
</template>

<script setup>
import {reactive, ref, onMounted, computed, onActivated, h,} from 'vue';
import {useRouter, useRoute} from 'vue-router';
import http from "@/utils/http";
import {ElMessage, ElMessageBox} from 'element-plus/lib/components';
import tool from "@/utils/tool";
import {createEnumByOptions} from '@/utils/enums.js';
import {getOrganizationOptions, getNetworkOptions, getDeviceOptions, getTagTypeByStatus} from '../device/device';


const router = useRouter();
const route = useRoute();
const isDialogVisible = ref(false);
const compoTableRef = ref(null);
const syncLoading = ref(false);
const organizationOptions = reactive([]);
const networkOptions = reactive([]);
const deviceNameOptions = reactive([]);
const deviceSerialOptions = reactive([]);

const macOptions = reactive([]);
const publicIpOptions = reactive([]);

// 远程选项
const remoteNetworkOptions = reactive([]);
const remoteNameOptions = reactive([]);
const remoteSerialOptions = reactive([]);
const remoteMacOptions = reactive([]);
const remotePublicIpOptions = reactive([]);
const deviceStatusOptions = reactive([]);
const organizationEnum = computed(() => {
  return createEnumByOptions(organizationOptions);
});
const statusEnum = computed(() => {
  return createEnumByOptions(deviceStatusOptions);
});


// 表格列
const columns = [
  {label: '状态', prop: 'status', sortable: true, width: '60px'},
  {label: '组织', prop: 'organizationId', sortable: true, minWidth: '120px' },
  {label: '网络', prop: 'networkName', sortable: true, minWidth: '150px'},
  {label: '交换机', prop: 'name', sortable: true, minWidth: '120px'},
  {label: '序列', prop: 'serial', minWidth: '120px',},
  {label: '公网IP', prop: 'publicIp', minWidth: '100px',},
  {label: 'LAN IP', prop: 'lanIp', minWidth: '100px',},
  {label: '网关', prop: 'gateway', minWidth: '100px',},
  {label: '地理位置信息', prop: 'address', minWidth: '100px',},
  {label: 'DNS', prop: 'primaryDns', type: 'dns', minWidth: '100px',},
  {label: '操作', prop: 'operator', type: 'defined', minWidth: '150px'}
];

// 查询表单
const queryForm = [

  {
    label: '交换机', prop: 'name', type: 'input',
    config: {options: remoteNameOptions, remote: true, placeholder: '请输入',},
  },
  {
    label: '序列号', prop: 'serial', type: 'input',
    config: {options: remoteSerialOptions, remote: true, placeholder: '请输入',},
  },
  {
    label: 'MAC', prop: 'mac', type: 'input',
    config: {options: remoteMacOptions, remote: true, placeholder: '请输入',},
  },
  {
    label: '公网IP', prop: 'publicIp', type: 'input',
    config: {options: remotePublicIpOptions, remote: true, placeholder: '请输入',},
  },
];

const table = {
  query: {
    url: '/device/switch/table',
    form: {formItems: queryForm},
  },
  columns: columns,
  config: {page: true, multipleTable: true,},
  update: {
    url: '/device/update',
  },
};

/**
 * 表单选择器变动
 */
function changeSelect(prop, val) {
  if (prop === 'organizationId') {
    getNetworkOptions(val, networkOptions);
    getDeviceOptions({'organizationId': val, productType: 'switch'}, deviceNameOptions, deviceSerialOptions, macOptions, publicIpOptions);
  } else if (prop === 'networkId') {
    getDeviceOptions({'networkId': val, productType: 'switch'}, deviceNameOptions, deviceSerialOptions, macOptions, publicIpOptions);
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
    } else if (prop === 'name') {
      tool.getRemoteOptions(val, remoteNameOptions, deviceNameOptions);
    } else if (prop === 'serial') {
      tool.getRemoteOptions(val, remoteSerialOptions, deviceSerialOptions);
    } else if (prop === 'mac') {
      tool.getRemoteOptions(val, remoteMacOptions, macOptions);
    } else if (prop === 'publicIp') {
      tool.getRemoteOptions(val, remotePublicIpOptions, publicIpOptions);
    }
  } else if(typeof val == 'undefined'){
    if (prop === 'networkId') {
      remoteNetworkOptions.length = 0;
    } else if (prop === 'name') {
      remoteNameOptions.length = 0;
    } else if (prop === 'serial') {
      remoteSerialOptions.length = 0;
    } else if (prop === 'mac') {
      remoteMacOptions.length = 0;
    } else if (prop === 'publicIp') {
      remotePublicIpOptions.length = 0;
    }
  }
  getOrganizationOptions(organizationOptions);
}

/**
 * 查询表格
 */
function queryTable() {
  compoTableRef.value.query();
  getOrganizationOptions(organizationOptions);
}

/**
 * 重置后
 */
function afterReset() {
  getNetworkOptions(null, networkOptions);
  getDeviceOptions({productType: 'switch'}, deviceNameOptions, deviceSerialOptions, macOptions, publicIpOptions);

}

///
function changePort(row){
  /// 跳转到端口修改
  router.push({
    name:'switchPortList',
    query:row
  });
}
// 修改 交换机模板
const currentSwitch = ref();
function changeSwitchTemplate(row){
  currentSwitch.value = row;
  isDialogVisible.value = true;
}


async function initQuery() {

  if (Object.keys(route.query).length > 0) {
    const query = route.query;
    const networkId = query.networkId;
    const organizationId = query.organizationId;
    const queryForm = {
      statusList:[],
      networkId:networkId,
      organizationId:organizationId
    };

    compoTableRef.value.setForm(queryForm);
    queryTable();
    await queryTemplate(query);
  }
  getOrganizationOptions(organizationOptions);
}

const templateOption = ref([]);
const  templateID = ref();
async function queryTemplate(query){



  const res = await http.post('configTemplate/switchProfile/list',{
    "organizationId":query.organizationId,
    "templateId":query.templateId
  });
  res.data.data.forEach((item)=>{
    templateOption.value.push({label:item.name,value:item.switchProfileId});
  });
}

async function summitTemplate(){

  const res = await http.post('/operate/maintain/updateSwitchProfile',{
    "serial": currentSwitch.value.serial,
    "switchProfileId":templateID.value
  })
  isDialogVisible.value = false; // 隐藏对话框
  if(res.data.success){
    ElMessage({
      message: '修改成功',
      type: 'success',
    })
  }else{
    ElMessage({
      message: res.data.msg,
      type: 'error',
    })
  }
}

onMounted(() => {
  initQuery();
  tool.getOptions(deviceStatusOptions, 'DEVICE_STATUS');
  getOrganizationOptions(organizationOptions);
});



</script>

<style lang="scss">

</style>
