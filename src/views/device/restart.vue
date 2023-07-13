<template>
  <single-data-view>
    <template #header>
      <el-card class="count-card">
        <el-row justify="space-evenly">
          <el-form class="restart-form" ref="formRef" label-position="left" :inline="true" :model="networkForm"
                   label-width="40px" size="large">
            <el-form-item label="门店"
                          prop="networkId">
              <el-select v-model="networkForm.networkId"
                         filterable
                         remote
                         placeholder="请输入门店号"
                         :remote-method="remoteMethod"
                         :loading="loading">

                <el-option v-for="item in storeOptions" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item>
              <div ></div>
              <el-button class="restart-button"
                         type="primary" plain
                         @click="openRebootDialog(networkForm)">AP 重启</el-button>
              <el-button class="restart-button"
                         type="primary" plain
                         @click="reset">重 置</el-button>
            </el-form-item>
          </el-form>
        </el-row>
      </el-card>

      <el-card class="count-card">
        <template #header>
          <el-row>
            操作手册
          </el-row>
        </template>
        <el-row>
          <el-col>1.输入门店号，查找对应的门店列表；</el-col>
        </el-row>
        <el-row>
          <el-col>2.如需切换门店，点击【重置】，重新输入选择；</el-col>
        </el-row>
        <el-row>
          <el-col>3.确认门店后，点击【AP 重启】，弹出AP列表对话框；</el-col>
        </el-row>
        <el-row>
          <el-col>4.确认重启的AP信息，勾选需要重启的AP；</el-col>
        </el-row>
        <el-row>
          <el-col>5.点击弹框中的【AP 重启】，将触发重启命令；</el-col>
        </el-row>
        <el-row>
          <el-col>6.触发成功后，会提示"重启成功"，反之会提示失败的AP序列；</el-col>
        </el-row>

      </el-card>
    </template>
  </single-data-view>

  <el-dialog
      v-model="restartDialogVisible"
      title="确定重启以下无线AP"
  >
    <div style="padding: 0px 0px 10px 0px">
      <el-table ref="multipleTableRef"
                :data="rebootDeviceList"
                border style="width: 100%"
                @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column prop="status" label="状态" align="center" width="60">
          <template #default="scope">
            <el-tag :type="getTagTypeByStatus(scope.row.status)">
              {{ statusEnum.getDescFromValue(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="无线AP" align="center"></el-table-column>
        <el-table-column prop="serial" label="序列号" align="center"></el-table-column>
      </el-table>
    </div>

    <template #footer>
      <el-button type="primary" plain @click="rebootWireless" :loading="restartLoading">AP 重启</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import {reactive, ref, onMounted, computed} from 'vue';
import http from "@/utils/http";
import {ElMessage} from 'element-plus/lib/components';
import SingleDataView from '@/components/SingleDataView';
import {createEnumByOptions} from "@/utils/enums";
import tool from "@/utils/tool";
import {getTagTypeByStatus} from './device';


const restartDialogVisible = ref(false);
const networkForm = reactive({});
const networkOptions = reactive([]);
const rebootDeviceList = reactive([]);
const deviceStatusOptions = reactive([]);
const storeOptions = reactive([]);
const loading = ref(false);
const restartLoading = ref(false);
const multipleSelection = ref(null);

const statusEnum = computed(() => {
  return createEnumByOptions(deviceStatusOptions);
});

/**
 * 查询门店网络选项
 */
async function getStoreNetworkOptions(options) {
  const { data: store } = await http.post('/sys/redis/value', {key: 'DICT:STORE_ORG_ID'});
  const storeOrgId = store.data.value;
  const { data: storeRes } = await http.post('/sys/redis/value', {key: 'DICT:NETWORK_NAME:ORG_ID:'+ storeOrgId});
  const storeNetworkNameDict = JSON.parse(storeRes.data.value);

  options.length = 0;
  for(let networkId in storeNetworkNameDict) {
    const data = {
      label: storeNetworkNameDict[networkId],
      value: networkId,
    };
    options.push(data);
  }
}

/**
 * 改变下拉选项
 */
function remoteMethod(val) {
  storeOptions.length = 0
  if (val) {
    loading.value = true;
    networkOptions.forEach((item) => {
      if (item.label.toLowerCase().includes(val.toLowerCase())) {
        storeOptions.push({
          label: item.label,
          value: item.value,
        })
      }
    })
    loading.value = false;
  }
}

/**
 * 打开重启对话框
 */
async function openRebootDialog(form) {
  if (!form.networkId) {
    return ElMessage.warning('请选择门店！');
  }

  await listDevice(form.networkId, 'wireless');
  if (rebootDeviceList.length === 0) {
    return ElMessage.error('所选门店未查询到AP设备！');
  }

  restartDialogVisible.value = true;
}

/**
 * 查询无线AP
 */
async function listDevice(networkId, productType) {
  const {data: res} = await http.post('/device/list', {networkId: networkId, productType: productType});
  if (!res.success) {
    return ElMessage.error(res.msg);
  }
  rebootDeviceList.length = 0;
  res.data.forEach((device) => {
    rebootDeviceList.push({
      name: device.name,
      status: device.status,
      serial: device.serial,
      organizationId: device.organizationId,
    });
  })
}

/**
 * 监听多选框
 */
function handleSelectionChange(val) {
  multipleSelection.value = val;
}

function reset(){
  networkForm.networkId = '';
}

/**
 * 重启无线AP
 */
async function rebootWireless() {
  if (multipleSelection.value == null || multipleSelection.value.length === 0) {
    return ElMessage.warning('请选择无线AP！');
  }

  restartLoading.value = true;
  const {data: res} = await http.post('/network/device/reboot', multipleSelection.value);
  restartLoading.value = false;
  if (!res.success) {
    return ElMessage.error(res.msg);
  }
  restartDialogVisible.value = false;
  return ElMessage.success(res.msg);
}


onMounted(() => {
  getStoreNetworkOptions(networkOptions);
  tool.getOptions(deviceStatusOptions, 'DEVICE_STATUS');
});


</script>

<style lang="scss">

.count-card {
  background: #000000;
  margin-bottom: 10px;
}

.restart-form{
  .el-form-item--large .el-form-item__label{
    font-size: 16px;
  }
  .el-select .el-input__inner{
    font-size: 16px;
  }
  .restart-button {
    font-size: 16px;
  }
}

</style>
