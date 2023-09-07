<script setup>
import {onMounted, reactive, ref} from "vue";
import http from "@/utils/http";
import {useRoute} from "vue-router";

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
  const res = await http.get('/operate/maintain/switchPorts/'+switchParam.value.serial)
  portArr.value = res.data.data
}

async  function getPortConfig(row){
  console.log(row);
  const res = await http.get('/operate/maintain/switchPort/'+switchParam.value.serial+"/"+row.portId)
  portParam.value = res.data.data;
}



const dialogTableVisible = ref(false)
const tableData = ref([
  {
    description: '交换机',
    type: 'input',
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
    options: [
      { value: '0', label: '自动协商' },
      { value: '1', label: '100兆位(自动)' },
      { value: '2', label: '100 兆位半双工(自动)' },
      { value: '3', label: '100 兆位全双工(强制)' },
      { value: '4', label: '10 兆位(自动)' },
      { value: '5', label: '10 兆位半双工(强制)' },
      { value: '6', label: '10 兆位全双工(强制)' },
    ]
  },
  {
    description: '端口计划',
    type: 'select',
    value: '',
    options: [
      { value: '0', label: '自动协商' },
      { value: '1', label: '100兆位(自动)' },
      { value: '2', label: '100 兆位半双工(自动)' },
      { value: '3', label: '100 兆位全双工(强制)' },
      { value: '4', label: '10 兆位(自动)' },
      { value: '5', label: '10 兆位半双工(强制)' },
      { value: '6', label: '10 兆位全双工(强制)' },
    ]
  },
  {
    description: '标签',
    type: 'portStatus',
    value: '启用'
  },
  {
    description: '端口简介',
    type: 'portStatus',
    value: '启用'
  },
  {
    description: '类型',
    type: 'button',
    value: '点击我'
  },
  {
    description: 'RSTP',
    type: 'portStatus',
    value: '启用'
  },
  {
    description: 'STP防护',
    type: 'button',
    value: '点击我'
  },
  {
    description: '端口隔离',
    type: 'portStatus',
    value: '启用'
  }
]);
</script>

<template>
  <div class="table-container">
    <el-table :data="portArr" stripe class="centered-table">
      <el-table-column prop="name" label="名称" width="180">{{switchParam.name}}</el-table-column>
      <el-table-column  label="mac" width="180">{{switchParam.mac}}</el-table-column>
      <el-table-column prop="portId" label="交换机/端口" width="180"></el-table-column>
      <el-table-column prop="type" label="类型" width="180"></el-table-column>
      <el-table-column prop="vlan" label="vlan" width="180"></el-table-column>
<!--      <el-table-column prop="receivedBytes" label="已接收字节" width="180"></el-table-column>-->
<!--      <el-table-column prop="sentBytes" label="已发送字节" width="180"></el-table-column>-->
      <el-table-column  label="功能" width="180">
        <template #default="scope">
          <el-button type="primary" plain @click="getPortConfig(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <el-dialog v-model="dialogTableVisible" title="更新端口">
    <el-table :data="tableData" border :show-header="false">
      <el-table-column label="描述信息" prop="description"></el-table-column>
      <el-table-column label="值">
        <template v-slot:default="scope">
          <el-input v-if="scope.row.type === 'input'" v-model="scope.row.value"></el-input>
          <el-button v-if="scope.row.type === 'button'">{{ scope.row.value }}</el-button>
          <div v-if="scope.row.type === 'portStatus'">
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

        </template>
      </el-table-column>
    </el-table>
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>