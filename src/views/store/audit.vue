<template>
  <div class="container">
    <el-container class="el-container">
      <el-main class="el-main">
        <compo-table
            ref="compoTableRef"
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
                查看详情
              </el-link>&nbsp;
              <el-link
                  type="primary"
                  href="javascript:;"
                  @click="approveDialog(slotProps.scope.row.id)"
              >
                通过
              </el-link>&nbsp;&nbsp;
              <el-link
                  type="primary"
                  href="javascript:;"
                  @click="rejectDialog(slotProps.scope.row.id)"
              >
                拒绝
              </el-link>
            </div>
          </template>
          <template #dialog>
            <!-- show operation logs-->
            <compo-dialog ref="detailDialogRef"
                          :dialog-params="showDetailDialog"
            >
            </compo-dialog>
            <!--  confirm dialog          -->
            <compo-dialog ref="approveDialogRef"
                          :dialog-params="showApprovalDialog"
              >
              <template #dialogSlot>
                  <span class="dialog-span">You sure want to approve?</span>
              </template>
            </compo-dialog>
            <!--   reject dialog         -->
            <compo-dialog ref="rejectDialogRef"
                          :dialog-params="showRejectDialog"
              >
              <template #dialogSlot>
                  <span>You sure want to reject?</span>
              </template>
            </compo-dialog>
          </template>
          <template #tableTextSlot="slotProps">
            <div v-if="slotProps.prop === 'auditStatus'">
              {{ auditStatusEnum.getDescFromValue(slotProps.cellValue)}}
            </div>
            <div v-if="slotProps.prop === 'type'">
              {{ operationTypesEnum.getDescFromValue(slotProps.cellValue)}}
            </div>
          </template>
        </compo-table>
      </el-main>
    </el-container>
  </div>
</template>
<script setup>
import CompoTable from "@/components/compoTable/index.vue";
import {computed, onMounted, reactive, ref} from "vue";
import CompoDialog from "@/components/compoDialog/index.vue";
import {createEnumByOptions} from "@/utils/enums";


const detailDialogRef = ref(null);
const approveDialogRef = ref(null);
const rejectDialogRef = ref(null);
const compoTableRef = ref(null);


const operationTypesEnum = computed(() => {
  return createEnumByOptions(operationTypesOptions);
});

function approveDialog(id) {
  approveDialogRef.value.openDialog();
}

const auditStatusEnum = computed(() => {
  return createEnumByOptions(auditStatusOptions);
});

function rejectDialog(id) {
  rejectDialogRef.value.openDialog();
}

const operationTypesOptions = reactive([
  {label: '开店', value: 1},
  {label: '关店', value: 2},
  {label: '转移', value: 3},
  {label: '回退', value: 4},
]);

const auditStatusOptions = reactive([
  {label: '初始化', value: '1'},
  {label: '同意', value: '2'},
  {label: '驳回', value: '3'},
  {label: '自动同意', value: '4'},
]);

const queryForm = [
  {
    label: '操作类型', prop: 'operationType', type: 'select',
    config: {options: operationTypesOptions}
  },
];

const table = {
  query: {
    url: '/operate/audit/table',
    form: {formItems: queryForm},
    reset: false
  },
  columns: [
    {label: 'ID', prop: 'id'},
    {label: '操作网络ID', prop: 'operateNetworkId'},
    {label: '审批类型', prop: 'type'},
    {label: '审核状态', prop: 'auditStatus'},
    {label: '操作人', prop: 'createdBy'},
    {label: '操作时间', prop: 'createdAt'},
    {label: '审批人', prop: 'updatedBy'},
    {label: '审批时间', prop: 'updatedAt'},
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

function queryTable() {
  compoTableRef.value.query();
}

function initQuery() {
  compoTableRef.value.setForm(queryForm);
  queryTable();
}

onMounted(() => {
  initQuery();
})

</script>

<style scoped>
.dialog-span {
  font-size: 20px;
  color: white;
}
</style>
