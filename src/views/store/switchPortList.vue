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

const  linkOption = [
  { value: 'Auto negotiate', label: '自动协商' },
  { value: '1 Gigabit full duplex (forced)', label: '100兆位(自动)' },
  { value: '100 Megabit (auto)', label: '100 兆位半双工(自动)' },
  { value: '100 Megabit full duplex (forced)', label: '100 兆位全双工(强制)' },
  { value: '10 Megabit (auto)', label: '10 兆位(自动)' },
  { value: '10 Megabit full duplex (forced)', label: '10 兆位半双工(强制)' },
  { value: '10 Megabit half duplex (forced)', label: '10 兆位全双工(强制)' },
];
// ('disabled', 'root guard', 'bpdu guard' or 'loop guard')
const  stpOption = [
  { value: 'disabled', label: '已禁用' },
  { value: 'root guard', label: 'Root guard' },
  { value: 'bpdu guard', label: 'BPDU防护' },
  { value: 'loop guard', label: 'loop guard' },
];


const route = useRoute();
const switchParam = ref({});
const portParam = ref({});
onMounted(()=>{
  checkQuery();
  getPortList();
})

function checkQuery(){
  if (Object.keys(route.query).length > 0) {
    switchParam.value = route.query;
  }
}

let portArr = ref([]);

async function getPortList(){

  if (Object.keys(route.query).length > 0) {
    switchParam.value = route.query;
  }
  const res = await http.get('/operate/maintain/switchPorts/'+switchParam.value.serial);
  portArr.value = res.data.data;
}

async  function getPortConfig(row){

  const res = await http.get('/operate/maintain/switchPort/'+switchParam.value.serial+"/"+row.portId);
  portParam.value = res.data.data;
  tableData.value[0].value = switchParam.value.name + "/" + row.portId;
  tableData.value[1].value = portParam.value.name;
  tableData.value[2].value = portParam.value.enabled ? "启用" : "已禁用";
  tableData.value[3].value = portParam.value.linkNegotiation;
  tableData.value[4].value = portParam.value.portScheduleId ?? '';
  tableData.value[5].value = portParam.value.tags;
  // tableData.value[6].value = portParam.value.;
  tableData.value[7].value = portParam.value.type === 'access' ? '接入' : 'Trunk';


  dialogTableVisible.value = true;


}



function summit() {
  const  params = {
    "serial": switchParam.value.name,
    "accessPolicyNumber": switchParam.value.accessPolicyNumber,
    "stickyMacAllowListLimit": switchParam.value.stickyMacAllowListLimit,
    "vlan": switchParam.value.name,
    "voiceVlan": switchParam.value.name,
    "accessPolicyType": switchParam.value.name,
    "adaptivePolicyGroupId": switchParam.value.name,
    "allowedVlans": switchParam.value.name,
    "linkNegotiation": switchParam.value.name,
    "name": switchParam.value.name,
    "portId": switchParam.value.name,
    "portScheduleId":switchParam.value.name ,
    "stpGuard": switchParam.value.stpGuard,
    "type": switchParam.value.type,
    "udld": switchParam.value.name,
    "daiTrusted": switchParam.value.name,
    "enabled": switchParam.value.name,
    "flexibleStackingEnabled": switchParam.value.flexibleStackingEnabled,
    "isolationEnabled": switchParam.value.isolationEnabled,
    "peerSgtCapable": switchParam.value.peerSgtCapable,
    "poeEnabled": switchParam.value.poeEnabled,
    "rstpEnabled": switchParam.value.rstpEnabled,
    "stormControlEnabled": switchParam.value.stormControlEnabled,
    "macAllowList": switchParam.value.macAllowList,
    "stickyMacAllowList": switchParam.value.stickyMacAllowList,
    "tags": switchParam.value.tags,
    "profile": switchParam.value.profile
  }
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
      { value: '', label: '未计划' },
    ]
  },
  {
    description: '标签',
    type: 'tag',
    value: []
  },
  {
    description: '端口简介',
    type: 'portStatus',
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
</script>

<template>
  <div class="table-container">
    <el-table :data="portArr" stripe class="centered-table">
      <el-table-column prop="name" label="名称" width="180">{{switchParam.name}}</el-table-column>
      <el-table-column  label="mac" width="180">{{switchParam.mac}}</el-table-column>
      <el-table-column prop="portId" label="交换机/端口" width="180"></el-table-column>
      <el-table-column prop="type" label="类型" width="180"></el-table-column>
      <el-table-column prop="vlan" label="vlan" width="180"></el-table-column>
      <el-table-column  label="功能" width="180">
        <template #default="scope">
          <el-button type="primary" plain @click="getPortConfig(scope.row)">编辑</el-button>
        </template>
      </el-table-column>



    </el-table>
  </div>

  <el-dialog v-model="dialogTableVisible" title="更新端口" align-center="align-center" :before-close="dialogClose">
    <el-table :data="tableData" :border="false" :show-header="false">
      <el-table-column label="描述信息" prop="description"></el-table-column>
      <el-table-column label="值" >

        <template v-slot:default="scope">
          <el-text v-if="scope.row.type === 'label'" >{{scope.row.value}}</el-text>
          <el-input v-if="scope.row.type === 'input'" v-model="scope.row.value"></el-input>
          <el-button v-if="scope.row.type === 'button'">{{ scope.row.value }}</el-button>
          <div v-if="scope.row.type === 'portStatus'">
            <el-radio-group v-model="scope.row.value">
              <el-radio-button label="启用"></el-radio-button>
              <el-radio-button label="已禁用"></el-radio-button>
            </el-radio-group>
          </div>
          <div v-if="scope.row.type === 'portType'">
            <el-radio-group v-model="scope.row.value">
              <el-radio-button label="Trunk"></el-radio-button>
              <el-radio-button label="接入"></el-radio-button>
            </el-radio-group>
          </div>

          <div v-if="scope.row.type === 'udldStatus'">
            <el-radio-group v-model="scope.row.value">
              <el-radio-button label="仅限警报"></el-radio-button>
              <el-radio-button label="执行"></el-radio-button>
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

          <div v-if="scope.row.type === 'tag'" >
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
      <el-button @click="dialogTableVisible=false"> 取消 </el-button>
      <el-button @click="summit"> 更新 </el-button>
    </div>
  </el-dialog>

</template>



<style scoped lang="scss">
.table-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.centered-table {
  max-width: 90%;
  margin: 20px;
  //box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.button-container {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */
  padding: 20px 0;         /* 顶部和底部的间距，可以根据需要调整 */
}
</style>