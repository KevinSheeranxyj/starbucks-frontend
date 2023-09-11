<script>
import {ref, onMounted} from "vue";
import http from "@/utils/http";
import {useRoute} from "vue-router";
import {ElMessage} from "element-plus/lib/components";

export default {
  name: "subNet",

  setup() {
    const isDialogVisible = ref(false);
    const selectedRow = ref({});
    const form = ref([]);
    const data = ref([]);
    const subnetParam = ref({});
    const route = useRoute();
    const getData = async () => {
      if (Object.keys(route.query).length > 0) {
        subnetParam.value = route.query;
      }
      const res = await http.get("/operate/maintain/networkVlans/" + subnetParam.value.organizationId + '/' + subnetParam.value.networkId);
      data.value = res.data.data;
    };
    const rowClick = (row) => {
      console.log(row);
      selectedRow.value = { ...row }; // 创建行数据的副本
      isDialogVisible.value = true; // 显示对话框
      console.log(selectedRow);
    };
    const updateData = async () => {
      // 在这里你可以更新 `data.value` 或发送更新给后端
      const params = {...selectedRow.value};
      params.organizationId = subnetParam.value.organizationId;
      const res = await http.post("operate/maintain/updateVlan",params);
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
    };

    // 如果您想在组件挂载后执行某些操作，可以这样做：
    onMounted(() => {
      getData();
    });

    return {
      form,
      data,
      isDialogVisible,
      selectedRow,
      getData,
      rowClick,
      updateData
    };
  },

}
</script>

<template>
  <div class="form-container">
    <el-table :data="data" label-width="150px" @row-click="rowClick">
      <el-table-column label="名称" width="180">
        <template #default="scope">
            <span style="margin-left: 10px">{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="子网信息" width="180">
        <template #default="scope">
          {{scope.row.subnet}}
        </template>
      </el-table-column>

      <el-table-column label="mxIP" width="180">
        <template #default="scope">
        {{scope.row.applianceIp}}
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="编辑信息" v-model="isDialogVisible" width="30%" :close-on-press-escape="false" :close-on-click-modal="false">
      <el-form :model="selectedRow" label-position="left">
        <el-form-item label="子网信息" style="width: 80%">
          <el-input v-model="selectedRow.subnet"></el-input>
        </el-form-item>
        <el-form-item label="&nbsp;&nbsp;mxIP&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" style="width: 80%">
          <el-input v-model="selectedRow.applianceIp"></el-input>
        </el-form-item>
      </el-form>
      <center>
        <span slot="footer" class="dialog-footer" >
        <el-button type="primary" @click="updateData">确 定</el-button>
      </span>
      </center>
    </el-dialog>

    </div>


</template>

<style scoped lang="scss">
.form-container {
  max-width: 500px;
  margin: 50px auto;
}

.subnet-input {
  margin-top: 10px;
}
</style>