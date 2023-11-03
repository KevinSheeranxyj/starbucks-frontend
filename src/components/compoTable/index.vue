<template>
  <single-data-view class="compo-table">
    <template #header>
      <slot name="headerSlot"></slot>

      <!-- 表单组件 -->
      <compo-form
        v-if="tableParams.query.form"
        ref="compoFormRef"
        :form-params="tableParams.query.form"
        form-type="table"
        class="compo-form"
        @changeSelect="changeSelect"
        @remoteMethod="remoteMethod"
      ></compo-form>

      <el-button-group class="compo-button-group">
        <el-button v-if="tableParams.query.form.formItems && tableParams.config.showQuery !== false" type="primary" plain @click="query()">查 询</el-button>
        <el-button v-if="tableParams.query.reset!==false" @click="reset">重 置</el-button>
        <el-button v-if="tableParams.delete" type="danger" plain @click="batchUpdate('archiveFlag', 1)">删 除</el-button>
        <el-button v-if="tableParams.export" type="primary" plain @click="exportData()">导 出</el-button>
        <!-- 自定义按钮 插槽 -->
        <slot name="buttonSlot"></slot>
      </el-button-group>
    </template>
    <template #body>
      <el-popover v-if="tableParams.hideAllowed" placement="bottom-end" :offset="0" :show-arrow="false" :width="120" trigger="click">
        <template #reference>
          <div class="table-right-icons">
            <el-icon :size="20"><Rank /></el-icon>
          </div>
        </template>
        <el-checkbox-group v-model="checkedCols">
          <el-checkbox v-for="col in tableParams.columns" :key="col.prop" :label="col.prop">{{
            col.label
          }}</el-checkbox>
        </el-checkbox-group>
      </el-popover>
      <el-table
        ref="multipleTable"
        v-loading="loading"
        height="100%"
        :data="tableData"
        border
        :stripe="tableParams.config.stripe!==false"
        :span-method="spanMethod"
        :show-summary="tableParams.config.showSummary"
        :summary-method="summaryMethod"
        :header-cell-style="{'height': '35px'}"
        @cell-click="cellClick"
        @selection-change="handleSelectionChange"
        @expand-change="expandChange"
      >
        <!-- 多选框 -->
        <el-table-column v-if="tableParams.config.multipleTable" align="center" type="selection"></el-table-column>
        <el-table-column
          v-for="(item, index) in tableParams.columns.filter(column => checkedCols?.includes(column.prop))"
          :key="index"
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
          <template v-else-if="item.type === 'dns'" #default="scope">
            <slot name="tableDNSSlot" :scope="scope" :prop="item.prop"> </slot>
            {{ '主:' + (scope.row['primaryDns'] === null ? "" : scope.row['primaryDns'])}}<br>
            {{ '次:' + (scope.row['secondaryDns'] === null ? "" : scope.row['secondaryDns']) }}
          </template>
          <template v-else-if="item.type === 'usedStatus'" #default="scope">
            <slot name="tableDNSSlot" :scope="scope" :prop="item.prop"> </slot>
            {{scope.row['usedStatus'] === 1 ? "未使用" :"已使用"}}<br>
          </template>

          <!-- 单元格：支持输入框编辑  -->
          <template v-else-if="item.type === 'input'" #default="scope">
            <el-input
              v-if="getCellEditFlag(scope.row, scope.column)"
              ref="cellInput"
              v-model="scope.row[scope.column.property]"
              :type="item.config.type"
              :placeholder="item.config.placeholder"
              @blur="updateCell(scope.row, scope.column)"
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
              ref="cellSelection"
              v-model="scope.row[scope.column.property]"
              :placeholder="item.config.placeholder"
              :filterable="item.config.filterable === false ? false : true"
              :clearable="item.config.clearable === false ? false : true"
              :multiple="item.config.multiple"
              :collapse-tags="item.config.collapseTags"
              :remote="item.config.remote === false ? false : true"
              :remote-method="item.config.remoteMethod"
              :loading="item.config.loading"
              @change="updateCell(scope.row, scope.column)"
              @visible-change="visibleChange"
            >
              <el-option
                v-for="config in item.config.options"
                :key="config.value"
                :label="config.label"
                :value="config.value"
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
              ref="cellSelection"
              v-model="scope.row[scope.column.property]"
              :placeholder="item.config.placeholder"
              :filterable="item.config.filterable === false ? false : true"
              :clearable="item.config.clearable === false ? false : true"
              :multiple="item.config.multiple"
              :collapse-tags="item.config.collapseTags"
              @change="updateCell(scope.row, scope.column)"
              @visible-change="visibleChange"
            >
              <el-option v-for="secondaryOption in secondaryOptions" :key="secondaryOption.value" :label="secondaryOption.label" :value="secondaryOption.value">
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
              ref="datePicker"
              v-model="scope.row[scope.column.property]"
              :type="item.type"
              :clearable="item.config.clearable!==false"
              :placeholder="item.config.placeholder"
              @blur="updateCell(scope.row, scope.column)"
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
              v-model="scope.row[scope.column.property]"
              :active-value="item.config.activeValue ? item.config.activeValue : 1"
              :inactive-value="item.config.inactiveValue ? item.config.inactiveValue : 0"
              @change="updateCell(scope.row, scope.column)"
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
      </el-table>
    </template>

    <template #footer>
      <el-pagination
        v-if="tableParams.config.page && tableParams.config.showPagination  !== false"
        :current-page="page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="limit"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
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
import {
  Rank
} from '@element-plus/icons-vue';

export default {
  name: 'CompoTable',
  components: { SingleDataView, Rank },
  props: { tableParams: Object, spanMethod: Function, summaryMethod: Function,
    expandChange: Function, defaultTableData: Array, selectedValues: Array ,organizationId:Object},
  emits: ['updateSuccess', 'querySuccess', 'changeSelect', 'remoteMethod', 'selectedValues'],

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
      checkedCols: []
    };
  },

  // 计算属性
  computed: {},

  // 定义生命周期函数，在页面创建时候就去做一些事情
  created() {
    this.checkColumnParams(this.tableParams.columns);
    this.checkTableParams(this.tableParams);
    this.getAllSubsetDict();
  },

  mounted() {
    // 修改斑马纹样式
    document.body.style.setProperty('--el-fill-color-lighter', '#111');
    this.checkedCols = this.tableParams.columns?.map(a => a.prop) || [];
    this.tableData = this.defaultTableData
  },

  watch: {
    defaultTableData: {
      handler(val) {
        this.tableData = val
      },
      deep: true
    }
  },

  methods: {

    /**
     * 校验表格列参数
     */
    checkColumnParams(params) {
      for (const i in params) {
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
      this.$refs.compoFormRef.validate(async(valid) => {
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
              this.organizationId ? { ...this.queryForm, organizationId: this.organizationId } : this.queryForm
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


    exportData(form) {
      this.$refs.compoFormRef.validate(async(valid) => {
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
          // const { data: res }
             const res = await this.$http.post(
              this.tableParams.export.url,
              this.queryForm,
                 { responseType: 'blob' }
             );
          this.loading = false;
          if (res.statusText.toLowerCase() !== "ok") {
            return this.$message.error(res.msg);
          }
          // 使用Blob对象和a标签将文件流保存为文件
          const blob = new Blob([res.data], { type: 'application/octet-stream' }); // 这里的类型可以根据实际情况更改
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'export.xlsx'; // 指定您想要的文件名和扩展名
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
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
      this.$emit('selectedValues', this.multipleSelection);
    },

    /**
     * 获取表格被选中的id
     */
    getTableIds() {
      this.ids = '';
      for (const i in this.multipleSelection) {
        const id = this.multipleSelection[i].id;
        if (this.ids === '') {
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
        type: 'warning'
      })
        .then(async() => {
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
              value: o.code
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
      const key = column.property;
      const value = row[column.property];
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
      if (typeof value === 'object' && Object.prototype.toString.call(value) === '[object Array]') {
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
    }
  }
};
</script>

<style lang="scss" scoped>
.table-right-icons {
  color: #CFD3DC;
  text-align: right;
  cursor: pointer;
}
</style>
