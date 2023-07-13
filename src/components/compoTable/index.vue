<template>
  <single-data-view class="compo-table">
    <template #header>
      <slot name="headerSlot"></slot>

      <!-- 表单组件 -->
      <compo-form
        v-if="tableParams.query.form"
        :formParams="tableParams.query.form"
        formType="table"
        ref="compoFormRef"
        class="compo-form"
        @changeSelect="changeSelect"
        @remoteMethod="remoteMethod"
      ></compo-form>

      <el-button-group class="compo-button-group">
        <el-button v-if="tableParams.query.form.formItems" type="primary" plain @click="query()">查 询</el-button>
        <el-button v-if="tableParams.query.reset!==false" @click="reset">重 置</el-button>
        <el-button v-if="tableParams.delete" type="danger" plain @click="batchUpdate('archiveFlag', 1)">删 除</el-button>
        <!-- 自定义按钮 插槽 -->
        <slot name="buttonSlot"></slot>
      </el-button-group>
    </template>

    <template #body>
      <el-table
        height="100%"
        v-loading="loading"
        ref="multipleTable"
        :data="this.tableData"
        @cell-click="cellClick"
        @selection-change="handleSelectionChange"
        @expand-change="expandChange"
        border
        :stripe="tableParams.config.stripe!==false"
        :span-method="spanMethod"
        :show-summary="tableParams.config.showSummary"
        :summary-method="summaryMethod"
        :header-cell-style="{'height': '35px'}"
      >
        <!-- 多选框 -->
        <el-table-column v-if="tableParams.config.multipleTable" align="center" type="selection"></el-table-column>

        <template v-for="(item, index) in tableParams.columns" :key="index">
          <el-table-column
            :prop="item.prop"
            :label="item.label"
            :width="item.width"
            :min-width="item.minWidth"
            :show-overflow-tooltip="item.showOverflowTooltip ? true : false"
            :align="item.align ? item.align : 'center'"
            :header-align="item.headerAlign ? item.headerAlign : 'center'"
            :sortable="item.sortable"
            :type="item.type"
          >
            <!-- 单元格：不可编辑 -->
            <template v-if="!item.type || item.type === 'text'" #default="scope">
              <!-- 文本样式 插槽 -->
              <slot name="tableTextSlot" :scope="scope" :prop="item.prop" :cellValue="scope.row[scope.column.property]">
                {{ scope.row[scope.column.property] }}
              </slot>
            </template>
            <!-- 单元格：支持输入框编辑  -->
            <template v-else-if="item.type === 'input'" #default="scope">
              <el-input
                v-if="getCellEditFlag(scope.row, scope.column)"
                @blur="updateCell(scope.row, scope.column)"
                v-model="scope.row[scope.column.property]"
                :type="item.config.type"
                :placeholder="item.config.placeholder"
                ref="cellInput"
              ></el-input>
              <div v-else>
                <!-- 输入文本样式 插槽 -->
                <slot
                  name="tableInputSlot"
                  :scope="scope"
                  :prop="item.prop"
                  :cellValue="scope.row[scope.column.property]"
                >
                  {{ scope.row[scope.column.property] }}
                </slot>
              </div>
            </template>
            <!-- 单元格：支持下拉框编辑  -->
            <template v-else-if="item.type === 'select'" #default="scope">
              <el-select
                v-if="getCellEditFlag(scope.row, scope.column)"
                v-model="scope.row[scope.column.property]"
                :placeholder="item.config.placeholder"
                :filterable="item.config.filterable === false ? false : true"
                :clearable="item.config.clearable === false ? false : true"
                :multiple="item.config.multiple"
                :collapse-tags="item.config.collapseTags"
                @change="updateCell(scope.row, scope.column)"
                @visible-change="visibleChange"
                ref="cellSelection"
                :remote="item.config.remote === false ? false : true"
                :remote-method="item.config.remoteMethod"
                :loading="item.config.loading"
              >
                <el-option
                  v-for="item in item.config.options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
              <div v-else>
                <!-- 下拉文本样式 插槽 -->
                <slot
                  name="tableSelectSlot"
                  :scope="scope"
                  :prop="item.prop"
                  :cellValue="scope.row[scope.column.property]"
                >
                  {{ $tool.getLabelByValue(item.config.options, scope.row[scope.column.property]) }}
                </slot>
              </div>
            </template>
            <template v-else-if="item.type === 'secondarySelect'" #default="scope">
              <el-select
                v-if="getCellEditFlag(scope.row, scope.column)"
                v-model="scope.row[scope.column.property]"
                :placeholder="item.config.placeholder"
                :filterable="item.config.filterable === false ? false : true"
                :clearable="item.config.clearable === false ? false : true"
                :multiple="item.config.multiple"
                :collapse-tags="item.config.collapseTags"
                @change="updateCell(scope.row, scope.column)"
                @visible-change="visibleChange"
                ref="cellSelection"
              >
                <el-option v-for="item in secondaryOptions" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
              <div v-else>
                {{ getSecondaryValue(scope.row, scope.column) }}
              </div>
            </template>
            <!-- 单元格：支持日期选择 -->
            <template v-else-if="['date', 'datetime'].includes(item.type)" #default="scope">
              <el-date-picker
                v-if="getCellEditFlag(scope.row, scope.column)"
                v-model="scope.row[scope.column.property]"
                :type="item.type"
                :clearable="item.config.clearable!==false"
                :placeholder="item.config.placeholder"
                @blur="updateCell(scope.row, scope.column)"
                ref="datePicker"
              >
              </el-date-picker>
              <div v-else>
                <!-- 日期样式 插槽 -->
                <slot
                  name="tableDateSlot"
                  :scope="scope"
                  :prop="item.prop"
                  :cellValue="scope.row[scope.column.property]"
                >
                  {{ $tool.dateFormat(scope.row[scope.column.property], item.config.style) }}
                </slot>
              </div>
            </template>
            <!-- 单元格：开关  -->
            <template v-else-if="item.type === 'switch'" #default="scope">
              <el-switch
                @change="updateCell(scope.row, scope.column)"
                v-model="scope.row[scope.column.property]"
                :active-value="item.config.activeValue ? item.config.activeValue : 1"
                :inactive-value="item.config.inactiveValue ? item.config.inactiveValue : 0"
              >
              </el-switch>
            </template>
            <!-- 展开行 -->
            <template v-else-if="item.type === 'expand'" #default="scope">
              <slot name="tableExpandSlot" :scope="scope" :prop="item.prop"> </slot>
            </template>
            <!-- 自定义列 -->
            <template v-else-if="item.type === 'defined'" #default="scope">
              <slot name="tableDefinedSlot" :scope="scope" :prop="item.prop"> </slot>
            </template>
          </el-table-column>
        </template>
      </el-table>
    </template>

    <template #footer>
      <el-pagination
        v-if="tableParams.config.page"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="this.page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="this.limit"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.total"
      >
      </el-pagination>
    </template>

    <template #others>
      <slot name="dialog"></slot>
    </template>
  </single-data-view>
</template>

<script>
import SingleDataView from '@/components/SingleDataView';

export default {
  name: 'compoTable',
  props: { tableParams: Object, spanMethod: Function, summaryMethod: Function, expandChange: Function },
  components: { SingleDataView },
  emits: ['updateSuccess', 'querySuccess', 'changeSelect', 'remoteMethod'],

  data() {
    return {
      loading: false,
      // 表数据
      tableData: [],
      // 分页信息
      page: 1,
      limit: 10,
      // 总条数
      total: 0,
      // 多选
      multipleSelection: [],
      // 表格id
      ids: '',
      // 表格编辑
      tableEdit: {},
      editingCellId: '',
      selectPopperOpen: false,
      // 编辑前单元格值
      beforeValue: null,
      beforeEditingCellId: '',
      // 查询表单
      queryForm: {},
      // 二级下拉选项
      secondaryOptions: [],
      // 所有子集字典
      allSubsetDict: [],
    };
  },

  // 定义生命周期函数，在页面创建时候就去做一些事情
  created() {
    this.checkColumnParams(this.tableParams.columns);
    this.checkTableParams(this.tableParams);
    this.getAllSubsetDict();
  },

  mounted() {
    // 修改斑马纹样式
    document.body.style.setProperty('--el-fill-color-lighter', '#111');
  },

  // 计算属性
  computed: {},

  methods: {
    /**
     * 校验表格列参数
     */
    checkColumnParams(params) {
      for (let i in params) {
        // 判断参数是否存在'config'，无则新增
        if (['input', 'select', 'date', 'datetime', 'switch', 'secondarySelect'].includes(params[i].type)) {
          if (!params[i].config) {
            params[i]['config'] = {};
          }
        }
      }
    },

    /**
     * 校验表格参数
     */
    checkTableParams(params) {
      if (!params.config) {
        params['config'] = {};
      }
    },

    /**
     * 重置
     */
    reset(resetFrom) {
      this.$refs.compoFormRef.reset(resetFrom);
      this.$emit('reset');
    },

    // 设置表单组件form对象
    setForm(form) {
      this.$refs.compoFormRef.setForm(form);
    },

    // 获取表单组件form对象
    getForm() {
      return this.$refs.compoFormRef.getForm();
    },

    /**
     * 查询
     */
    query(form) {
      this.$refs.compoFormRef.validate(async (valid) => {
        if (valid) {
          // 如果无form对象，则从表单组件获取
          if (form) {
            if (form.isTrusted) {
              this.queryForm = this.$refs.compoFormRef.getForm();
            } else {
              this.queryForm = form;
            }
          } else {
            this.queryForm = this.$refs.compoFormRef.getForm();
          }

          this.loading = true;
          const { data: res } = await this.$http.post(
            this.tableParams.query.url + '?page=' + this.page + '&limit=' + this.limit,
            this.queryForm
          );
          this.loading = false;
          if (!res.success) {
            return this.$message.error(res.msg);
          }

          this.tableData = this.parseData(res.data);
          this.total = res.count;

          this.multipleSelection = [];
          this.ids = '';

          this.$emit('querySuccess', this.tableData);
        }
      });
    },

    parseData(data) {
      return data;
    },

    /**
     * 监听page改变的事件
     */
    handleSizeChange(newSize) {
      this.limit = newSize;
      this.query();
    },

    /**
     * 监听limit改变的事件
     */
    handleCurrentChange(newPage) {
      this.page = newPage;
      this.query();
    },

    /**
     * 监听多选框
     */
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },

    /**
     * 获取表格被选中的id
     */
    getTableIds() {
      this.ids = '';
      for (let i in this.multipleSelection) {
        let id = this.multipleSelection[i].id;
        if (this.ids == '') {
          this.ids = id;
        } else {
          this.ids = this.ids + ',' + id;
        }
      }
      return this.ids;
    },

    /**
     * 获取表格被选中的数据
     */
    getMultipleSelection() {
      return this.multipleSelection;
    },

    /**
     * 批量更新
     */
    batchUpdate(key, value) {
      if (this.multipleSelection.length === 0) {
        this.$message.error('请选择需要删除的数据！');
        return;
      }
      this.$confirm('此操作将永久删除选中数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          this.getTableIds();

          const body = {};
          body['ids'] = this.ids;
          body[key] = value;
          const { data: res } = await this.$http.post(this.tableParams.delete.url, body);
          if (!res.success) {
            this.ids = '';
            return this.$message.error(res.msg);
          }
          this.$message.success('删除成功');
          this.query();
        })
        .catch(() => {
          return;
        });
    },

    /**
     * 下拉框显示/隐藏事件
     */
    visibleChange(show) {
      this.selectPopperOpen = show;
      if (!show) {
        this.initTableEdit();
      }
    },

    /**
     * 获取单元格编辑状态
     */
    getCellEditFlag(row, column) {
      return this.tableEdit[column.id + '_' + row.id];
    },

    /**
     * 重置单元格编辑状态
     */
    initTableEdit() {
      this.editingCellId = '';
      this.tableEdit = {};
    },

    /**
     * 点击单元格,标识该单元格编辑
     */
    cellClick(row, column) {
      const id = column.id + '_' + row.id;
      if (id === this.editingCellId) {
        return;
      }

      // 编辑前单元格值
      this.beforeValue = row[column.property];
      this.beforeEditingCellId = id;

      // 初始化表格编辑
      this.initTableEdit();
      // 单元格设置为可编辑
      this.tableEdit[id] = true;
      this.editingCellId = id;

      this.getSecondaryOptions(row, column);

      // 等页面渲染好再调用
      this.$nextTick(() => {
        if (this.$refs.cellSelection) {
          if (this.$refs.cellSelection.length > 0) {
            this.$refs.cellSelection[0].toggleMenu();
          }
        }
        if (this.$refs.cellInput) {
          if (this.$refs.cellInput.length > 0) {
            this.$refs.cellInput[0].focus();
          }
        }
        if (this.$refs.datePicker) {
          if (this.$refs.datePicker.length > 0) {
            this.$refs.datePicker[0].focus();
          }
        }
      });
    },

    /**
     * 获取二级下拉选项
     */
    async getSecondaryOptions(row, column) {
      if (this.tableParams.secondarySelect) {
        if (this.tableParams.secondarySelect[column.property]) {
          const { data: res } = await this.$http.get(
            `/admin/dict/query/` + row[this.tableParams.secondarySelect[column.property]]
          );
          if (!res.success) {
            return this.$message.error(res.msg);
          }
          this.secondaryOptions = [];
          res.body.forEach((o) => {
            this.secondaryOptions.push({
              label: o.desc,
              value: o.code,
            });
          });
        }
      }
    },

    /**
     * 根据一级字典获取所有子集字典
     */
    async getAllSubsetDict() {
      if (this.tableParams.firstDictCode) {
        const { data: res } = await this.$http.get(`/admin/dict/querySub/` + this.tableParams.firstDictCode);
        if (!res.success) {
          return this.$message.error(res.msg);
        }
        this.allSubsetDict = res.body;
      }
    },

    /**
     * 获取二级字典的值
     */
    getSecondaryValue(row, column) {
      const firstCode = row[this.tableParams.secondarySelect[column.property]];
      const secondaryCode = row[column.property];
      const secondaryDict = this.allSubsetDict[firstCode];
      return this.getDescByCode(secondaryCode, secondaryDict);
    },

    /**
     * 根据字典code查询desc
     */
    getDescByCode(code, dict) {
      if (!code || !dict) {
        return;
      }
      for (const obj of dict) {
        if (obj['code'] === code) {
          return obj['desc'];
        }
      }
    },

    /**
     * 更新单元格
     */
    updateCell(row, column) {
      let key = column.property;
      let value = row[column.property];
      const id = column.id + '_' + row.id;
      // 单元格内容不变，则不更新
      if (this.beforeValue === value && this.beforeEditingCellId === id) {
        this.initTableEdit();
        return;
      }

      const body = {};
      body['id'] = row.id;
      body[key] = value;
      // 如果value类型是Object，且是数组，判断为单元格为下拉多选，不初始化单元格编辑状态
      if (typeof value == 'object' && Object.prototype.toString.call(value) === '[object Array]') {
        this.update(body);
      } else {
        this.update(body);
        this.initTableEdit();
      }
    },

    /**
     * 更新
     */
    async update(row) {
      const { data: res } = await this.$http.post(this.tableParams.update.url, row);
      if (!res.success) {
        return this.$message.error(res.msg);
      }
      this.$emit('updateSuccess', row);
    },

    /**
     * 变更选择器选项
     */
    changeSelect(prop, val) {
      this.$emit('changeSelect', prop, val);
    },

    /**
     * 选择器远程方法
     */
    remoteMethod(prop, val) {
      this.$emit('remoteMethod', prop, val);
    },
  },
};
</script>

<style>
</style>
