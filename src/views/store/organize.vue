<template>
  <div class="container">
    <el-row :gutter="20">
      <!-- Tree Menu -->
      <el-col :span="8">
        <div class="tree-container">
          <h3>门店选择</h3>
          <el-tree
              :data="treeData"
              :props="defaultProps"
              @node-click="handleNodeClick"
              highlight-current
          >
          </el-tree>
        </div>
      </el-col>

      <!-- Table -->
      <el-col :span="16">
        <div class="table-container">
          <h3>网络设备信息</h3>
          <el-table :data="tableData" style="width: 100%">
            <el-table-column
                prop="name"
                label="设备名称"
            ></el-table-column>
            <el-table-column
                prop="type"
                label="设备类型"
            ></el-table-column>
            <el-table-column
                prop="ip"
                label="IP 地址"
            ></el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Tree Data
const treeData = ref([
  {
    label: 'Region 1',
    children: [
      {
        label: 'City A',
        children: [
          { label: 'Store 1', type: 'store', devices: [
              { name: 'Router', type: 'Router', ip: '192.168.1.1' },
              { name: 'Switch', type: 'Switch', ip: '192.168.1.2' },
            ]}
        ]
      },
      {
        label: 'City B',
        children: [
          { label: 'Store 2', type: 'store', devices: [
              { name: 'Router', type: 'Router', ip: '192.168.2.1' },
              { name: 'Switch', type: 'Switch', ip: '192.168.2.2' },
            ]}
        ]
      }
    ]
  },
  {
    label: 'Region 2',
    children: [
      {
        label: 'City A',
        children: [
          { label: 'Store 1', type: 'store', devices: [
              { name: 'Router', type: 'Router', ip: '192.168.1.1' },
              { name: 'Switch', type: 'Switch', ip: '192.168.1.2' },
            ]}
        ]
      },
      {
        label: 'City B',
        children: [
          { label: 'Store 2', type: 'store', devices: [
              { name: 'Router', type: 'Router', ip: '192.168.2.1' },
              { name: 'Switch', type: 'Switch', ip: '192.168.2.2' },
            ]}
        ]
      }
    ]
  }
]);

const defaultProps = ref({
  children: 'children',
  label: 'label'
});

// Table Data
const tableData = ref([]);

// Event Handler
const handleNodeClick = (nodeData) => {
  if (nodeData.type === 'store') {
    tableData.value = nodeData.devices;
  } else {
    tableData.value = [];
  }
};
</script>

<style scoped>
.container {
  padding: 20px;
}

.tree-container,
.table-container {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

h3 {
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
}
</style>