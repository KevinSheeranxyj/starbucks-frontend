<template>
  <single-data-view class="redis-config-tab">
    <template #header>
      <el-form ref="formRef" :inline="true" :model="searchObj" :rules="rules" label-position="left" label-width="70px">
        <el-form-item label="前缀" prop="prefix">
          <el-select @change="prefixSelectChanged" filterable v-model="selectedPrefix" placeholder=" ">
            <el-option v-for="item in prefixOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="pattern-input" label="通配符" prop="pattern">
          <el-input v-model="searchObj.pattern"> </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" plain @click="submitForm('formRef')">查 询</el-button>
          <el-button @click="resetForm('formRef')">重 置</el-button>
        </el-form-item>
      </el-form>
    </template>
    <template #body>
      <el-table
        v-loading="loading"
        ref="multipleTable"
        :data="tableData"
        tooltip-effect="dark"
        border
        height="100%"
        style="width: 100%"
      >
        >
        <el-table-column align="center" type="index" width="30"> </el-table-column>
        <el-table-column align="center" prop="key" label="KEY" :show-overflow-tooltip="true" min-width="120">
        </el-table-column>
        <el-table-column align="center" prop="value" label="VALUE" :show-overflow-tooltip="true" min-width="80">
        </el-table-column>
      </el-table>
    </template>
  </single-data-view>
</template>

<script>
import { createEnum } from '@/utils/enums.js';
import SingleDataView from '@/components/SingleDataView';

export default {
  // 定义组件名称
  name: 'redis',
  components: { SingleDataView },
  data: () => ({
    // 指定查询条件
    tableData: [],
    loading: false,
    // redis前缀枚举
    prefixs: [],
    selectedPrefix: '',

    dialogVisible: false,
    dialogAdd: true,
    searchObj: {},
    rules: {
      pattern: [{ required: true, message: '请输入通配符', trigger: 'submit' }],
    },
  }),

  created() {
    // 调用函数获取表格数据
    this.getPrefixs();
  },

  computed: {
    // 创建前缀枚举
    prefixEnum() {
      const enumData = {};
      this.prefixs.forEach((o) => {
        enumData[o.name] = [o.code, o.desc];
      });
      return createEnum(enumData);
    },

    // 设置前缀下拉列表数据
    prefixOptions() {
      const options = [];
      this.prefixs.forEach((o) => {
        let option = {
          value: o.code,
          label: o.desc,
        };
        options.push(option);
      });
      return options;
    },
  },

  methods: {
    /**************************************** 头部表单操作 ****************************************/

    prefixSelectChanged(item) {
      this.searchObj.pattern = item + '*';
    },

    /**
     * 提交
     */
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.queryRedis();
        } else {
          return false;
        }
      });
    },
    async queryRedis() {
      this.loading = true;
      const { data: res } = await this.$http.post('/sys/redis/pattern', this.searchObj);
      if (!res.success) {
        this.loading = false;
        return this.$message.error(res.msg);
      }
      this.$message.success(res.msg);
      this.loading = false;
      this.tableData = res.data;
    },

    /**
     * 重置表单
     */
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },

    /**************************************** 获取基础数据 ****************************************/
    /**
     * 获取所有redis前缀
     */
    async getPrefixs() {
      const { data: res } = await this.$http.get('/sys/redis/prefix/enum');
      if (!res.success) {
        return this.$message.error(res.msg);
      }

      this.prefixs = res.data;
    },

    /**************************************** 表格操作 ****************************************/
  },
};
</script>

<style scoped></style>
