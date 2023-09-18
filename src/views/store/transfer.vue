<template>
  <div class="transfer-container">
    <!-- 选择组件 -->
    <div class="selection-section">
      <el-row>
        <el-col>
          请选择转移前的网络信息
        </el-col>
        <el-col>
          <el-select v-model="fromOrg" placeholder="选择转移前的org" @change="changeOrg">
            <el-option v-for="org in organizationOptions" :key="org.value" :label="org.label"
                       :value="org.value"></el-option>
          </el-select>
        </el-col>
      </el-row>

      <el-row>
        <el-col>
          选择要转移的网络
        </el-col>
        <el-col>
          <el-select v-model="fromNetwork" placeholder="选择转移前的网络" @change="getNet">
            <el-option v-for="network in networkOptions" :key="network.value" :label="network.label"
                       :value="network.value"></el-option>
          </el-select>
        </el-col>
      </el-row>

      <el-row>
        <el-col>
          选择要转移到的目标组织
        </el-col>
        <el-col>
          <el-select v-model="toOrg" placeholder="选择转移后的org" @change="getToOrg">
            <el-option v-for="org in organizationOptions" :key="org.value" :label="org.label"
                       :value="org.value"></el-option>
          </el-select>
        </el-col>
      </el-row>

    </div>

    <!-- 二次确认组件 -->
    <el-dialog v-if="showConfirmDialog" title="温馨提示" width="30%" v-model="showConfirmDialog">
      <p>您确定要从 {{ fromOrgLabel }} 的 {{ fromNetWorkLabel }} 转移到 {{ toOrgLabel }} 吗？</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showConfirmDialog = false">取消</el-button>
        <el-button type="primary" @click="showDetails">确认转移</el-button>
      </span>
    </el-dialog>


    <center>
      <h3>变更前信息:</h3>
      {{ fromOrgLabel + ' 组织下 ' + fromNetWorkLabel + ' 网络节点' }}
      <h3>变更后信息:</h3>
      {{ toOrgLabel }}
      <br/>
      <br/>
      <el-button @click="showConfirmDialog = true">
        提交
      </el-button>
    </center>


  </div>
</template>

<script>
import {onMounted, reactive, ref} from "vue";
import {getNetworkOptions, getOrganizationOptions} from "@/views/device/device";
import {ElLoading, ElMessage} from 'element-plus/lib/components';
import http from "@/utils/http";

export default {
  name: "TransferPage",
  setup() {
    onMounted(async () => {
      await getOrganizationOptions(organizationOptions);
    });


    const organizationOptions = reactive([]);
    const networkOptions = reactive([]);
    const fromOrg = ref("");
    const fromNetwork = ref("");
    const toOrg = ref("");
    const showConfirmDialog = ref(false);
    const confirmCheck = ref(false);

    const fromOrgLabel = ref('待选择');
    const fromNetWorkLabel = ref('待选择');
    const toOrgLabel = ref('');

    const showDetails = async () => {

      const loading = ElLoading.service({
        lock: true,
        text: '转移中...',
        background: 'rgba(0, 0, 0, 0.7)',
      })
     const {data:res}= await http.post("operate/network/transfer",{
        "networkId":fromNetwork.value,
        "organizationId":toOrg.value
      })
      loading.close();
      if(res.success){
        ElMessage.success('转移成功');
      }else{
        ElMessage.error(res.msg);
      }
      showConfirmDialog.value = false;
    };

    const startTransfer = () => {
      // 这里添加后台同步和转移的逻辑
    };
    const changeOrg = async (v) => {

      fromOrgLabel.value = findLabelByValue(organizationOptions, v);
      const loading = ElLoading.service({
        lock: true,
        text: '网络列表加载中...',
        background: 'rgba(0, 0, 0, 0.7)',
      })
      await getNetworkOptions(v, networkOptions);
      loading.close();
    };
    const getToOrg = (v) => {
      toOrgLabel.value = findLabelByValue(organizationOptions, v);
    };
    const getNet = (v) => {
      fromNetWorkLabel.value = findLabelByValue(networkOptions, v);
    };
    const findLabelByValue = (options, value) => {
      const selectedOption = options.find(option => option.value === value);
      return selectedOption ? selectedOption.label : '';
    };


    return {
      fromOrg,
      fromNetwork,
      toOrg,
      showConfirmDialog,
      networkOptions,
      confirmCheck,
      organizationOptions,
      fromOrgLabel,
      fromNetWorkLabel,
      toOrgLabel,
      showDetails,
      startTransfer,
      changeOrg,
      getToOrg,
      getNet
    };
  },

};
</script>

<style scoped>
.transfer-container {
  padding: 20px;
//color: whitesmoke;
}

.selection-section {
  justify-content: center;
  display: flex;
  gap: 10px;
}
</style>
