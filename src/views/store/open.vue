<template>
  <div class="large-page">
    <el-steps :active="active" finish-status="success" class="step-body" >
      <el-step title="Step 1"></el-step>
      <el-step title="Step 2"></el-step>
      <el-step title="Step 3"></el-step>
      <el-step title="Step 4"></el-step>
      <el-step title="Step 5"></el-step>
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
                <el-button type="primary" plain @click="addDeviceDialog">添加设备</el-button>
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
           <compo-table
               ref="segmentFormRef"
               :table-params="segmentTable"
               :default-table-data="segmentData"
           >
             <template
                 #tableDefinedSlot="slotProps"
             >
               <div v-if="slotProps.prop === 'operator'">
                 <el-link
                     type="primary"
                     href="javascript:;"
                 >PING
                 </el-link>
               </div>
             </template>
           </compo-table>
          </div>
          <div class="button-section">
            <el-button type="primary"  @click="previousStep">{{ '上一步' }}</el-button>
            <el-button type="primary" :disabled="segmentData.every(item => item.pingResult === 'Failed')
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
                :form-params="getNetworkType(item.model) === 'router' ? getNetworkDeviceInfoSchema:
                getNetworkType(item.model) === 'appliance' ? getApSchema : getSwitchSchema"
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
              :default-table-data="mockNetworkDeviceInfos"
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
                :form-params="getNetworkType(item.model) === 'router' ? getNetworkDeviceInfoSchema:
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
import {computed, onMounted, onUpdated, reactive, ref} from "vue";
import {useRouter} from "vue-router";
import {getOrganizationOptions} from "@/views/device/device";

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

function closeDialog() {
  addDialogRef.value.dialogVisible = false;
}

function applyDevice() {

}

const mockNetworkDeviceInfos =[
  {
    "mac": "a8:46:9d:6d:ae:b4",
    "serial": "Q2FY-25TM-3UCK",
    "networkName": "Shanghai Pre-Prod Lab MX67_2",
    "model": "MX67",
    "orderNumber": "5S0785958",
    "usedStatus": 0,
    "claimedAt": null,
    "location": "1adea",
    "deviceName": "TEST",
    "msIP": "12.10.10.1",
    "maskNo": "1299",
    "vlan": "2",
    "dns": "21"
  },
  {
    "mac": "a8:46:9d:6d:a2:9c",
    "serial": "Q2FY-XS4J-BLGZ",
    "networkName": "Pre-Prod Test_Store_1",
    "model": "MX67",
    "orderNumber": "5S0785958",
    "usedStatus": 0,
    "claimedAt": null,
    "location": "1adea",
    "deviceName": "TEST",
    "msIP": "12.10.10.1",
    "maskNo": "1299",
    "vlan": "2",
    "dns": "21"
  },
  {
    "mac": "2c:3f:0b:5f:05:43",
    "serial": "Q2CX-AP2K-QH6D",
    "networkName": "test_Xinyan",
    "model": "MS120-8FP",
    "orderNumber": "5S5354573",
    "usedStatus": 1,
    "claimedAt": null,
    "location": "1adea",
    "deviceName": "TEST",
    "msIP": "12.10.10.1",
    "maskNo": "1299",
    "vlan": "2",
    "dns": "21"
  },
  {
    "mac": "a8:46:9d:46:cd:e7",
    "serial": "Q4AS-H87F-HV44",
    "networkName": "Pre-Prod Test_Store_1",
    "model": "MS210-24P",
    "orderNumber": "5S2358094",
    "usedStatus": 0,
    "claimedAt": null,
    "location": "1adea",
    "deviceName": "TEST",
    "msIP": "12.10.10.1",
    "maskNo": "1299",
    "vlan": "2",
    "dns": "21"
  }
];
const mockSwitchConfigInfo = [
  {
    templateId: "1201",
    mac: "2c:3f:0b:5f:05:43",
    model: "MS120-8FP",
    serial: "Q2CX-AP2K-QH6D",
  },
  {
    templateId: "12122",
    mac: "2c:3f:0b:5f:05:43",
    model: "MS120-8FP",
    serial: "Q2CX-AP2K-QH6D",
  }
];

function collectValues(values, idx) {
  const index = submitData.networkDeviceAdd.findIndex(item => item.serial === idx);
  submitData.networkDeviceAdd[index] = {
    ...submitData.networkDeviceAdd[index],
    ...values
  }
  console.log(submitData.networkDeviceAdd);
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
        label: 'DNS', prop: 'dns', type: 'input',
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true} : {},
        rules: true
      },
      {
        label: 'MX IP', prop: 'mxIp', type: 'input',
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
        label: 'DNS', prop: 'dns', type: 'input',
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true} : {},
        rules: true
      },
      {
        label: 'MS IP', prop: 'msIp', type: 'input',
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
  }
});

const getNetworkDeviceInfoSchema = computed(() => {
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
      {
        label: 'DNS', prop: 'dns', type: 'input',
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true} : {},
        rules: true
      }
    ]
  };
});

const segmentData = [
  {
    "vlan": "Management",
    "segmentIp": "12.02.101",
    "mxIP": "110.02.10.1",
    "pingResult": "Failed",
  },
  {
    "vlan": "Router102",
    "segmentIp": "12.02.102",
    "mxIP": "110.02.10.1",
    "pingResult": "Failed",
  },
  {
    "vlan": "IOT",
    "segmentIp": "12.02.103",
    "mxIP": "110.02.10.1",
    "pingResult": "Failed",
  },
  {
    "vlan": "native 2",
    "segmentIp": "12.02.104",
    "mxIP": "110.02.10.1",
    "pingResult": "Failed",
  },
];


function handleClose() {
  dialogVisible.value = false;
}

function handleSelectedValues(val) {
  selectedValues.value = val;
}

const organizationOptions = reactive([]);

const confirmDialog = computed(() => ({
  title: 'Confirmation',
  form: {
    formItem: [{}]
  }
}));


const networkTypeOptions = reactive([
  {label: '组合硬件', value: 'comboHardware' },
  {label: '路由器', value: 'appliance' },
  {label: '交换机', value: 'switch' },
  {label: '无线', value: 'wireless' }
]);

const networkTemplateOptions = reactive([
  {label: 'CMMO-TEST', value: 'cmmo-test'},
  {label: 'TELE-CON', value: 'tele-con'},
  {label: 'TEST', value: 'test'}
]);

function handleDisabledButton(value) {
  disabledButton.value = value;
}


const segmentTable = computed(() => {
  return {
    query: {
      url: '/device/inventory/table',
      form: {formItems: isManual.value ? [
          {
            label: '网段', prop: 'segment', type: 'input',
          }] : [
          {
            label: '12.10.12/120', prop: 'segment', type: 'select', disabled: true,
            config: {options: segmentOptions}
          }
        ]},
      reset: false
    },
    columns: [
      {label: 'VLAN', prop: 'vlan', },
      {label: '子网', prop: 'segmentIp', },
      {label: 'MX IP', prop: 'mxIP', },
      {label: 'PING 结果', prop: 'pingResult', },
      {label: '操作', prop: 'operator', type: 'defined' },
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
        label: '网络类型', prop: 'networkType', type: 'select', rules: true,
        config:  activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {options: networkTypeOptions, disabled: true} : {options: networkTypeOptions}
      },
      {
        label: '网络模板', prop: 'networkTemplate', type: 'select', rules: true,
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ?  {options: networkTemplateOptions, disabled: true} : {options: networkTemplateOptions}
      }
    ]
  }
});



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
      form: {formItems: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? [] : queryDeviceForm},
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
  label: '设备信息', prop: 'deviceInfo', type: 'input', fixedSpan: 14,
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

const networkDeviceInfoSchema = computed(() => {
  return {
    formItems: [
      {
        label: '地址位置信息', prop: 'location', type: 'input', rules: true,
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true} : {}
      },
      {
        label: '设备名称', prop: 'deviceName', type: 'input', rules: true,
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true}: {}
      },
      {
        label: 'MS IP', prop: 'msIP', type: 'input', rules: true,
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true} : {}
      },
      {
        label: 'MX IP', prop: 'mxIP', type: 'input', rules: true,
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true}: {}
      },
      {
        label: '掩码', prop: 'maskNo', type: 'input',
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true}: {}
      },
      {
        label: 'VLAN', prop: 'vlan', type: 'input',
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true}: {}
      },
      {
        label: 'DNS', prop: 'dns', type: 'input',
        config: activeNames.value.every((val, index) => val === finalActiveNames[index]) ? {disabled: true}: {}
      },
    ]
  }
});

onUpdated(() => {
  if (currentStep === 2) {
    initQuery();
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

function secondStep() {
  submitData.storeInfo = storeSchemaFormRef.value.getForm();
  active.value++;
  currentStep.value++;
}

function thirdStep() {
  if (deviceTableRef.value.getMultipleSelection().length === 0) {
    dialogVisible.value = true;
  }
  active.value++;
  currentStep.value++;
}

function fourthStep() {
  networkDeviceData = submitData.networkDeviceAdd;
  console.log(networkDeviceData);
  submitData.segmentInfo = segmentData;

  active.value++;
  currentStep.value++;
}

function finalStep() {
  active.value++;
  currentStep.value++;
  switchData = submitData.networkDeviceAdd
      .filter(item => getNetworkType(item.model) === 'switch');
}

function addDeviceDialog() {
  addDialogRef.value.openDialog();
}

function promptConfirmationBeforeNext() {
  dialogVisible.value = true;
  submitData.networkDeviceAdd = selectedValues.value;
}

function previousStep() {
  active.value--;
  currentStep.value--;
  activeNames.value = ['1', '2', '3', '4', '5', '6'];
}

function preview() {
  activeNames.value = ['7'];
  currentStep.value++;
  submitData.switchConfig = submitData.networkDeviceAdd.filter(item => getNetworkType(item.model) === 'switch');
}

const switchTemplateOptions = reactive([
  {
    label: 'TEST1', value: 'test1',
  },
  {
    label: 'TEST2', value: 'test2',
  },
  {
    label: 'TEST3', value: 'test3',
  }
]);

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

function submitAll() {

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

</style>
