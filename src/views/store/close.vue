<template>
  <div class="large-page">
    <el-collapse v-model="activeNames" class="collapse-body" >
      <el-collapse-item title="基本信息" name="1">
        <div class="content-section">
          <compo-form
              ref="organizationFormRef"
              :form-params="organizationSchema"
              form-type="table"
              @changeSelect="changeSelect"
              @disabledButton="handleDisabledButton"
          >
          </compo-form>
          <div class="button-section">
            <el-button
                :disabled="disabledButton"
                type="primary"
                @click="confirmCloseStore"
            >
              确认关店
            </el-button>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import {getCurrentInstance, onMounted, reactive, ref} from 'vue'
import {getNetworkOptions, getOrganizationOptions} from "@/views/device/device";
import http from "@/utils/http";
import {ElMessage} from "element-plus/lib/components";
import tool from "@/utils/tool";

// 数据
const checked = ref(false)
const currentStep = ref(1)
const activeNames = ref(['1', '2', '3', '3', '4', '5',]);
const networkOptions = reactive([]);
const organizationOptions = reactive([]);
const organizationFormRef = ref(null);
const networkStatusOptions = reactive([]);
let remoteNetworkOptions = reactive([]);
const { proxy } = getCurrentInstance();

const disabledButton = ref(true);

function confirmCloseStore() {

  proxy.$prompt('请输入门店号', '', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    inputErrorMessage: '无效的门店ID'
  })
      .then(({value}) => {
        if(value !== netName.value){
          alert("输入门店号与选择不一致, 请重试");
          return;
        }
        submitCloseStore(netID.value);
      })
      .catch(() => {
        proxy.$message({
          type: 'info',
          message: 'Input canceled'
        })
      })
}

onMounted(() => {
  tool.getOptions(networkStatusOptions, 'DEVICE_STATUS');
  getOrganizationOptions(organizationOptions);
})

const organizationSchema = {
  formItems: [
    {
      label: '选择组织', prop: 'organizationId', type: 'select',
      config: {options: organizationOptions},
      rules: true,
    },
    {
      label: '选择网络', prop: 'networkId', type: 'select',
      config: {options: networkOptions,remote: true, placeholder: '请输入'},
      rules: true,
    }]
};

async function submitCloseStore(val) {
  const {data: res} = await http.post(
      '/operate/network/closeStore',
       {networkId: val}
  );
  if (!res.success) {
    ElMessage.error(res.msg);
  }else{
    proxy.$message({
      type: 'success',
      message: '关店成功'
    });
  }
}

const netName = ref('');
const  netID= ref('');
async  function changeSelect(prop, val) {

  if (prop === 'organizationId') {
    await getNetworkOptions(val, networkOptions);
  } else if (prop === 'networkId') {

    if(val === ''){
      // remoteNetworkOptions.length = 0;
    }else{
      networkOptions.forEach((item)=>{
        console.log(item.value);
        if(val === item.value){
          netID.value = val;
          netName.value = item.label;
        }
      });
    }
  }
}
function handleDisabledButton(val) {
  disabledButton.value = val;
}

</script>
<style>

.collapse-body {
  justify-content: center;
  margin-top: 40px;
  margin-left: 90px;
  margin-right: 90px;
}
.large-page {
  overflow-y: auto;
  max-height: 890px;
}
.button-section {
  position: relative;
  margin: 10px 300px;
}
</style>
