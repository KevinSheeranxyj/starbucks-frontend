<template>
  <div class="large-page">
    <el-steps :active="active" finish-status="success" class="step-body" >
      <el-step title="Step 1"></el-step>
      <el-step title="Step 2"></el-step>
      <el-step title="Step 3"></el-step>
      <el-step title="Step 4"></el-step>
      <el-step title="Step 5"></el-step>
      <el-step title="Step 6"></el-step>
    </el-steps>
    <el-collapse v-model="activeNames" class="collapse-body" >
      <keep-alive>
        <el-collapse-item title="组织切换" name="1" v-if="currentStep === 1">
          <div class="content-section">
            <compo-form
                ref="organizationFormRef"
                :form-params="organizationSchema"
                form-type="table"
                @disabledButton="handleDisabledButton"
            >
            </compo-form>
          </div>
          <div class="button-section">
            <el-button type="primary" :disabled="disabledButton" @click="firstStep">{{ '下一步' }}</el-button>
          </div>
        </el-collapse-item>
      </keep-alive>
      <keep-alive>
        <el-collapse-item title="新增门店信息" name="2" v-if="currentStep === 2">
          <div class="content-section">
            <compo-form
              ref="storeSchemaFormRef"
              :form-params="storeSchemaForm"
              form-type="table"
              @disabledButton="handleDisabledButton"
            >
            </compo-form>
          </div>
          <div class="button-section">
            <el-button type="primary" @click="previousStep">{{ '上一步' }}</el-button>
            <el-button type="primary" :disabled="disabledButton" @click="secondStep">{{ '下一步' }}</el-button>
          </div>
        </el-collapse-item>
      </keep-alive>
      <keep-alive>
        <el-collapse-item title="网络设备添加" name="3" v-if="currentStep === 3">
          <div class="content-section">
            <compo-table
                ref="deviceTableRef"
                :table-params="deviceTable"
                @selectedValues="handleSelectedValues"
            >
              <template #buttonSlot>
                <el-button type="primary" plain @click="addDeviceDialog">申领设备</el-button>
              </template>
              <template #dialog>
                <compo-dialog ref="addDialogRef" :dialog-params="addDialog">
                  <template #headerSlot>
                    <ul>
                      <li>您可以通过添加订单号或单个设备序列号（每行一个）将设备添加到库存中。</li>
                      <li>如果您想同时定义设备名称，您可以使用格式输入： “序列号，名称”为每一行。</li>
                    </ul>
                  </template>
                  <template #dialogButtonSlot>
                    <el-button  @click="closeDialog">关闭</el-button>
                    <el-button type="primary" @click="applyDevice">申领</el-button>
                  </template>
                </compo-dialog>
                <el-dialog
                    title="确认框"
                    v-model="dialogVisible"
                    width="30%"
                    :before-close="handleClose">
                  <div class="dialog-content">请确认你所勾选的网络设备</div>
                  <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="thirdStep">确认</el-button>
              </span>
                </el-dialog>
              </template>
            </compo-table>
            <div v-if="selectedValues.length > 0">
              <compo-table
                  :table-params="selectedTable"
                  :default-table-data="selectedValues"
              >
                <template #tableDefinedSlot="slotProps">
                  <div v-if="slotProps.prop === 'operator'">
                    <el-button type="primary" plain @click="removeSelected">移除</el-button>
                  </div>
                </template>
              </compo-table>
            </div>
          </div>
          <div class="button-section">
            <el-button type="primary"  @click="previousStep">{{ '上一步' }}</el-button>
            <el-button type="primary"  @click="promptConfirmationBeforeNext">{{ '下一步' }}</el-button>
          </div>
        </el-collapse-item>
      </keep-alive>
      <keep-alive>
        <el-collapse-item title="获取网段信息" name="4" v-if="currentStep === 4">
          <div class="content-section">
            <el-select v-model="segmentTypeData"
                       @change="changeOptions"
                       placeholder="Select">
              <el-option
                  v-for="item in segmentTypeOptions"
                  :label="item.label"
                  :value="item.value"
                  :key="item.value"
              >
              </el-option>
            </el-select>

            <el-row v-if="isManual" style="margin-top: 10px">
              <el-row v-if="isManual" style=" display: flex; align-items: center;">
                <span style="margin-right: 5px">网段:   </span>
                <el-input v-model="manualIP" placeholder="请输入:10.0.0.0- 10.255.255.255之间的网段" style="flex: 1;width: 220px;"></el-input>
                <span style="margin-left: 5px">/24</span>
              </el-row>
            </el-row>

            <compo-table
               ref="segmentFormRef"
               :table-params="segmentTable"
               :default-table-data="segmentData">
             <template #buttonSlot v-if="isManual">
                <el-button type="primary" @click="pingCheck">PING检测</el-button>
             </template>
           </compo-table>
          </div>
          <div class="button-section">
            <el-button type="primary"  @click="previousStep">{{ '上一步' }}</el-button>
            <el-button type="primary" :disabled="segmentData.every(item => item.pingResult === false)
            ? disabledButton : disabledButton = true"  @click="fourthStep">{{ '下一步' }}</el-button>
          </div>
        </el-collapse-item>
      </keep-alive>
      <keep-alive>
        <el-collapse-item title="网络设备信息" name="5" v-if="currentStep === 5">
          <div class="content-section" v-for="item in networkDeviceData" :key="item.serial">
            <el-divider content-position="left">{{getNetworkType(item.model) === 'router' ?
                '路由器': getNetworkType(item.model) === 'switch' ? '交换机':
                    getNetworkType(item.model) === 'appliance' ? '无线AP': ''}}</el-divider>
            <span>{{item.serial}} - {{item.mac}} - {{item.model}}</span>
            <compo-form
                @popValue="(val) => collectValues(val, item.serial)"
                :form-params="getNetworkType(item.model) === 'router' ? getRouterInfoSchema :
                (getNetworkType(item.model) === 'appliance' ? getApSchema : getSwitchSchema)"
                form-type="table"
            >
            </compo-form>
          </div>
          <div class="button-section">
            <el-button type="primary"  @click="previousStep">{{ '上一步' }}</el-button>
            <el-button type="primary"  @click="finalStep">{{ '下一步' }}</el-button>
          </div>
        </el-collapse-item>
      </keep-alive>
      <keep-alive>
        <el-collapse-item title="交换机配置文件" name="6" v-if="currentStep === 6
        && submitData.networkDeviceAdd.some(item => getNetworkType(item.model) === 'switch')">
          <div class="content-section" v-for="item in switchData" :key="item.id">
             <el-divider content-position="left">
               <span>{{ item.serial }} &nbsp;&nbsp;&nbsp; {{item.mac}} &nbsp;&nbsp; {{item.model}}</span>
             </el-divider>
             <compo-form
                 @popValue="(val) => collectSwitchConfigInfo(val, item.serial)"
                 :form-params="switchTemplateSchema"
                 form-type="table"
             >
             </compo-form>
          </div>
          <div class="button-section">
            <el-button type="primary"  @click="previousStep">{{ '上一步' }}</el-button>
            <el-button type="primary"  @click="preview">{{ '预览' }}</el-button>
          </div>
        </el-collapse-item>
      </keep-alive>
    <!-- PREVIEW STEP   -->
      <el-collapse-item name="7" v-if="currentStep === 7">
      <div class="content">
        <!--  Step1 组织交换信息预览   -->
        <div class="preview-section-1">
          <compo-form
              ref="organizationFormRef"
              :form-params="organizationSchema"
              form-type="table"
              @disabledButton="handleDisabledButton"
              :default-data="submitData.organization"
          >
          </compo-form>
        </div>
        <!--  Step2 门店基本信息预览     -->
        <div class="preview-section-2">
          <compo-form
              ref="storeSchemaFormRef"
              :form-params="storeSchemaForm"
              form-type="table"
              :default-data="submitData.storeInfo"
          >
          </compo-form>
        </div>
        <!--  Step3 网络设备添加信息预览 table      -->
        <div class="preview-section-3">
          <compo-table
              :table-params="deviceTable"
              :default-table-data="selectedValues"
          >
          </compo-table>
        </div>
        <!--  Step4  网段信息预览 table  -->
        <div class="preview-section-4">
          <div class="content-section">
            <compo-table
                :table-params="segmentTable"
                :default-table-data="segmentData"
            >
            </compo-table>
          </div>
        </div>
        <!-- Step5 网络设备基本信息预览 form     -->
        <div class="preview-section-5" v-for="item in submitData.networkDeviceAdd">
          <el-divider content-position="left">{{getNetworkType(item.model) === 'router' ?
              '路由器': getNetworkType(item.model) === 'switch' ? '交换机':
                  getNetworkType(item.model) === 'appliance' ? '无线AP': ''}}</el-divider>
          <span>{{item.serial}} - {{item.mac}} - {{item.model}}</span>
            <compo-form
                :form-params="getNetworkType(item.model) === 'router' ? getRouterInfoSchema:
                getNetworkType(item.model) === 'appliance' ? getApSchema : getSwitchSchema"
                form-type="table"
                :default-data="item"
            >
            </compo-form>
        </div>
        <!-- Step6 交换机配置文件预览      -->
        <div class="preview-section-6" v-if="currentStep === 7
        && submitData.networkDeviceAdd.some(item => getNetworkType(item.model) === 'switch')"
             v-for="item in submitData.switchConfig">
          <el-divider content-position="left">
            <span>{{ item.serial }} &nbsp;&nbsp;&nbsp; {{item.mac}} &nbsp;&nbsp; {{item.model}}</span>
          </el-divider>
          <compo-form
              :form-params="switchTemplateSchema"
              form-type="table"
              :default-data="item"
          >
          </compo-form>
        </div>
      </div>
      <div class="form-button" v-if="currentStep === 7">
        <el-button type="primary"  @click="previousStep">{{ '上一步' }}</el-button>
        <el-button type="primary"  @click="submitAll">{{ '提交' }}</el-button>
      </div>
    </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import CompoTable from "@/components/compoTable/index.vue";
import CompoDialog from "@/components/compoDialog/index.vue";
import {computed, getCurrentInstance, onMounted, onUpdated, reactive, ref, watch} from "vue";
import {useRouter} from "vue-router";
import {getOrganizationOptions, getNetworkTemplateOptions, getSwitchTemplateOptions} from "@/views/device/device";
import http from "@/utils/http";
import {ElLoading, ElMessage} from "element-plus/lib/components";


const active =  ref(0);
const addDialogRef = ref(null);
const currentStep = ref(1);
const activeNames = ref(['1', '2', '3', '3', '4', '5', '6']);
const storeSchemaFormRef = ref(null);
const deviceTableRef = ref(null);
const segmentFormRef = ref(null);
const organizationFormRef = ref(null);
let storeData = ref(null);
const disabledButton = ref(false);
const dialogVisible = ref(false);
const selectedValues = ref([]);
const isManual = ref(false);
const manualIP = ref('');
const lastValidIP = ref('');

const segmentTypeData = ref('自动');
let switchData = reactive([]);
const submitData = reactive({
  organization: {},
  storeInfo: {},
  networkDeviceAdd: [], // multiple table
  segmentInfo: [], // multiple table,
  switchConfig: []
});
const finalActiveNames = ['7'];


function isValidIP(ip) {
  const regex = /^10\.([0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.([0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.([0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
  return regex.test(ip);
}

function closeDialog() {
  addDialogRef.value.dialogVisible = false;
}
function removeSelected(index){
  selectedValues.value.splice(index, 1);
}

const { proxy } = getCurrentInstance();

async function applyDevice() {
  const serials = [];
  const {data: res} = await http.post(
      '/device/claim',
      {
        organizationId: submitData.organization.organizationId,
        serials: serials.concat(addDialogRef.value.getForm().serials)
      }
  )
  if (!res.success) {
   return ElMessage.error(res.msg);
  }
}

async function pingCheck() {
  if(!isValidIP(manualIP.value)){
    ElMessage.error('请输入:10.0.0.0- 10.255.255.255之间的网段');
    return;
  }
  const loading =  ElLoading.service({
    lock: true,
    text: 'ping检测中...',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  const {data: res} = await http.post(
      '/operate/networkVlan/getVlans',
      {
        segment:manualIP.value+'/24',
      });
  if (!res.success) {
    return this.$message.error(res.msg);
  } else {
    segmentData.value = res.data;
    console.log(segmentData.value);
  }
  loading.close();

}

function collectValues(values, idx) {
  console.log("collectValues====",values,idx);
  const index = submitData.networkDeviceAdd.findIndex(item => item.serial === idx);
  submitData.networkDeviceAdd[index] = {
    ...submitData.networkDeviceAdd[index],
    ...values
  }
  console.log("collectValues====2",submitData.networkDeviceAdd);
}

const segmentOptions = ref([
  {
    label: '', value: ''
  },
  {
    label: '', value: ''
  },
  {
    label: '120.0.1.1', value: '12929.101'
  },
  {
    label: 'TEST - 201', value: '12929.101'
  },
  {
    label: 'TEST - 301', value: '12929.101'
  },
]);
const segmentTypeOptions = ref([
  {
    label: '自动', value: 'auto'
  },
  {
    label: '手动', value: 'manual',
  }
]);

function changeOptions(value) {
  isManual.value = value === 'manual';
}

function getNetworkType(value) {
  if (value.startsWith('MX')) {
      return 'router';
  } else if(value.startsWith('MS')) {
      return 'switch';
  } else if(value.startsWith('MR')) {
      return 'appliance';
  }
}

function collectSwitchConfigInfo(val, idx) {
  const index = submitData.networkDeviceAdd.findIndex(item => item.serial === idx);
  submitData.networkDeviceAdd[index] = {
    ...submitData.networkDeviceAdd[index],
    ...val
  }
}
let networkDeviceData = reactive([]);

let segmentData = ref([]);

const getApSchema = computed(() => {
  return {
    formItems: [
      {
        label: '地理位置', prop: 'location', type: 'input',
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true} : {},
        rules: true
      },
      {
        label: '设备名称', prop: 'deviceName', type: 'input',
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true} : {},
        rules: true
      },
      {
        label: '主 DNS', prop: 'primaryDns', type: 'input',
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true} : {},
        rules: true
      },
      {
        label: '备 DNS', prop: 'secondDns', type: 'input',
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true} : {},
      },
      {
        label: 'MR IP', prop: 'mrIp', type: 'input',
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true} : {},
      },
      {
        label: 'VLAN', prop: 'vlan', type: 'input',
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true} : {},
      },
      {
        label: '网关', prop: 'gateway', type: 'input',
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true} : {},
      }
    ]
  };
});
const getSwitchSchema = computed(() => {
  return {
    formItems: [
      {
        label: '地理位置', prop: 'location', type: 'input',
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true} : {},
        rules: true
      },
      {
        label: '设备名称', prop: 'deviceName', type: 'input',
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true} : {},
        rules: true
      },
      {
        label: '主 DNS', prop: 'primaryDns', type: 'input',
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true} : {},
        rules: true
      },
      {
        label: '备 DNS', prop: 'secondDns', type: 'input',
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true} : {},
      },
      {
        label: 'MS IP', prop: 'staticIp', type: 'input',
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true} : {},
      },
      {
        label: 'VLAN', prop: 'vlan', type: 'input',
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true} : {},
      },
      {
        label: '网关', prop: 'staticGatewayIp', type: 'input',
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true} : {},
      }
    ]
  }
});

const getRouterInfoSchema = computed(() => {
  return  {
    formItems: [
      {
        label: '地理位置', prop: 'address', type: 'input',
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true} : {},
        rules: true
      },
      {
        label: '设备名称', prop: 'deviceName', type: 'input',
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true} : {},
        rules: true
      },
      // {
      //   label: 'DNS', prop: 'dns', type: 'input',
      //   config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true} : {},
      //   rules: true
      // }
    ]
  };
});


function handleClose() {
  dialogVisible.value = false;
}

function handleSelectedValues(val) {
  if (val.length > 0){
    selectedValues.value = val;
  }
}

const organizationOptions = reactive([]);

const confirmDialog = computed(() => ({
  title: 'Confirmation',
  form: {
    formItem: [{}]
  }
}));


const networkTypeOptions = reactive([
  {label: '组合硬件', value: '["appliance", "switch", "wireless"]' },
  {label: '路由器', value: '["appliance"]' },
  {label: '交换机', value: '["switch"]' },
  {label: '无线AP', value: '["wireless"]' }
]);

const networkTemplateOptions = reactive([]);

function handleDisabledButton(value) {
  disabledButton.value = value;
}


const segmentTable = computed(() => {
  return {
    query: {
      url: '/operate/networkVlan/getVlans',
      form: {formItems: isManual.value ? [
          // {
          //   label: '网段', prop: 'segment', type: 'input',
          // }
          ] : [
          {
            label: '12.xx.xx/120', prop: 'segment', type: 'select', disabled: true,
            config: {options: segmentOptions}
          }
        ]},
      reset: false
    },
    columns: [
      {label: 'VLAN ID', prop: 'vlanId', },
      {label: 'VLAN 名称', prop: 'name', },
      {label: '子网', prop: 'subnet', },
      {label: 'MX IP', prop: 'mxIp', },
      {label: 'PING 结果', prop: 'pingResult', },
    ],
    config: {
      page: true,
      multipleTable: false,
      showQuery: false,
      showPagination: false
    }
  }
})

const storeSchemaForm = computed(() => {
  return {
    formItems: [
      {
        label: '网络名称', prop: 'networkName', type: 'input', rules: true,
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true} : {}
      },
      {
        label: '网络类型', prop: 'productTypes', type: 'select', rules: true,
        config:  activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {options: networkTypeOptions, disabled: true} : {options: networkTypeOptions}
      },
      {
        label: '网络模板', prop: 'templateId', type: 'select', rules: true,
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ?  {options: networkTemplateOptions, disabled: true} : {options: networkTemplateOptions}
      }
    ]
  }
});

const userStatusOptions = reactive([
  {
    label: '已使用', value: 0,
  },
  {
    label: '未使用', value: 1,
  }
]);

const queryDeviceForm = [
  {
    label: '序列号', prop: 'serial', type: 'input'
  },
  {
    label: 'MAC 地址', prop: 'mac', type: 'input'
   },
  {
    label: '型号', prop: 'model', type: 'input'
   },
  {
    label: '状态', prop: 'usedStatus', type: 'select',
    config: {options: userStatusOptions}
  }
]
const selectedTable = {
  query: {
    url: '/device/inventory/table',
    form: {formItems: []},
    reset: false
  },
  columns: [
    {label: '序列号', prop: 'serial', },
    {label: 'MAC 地址', prop: 'mac', },
    {label: '型号', prop: 'model', },
    {label: '订单编号', prop: 'orderNumber' },
    {label: '网络', prop: 'networkName', },
    {label: '状态', prop: 'usedStatus', },
    {label: '操作', prop: 'operator',type: 'defined' },
  ],
  config: {
    page: true,
    multipleTable: false,
    showQuery: false,
    showPagination: false
  },
};

const deviceTable = computed(() => {
  return {
    query: {
      url: '/device/inventory/table',
      form: { formItems: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? [] : queryDeviceForm },
      reset: false
    },
    columns: [
      {label: '序列号', prop: 'serial', },
      {label: 'MAC 地址', prop: 'mac', },
      {label: '型号', prop: 'model', },
      {label: '订单编号', prop: 'orderNumber' },
      {label: '网络', prop: 'networkName', },
      {label: '状态', prop: 'usedStatus', },
    ],
    config: {
      page: true,
      multipleTable: !activeNames.value.every((val, index) => val === finalActiveNames[index]),
      showQuery: !activeNames.value.every((val, index) => val === finalActiveNames[index]),
      showPagination: !activeNames.value.every((val, index) => val === finalActiveNames[index]),
    },
  }
});

const defaultAddForm = [{
  label: '设备信息', prop: 'serials', type: 'input', fixedSpan: 14,
  config: {type: 'textarea'}
}];

const addDialog = computed(() => ({
      title: '按序列号或/订单编号申领',
      url: '/device/add',
      form: {
        formItems: [
          ...defaultAddForm,
        ],
      },
      button: false
    }));

const organizationSchema = computed(() => {
  return  {
    formItems: [
      {
        label: '选择组织', prop: 'organizationId', type: 'select',
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {options: organizationOptions, disabled: true} : {
          options: organizationOptions,
        },
        rules: true,
      }]
  };
})

onUpdated(() => {
  if (currentStep.value === 3) {
    initQuery();
  }
  if (currentStep.value === 2) {
    getNetworkTemplateOptions(networkTemplateOptions, organizationFormRef.value.getForm());
  }
  if (currentStep.value === 6) {
    getSwitchTemplateOptions(switchTemplateOptions, organizationFormRef.value.getForm(), storeSchemaFormRef.value.form.templateId)
  }
  dialogVisible.value = false;
})

onMounted(() => {

  getOrganizationOptions(organizationOptions);
});

onUpdated(() => {
  if (storeSchemaFormRef.value !== null) {
    storeData = storeSchemaFormRef.value.form;
  }
})

function initQuery() {
  deviceTableRef.value.setForm({});
  deviceTableRef.value.query();
}

function firstStep() {
  submitData.organization = organizationFormRef.value.getForm();
  dialogVisible.value = false;
  active.value++;
  currentStep.value++;
}

const networkId = ref(null);

function secondStep() {
  createNetwork();
  submitData.storeInfo = storeSchemaFormRef.value.getForm();
  active.value++;
  currentStep.value++;
}

function thirdStep() {
  if (deviceTableRef.value.getMultipleSelection().length === 0) {
    dialogVisible.value = true;
  }
  updateSelectedNetworks();
  active.value++;
  currentStep.value++;
}

async function createNetwork() {
  const {data: res} = await http.post(
      '/operate/network/openStore/createNetwork',
      {
        organizationId: submitData.organization.organizationId,
        ...storeSchemaFormRef.value.getForm()
      }
  );
  if (!res.success) {
    ElMessage.error(res.msg);
  }
  networkId.value = res.data;
}

const deviceInfo = ref(null);

async function updateSelectedNetworks() {
  const {data: res} = await http.post(
      '/operate/device/add',
      {
        ...networkId.value,
        serials: serials.value,
      }
  );
  if (!res.success) {
    ElMessage.error(res.msg);
  }

  deviceInfo.value = res.data;
}

async function updateVlanList() {
  const {data: res} = await http.post(
      '/operate/networkVlan/updateVlan',
      {
        ...networkId.value,
        networkVlanList: segmentData.value,
      }
  );

  if (!res.success) {
    ElMessage.error(res.msg);
  }

}

function fourthStep() {
  updateVlanList();
  networkDeviceData = submitData.networkDeviceAdd;
  submitData.segmentInfo = segmentData.value;

  active.value++;
  currentStep.value++;
}


function finalStep() {
  updateDeviceInfo();
  active.value++;
  currentStep.value++;
  switchData = submitData.networkDeviceAdd
      .filter(item => getNetworkType(item.model) === 'switch');
}


async function updateDeviceInfo() {


    const {data: res} = await http.post(
        '/operate/device/updateDevice',
        networkDeviceData
    );

    if (!res.success) {
        ElMessage.error(res.msg);
    }
}

function addDeviceDialog() {
  addDialogRef.value.openDialog();
}


const serials = ref([]);

function promptConfirmationBeforeNext() {

  dialogVisible.value = true;
  submitData.networkDeviceAdd = selectedValues.value;
  submitData.networkDeviceAdd.map(item => {
    if (!serials.value.find(obj => obj.serial === item.serial)) {
        serials.value.push(item.serial);
    }
  });
}

function previousStep() {
  active.value--;
  currentStep.value--;
  activeNames.value = ['1', '2', '3', '4', '5', '6'];
}

function preview() {
  // updateSwitchConfigInfo();
  activeNames.value = ['7'];
  currentStep.value++;
  submitData.switchConfig = submitData.networkDeviceAdd.filter(item => getNetworkType(item.model) === 'switch');
}

async function updateSwitchConfigInfo() {
  const {data: res} = await http.post(
      '/operate/device/updateDevice',
  )
}

const switchTemplateOptions = reactive([]);

const switchTemplateSchema = computed(() => {
  return {
    formItems: [
      {
        label: '模板', prop: 'templateId', type: 'select',
        config: activeNames.value.every((val, index) => val === finalActiveNames[index])
            ? {options: switchTemplateOptions, disabled: true} : {options: switchTemplateOptions}
      }
    ]
  }
})

const router = useRouter();

async function submitAll() {
  const {data: res} =  await http.post(
      '/operate/network/openStore/submit',
      networkId.value
  );
  console.log(res);
  if (!res.success) {
    ElMessage.error(res.msg);
  }else{
    ElMessage.success(res.msg);
  }
}

</script>

<style scoped>

.content-section {
  overflow: hidden;
  padding-right: 10px;
}

.step-body {
  margin-left: 100px;
  margin-right: 100px;
  margin-top: 100px;
}

.collapse-body {
  justify-content: center;
  margin-top: 40px;
  margin-left: 90px;
  margin-right: 90px;
  overflow-y: auto;
  max-height: 50vh;
}
.button-section {
  padding: 50px 10px 0 10px;
}

.large-page {
  overflow-y: auto;
}

.preview-section-1 {

}
.preview-section-3 {

}
.preview-section-4 {

}
.preview-section-2 {
  margin-top: 10px;
  margin-bottom: 20px;
}
.dialog-content {
  padding-bottom: 15px;
  padding-left: 45px;
  color: white;
}
.valid-border {
  border-color: green !important;
}
</style>
