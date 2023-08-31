<template>
  <div class="large-page">
    <el-collapse v-model="activeNames" class="collapse-body" >
      <el-collapse-item title="基本信息" name="1">
        <div class="content-section">
          <compo-form
              ref="organizationFormRef"
              :form-params="organizationSchema"
              form-type="table"
          >
          </compo-form>
          <div class="button-section">
            <el-button type="primary"
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
import {getOrganizationOptions} from "@/views/device/device";

// 数据
const checked = ref(false)
const currentStep = ref(1)
const activeNames = ref(['1', '2', '3', '3', '4', '5',]);
const organizationOptions = reactive([]);
const organizationFormRef = ref(null);
const { proxy } = getCurrentInstance();

function confirmCloseStore() {
  proxy.$prompt('请输入门店号', '', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    inputErrorMessage: '无效的门店ID'
  })
      .then(({value}) => {
        proxy.$message({
          type: 'success',
          message: '关店成功' + value
        });

      })
      .catch(() => {
        proxy.$message({
          type: 'info',
          message: 'Input canceled'
        })
      })
}

onMounted(() => {
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
      config: {options: organizationOptions},
      rules: true,
    }]
};

</script>
<style>

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
.large-page {
  overflow-y: auto;
  max-height: 890px;
}
.button-section {
  position: relative;
  margin: 10px 300px;
}
</style>
