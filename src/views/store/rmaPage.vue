<template>
  <div>
    <el-table :data="tableData">
      <el-table-column prop="mac" label="MAC 地址"></el-table-column>
      <el-table-column prop="serial" label="序列号"></el-table-column>
      <el-table-column prop="networkName" label="网络名"></el-table-column>
      <el-table-column prop="model" label="型号"></el-table-column>
      <el-table-column prop="orderNumber" label="订单号"></el-table-column>
      <el-table-column prop="usedStatus" label="使用状态"></el-table-column>
      <el-table-column prop="claimedAt" label="认领时间"></el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="primary" @click="handleRMA(scope.row)">RMA</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script setup>
import {onMounted, ref} from "vue";
import http from "@/utils/http";
const tableData = ref([])

onMounted(() => {
  getDevices()
});

async function getDevices(){
  const {data:res} = await http.post("device/inventory/table?page=1&limit=10",{networkId:"L_851180329573047180"})
  tableData.value = res.data;
}

async function handleRMA(){
  const {data:res} = await http.post("operate/maintain/rma",{networkId:"L_851180329573047180"})
  tableData.value = res.data;
}
</script>

<style scoped lang="scss">

</style>