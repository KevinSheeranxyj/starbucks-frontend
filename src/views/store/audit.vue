<template>
  <div class="container">
    <el-container class="el-container">
      <el-main class="el-main">
        <compo-table
          :table-params="table"
          :table-data="mockData"
        >
          <template #tableDefinedSlot="slotProps">
            <div v-if="slotProps.prop === 'operator'">
              <el-link
                  type="primary"
                  href="javascript:;"
                  @click="openDetailDialog(slotProps.scope.row.id)"
              >
                Show Detail
              </el-link>&nbsp;
              <el-link
                  type="primary"
                  href="javascript:;"
                  @click="approveDialog(slotProps.scope.row.id)"
              >
                Approve
              </el-link>&nbsp;&nbsp;
              <el-link
                  type="primary"
                  href="javascript:;"
                  @click="rejectDialog(slotProps.scope.row.id)"
              >
                Reject
              </el-link>
            </div>
          </template>
          <template #dialog>
            <!-- show operation logs-->
            <compo-dialog ref="detailDialogRef"
                          @confirmSuccess="promptSuccess"
                          :dialog-params="showDetailDialog"
            >
            </compo-dialog>
            <!--  confirm dialog          -->
            <compo-dialog ref="approveDialogRef"
                          :dialog-params="showApprovalDialog"
                          @initDialog="initApproval"
                          @confirmSuccess="promptSuccess"
              >
              <template #dialogSlot>
                  <span class="dialog-span">You sure want to approve?</span>
              </template>
            </compo-dialog>
            <!--   reject dialog         -->
            <compo-dialog ref="rejectDialogRef"
                          :dialog-params="showRejectDialog"
                          @initDialog="initApproval"
                          @confirmSuccess="promptSuccess"
              >
              <template #dialogSlot>
                  <span>You sure want to reject?</span>
              </template>
            </compo-dialog>
          </template>
        </compo-table>
      </el-main>
    </el-container>
  </div>
</template>
<script setup>
import CompoTable from "@/components/compoTable/index.vue";
import {computed, reactive, ref} from "vue";
import CompoDialog from "@/components/compoDialog/index.vue";


const detailDialogRef = ref(null);
const approveDialogRef = ref(null);
const rejectDialogRef = ref(null);


function promptSuccess() {

}

function initApproval() {

}

function approveDialog(id) {
  approveDialogRef.value.openDialog();
}

function rejectDialog(id) {
  rejectDialogRef.value.openDialog();
}

const operationTypesOptions = reactive([
  {label: 'Opening Store', value: 'openingStore'},
  {label: 'Closing Store', value: 'closingStore'},
  {label: 'Transferring Store', value: 'transferStore'},
])

const queryForm = [
  {
    label: '操作类型', prop: 'operationType', type: 'select',
    config: {options: operationTypesOptions}
  },
];

const table = {
  query: {
    url: '/store/audit',
    form: {formItems: queryForm},
    reset: false
  },
  columns: [
    {label: 'ID', prop: 'id'},
    {label: '提交人', prop: 'submitPerson'},
    {label: '提交日期', prop: 'submitDate'},
    {label: '操作类型', prop: 'operationType'},
    {label: '操作状态', prop: 'operationStatus'},
    {label: '处理人', prop: 'auditPerson'},
    {label: 'Operations', prop: 'operator', type: 'defined'}
  ]
};
const mockData = ref([
  {
    "id": 1,
    "submitPerson": "Jackson",
    "submitDate": "2023-08-23",
    "operationType": "Opening Store",
    "operationStatus": "Pending",
    "auditPerson": "Kevin",
  },
  {
    "id": 2,
    "submitPerson": "Andy",
    "submitDate": "2023-08-23",
    "operationType": "Closing Store",
    "operationStatus": "Pending",
    "auditPerson": "Stephen",
  },
  {
    "id": 3,
    "submitPerson": "Tom",
    "submitDate": "2023-08-23",
    "operationType": "Transfer Store",
    "operationStatus": "Pending",
    "auditPerson": "Jeff Bezos",
  },
]);

const emailOptions = reactive([
  {label: 'TEST - A', value: 'sinel'},
  {label: 'FEMALE', value: 'female'}
]);

const detailForm = [
  {label: 'A', prop: 'test', type: 'input', minWidth: '120px'},
  {label: 'B', prop: 'test1', type: 'select', minWidth: '120px'},
  {label: 'C', prop: 'test2', type: 'datetime', minWidth: '120px'},
  {
    label: 'D', prop: 'test3', type: 'select', minWidth: '120px',
    config: {options: emailOptions, multiple: true}
  },
  {label: 'E', prop: 'test4', type: 'input', minWidth: '120px'},
  {label: 'F', prop: 'test5', type: 'input', minWidth: '120px'},
];
const showDetailDialog = computed(() => ({
  title: 'Operation Logs',
  url: '/audit/details',
  form: {
    formItems: [
        ...detailForm
    ]
  }
}))

const showApprovalDialog = computed(() => ({
  title: 'Confirmation',
  url: '/audit/approval',
  form: {
    formItems: [{}]
  }
}))

const showRejectDialog = computed(() => ({
  title: 'Confirmation',
  url: '/audit/reject',
  form: {
    formItems: [{}]
  }
}))



function openDetailDialog(id) {
  detailDialogRef.value.openDialog();

}

</script>

<style scoped>
.dialog-span {
  font-size: 20px;
  color: white;
}
</style>
