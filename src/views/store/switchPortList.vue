<script setup>
import {onMounted, reactive, ref} from "vue";
import http from "@/utils/http";
import {useRoute} from "vue-router";
import {ElMessageBox} from "element-plus/lib/components";

const dialogClose = (done) => {
  ElMessageBox.confirm('确认关闭吗?')
      .then(() => {
        done()
      })
      .catch(() => {
        // catch error
      })
}

const linkOption = [
  {value: 'Auto negotiate', label: '自动协商'},
  {value: '1 Gigabit full duplex (forced)', label: '100兆位(自动)'},
  {value: '100 Megabit (auto)', label: '100 兆位半双工(自动)'},
  {value: '100 Megabit full duplex (forced)', label: '100 兆位全双工(强制)'},
  {value: '10 Megabit (auto)', label: '10 兆位(自动)'},
  {value: '10 Megabit full duplex (forced)', label: '10 兆位半双工(强制)'},
  {value: '10 Megabit half duplex (forced)', label: '10 兆位全双工(强制)'},
];
// ('disabled', 'root guard', 'bpdu guard' or 'loop guard')
const stpOption = [
  {value: 'disabled', label: '已禁用'},
  {value: 'root guard', label: 'Root guard'},
  {value: 'bpdu guard', label: 'BPDU防护'},
  {value: 'loop guard', label: 'loop guard'},
];

function getStpValue(label){
  const option = stpOption.find(opt => opt.label === label);
  return option ? option.value : null;
}
function getStpLabel(value){
  const option = stpOption.find(opt => opt.value === value);
  return option ? option.label : null;
}

const route = useRoute();
const switchParam = ref({});
const portParam = ref({});
onMounted(() => {
  checkQuery();
  getPortList();
})

function checkQuery() {
  if (Object.keys(route.query).length > 0) {
    switchParam.value = route.query;
  }
}

let portArr = ref([]);

async function getPortList() {

  if (Object.keys(route.query).length > 0) {
    switchParam.value = route.query;
  }
  const res = await http.get('/operate/maintain/switchPorts/' + switchParam.value.serial);
  portArr.value = res.data.data;
}

async function getPortConfig(row) {

  const res = await http.get('/operate/maintain/switchPort/' + switchParam.value.serial + "/" + row.portId);
  portParam.value = res.data.data;
  switchParam.value.portId = row.portId;
  tableData.value[0].value = switchParam.value.name + "/" + row.portId;
  tableData.value[1].value = portParam.value.name;
  tableData.value[2].value = portParam.value.enabled ? "启用" : "已禁用";
  tableData.value[3].value = portParam.value.linkNegotiation;
  tableData.value[4].value = portParam.value.portScheduleId ?? '';
  tableData.value[5].value = portParam.value.tags;
  tableData.value[6].value = portParam.value.profile == null ? "已禁用" : "启用";
  tableData.value[7].value = portParam.value.type === 'access' ? '接入' : 'Trunk';
  tableData.value[8].value = portParam.value.rstpEnabled ? '启用' : '已禁用';
  tableData.value[9].value = getStpLabel(portParam.value.stpGuard) ;
  tableData.value[10].value = portParam.value.isolationEnabled ? '启用' : '已禁用';
  tableData.value[11].value = portParam.value.daiTrusted ? '启用' : '已禁用';
  tableData.value[12].value = portParam.value.udld === 'Alert only' ? '仅限警报' : '执行';
  tableData.value[13].value = portParam.value.poeEnabled ? '启用' : '已禁用';



  localVLAN.value = portParam.value.vlan;
  voiceVlan.value = portParam.value.voiceVlan;
  allowedVlans.value = portParam.value.allowedVlans;
  stickyMacAllowList.value= portParam.value.stickyMacAllowList;
  macAllowList.value= portParam.value.macAllowList;
  stickyMacAllowListLimit.value= portParam.value.stickyMacAllowListLimit;
  accessPolicyType.value= portParam.value.accessPolicyType;

  dialogTableVisible.value = true;


}


async function summit() {
  const params = {
    "serial": switchParam.value.serial,
    "stickyMacAllowListLimit": stickyMacAllowListLimit.value,
    "vlan": localVLAN.value,
    "voiceVlan": voiceVlan.value,
    "accessPolicyType": accessPolicyType.value,
    "allowedVlans": allowedVlans.value,
    "linkNegotiation": tableData.value[3].value,
    "name": tableData.value[1].value,
    "portId": switchParam.value.portId,
    "stpGuard": getStpValue(tableData.value[9].value),
    "type":  tableData.value[7].value ===  '接入' ? "access" : 'Trunk',
    "udld":   tableData.value[12].value === '仅限警报' ? "Alert only" : 'Enforce',
    "daiTrusted": tableData.value[11].value === '启用',
    "enabled":   tableData.value[2].value === "启用",
    "isolationEnabled":  tableData.value[10].value === '启用',
    "poeEnabled": tableData.value[13].value === '启用',
    "rstpEnabled": tableData.value[8].value === '启用',
    "macAllowList": macAllowList.value,
    "stickyMacAllowList": stickyMacAllowList.value,
    "tags":  tableData.value[5].value
  }
const res =  await http.post('/operate/maintain/updateSwitchPort',params);
  alert(res.data.msg);
  dialogTableVisible.value = false;

}

let dialogTableVisible = ref(false)
const tableData = ref([
  {
    description: '交换机',
    type: 'label',
    value: ''
  },
  {
    description: '名称',
    type: 'input',
    value: ''
  },
  {
    description: '端口状态',
    type: 'portStatus',
    value: '启用'
  },
  {
    description: '链路协商',
    type: 'select',
    value: '',
    options: linkOption
  },
  {
    description: '端口计划',
    type: 'select',
    value: '',
    options: [
      {value: '', label: '未计划'},
    ]
  },
  {
    description: '标签',
    type: 'tag',
    value: []
  },
  {
    description: '端口简介',
    type: 'portDetail',
    value: '启用'
  },
  {
    description: '类型',
    type: 'portType',
    value: 'Trunk'
  },
  {
    description: 'RSTP',
    type: 'portStatus',
    value: '启用'
  },
  {
    description: 'STP防护',
    type: 'select',
    value: '',
    options: stpOption
  },
  {
    description: '端口隔离',
    type: 'portStatus',
    value: '启用'
  },
  {
    description: '受信任的DAI',
    type: 'portStatus',
    value: '启用'
  }
  ,
  {
    description: 'UDLD',
    type: 'udldStatus',
    value: '启用'
  }
  ,
  {
    description: 'PoE',
    type: 'PoEStatus',
    value: '启用'
  }
]);

const inputVisible = ref(false)
const inputValue = ref('')


const handleClose = (tag) => {
  tableData.value[5].value.splice(tableData.value[5].value.indexOf(tag), 1)
}

const showInput = () => {
  inputVisible.value = true
}

const handleInputConfirm = () => {
  if (inputValue.value) {
    tableData.value[5].value.push(inputValue.value);
  }
  inputVisible.value = false
  inputValue.value = ''
}
const configFileOption = ref([
  {label: "", value: ''}
]);


function protStatusChange(v) {
  const index = 7;
  if (v === '启用') {
    tableData.value.splice(index, 0, {
      description: '端口配置文件名称',
      type: 'select',
      value: '',
      options: configFileOption
    });
  } else {
    if (tableData.value[index].description === '端口配置文件名称') {
      tableData.value.splice(index, 1);
    }
  }
}


// trunk 相关数据
const localVLAN = ref('1');
const allowedVlans = ref('');
const voiceVlan = ref('');
const stickyMacAllowListLimit = ref(0);

const macAllowList = ref([]);
const stickyMacAllowList = ref([]);
const accessPolicyType = ref('');

// 接入 相关数据
const accessTactics = [
    {label:"开放",value:"Open"},
    {label:"粘性 MAC 允许列表",value:"Sticky MAC allow list"},
    {label:"MAC 允许列表",value:"MAC allow list"},
];


</script>

<template>
<center>
  <el-row style="padding: 20px">
    <el-col>
      <el-row class="info-row">
        <el-col :span="6"></el-col>
        <el-col :span="4"><strong>交换机的名称: {{ switchParam.name }}</strong></el-col>
        <el-col :span="5"><strong>所在地址: {{ switchParam.address }}</strong></el-col>
      </el-row>

      <el-row class="info-row">
        <el-col :span="6"></el-col>
        <el-col :span="4"><strong>型号: {{ switchParam.model }}</strong></el-col>
        <el-col :span="4"><strong>公网 IP: {{ switchParam.publicIp }}</strong></el-col>
      </el-row>

      <el-row class="info-row">
        <el-col :span="6"></el-col>
        <el-col :span="4"><strong>SN 号: {{ switchParam.serial }}</strong></el-col>
        <el-col :span="4"><strong>状态: {{ switchParam.status }}</strong></el-col>
      </el-row>
    </el-col>
    <el-col>
      <el-table :data="portArr" stripe class="centered-table">
        <el-table-column prop="name" label="名称" width="180"></el-table-column>
        <el-table-column prop="portId" label="端口号" width="180"></el-table-column>
        <el-table-column prop="type" label="类型" width="180"></el-table-column>
        <el-table-column prop="vlan" label="vlan" width="180"></el-table-column>
        <el-table-column label="功能" width="180">

          <template #default="scope">
            <el-button type="primary" plain @click="getPortConfig(scope.row)">编辑</el-button>
          </template>
        </el-table-column>

      </el-table>
    </el-col>
  </el-row>
</center>




  <el-dialog v-model="dialogTableVisible" title="更新端口" align-center="align-center" :before-close="dialogClose">
    <el-table :data="tableData" :border="false" :show-header="false">
      <el-table-column label="描述信息" prop="description"></el-table-column>
      <el-table-column label="值">

        <template v-slot:default="scope">
          <el-text v-if="scope.row.type === 'label'">{{ scope.row.value }}</el-text>
          <el-input v-if="scope.row.type === 'input'" v-model="scope.row.value"></el-input>
          <el-button v-if="scope.row.type === 'button'">{{ scope.row.value }}</el-button>

          <div v-if="scope.row.type === 'portDetail'">
            <el-radio-group v-model="scope.row.value" @change="protStatusChange">
              <el-radio-button label="启用"></el-radio-button>
              <el-radio-button label="已禁用"></el-radio-button>
            </el-radio-group>
          </div>
          <div v-if="scope.row.type === 'portStatus'">
            <el-radio-group v-model="scope.row.value">
              <el-radio-button label="启用"></el-radio-button>
              <el-radio-button label="已禁用"></el-radio-button>
            </el-radio-group>
          </div>


          <div v-if="scope.row.type === 'portType'">
            <el-radio-group v-model="scope.row.value">
              <el-popover
                  placement="bottom"
                  :width="300"
                  auto-teleported="true"
                  trigger="click"
              >
                <template #reference>
                  <el-radio-button label="Trunk"></el-radio-button>
                </template>
                <div>
                  <el-row>
                    <el-col>
                      本地 VLAN
                    </el-col>
                    <el-col>
                      <el-input v-model="localVLAN"></el-input>
                    </el-col>

                    <el-col>
                      允许的 VLAN
                    </el-col>

                    <el-col>
                      <el-input v-model="allowedVlans">

                      </el-input>
                    </el-col>

                  </el-row>
                </div>
              </el-popover>

              <el-popover
                  :width="300"
                  trigger="click"
              >
                <template #reference>
                  <el-radio-button label="接入"></el-radio-button>
                </template>
                <div>
                  <el-row>
                    <el-col>
                      访问策略
                    </el-col>

                    <el-col>
                      <el-select  :teleported="false" :popper-append-to-body="false" v-model="accessPolicyType">
                        <el-option
                            v-for="item in accessTactics"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                      </el-select>
                    </el-col>

                    <el-col v-if="accessPolicyType === 'MAC allow list'">
                      <el-col>允许列出的MAC</el-col>
                      <el-col><el-input v-model="macAllowList"></el-input></el-col>
                    </el-col>

                    <el-col>
                      VLAN
                    </el-col>
                    <el-col>
                      <el-input v-model="localVLAN">
                      </el-input>
                    </el-col>

                    <el-col>
                      语音VLAN
                    </el-col>
                    <el-col>
                      <el-input v-model="voiceVlan">
                      </el-input>
                    </el-col>

                  </el-row>
                </div>
              </el-popover>


            </el-radio-group>
          </div>


          <div v-if="scope.row.type === 'udldStatus'">
            <el-radio-group v-model="scope.row.value">
              <el-radio-button label="仅限警报"></el-radio-button>
              <el-radio-button label="执行"></el-radio-button>
            </el-radio-group>
          </div>

          <div v-if="scope.row.type === 'PoEStatus'">
            <el-radio-group v-model="scope.row.value">
              <el-radio-button label="启用"></el-radio-button>
              <el-radio-button label="已禁用"></el-radio-button>
            </el-radio-group>
          </div>


          <el-select v-if="scope.row.type === 'select'" v-model="scope.row.value">
            <el-option
                v-for="item in scope.row.options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>

          <div v-if="scope.row.type === 'tag'">
            <el-tag
                v-for="tag in scope.row.value"
                :key="tag"
                class="mx-1"
                closable
                :disable-transitions="false"
                @close="handleClose(tag)"
            >
              {{ tag }}
            </el-tag>
            <el-input
                v-if="inputVisible"
                v-model="inputValue"
                class="ml-1 w-20"
                size="small"
                @keyup.enter="handleInputConfirm"
                @blur="handleInputConfirm"
            />
            <el-button v-else class="button-new-tag ml-1" size="small" @click="showInput">
              + New Tag
            </el-button>

          </div>

        </template>

      </el-table-column>
    </el-table>
    <div class="button-container">
      <el-button @click="dialogTableVisible=false"> 取消</el-button>
      <el-button @click="summit"> 更新</el-button>
    </div>
  </el-dialog>

</template>



<style scoped lang="scss">
.switch-info {
  margin: 30px 20px 25px 20px;  // 将下边距设为25px
  padding: 20px;
  border-radius: 5px;
}

.info-row {
  margin-bottom: 15px;
  color: #C8CBD2;
  &:last-child {
    margin-bottom: 0;
  }
}

.table-container {
  display: flex;
  justify-content: center;
  align-items: start;
  height: calc(100vh - 140px);
  margin-top:25px;  // 将上边距设为25px
}

.centered-table {
  max-width: 95%;
  margin: 20px 0;
}
.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}
.el-table::before {
  height: 0;
}
.customer-table .el-table__fixed-right::before,
.el-table__fixed::before {
  width: 0;
}

</style>