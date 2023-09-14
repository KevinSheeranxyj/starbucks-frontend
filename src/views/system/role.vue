<template>
  <single-data-view>
    <template #header>
      <el-form ref="form" :model="form" label-width="auto">
        <el-button-group class="compo-button-group">
          <el-button type="primary" plain @click="openAddDialog">新 增</el-button>
          <el-button type="primary" plain @click="refreshRedisResource" :loading=refreshLoading>刷新redis资源</el-button>
        </el-button-group>
      </el-form>
    </template>
    <template #body>
      <el-tree
        :data="treeData"
        draggable
        @node-drop="roleTreeDrop"
        node-key="id"
        default-expand-all
        :expand-on-click-node="false"
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <span>{{ node.label }}</span>
            <span>
              <el-divider direction="vertical"></el-divider>
              <span class="name-container"> {{ data.roleCode }}</span>
              <el-divider direction="vertical"></el-divider>
              <el-link @click="openAssignApi(data)" href="javascript:;" type="primary">接口权限</el-link>
              <el-divider direction="vertical"></el-divider>
              <el-link @click="append(data)" href="javascript:;" type="primary">新增</el-link>
              <el-divider direction="vertical"></el-divider>
              <el-link @click="update(data)" href="javascript:;" type="primary">修改</el-link>
            </span>
          </span>
        </template>
      </el-tree>
    </template>

    <template #others>
      <!-- 新增角色对话框 -->
      <el-dialog @close="cancelAdd" width="400px" :title="(isAdd ? '新增' : '修改') + '角色'" v-model="dialogVisible">
        <el-form ref="formRef" :inline="false" :model="form" label-width="80px">
          <el-form-item label="上级角色" prop="parentRoleCode">
            <el-select :disabled="isChild" filterable v-model="form.parentRoleCode" placeholder=" ">
              <el-option v-for="item in roleSelectionData" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="form.roleName"> </el-input>
          </el-form-item>
          <el-form-item label="角色编码" prop="roleCode">
            <el-input v-model="form.roleCode"></el-input>
          </el-form-item>
        </el-form>

        <template #footer>
          <span class="dialog-footer">
            <el-button type="primary" @click="submitForm('formRef')">提 交</el-button>
            <el-button @click="resetForm('formRef')">取 消</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 分配接口权限对话框 -->
      <el-dialog width="900px" title="接口权限" v-model="apiPermissionDialog" :close-on-click-modal="false">
        <div style="height: 380px; overflow: scroll; overflow-x: hidden">
          <el-tree
            ref="apiPermissionTree"
            :data="apiTreeData"
            show-checkbox
            node-key="id"
            :default-checked-keys="checkedApiKeys"
            default-expand-all
            :expand-on-click-node="false"
            v-loading="apiTreeLoading"
          >
            <template #default="{ data }">
              <span class="custom-tree-node">
                <span>{{ data.page }}</span>
                <span>
                  <el-divider direction="vertical"></el-divider>
                  <span class="name-container"> {{ data.name }}</span>
                </span>
                <span>
                  <el-divider direction="vertical"></el-divider>
                  <span class="name-container"> {{ data.path }}</span>
                </span>
              </span>
            </template>
          </el-tree>
        </div>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="cancelConfirmApp()">取 消</el-button>
            <el-button type="primary" @click="submitConfirmApp()">确 定</el-button>
          </span>
        </template>
      </el-dialog>
    </template>
  </single-data-view>
</template>

<script>
import SingleDataView from '@/components/SingleDataView';

export default {
  name: 'RoleManager',

  components: {
    SingleDataView,
  },

  data() {
    return {
      refreshLoading: false,
      // 角色对话框
      dialogVisible: false,
      currentParentRole: '',
      currentNodeData: {},
      isAdd: false,
      isChild: false,
      editingRow: {},
      roleSelectionData: [],

      form: {},
      total: 0,

      treeData: [],

      // 接口权限对话框
      apiTreeLoading: false,
      apiPermissionDialog: false,
      apiTreeData: [],
      checkedApiKeys: [],
      currentApiRoleData: {},
    };
  },

  created() {
    this.getTableData();
  },

  computed: {
  },

  methods: {
    async queryAllApi() {
      this.apiTreeData = [];
      const { data: res } = await this.$http.post(`/sys/resource/list`, {});
      if (!res.success) {
        return this.$message.error(res.msg);
      }
      res.data.forEach((o) => {
        this.apiTreeData.push({
          id: o.id,
          page: o.page,
          name: o.name,
          path: o.path,
        });
      });
    },

    async queryCurrentApi(data) {
      this.checkedApiKeys = [];
      const body = {
        roleId: data.id,
      };
      const { data: res } = await this.$http.post(`/sys/resource/list/by-role-id`, body);
      if (!res.success) {
        return this.$message.error(res.msg);
      }
      this.checkedApiKeys = res.data.map((o) => o.id);
    },

    // 接口权限
    openAssignApi(data) {
      this.apiTreeData = [];
      this.apiTreeLoading = true;
      this.queryAllApi()
        .then(() => this.queryCurrentApi(data))
        .then(() => {
          this.apiTreeLoading = false;
        });
      this.apiPermissionDialog = true;
      this.currentApiRoleData = data;
    },

    async submitConfirmApp() {
      const ids = this.$refs.apiPermissionTree.getCheckedKeys(false).join(',');
      const body = {
        roleId: this.currentApiRoleData.id,
        resourceIds: ids,
      };
      const { data: res } = await this.$http.post(`/sys/role/resources/update`, body);
      if (!res.success) {
        return this.$message.error(res.msg);
      }
      this.$message.success(res.msg);
      this.apiPermissionDialog = false;
    },

    cancelConfirmApp() {
      this.apiPermissionDialog = false;
    },

    openAddDialog() {
      this.isAdd = true;
      this.isChild = false;
      this.dialogVisible = true;
    },
    cancelAdd() {
      this.dialogVisible = false;
    },

    async getTableData() {
      const { data: res } = await this.$http.post(`/sys/role/list`, {});
      if (!res.success) {
        return this.$message.error(res.msg);
      }
      const treeData = [];
      const roleSelectionData = [];
      res.data.forEach((o) => {
        treeData.push({
          id: o.id,
          parentRoleCode: o.parentRoleCode,
          roleCode: o.roleCode,
          label: o.roleName,
        });
        roleSelectionData.push({
          label: o.roleName,
          value: o.roleCode,
        });
      });
      this.treeData = this.formatTree(treeData);
      this.roleSelectionData = roleSelectionData;
    },

    async addRole() {
      const body = {
        parentRoleCode: this.form.parentRoleCode,
        roleCode: this.form.roleCode,
        roleName: this.form.roleName,
      };
      const { data: res } = await this.$http.post(`/sys/role/add`, body);
      if (!res.success) {
        return this.$message.error(res.msg);
      }
      this.$message.success(res.msg);
      return res.data;
    },

    append(data) {
      this.isAdd = true;
      this.isChild = true;
      this.currentParentRole = data.roleCode;
      this.form = {
        parentRoleCode: this.currentParentRole,
      };
      this.dialogVisible = true;
      this.currentNodeData = data;
    },

    update(data) {
      this.isAdd = false;
      this.isChild = true;
      this.currentNodeData = data;
      this.form = {
        parentRoleCode: '',
        roleCode: data.roleCode,
        roleName: data.label,
      };
      this.dialogVisible = true;
    },

    async submitForm() {
      if (this.isAdd) {
        const id = await this.addRole();
        if (!id) {
          return;
        }
      } else {
        const body = {
          id: this.currentNodeData.id,
          roleCode: this.form.roleCode,
          roleName: this.form.roleName,
        };
        this.updateRole(body).then(() => this.getTableData());
      }

      this.getTableData();
      this.dialogVisible = false;
    },

    resetForm() {
      this.form = {};
      this.currentParentRole = '';
      this.currentNodeData = {};
      this.dialogVisible = false;
    },

    roleTreeDrop(node, targetNode, position) {
      let parentRole = '';
      if (position === 'inner') {
        parentRole = targetNode.data.name;
      } else {
        const parent = targetNode.parent;
        if (Array.isArray(parent)) {
          parentRole = null;
        } else {
          parentRole = parent.data.name;
        }
      }
      const body = {
        id: node.data.id,
        parentRoleCode: parentRole ? parentRole : '',
      };
      this.updateRole(body);
    },

    async updateRole(body) {
      const { data: res } = await this.$http.post(`/sys/role/update`, body);
      if (!res.success) {
        return this.$message.error(res.msg);
      }
      this.$message.success(res.msg);
    },

    /**
     * 刷新redis资源角色关系
     */
    async refreshRedisResource() {
      this.refreshLoading = true;
      const { data: res } = await this.$http.post('/sys/role/redis/refresh');
      if (!res.success) {
        return this.$message.error(res.msg);
      }
      this.refreshLoading = false;
      this.$message.success(res.msg);
    },

    /**
     * 将角色数据递归成树
     */
    formatTree(data, parentRoleCode) {
      let result = [];

      // 第一步: 查找顶级节点 (即 parentRoleCode 为空的节点)
      for (let i = 0; i < data.length; i++) {
        if (!data[i].parentRoleCode) {
          result.push({
            label: data[i].label,
            children: []
          });
        }
      }

      // 第二步: 为顶级节点查找子节点
      for (let i = 0; i < data.length; i++) {
        if (data[i].parentRoleCode) {
          for (let j = 0; j < result.length; j++) {
            if (data[i].parentRoleCode === result[j].label) {
              result[j].children.push({
                label: data[i].label,
                children: []
              });
            }
          }
        }
      }

      // 注意: 这只考虑了两级层次结构，你可能需要添加更多的循环来处理更深的层次结构。

      return result;
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.el-tree-node__label) {
  width: 100%;
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
  .name-container {
    text-align: left;
    width: 300px;
    display: inline-block;
  }
  .el-link {
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
  }
}
</style>
