<template>
  <el-container class="el-container">
    <el-main class="el-main">
      <compo-table
          ref="compoTableRef"
          :table-params="networkForms"
      >
        <template #tableTextSlot="slotProps">
          <div v-if="slotProps.prop ==='id'">
            <el-link type="primary" @click="routeNetworkPage(slotProps.cellValue)">
              {{slotProps.cellValue}}
            </el-link>
          </div>
        </template>

        <template #tableDefinedSlot="slotProps">
          <div v-if="slotProps.prop === 'operator'">
            <el-link
                type="primary"
                href="javascript:;"
                @click="openUpdateDialog(slotProps.scope.row)"
            >
              Update Segment
            </el-link>
            <el-link
                type="primary"
                href="javascript:;"
                @click="openUpdateSwitch(slotProps.scope.row)"
            >
              Update Switch Ports
            </el-link>
          </div>
        </template>
      </compo-table>
  </el-main>
  </el-container>
</template>

<script setup>

import {onMounted, reactive} from "vue";
import CompoTable from "@/components/compoTable/index.vue";
import {getOrganizationOptions} from "@/views/device/device";
import {useRouter} from "vue-router";

const compoTableRef = reactive();

const organizationOptions = reactive([]);

const columns = [
  {label: 'ID', prop: 'id'},
  {label: 'Organization', prop: 'organizationId', sortable: true, minWidth: '150px', showOverflowTooltip: true},
  {label: 'Network', prop: 'name', sortable: true, showOverflowTooltip: true},
  {label: 'SwitchName', prop: 'switchNum', sortable: true},
  {label: 'AP wireless', prop: 'wirelessNum', sortable: true},
];

function routeNetworkPage(id) {
    router.push({
      params: id,
      url: '',
    });
}

const router = useRouter();

const queryForm = [
    {
      label: '组织', prop: 'organizationId', type: 'select', fixedSpan: 100,
      config: {options: organizationOptions, clearable: false}
    }
];

const mockData = [
  {
    "id": 1111,
    "alarmName": "办公室-网络-2.4G信道利用率告警",
    "alarmTemplate": "以下办公室-网络-2.4G信道利用率≥70：",
    "organizationType": "OFFICE",
    "alarmObject": "[\"m18274714861@163.c"
  },
];

const networkForms = {
  query: {
    url: '/network/table',
    form: {formItems: queryForm}
  },
  tableData: mockData,
  columns: columns,
  config: {
    page: true,
  },
  update: {
    url: '/alarm/config/update',
  }
};


onMounted(() => {
  getOrganizationOptions(organizationOptions);
})
</script>

<style scoped>
.el-main {
  background-color: #000;
  color: #333;
  text-align: center;
  margin: 1.7em 0.48em 0;
  flex-wrap: wrap;
}
</style>
