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
      <el-collapse-item title="新增门店信息" name="1" v-if="currentStep === 1">
        <div class="content-section">
          <compo-form
            ref="storeSchemaFormRef"
            :form-params="storeSchemaForm"
            form-type="table"
          >
          </compo-form>
        </div>
        <div class="button-section">
          <el-button type="primary" :disabled="disabledButton" @click="nextStep">{{ '下一步' }}</el-button>
        </div>
      </el-collapse-item>
      <el-collapse-item title="网络设备添加" name="2" v-if="currentStep === 2">
        <div class="content-section">
          <compo-table
              ref="deviceTableRef"
              :table-params="deviceTable"
          >
            <template #buttonSlot>
              <el-button type="primary" plain @click="addDeviceDialog">添加设备</el-button>
            </template>

            <template #dialog>
              <compo-dialog ref="addDialogRef" :dialog-params="addDialog" @initDialog="initDialog" @confirmSuccess="addSuccess">
                <template #headerSlot>
                  <ul>
                    <li>您可以通过添加订单号或单个设备序列号（每行一个）将设备添加到库存中。</li>
                    <li>如果您想同时定义设备名称，您可以使用格式输入： “序列号，名称”为每一行。</li>
                  </ul>
                </template>
              </compo-dialog>
            </template>
          </compo-table>
        </div>
        <div class="button-section">
          <el-button type="primary"  @click="previousStep">{{ '上一步' }}</el-button>
          <el-button type="primary"  @click="nextStep">{{ '下一步' }}</el-button>
        </div>
      </el-collapse-item>
      <el-collapse-item title="获取网段信息" name="3" v-if="currentStep === 3">
        <div class="content-section">
          <compo-form
              ref="segmentFormRef"
              :form-params="segmentSchema"
              form-type="table"
          >
          </compo-form>
        </div>
        <div class="button-section">
          <el-button type="primary"  @click="previousStep">{{ '上一步' }}</el-button>
          <el-button type="primary"  @click="nextStep">{{ '下一步' }}</el-button>
        </div>
      </el-collapse-item>
      <el-collapse-item title="网络设备信息" name="4" v-if="currentStep === 4">
        <div class="content-section">
          <compo-form
              ref="networkDeviceFormRef"
              :form-params="networkDeviceInfoSchema"
              form-type="table"
          >
          </compo-form>
        </div>
        <div class="button-section">
          <el-button type="primary"  @click="previousStep">{{ '上一步' }}</el-button>
          <el-button type="primary"  @click="nextStep">{{ '下一步' }}</el-button>
        </div>
      </el-collapse-item>
      <el-collapse-item title="交换机模板调用" name="5" v-if="currentStep === 5">
        <div class="content-section">
          <compo-form
              ref="switchInfoFormRef"
              :form-params="switchInfoSchema"
              form-type="table"
          >
          </compo-form>
        </div>
        <div class="button-section">
          <el-button type="primary"  @click="previousStep">{{ '上一步' }}</el-button>
          <el-button type="primary"  @click="preview">{{ '预览' }}</el-button>
        </div>
      </el-collapse-item>
      <el-collapse-item name="6" v-if="currentStep === 6">
        <div class="content">
          <compo-form
              ref="storeSchemaFormRef"
              :form-params="storeSchemaForm"
              form-type="table"
          >
          </compo-form>
          <compo-table
              ref="previewTableRef"
              :table-params="previewTable"
              :table-data="deviceInfoData"
          >
          </compo-table>
          <compo-form
              ref="segmentFormRef"
              :form-params="segmentSchema"
              form-type="table"
          >
          </compo-form>
          <div v-if="deviceInfoData.length > 0" v-for="item in deviceInfoData" :key="item.id">
            <compo-form
                ref="networkDeviceFormRef"
                :form-params="networkDeviceInfoSchema"
                form-type="table"
            >
            </compo-form>
          </div>
          <compo-form
              ref="switchInfoFormRef"
              :form-params="switchInfoSchema"
              form-type="table"
          >
          </compo-form>
        </div>
      </el-collapse-item>
      <div class="form-button" v-if="currentStep === 6">
        <el-button type="primary"  @click="previousStep">{{ '上一步' }}</el-button>
        <el-button type="primary"  @click="submitAll">{{ '提交' }}</el-button>
      </div>
    </el-collapse>
  </div>
</template>

<script setup>
import CompoTable from "@/components/compoTable/index.vue";
import CompoDialog from "@/components/compoDialog/index.vue";
import {computed, onMounted, onUpdated, reactive, ref} from "vue";
import {useRouter} from "vue-router";
import tool from "@/utils/tool";

const active =  ref(0);
const addDialogRef = ref(null);
const currentStep = ref(1);
const activeNames = ref(['1', '2', '3', '3', '4', '5',]);
const storeSchemaFormRef = ref(null);
const deviceTableRef = ref(null);
const segmentFormRef = ref(null);
const networkDeviceFormRef = ref(null);
const switchInfoFormRef = ref(null);
const disabledButton = ref(false);
let storeData = ref(null);
let deviceInfoData = ref(
    [{
      "mac": "a8:46:9d:6d:ae:b4",
      "serial": "Q2FY-25TM-3UCK",
      "networkName": "Shanghai Pre-Prod Lab MX67_2",
      "model": "MX67",
      "orderNumber": "5S0785958",
      "usedStatus": 0,
      "claimedAt": null
    },
      {
        "mac": "a8:46:9d:7a:94:b7",
        "serial": "Q2FY-5VHW-Q3QG",
        "networkName": "Shanghai Pre-Prod Lab MX67_1",
        "model": "MX67",
        "orderNumber": "5S0785958",
        "usedStatus": 0,
        "claimedAt": null
      },]
);
const previewTableRef = ref({});

const remoteNetworkOptions = reactive([]);

function getFormsData(forms) {
}

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

const storeSchemaForm = {
  formItems: [
    {
      label: '网络', prop: 'networkId', type: 'input', rules: true,
    },
    {
      label: '网络类型', prop: 'networkType', type: 'select', rules: true,
      config: {options: networkTypeOptions}
    },
    {
      label: '网络模板', prop: 'networkTemplate', type: 'select', rules: true,
      config: {options: networkTemplateOptions}
    }
  ]
};


const previewTable = {
  query: {
    url: '/device/inventory/table',
    form: {formItems: []},
    reset: false
  },
  columns: [
    {label: '网络', prop: 'networkName', },
    {label: '状态', prop: 'usedStatus', },
    {label: 'MAC 地址', prop: 'mac', },
    {label: '序列号', prop: 'serial', },
    {label: '订单编号', prop: 'orderNumber', },
    {label: '模型', prop: 'model', },
  ],
  config: {
    page: true,
    multipleTable: false,
    showQuery: false,
    showPagination: false
  }
}

const deviceTable = {
  query: {
    url: '/device/inventory/table',
    form: {formItems: []},
    reset: false
  },
  columns: [
    {label: '网络', prop: 'networkName', },
    {label: '状态', prop: 'usedStatus', },
    {label: 'MAC 地址', prop: 'mac', },
    {label: '序列号', prop: 'serial', },
    {label: '订单编号', prop: 'orderNumber', },
    {label: '模型', prop: 'model', },
  ],
  config: {
    page: true,
    multipleTable: true,
    showQuery: false,
  },

};

const defaultAddForm = [{
  label: '设备信息', prop: 'deviceInfo', type: 'input', fixedSpan: 24,
  config: {type: 'textarea'}
}];

const addDialog = computed(() => ({
      title: '将设备添加到清单',
      url: '/device/add',
      form: {
        formItems: [
          ...defaultAddForm,
        ]
      }
    }));

const switchInfoSchema = {
  formItems: [
    {
      label: '交换机模板选择', prop: 'switchTemplates', type: 'select', width: '30px',
      config: {options: networkTypeOptions}
    }]
};


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

const networkDeviceInfoSchema = {
  formItems: [
    {
      label: '地址位置信息', prop: 'location', type: 'input', rules: true,
      config: {}
    },
    {
      label: '设备名称', prop: 'deviceName', type: 'input', rules: true, 
      config: {}
    },
    {
      label: 'MS IP', prop: 'msIP', type: 'input', rules: true,
    },
    {
      label: 'MX IP', prop: 'mxIP', type: 'input', rules: true,
    },
    {
      label: '掩码', prop: 'maskNo', type: 'input',
    },
    {
      label: 'VLAN', prop: 'vlan', type: 'input',
    },
    {
      label: 'DNS', prop: 'dns', type: 'input',
    },
  ]
};

const segmentSchema = {
  formItems: [
  {
    label: '网段', prop: 'networkId', type: 'input',
    config: {disabled: true}
  },
    {
      label: 'PING 结果', prop: 'pingResult', type: 'input',
      config: {disabled: true}
    }
  ]

}

onMounted(() => {
})

onUpdated(() => {
  if(deviceTableRef.value !== null) {
    initQuery();
  }
  if (storeSchemaFormRef.value !== null) {
    console.log(storeSchemaFormRef.value.form)
    storeData = storeSchemaFormRef.value.form;
  }
  if (segmentFormRef.value !== null) {
    // mock data
    segmentFormRef.value.setForm({
      networkId: '2c:3f:0b:5e:c8:81',
      pingResult: 'SUCCESS'
    });
  }
  if (previewTableRef.value !== null) {
  }
})
function initQuery() {
  deviceTableRef.value.setForm({});
  deviceTableRef.value.query();
}

function nextStep() {
  active.value++;
  currentStep.value++;
}

function addDeviceDialog() {
  addDialogRef.value.openDialog();
}

function previousStep() {
  if (currentStep.value > 1) {
    active.value--;
    currentStep.value--;
  }
  activeNames.value = ['1', '2', '3', '4', '5'];
}

function preview() {
  activeNames.value = ['6'];
  currentStep.value++;
}

const router = useRouter();

function submitAll() {
  active.value++;
  if (active.value > 5) {
    active.value = 0;
  }
  const data = {

  };

}

</script>

<style scoped>

.content-section {
  max-height: 60vh;
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
}
.button-section {
  padding: 50px 10px 0 10px;
}

.large-page {
  overflow-y: auto;
  max-height: 890px;
}

.form-button {
  margin: 30px 600px;
}
</style>
