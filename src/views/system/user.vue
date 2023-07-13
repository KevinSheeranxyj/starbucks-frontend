<template>
  <compo-table :tableParams="table" ref="compoTableRef">
    <template #buttonSlot>
      <el-button type="primary" plain @click="sync" :loading=syncLoading>同 步</el-button>
      <el-button type="primary" plain @click="openInitDialog">密码初始化</el-button>
    </template>

    <template #tableTextSlot="slotProps">
      <div v-if="slotProps.prop === 'enableFlag'">
        <el-tag :type="getTagTypeByEnableFlag(slotProps.cellValue)">
          {{ enableFlagEnum.getDescFromValue(slotProps.cellValue) }}
        </el-tag>
      </div>
    </template>
    '

    <template #tableDefinedSlot="slotProps">
      <div v-if="slotProps.prop === 'operation'">
        <el-link @click="openAssignRolesDialog(slotProps.scope.row)" href="javascript:;" type="primary">
          分配角色
        </el-link>
      </div>
    </template>

    <template #dialog>
      <el-dialog width="600px" title="角色" v-model="assignRolesDialog" :close-on-click-modal="false">
        <div style="height: 380px; overflow: scroll; overflow-x: hidden">
          <el-tree
              :data="roleTreeData"
              ref="roleTreeRef"
              show-checkbox
              node-key="id"
              default-expand-all
              :default-checked-keys="checkedRoles"
              :props="defaultProps"
          />
        </div>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="cancelRoleConfig()">取 消</el-button>
            <el-button type="primary" @click="submitRoleConfig()">确 定</el-button>
          </span>
        </template>
      </el-dialog>
    </template>
  </compo-table>

  <el-dialog
      v-model="initDialogVisible"
      title="密码初始化"
      width="300px"
  >
    <span style="color:rgb(217,217,217);">
      <el-icon>
        <QuestionFilled/>
      </el-icon>
      确认密码初始化选择的记录吗？</span>

    <template #footer>
      <el-button type="primary" plain @click="initPassword">
        确 定
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
import {createEnumByOptions} from '@/utils/enums.js';
import http from '@/utils/http';
import {ElMessage} from "element-plus/lib/components";
import {QuestionFilled} from '@element-plus/icons-vue';

const usernameOptions = [];
const emailOptions = [];
const enableFlagOptions = [
  {
    label: "Unverified",
    value: 0,
  }, {
    label: "OK",
    value: 1,
  },
];

async function getUserOptions(usernameOptions, emailOptions) {
  const {data: res} = await http.post(`/sys/user/list`, {});
  usernameOptions.length = 0;
  emailOptions.length = 0;
  res.data.forEach((user) => {
    usernameOptions.push({
      value: user.username,
      label: user.username,
    });

    emailOptions.push({
      value: user.email,
      label: user.email,
    });
  });
}


// 查询表单
const queryForm = [
  {
    label: '姓名', prop: 'username', type: 'select',
    config: {options: usernameOptions},
  },
  {
    label: '邮箱', prop: 'email', type: 'select',
    config: {options: emailOptions},
  },
  {
    label: '状态', prop: 'enableFlag', type: 'select',
    config: {options: enableFlagOptions},
  },
];

// 表格列
const columns = [
  {label: '状态', prop: 'enableFlag', width: '80px'},
  {label: '姓名', prop: 'username',},
  {label: '邮箱', prop: 'email'},
  {label: '角色', prop: 'roles'},
  {label: '操作', prop: 'operation', type: 'defined'},
];

export const table = {
  columns: columns,
  config: {
    page: true,
    multipleTable: true,
  },
  // 查询
  query: {
    url: '/sys/user/table',
    form: {formItems: queryForm},
  },
  // 删除
  // delete: {
  //   url: '/sys/user/batchArchive',
  // },
  // 更新
  update: {
    url: '/sys/user/update',
  },
};

export default {
  name: 'UserManager',
  // 定义组件接收值和类型
  props: {},
  components: {
    QuestionFilled,
  },
  data: () => ({
    table,
    enableFlagOptions,
    syncLoading: false,
    usernameOptions,
    emailOptions,
    // 密码初始化对话框
    initDialogVisible: false,
    id: 0,
    // 分配角色对话框
    assignRolesDialog: false,
    currentUserId: null,

    defaultProps: {
      children: 'children',
      label: 'label',
    },

    roleTreeData: [],
    checkedRoles: [],
  }),

  created() {
  },

  mounted() {
    this.getTableData();
    getUserOptions(usernameOptions, emailOptions);
  },

  // 计算属性
  computed: {
    enableFlagEnum() {
      return createEnumByOptions(this.enableFlagOptions);
    },
  },

  methods: {
    /**
     * 获取表格数据
     */
    async getTableData() {
      this.$refs.compoTableRef.query();
    },

    async sync() {
      this.syncLoading = true;
      const {data: res} = await this.$http.get(`/sys/user/sync`);
      this.syncLoading = false;
      if (!res.success) {
        return this.$message.error(res.msg);
      }
      this.$message.success(res.msg);
      await this.getTableData();
    },

    /**
     * 根据启用状态判断tag类型
     */
    getTagTypeByEnableFlag(enableFlag) {
      if (enableFlag === 0) {
        return 'danger';
      } else if (enableFlag === 1) {
        return 'success';
      } else if (enableFlag === 2) {
        return 'info';
      }
      return 'warning';
    },

    openInitDialog() {
      const ids = this.$refs.compoTableRef.getTableIds();
      if (ids === '') {
        return ElMessage.warning('请选择需要操作的数据');
      }
      if (typeof ids === 'number') {
        this.id = ids;
        this.initDialogVisible = true;
      } else {
        return this.$message.error("只能选择一条记录进行操作！");
      }
    },

    async initPassword(){
      const {data: res} = await this.$http.post('/sys/user/password/init', {id: this.id});
      if (!res.success) {
        return ElMessage.error(res.msg);
      }
      ElMessage.success(res.msg);
      this.initDialogVisible = false;
      this.getTableData();
    },

    openAssignRolesDialog(row) {
      this.assignRolesDialog = true;
      this.currentUserId = row.id;
      this.listRole();
      this.listSelectedRole(row.id);
    },

    async listSelectedRole(userId) {
      this.checkedRoles = [];
      const body = {id: userId};
      console.log("body", body)
      const {data: res} = await this.$http.post('/sys/role/list/by-user-id', body);
      if (!res.success) {
        return this.$message.error(res.msg);
      }
      this.checkedRoles = res.data.map((o) => o.id);
      console.log("checkedRoles", this.checkedRoles);
    },

    async listRole() {
      const {data: res} = await this.$http.post('/sys/role/list', {});
      if (!res.success) {
        return this.$message.error(res.msg);
      }
      const treeData = [];
      res.data.forEach((o) => {
        treeData.push({
          id: o.id,
          parentRoleCode: o.parentRoleCode,
          roleCode: o.roleCode,
          label: o.roleName,
        });
      });
      this.roleTreeData = this.formatTree(treeData);
    },

    /**
     * 将角色数据递归成树
     */
    formatTree(data, parentRoleCode) {
      return data
          .filter((o) => {
            // 判断是否是第一次递归（parentRoleCode 未定义)
            // 是：筛选parentRoleCode为空的数据
            // 否：筛选指定parentRoleCode
            return parentRoleCode === undefined ? !o.parentRoleCode : o.parentRoleCode === parentRoleCode;
          })
          .map((o) => {
            o.children = this.formatTree(data, o.roleCode);
            return o;
          });
    },

    async submitRoleConfig() {
      const ids = this.$refs.roleTreeRef.getCheckedKeys(false).join(',');
      const body = {
        userId: this.currentUserId,
        roleIds: ids,
      };
      const {data: res} = await this.$http.post(`/sys/user/roles/update`, body);
      if (!res.success) {
        return this.$message.error(res.msg);
      }
      this.$message.success(res.msg);
      this.assignRolesDialog = false;
      this.getTableData();
    },

    cancelRoleConfig() {
      this.assignRolesDialog = false;
    },
  },
};
</script>

<style>
</style>
