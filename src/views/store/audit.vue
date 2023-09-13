<template>
  <div class="container" style="color:#00ff00;">
    <el-container class="el-container">
      <el-main class="el-main">

        <!-- 新增的筛选区域 -->
        <el-form :inline="true" class="filter-form">
          <el-row>
            <el-col :span="4">
              <el-form-item label="操作类型">
                <el-select v-model="searchForm.selectedOperationType" placeholder="选择操作类型" @change="filterData">
                  <el-option
                      v-for="item in operationTypesOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="4">
              <el-form-item label="状态类型">
                <el-select v-model="searchForm.selectedStatusType" placeholder="选择审核状态"
                           @change="statusFilteredData">
                  <el-option
                      v-for="item in auditStatusOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="5">
              <el-form-item label="开始时间">
                <el-date-picker
                    v-model="searchForm.createdStart"
                    type="date"
                    placeholder="Pick a day"
                />
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="结束时间">
                <el-date-picker
                    v-model="searchForm.createdEnd"
                    type="date"
                    placeholder="Pick a day"
                />
              </el-form-item>
            </el-col>

            <el-col :span="4">
              <el-form-item label="处理人">
                <el-input v-model="searchForm.auditPerson" placeholder="请输入..."></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="4">
              <el-form-item label="提交人">
                <el-input v-model="searchForm.submitPerson" placeholder="请输入..."></el-input>
              </el-form-item>
            </el-col>

          </el-row>
        </el-form>

        <el-row>
          <el-col :span="20"></el-col>
          <el-col :span="4">
            <el-button-group class="compo-button-group">
              <el-button type="primary" plain @click="queryTable">查 询</el-button>
              <el-button @click="resetSearch">重 置</el-button>
            </el-button-group>
          </el-col>
        </el-row>

        <el-tabs
            v-model="activeName"
            type="card"
            class="demo-tabs"
            @tab-click="handleClick"
        >
         <el-tab-pane label="待审核" name="readyAudit">
           <el-table :data="filteredData" class="table,el-table" align="center" header-align="center">
             <el-table-column prop="createdBy" label="提交人"></el-table-column>
             <el-table-column prop="createdAt" label="提交日期"></el-table-column>
             <el-table-column prop="type" label="操作类型"></el-table-column>
             <el-table-column prop="auditStatus" label="操作状态"></el-table-column>
             <el-table-column prop="updatedBy" label="处理人"></el-table-column>
             <el-table-column prop="updatedAt" label="处理时间"></el-table-column>
             <el-table-column label="操作" width="180">
               <template #default="scope">
                 <el-link class="action-link" type="primary" @click="openDetailDialog(scope.row.id)">查看详情</el-link>
                 <el-link v-if="scope.row.auditStatus === '初始化'" class="action-link" type="success"
                          @click="approveDialog(scope.row.id)">通过
                 </el-link>
                 <el-link v-if="scope.row.auditStatus === '初始化'" class="action-link" type="danger"
                          @click="rejectDialog(scope.row.id)">拒绝
                 </el-link>
               </template>
             </el-table-column>
           </el-table>
         </el-tab-pane>

          <el-tab-pane label="已审核" name="audited">
            <el-table :data="filteredData" class="table,el-table" align="center" header-align="center">
              <el-table-column prop="createdBy" label="提交人"></el-table-column>
              <el-table-column prop="createdAt" label="提交日期"></el-table-column>
              <el-table-column prop="type" label="操作类型"></el-table-column>
              <el-table-column prop="auditStatus" label="操作状态"></el-table-column>
              <el-table-column prop="updatedBy" label="处理人"></el-table-column>
              <el-table-column prop="updatedAt" label="处理时间"></el-table-column>
              <el-table-column label="操作" width="180">
                <template #default="scope">
                  <el-link class="action-link" type="primary" @click="openDetailDialog(scope.row.id)">查看详情</el-link>
                  <el-link v-if="scope.row.auditStatus === '初始化'" class="action-link" type="success"
                           @click="approveDialog(scope.row.id)">通过
                  </el-link>
                  <el-link v-if="scope.row.auditStatus === '初始化'" class="action-link" type="danger"
                           @click="rejectDialog(scope.row.id)">拒绝
                  </el-link>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>


        </el-tabs>

        <el-pagination
            :current-page="pagination.currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pagination.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.totalItems"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            class="el-pagination"
        >
        </el-pagination>


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

        <div v-else>
           <el-button @click="centerDialogVisible = false">关闭</el-button>
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

import {computed, onMounted, reactive, ref} from "vue";
import http from "@/utils/http";

onMounted(() => {
  getNetData();
});

const centerDialogVisible = ref(false);
const dialogTitle = ref('');
const dialogContent = ref('');
const dialogAction = ref('');
const dialogWidth = ref('30%');
const selectedID = ref('');


const isDetail = ref(false);

const activeName = ref('readyAudit')
const handleClick = (tab, event) => {
  console.log(tab.props.name);
}

function openDetailDialog(id) {
  isDetail.value = true;
  dialogContent.value = '';
  dialogWidth.value = "70%";
  showAuditDetail(id);
}

function approveDialog(id) {
  setDialogConfig("确认通过", `确定要通过ID为 ${id} 的请求吗？`, 'approve', "30%", true, id);
}

function rejectDialog(id) {
  setDialogConfig("确认拒绝", `确定要拒绝ID为 ${id} 的请求吗？`, 'reject', '30%', true, id);
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
  // 你可以在这里进行实际的"通过"操作，如API调用等
  centerDialogVisible.value = false;
  updataStatus(2, selectedID.value);
}

function doReject() {
  // 你可以在这里进行实际的"拒绝"操作，如API调用等
  centerDialogVisible.value = false;
  updataStatus(3, selectedID.value);
}


const searchForm = ref({
  selectedOperationType: '',
  selectedStatusType: '',
  auditStatus: '',
  createdStart: '',
  createdEnd: '',
  auditPerson: '',
  submitPerson: '',
})


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


const filteredData = ref([]);

function filterData() {
}

function statusFilteredData() {
}


async function getNetData() {
  var params = {
    "type": '',
    "auditStatus": '',
    "createStart": '',
    "createEnd": '',
    "createdBy": '',
    "updatedBy": ''
  };
  const res = await http.post("/operate/audit/table" + '?page=' + pagination.currentPage + '&limit=' + pagination.pageSize, {});

  if (res.data && res.data.data) {
    res.data.data.forEach(item => {
      // 格式化时间
      if (item.createdAt) {
        item.createdAt = formatDate(item.createdAt);
      }
      if (item.updatedAt) {
        item.updatedAt = formatDate(item.updatedAt);
      }

      if (item.type) {
        item.type = getDescFromValue(operationTypesOptions, item.type);
      }
      if (item.auditStatus) {
        item.auditStatus = getDescFromValue(auditStatusOptions, item.auditStatus);
      }
    });

    pagination.totalItems = res.data.count;
    filteredData.value = res.data.data;
  }
}

function getDescFromValue(arr, value) {
  const found = arr.find(item => item.value === value);
  return found ? found.label : value;
}

function formatDate(date) {
  const dt = new Date(date);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  const hh = String(dt.getHours()).padStart(2, '0');
  const ss = String(dt.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${ss}`;
}

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  totalItems: 0
});

// 当更改分页大小时的处理函数
function handleSizeChange(newSize) {
  pagination.pageSize = newSize;
  getNetData();  // 重新获取数据
}

// 当更改当前页时的处理函数
function handleCurrentChange(newPage) {
  pagination.currentPage = newPage;
  getNetData();  // 重新获取数据
}

function queryTable() {
  console.log(searchForm.value);
}

function resetSearch() {

}

const auditUpdateURL = "/operate/audit/updateAuditStatus";

async function updataStatus(type, id) {
  var parasm = {
    'id': id,
    'auditStatus': type
  }
  let res = await http.post(auditUpdateURL, parasm)

  getNetData();
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
  console.log(detailModel.value);
  centerDialogVisible.value = true
}

</script>


<style scoped>
.el-main {
  max-height: 95vh; /* 这里的100px是预估的值，可以根据实际情况调整 */
  display: flex;
  flex-direction: column;
}

.el-table {
  flex: 1;
  overflow: auto;
}

.el-pagination {
  margin-top: 20px; /* 增加上边距，确保与表格有间距 */
}

.dialog-span {
  font-size: 20px;
  color: white;
  display: block;
  margin-bottom: 15px;
}

/* 新添加的样式 */
.el-container {
  padding: 20px;
}

.table {
  margin-top: 20px;
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