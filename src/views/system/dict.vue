<template>
  <single-data-view>
    <template #header>
      <el-form ref="form" :model="form" label-width="auto">
        <el-button-group>
          <el-button type="primary" plain @click="openAddDialog">新 增</el-button>
          <el-button type="primary" plain @click="refreshRedisResource"  :loading=refreshLoading>刷新redis缓存</el-button>
        </el-button-group>
      </el-form>
    </template>
    <template #body>
      <el-tree
        ref="dictTreeRef"
        :data="treeData"
        @node-drop="roleTreeDrop"
        node-key="id"
        :expand-on-click-node="true"
        v-loading="loading"
      >
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <div class="desc-container">
              <span>{{ data.dictName }}</span>
            </div>
            <div class="name-container">
              <el-divider direction="vertical"></el-divider>
              <span> {{ data.dictCode }}</span>
            </div>
            <div class="order-container">
              <el-divider direction="vertical"></el-divider>
              <span> {{ data.orderNo }}</span>
            </div>
            <div class="link-container">
              <el-divider direction="vertical"></el-divider>
              <el-link @click.stop="append(data)" href="javascript:;" type="primary">新增</el-link>
              <el-divider direction="vertical"></el-divider>
              <el-link @click.stop="update(node, data)" href="javascript:;" type="primary">修改</el-link>
              <el-divider direction="vertical"></el-divider>
              <el-popconfirm title="确定删除？" @confirm.stop="deleteData(data)">
                <template #reference>
                  <el-link href="javascript:;" type="danger">删除</el-link>
                </template>
              </el-popconfirm>
            </div>
          </div>
        </template>
      </el-tree>
    </template>

    <template #others>
      <!-- 添加对话框 -->
      <el-dialog @close="cancelAdd" width="400px" :title="(isAdd ? '添加' : '修改') + '字典'" v-model="dialogVisible">
        <el-form ref="formRef" :inline="false" :rules="rules" :model="form" label-width="80px">
          <el-form-item label="父级字典" prop="parentDictCode">
            <el-select clearable filterable v-model="form.parentDictCode" placeholder=" ">
              <el-option v-for="item in dictSelectionData" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="字典名称" prop="dictName">
            <el-input v-model="form.dictName"> </el-input>
          </el-form-item>
          <el-form-item label="字典编号" prop="dictCode">
            <el-input v-model="form.dictCode"></el-input>
          </el-form-item>
          <el-form-item label="排序值" prop="orderNo">
            <el-input v-model="form.orderNo"></el-input>
          </el-form-item>
        </el-form>

        <template #footer>
          <span class="dialog-footer">
            <el-button type="primary" @click="submitForm('formRef')">提 交</el-button>
            <el-button @click="resetForm('formRef')">取 消</el-button>
          </span>
        </template>
      </el-dialog>
    </template>
  </single-data-view>
</template>

<script>
import { createEnumByOptions } from '@/utils/enums.js';
import SingleDataView from '@/components/SingleDataView';

export default {
  name: 'dict',

  components: {
    SingleDataView,
  },

  data() {
    return {
      refreshLoading: false,
      dialogVisible: false,
      currentParentDict: '',
      currentNodeData: {},
      isAdd: false,
      isChild: false,
      dictSelectionData: [],

      form: {},
      total: 0,
      loading: false,
      treeData: [],
      currentRow: {},
      rules: {
        orderNo: [{ required: true, message: '请输入排序值', trigger: 'blur' }],
        dictCode: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
        dictName: [{ required: true, message: '请输入字典编号', trigger: 'blur' }],
      },
    };
  },

  created() {
    this.getTableData();
  },

  computed: {
    releaseStatusEnum() {
      return createEnumByOptions(this.releaseStatusOptions);
    },
  },

  methods: {
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
      this.loading = true;
      const { data: res } = await this.$http.post(`/sys/dict/list`, {});
      if (!res.success) {
        this.loading = false;
        return this.$message.error(res.msg);
      }
      const treeData = [];
      const dictSelectionData = [];
      res.data.forEach((o) => {
        treeData.push({
          id: o.id,
          parentDictCode: o.parentDictCode,
          dictName: o.dictName,
          dictCode: o.dictCode,
          orderNo: o.orderNo,
        });
        dictSelectionData.push({
          label: o.dictName,
          value: o.dictCode,
        });
      });
      this.treeData = this.formatTree(treeData);
      this.dictSelectionData = dictSelectionData;
      this.loading = false;
    },

    async addRole() {
      const body = {
        parentDictCode: this.form.parentDictCode,
        dictCode: this.form.dictCode,
        dictName: this.form.dictName,
        orderNo: this.form.orderNo,
      };
      const { data: res } = await this.$http.post(`/sys/dict/add`, body);
      if (!res.success) {
        return this.$message.error(res.msg);
      }
      return res;
    },

    append(data) {
      this.isAdd = true;
      this.isChild = true;
      this.currentParentDict = data.dictCode;
      this.form = {
        parentDictCode: data.dictCode,
      };
      this.dialogVisible = true;
      this.currentNodeData = data;
    },

    update(node, data) {
      let parentDictCode = '';
      if (node.parent.data.length === undefined) {
        // 如果没有长度说明父节点不是根节点
        console.log(node.parent);
        parentDictCode = node.parent.data.dictCode;
      }
      this.isAdd = false;
      this.isChild = true;
      this.currentNodeData = data;
      this.form = {
        parentDictCode: parentDictCode,
        dictCode: data.dictCode,
        dictName: data.dictName,
        orderNo: data.orderNo,
      };
      this.currentRow = data;
      this.dialogVisible = true;
    },

    async deleteData(data) {
      const body = {
        id: data.id,
      };
      const { data: res } = await this.$http.post(`/sys/dict/delete`, body);
      if (!res.success) {
        return this.$message.error(res.msg);
      }
      this.getTableData();
      this.$message.success('删除成功');
    },

    async submitForm(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          if (this.isAdd) {
            const res = await this.addRole();
            if (res.success) {
              this.$message.success('操作成功');
              this.$refs.dictTreeRef.append(
                {
                  id: res.id,
                  dictCode: this.form.dictCode,
                  dictName: this.form.dictName,
                  orderNo: this.form.orderNo,
                  parentDictCode: this.form.parentDictCode,
                },
                this.currentNodeData.id
              );
            }
          } else {
            const body = {
              id: this.currentNodeData.id,
              dictCode: this.form.dictCode,
              dictName: this.form.dictName,
              orderNo: this.form.orderNo,
              parentDictCode: this.form.parentDictCode,
            };

            if (this.currentRow.parentDictCode !== this.form.parentDictCode) {
              this.updateDict(body).then(() => this.getTableData());
            } else {
              this.updateDict(body);
            }
            this.currentRow.dictCode = this.form.dictCode;
            this.currentRow.dictName = this.form.dictName;
            this.currentRow.orderNo = this.form.orderNo;
          }
          this.dialogVisible = false;
        }
      });
    },

    resetForm() {
      this.form = {};
      this.currentParentDict = '';
      this.currentNodeData = {};
      this.dialogVisible = false;
    },

    roleTreeDrop(node, targetNode, position) {
      let parentDictCode = '';
      if (position === 'inner') {
        parentDictCode = targetNode.data.dictCode;
      } else {
        const parent = targetNode.parent;
        if (Array.isArray(parent)) {
          parentDictCode = null;
        } else {
          parentDictCode = parent.data.dictCode;
        }
      }
      const body = {
        id: node.data.id,
        parentDictCode: parentDictCode ? parentDictCode : '',
      };
      this.updateDict(body);
    },

    async updateDict(body) {
      const { data: res } = await this.$http.post(`/sys/dict/update`, body);
      if (!res.success) {
        return this.$message.error(res.msg);
      }
      this.$message.success('操作成功');
    },

    /**
     * 刷新字典redis
     */
    async refreshRedisResource() {
      this.refreshLoading = true;
      const { data: res } = await this.$http.post('/sys/dict/redis/refresh');
      if (!res.success) {
        return this.$message.error(res.msg);
      }
      this.refreshLoading = false;
      this.$message.success('刷新成功');
    },

    /**
     * 将角色数据递归成树
     */
    formatTree(data, parentDictCode) {
      return data
        .filter((o) => {
          // 判断是否是第一次递归（parentDictCode 未定义)
          // 是：筛选parentDictCode为空的数据
          // 否：筛选指定parentDictCode
          return parentDictCode === undefined ? !o.parentDictCode : o.parentDictCode === parentDictCode;
        })
        .map((o) => {
          o.children = this.formatTree(data, o.dictCode);
          return o;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.el-tree-node__label) {
  width: 100%;
}
.custom-tree-node {
  width: calc(100% - 32px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;

  .desc-container {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    flex: 1;
  }
  .name-container {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: left;
    width: 300px;
  }
  .order-container {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: left;
    width: 50px;
  }
  .link-container {
    width: 120px;

    .el-link {
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
    }
  }
}
</style>
