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
            <el-option v-for="org in organizationOptions" :key="org.value" :label="org.label" :value="org.value"></el-option>
          </el-select>
        </el-col>
      </el-row>

     <el-row>
       <el-col>
         选择要转移的网络
       </el-col>
       <el-col>
         <el-select v-model="fromNetwork" placeholder="选择转移前的网络">
           <el-option v-for="network in networkOptions" :key="network.value" :label="network.label" :value="network.value"></el-option>
         </el-select>
       </el-col>
     </el-row>

      <el-row>
        <el-col>
          选择要转移到的目标组织
        </el-col>
        <el-col>
          <el-select v-model="toOrg" placeholder="选择转移后的org">
            <el-option v-for="org in organizationOptions" :key="org.value" :label="org.label" :value="org.value"></el-option>
          </el-select>
        </el-col>
      </el-row>

      <el-button @click="confirmTransfer">确认选择</el-button>
    </div>

    <!-- 二次确认组件 -->
    <el-dialog v-if="showConfirmDialog" title="二次确认" width="30%" v-model="showConfirmDialog">
      <p>您确定要从 {{ fromOrg }} 的 {{ fromNetwork }} 转移到 {{ toOrg }} 吗？</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showConfirmDialog = false">取消</el-button>
        <el-button type="primary" @click="showDetails">确认转移</el-button>
      </span>
    </el-dialog>


    <div>
      <h3>变更前信息:</h3>

      <h3>变更后信息:</h3>
    </div>

    <!-- 操作按钮 -->
    <div v-if="showDetailsSection">
      <el-checkbox v-model="confirmCheck">确认转移</el-checkbox>
      <el-button type="primary" @click="startTransfer" :disabled="!confirmCheck">开始转移</el-button>
    </div>
  </div>
</template>

<script>
import {onMounted, reactive, ref} from "vue";
import {getNetworkOptions, getOrganizationOptions} from "@/views/device/device";
import {ElLoading} from 'element-plus/lib/components';

export default {
  name: "TransferPage",
  setup() {
    onMounted(async()=>{
      await getOrganizationOptions(organizationOptions);
    });


    const organizationOptions = reactive([]);
    const networkOptions = reactive([]);
    const fromOrg = ref("");
    const fromNetwork = ref("");
    const toOrg = ref("");
    const showConfirmDialog = ref(false);
    const showDetailsSection = ref(false);
    const confirmCheck = ref(false);

    const confirmTransfer = () => {
      showConfirmDialog.value = true;
    };

    const showDetails = () => {
      showConfirmDialog.value = false;
      showDetailsSection.value = true;
    };

    const startTransfer = () => {
      // 这里添加后台同步和转移的逻辑
    };
    const changeOrg = async (v)=>{
      const loading =  ElLoading.service({
        lock: true,
        text: '网络列表加载中...',
        background: 'rgba(0, 0, 0, 0.7)',
      })
      await getNetworkOptions(v, networkOptions);
      loading.close();
    };

    return {
      fromOrg,
      fromNetwork,
      toOrg,
      showConfirmDialog,
      showDetailsSection,
      networkOptions,
      confirmCheck,
      organizationOptions,
      confirmTransfer,
      showDetails,
      startTransfer,
      changeOrg
    };
  },

};
</script>

<style scoped>
.transfer-container {
  padding: 20px;
}

.selection-section {
  justify-content: center;
  display: flex;
  gap: 10px;
}
</style>
