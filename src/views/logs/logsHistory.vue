<script setup>
import tool from '@/utils/tool';
import {createEnum} from '@/utils/enums';
import {ref, onMounted, reactive, computed} from 'vue';
import {useRoute} from 'vue-router';
import {ElMessage} from 'element-plus/lib/components';
import http from "@/utils/http";
import {getUserListOptions} from "@/views/device/device";
const route = useRoute();

const compoTableRef = ref(null);
const detailDialogVisible = ref(false);
const detailLogs = ref([]);

const archiveFlagOptions = reactive([
  {label: '未归档', value: 0 },
  {label: '已归档', value: 1 }
]);

const archiveFlagEnum = computed(() => {
  const enumData = {}; archiveFlagEnum
  archiveFlagOptions.forEach((o) => {
    enumData[o.label] = [o.value, o.label];
  });
  return createEnum(enumData);
});

const createdByOptions = reactive([]);
const createdByEnum = computed(() => {
  const enumData = {};
  createdByOptions.forEach((o) => {
    enumData[o.label] = [o.value, o.label];
  });
  return createEnum(enumData);
});
// 表格列
const columns = [
  {label: '操作时间', prop: 'createdAt', width: '140px'},
  {label: '操作人', prop: 'createdBy'},
  {label: '页面', prop: 'page'},
  {label: '操作', prop: 'action', minWidth: '120px'},
  // {label: '接口路径', prop: 'path', minWidth: '180px'},
  {label: '结果', prop: 'result', minWidth: '100px'},
  // {label: '备注', prop: 'remark', minWidth: '100px'},
  // {label: '归档标识', prop: 'archiveFlag'},
  {label: '查看', prop: 'operator', width: '80px', type: 'defined'}
];

// 查询表单
const queryForm = [
  // {
  //   label: '页面', prop: 'page', type: 'input'
  // },
  // {
  //   label: '操作', prop: 'action', type: 'input'
  // },
  {
    label: '页面', prop: 'result', type: 'input'
  },
  {
    label: '操作人', prop: 'createdBy', type: 'select',
    config: {options: createdByOptions, clearable: false},
  },
  {
    label: '开始日期', prop: 'startDate', type: 'date',
    config: {valueFormat: "YYYY-MM-DD"},
  },
  {label: '结束日期', prop: 'endDate', type: 'date',
    config: {valueFormat: "YYYY-MM-DD"},
  },
];

const getTagTypeByArchiveFlag = (value) => {
  switch (value) {
    case 0:
      return 'warning';
    case 1:
      return 'danger'
    default:
      return 'info'
  }
};

const getTagTypeByResult = value => {
  if (value?.includes('失败')) {
    return 'danger'
  } else if (value?.includes('成功')) {
    return 'success'
  }
  return 'info'
}

const table = {
  query: {
    url: '/sys/operateLog/list',
    form: {formItems: queryForm}
  },
  columns: columns,
  config: {
    page: true
  }
};

/**
 * 查询表格
 */
function queryTable() {
  compoTableRef.value.query();
}

function openDetailDialog(row) {
  if (!row?.detailLogs?.length) {
    return ElMessage.warning('未查询到变更详情');
  }
  detailLogs.value = row.detailLogs;
  detailDialogVisible.value = true;
}

onMounted(() => {
  if (Object.keys(route.params).length <= 0) {
    queryTable();
  }
  getUserListOptions(createdByOptions);
});

</script>
<template>
  <!-- 表格组件 -->
  <compo-table
    ref="compoTableRef"
    :table-params="table"
  >
    <template #tableTextSlot="slotProps">
      <div v-if="slotProps.prop === 'archiveFlag'">
        <el-tag :type="getTagTypeByArchiveFlag(slotProps.cellValue)">
          {{ archiveFlagEnum.getDescFromValue(slotProps.cellValue) }}
        </el-tag>
      </div>
      <div v-else-if="slotProps.prop === 'result'">
        <el-tag v-if="slotProps.cellValue" :type="getTagTypeByResult(slotProps.cellValue)">
          {{ slotProps.cellValue }}
        </el-tag>
      </div>
      <div v-else-if="slotProps.prop === 'createdAt'">
        {{ tool.dateFormat(slotProps.cellValue, 'yyyy-MM-dd hh:mm:ss') }}
      </div>

<!--      <div v-if="slotProps.prop === 'createdBy'">-->
<!--        {{ createdByEnum.getDescsFromValues(slotProps.cellValue) }}-->
<!--      </div>-->
    </template>
    <template #tableDefinedSlot="slotProps">
      <div v-if="slotProps.prop === 'operator'">
        <el-link
          type="primary"
          href="javascript:;"
          @click="openDetailDialog(slotProps.scope.row)"
        >变更详情
        </el-link>
      </div>
    </template>

    <template #dialog>
      <el-dialog
        v-model="detailDialogVisible"
        title="变更详情"
        fullscreen
      >
        <div v-for="(item, index) in detailLogs" :key="index">
          <el-divider border-style="dashed" />
          <div class="line"><text>原数据：</text><pre>{{ JSON.parse(item.originalData) }}</pre></div>
          <div class="line"><text>新数据：</text><pre>{{ JSON.parse(item.newData) }}</pre></div>
          <div class="line"><text>变化：</text><pre>{{ item.diff }}</pre></div>
        </div>
      </el-dialog>
    </template>
  </compo-table>
</template>

<style lang="scss" scoped>
.line {
  display: flex;
  color: #CFD3DC;
  margin-bottom: 20px;
  text {
    flex-shrink: 0;
  }
  pre {
    margin: 0 20px;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
}
</style>
