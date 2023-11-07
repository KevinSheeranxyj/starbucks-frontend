<template xmlns="">


  <div class="container" style="color:#00ff00;">
    <el-container class="el-container">
      <el-main class="el-main">

        <el-tabs
            v-model="activeName"
            type="card"
            class="demo-tabs"
            @tab-click="handleClick"
        >
          <el-tab-pane label="待审核" name="readyAudit">
            <compo-table
              ref="compoTableReadyRef"
              @reset="afterReset"
              :table-params="table"
            >
            <template #tableDefinedSlot="slotProps">
              <div v-if="slotProps.prop === 'operator'">
                <el-link class="action-link" type="primary" @click="openDetailDialog(slotProps.scope.row)">查看详情</el-link>

                <el-link v-if="slotProps.scope.row.auditStatus === 1" class="action-link" type="success"
                         @click="approveDialog(slotProps.scope.row.id)">通过
                </el-link>
                <el-link v-if="slotProps.scope.row.auditStatus === 1" class="action-link" type="danger"
                         @click="rejectDialog(slotProps.scope.row.id)">拒绝
                </el-link>
              </div>
            </template>
            <template #tableTextSlot="slotProps">
              <div v-if="slotProps.prop === 'createdAt'">
                {{ tool.dateFormat(slotProps.cellValue, 'yyyy-MM-dd hh:mm:ss') }}
              </div>

              <div v-if="slotProps.prop === 'updatedAt'">
                {{ tool.dateFormat(slotProps.cellValue, 'yyyy-MM-dd hh:mm:ss') }}
              </div>
              <div v-if="slotProps.prop === 'type'">
                {{getDescFromValue(operationTypesOptions,slotProps.cellValue)}}
              </div>
              <div v-if="slotProps.prop === 'auditStatus'">
                {{getDescFromValue(auditStatusOptions,slotProps.cellValue)}}
              </div>
            </template>
            </compo-table>
          </el-tab-pane>

          <el-tab-pane label="已审核" name="audited">
            <compo-table
                ref="compoTableRef"
                @reset="afterReset"
                :table-params="table"
            >
              <template #tableDefinedSlot="slotProps">
                <div v-if="slotProps.prop === 'operator'">
                  <el-link class="action-link" type="primary" @click="openDetailDialog(slotProps.scope.row)">查看详情</el-link>

                  <el-link v-if="slotProps.scope.row.auditStatus === 1" class="action-link" type="success"
                           @click="approveDialog(slotProps.scope.row.id)">通过
                  </el-link>
                  <el-link v-if="slotProps.scope.row.auditStatus === 1" class="action-link" type="danger"
                           @click="rejectDialog(slotProps.scope.row.id)">拒绝
                  </el-link>
                </div>
              </template>
              <template #tableTextSlot="slotProps">
                <div v-if="slotProps.prop === 'createdAt'">
                  {{ tool.dateFormat(slotProps.cellValue, 'yyyy-MM-dd hh:mm:ss') }}
                </div>

                <div v-if="slotProps.prop === 'updatedAt'">
                  {{ tool.dateFormat(slotProps.cellValue, 'yyyy-MM-dd hh:mm:ss') }}
                </div>
                <div v-if="slotProps.prop === 'type'">
                  {{getDescFromValue(operationTypesOptions,slotProps.cellValue)}}
                </div>
                <div v-if="slotProps.prop === 'auditStatus'">
                  {{getDescFromValue(auditStatusOptions,slotProps.cellValue)}}
                </div>
              </template>
            </compo-table>
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
  </div>


  <el-dialog v-model="centerDialogVisible" :title="dialogTitle" :width="dialogWidth" center>
    <span>{{ dialogContent }}</span>

    <template #footer>
      <span class="dialog-footer">

        <div v-if="!isDetail">
          <el-button @click="centerDialogVisible = false">关闭</el-button>
          <el-button v-if="dialogAction === 'reject'" type="danger" @click="doReject()">确认拒绝</el-button>
          <el-button v-if="dialogAction === 'approve'" type="success" @click="doApprove()">确认通过</el-button>
        </div>

        <div v-else-if="isCanBack">
           <el-button @click="backAction">回退</el-button>
        </div>

        <div v-else>
           <el-button @click="doAction">立即执行</el-button>
        </div>

      </span>
    </template>


    <div v-if="isDetail">
      <div v-if="detailModel.operateDeviceInfoVoList.length>0 && isDetail">

        <el-divider content-position="left">网络设备信息</el-divider>
        <el-row>
          <el-col :span="4"><strong>名称</strong></el-col>
          <el-col :span="4"><strong>SN</strong></el-col>
          <el-col :span="4"><strong>型号</strong></el-col>
          <el-col :span="4"><strong>MAC</strong></el-col>
          <el-col :span="4"><strong>地址</strong></el-col>
        </el-row>
        <div v-for="formData in detailModel.operateDeviceInfoVoList" :key="formData.id">
          <el-form label-width="120px" class="horizontal-form">

            <el-row>
              <el-col :span="4">{{ formData.name }}</el-col>
              <el-col :span="4">{{ formData.serial }}</el-col>
              <el-col :span="4">{{ formData.model }}</el-col>
              <el-col :span="4">{{ formData.mac }}</el-col>
              <el-col :span="4">{{ formData.address }}</el-col>
            </el-row>

          </el-form>
        </div>
      </div>

      <div v-else style="text-align: center;">
        <el-divider/>
        <strong>暂无网络设备</strong>
      </div>

      <div v-if="detailModel.operateNetworkVlanVOList.length>0  && isDetail">
        <el-divider content-position="left">子网信息</el-divider>
        <el-row>
          <el-col :span="5"><strong>名称</strong></el-col>
          <el-col :span="4"><strong>mxIP</strong></el-col>
          <el-col :span="4"><strong>子网</strong></el-col>
        </el-row>
        <div v-for="formData in detailModel.operateNetworkVlanVOList" :key="formData.id">
          <el-form label-width="120px" class="horizontal-form">
            <el-row>
              <el-col :span="5">{{ formData.name }}</el-col>
              <el-col :span="4">{{ formData.mxIp }}</el-col>
              <el-col :span="4">{{ formData.subnet }}</el-col>
            </el-row>
          </el-form>
        </div>
      </div>
      <div v-else style="text-align: center;">
        <el-divider/>
        <strong>暂无子网信息</strong>
      </div>

    </div>
  </el-dialog>


</template>

<script setup>

import {onMounted, reactive, ref} from "vue";
import http from "@/utils/http";
import {ElLoading,ElMessage} from "element-plus/lib/components";
import tool from "@/utils/tool";


const operationTypesOptions = reactive([
  {label: '开店', value: 1},
  {label: '关店', value: 2},
  {label: '转移', value: 3},
  {label: '回退', value: 4},
]);
const auditStatusOptions = reactive([
  {label: '初始化', value: 1},
  {label: '同意', value: 2},
  {label: '驳回', value: 3},
  {label: '自动同意', value: 4},
]);


onMounted(() => {
  activeName.value = "readyAudit";
  queryTable();
});
function afterReset(){
  queryTable()
}


// 表格列
const columns = [
  {label: '提交人', prop: 'createdBy'},
  {label: '提交日期', prop: 'createdAt' },
  {label: '操作类型', prop: 'type'},
  {label: '操作状态', prop: 'auditStatus'},
  {label: '处理人', prop: 'updatedBy'},
  {label: '处理时间', prop: 'updatedAt'},
  {label: '操作', prop: 'operator', type: 'defined'}
];

// 查询表单
const queryForm = [
  {
    label: '提交人', prop: 'submitPerson', type: 'input',
  },
  {
    label: '开始日期', prop: 'createdStart', type: 'date',
     config: {valueFormat: "YYYY-MM-DD"},
  },
  {
    label: '结束日期', prop: 'createdEnd', type: 'date',
     config: {valueFormat: "YYYY-MM-DD"},
  },
  {
    label: '操作类型', prop: 'selectedStatusType', type: 'select',
    config: {options: operationTypesOptions, placeholder: '请输入',},
  },
  {
    label: '操作状态', prop: 'selectedStatusType', type: 'select',
    config: {options: auditStatusOptions, placeholder: '请输入',},
  },
  {
    label: '处理人', prop: 'auditPerson', type: 'input',
    config: {placeholder: '请输入',},
  },
];
const table = {
  query: {
    url: '/operate/audit/table',
    form: {formItems: queryForm},
  },
  columns: columns,
  config: {page: true,},
};
const compoTableRef = ref(null);
const compoTableReadyRef = ref(null);

const centerDialogVisible = ref(false);
const dialogTitle = ref('');
const dialogContent = ref('');
const dialogAction = ref('');
const dialogWidth = ref('30%');
const selectedID = ref('');


const isDetail = ref(false);
const isCanBack = ref(false);

const activeName = ref('readyAudit')


const handleClick = (tab, event) => {

  if(tab.props.name === "audited"){
    const  queryForm = {
      auditStatus:2,
    };
    compoTableRef.value.setForm(queryForm);
    compoTableRef.value.query()
  }else{
    const queryForm = {
      auditStatus:1,
    };
    compoTableReadyRef.value.setForm(queryForm);
    compoTableReadyRef.value.query();
  }
}


/// 打开弹窗, 设置是否显示 回退 按钮的逻辑
function openDetailDialog(row) {
  isDetail.value = true;
  dialogContent.value = '';
  dialogWidth.value = "70%";
  isCanBack.value = (row.value === 2 || row.value === 3) && row.executeStatus === 2;
  showAuditDetail(row.id);
}

function approveDialog(id) {
  setDialogConfig("确认通过", `确定要通过吗？`, 'approve', "30%", true, id);
}

function rejectDialog(id) {
  setDialogConfig("确认拒绝", `确定要拒绝吗？`, 'reject', '30%', true, id);
}

// 执行操作
async function doAction(row) {

  const {data: res} = await http.post("/operate/network/execute", {id: selectedID.value})

  const loading =  ElLoading.service({
    lock: true,
    text: '请稍后...',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  if (res.success) {
    loading.close();
    ElMessage.success('执行成功');
  } else {
    loading.close();
    ElMessage.error(res.msg);
  }

}

async function backAction() {
  const {data:res} = http.post('operate/audit/rollback',{id: selectedID.value})
  const loading =  ElLoading.service({
    lock: true,
    text: '回退中...',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  if (res.success) {
    loading.close();
    ElMessage.success('执行成功');
  } else {
    loading.close();
    ElMessage.error(res.msg);
  }
  queryTable()
}

function setDialogConfig(title, content, action, width, isShow, id) {
  isDetail.value = false;
  dialogTitle.value = title;
  dialogContent.value = content;
  dialogAction.value = action;
  dialogWidth.value = width;
  centerDialogVisible.value = isShow;
  selectedID.value = id;
}

function doApprove() {
  centerDialogVisible.value = false;
  updataStatus(2, selectedID.value);
}

function doReject() {
  centerDialogVisible.value = false;
  updataStatus(3, selectedID.value);
}



function getDescFromValue(arr, value) {
  const found = arr.find(item => item.value === value);
  return found ? found.label : value;
}

async function queryTable() {
  await compoTableRef.value.query();
  await compoTableReadyRef.value.query();
  // compoTableRef.value.reload();
}



const auditUpdateURL = "/operate/audit/updateAuditStatus";

async function updataStatus(type, id) {
  const params = {
    'id': id,
    'auditStatus': type
  };
  let res = await http.post(auditUpdateURL, params)

  queryTable();
  alert(res.data.msg);
}


const detailModel = ref({
  id: null,
  operateNetworkId: null,
  type: null,
  auditStatus: null,
  parentId: null,
  operateDeviceInfoVoList: [],
  operateNetworkVlanVOList: [],
});

async function showAuditDetail(id) {
  dialogTitle.value = "查看详情"
  const res = await http.post('/operate/audit/detail', {'id': id});
  detailModel.value = res.data.data;
  selectedID.value = id;
  centerDialogVisible.value = true
}

</script>


<style scoped>
.el-main {
  max-height: 95vh; /* 这里的100px是预估的值，可以根据实际情况调整 */
  display: flex;
  flex-direction: column;
}

/* 新添加的样式 */
.el-container {
  padding: 20px;
}


.action-link {
  margin-right: 10px;
  padding: 5px 10px;
  border-radius: 4px;
}

.action-link:not(:last-child) {
  margin-right: 10px;
}

.action-link[type="success"] {
  background-color: #67c23a;
}

.action-link[type="danger"] {
  background-color: #f56c6c;
}

.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}
</style>