<template>
  <el-form
    ref="formRef"
    :model="form"
    :inline="inline"
    :label-width="labelWidth"
    :label-position="labelPosition"
    class="compo-form-container"
  >
    <el-row :gutter="1">
      <el-col v-for="(item, index) in formItems" :key="index" :span="item.span">
        <el-form-item :label="item.label" :prop="item.prop" :rules="item.rules">
          <!-- 输入框 -->
          <template v-if="item.type === 'input'">
            <el-input
              v-model="form[item.prop]"
              :placeholder="item.config.placeholder"
              :clearable="item.config.clearable!==false"
              :type="item.config.type"
            ></el-input>
          </template>
          <!-- 选择器 -->
          <template v-else-if="item.type === 'select'">
            <el-select
              v-model="form[item.prop]"
              :placeholder="item.config.placeholder"
              :filterable="item.config.filterable!==false"
              :clearable="item.config.clearable!==false"
              :allow-create="item.config.allowCreate"
              :multiple="item.config.multiple"
              :collapse-tags="item.config.collapseTags"
              :remote="item.config.remote"
              :remote-method="((value)=>{remoteMethod(item.prop, value)})"
              style="width: 100%"
              @change="((value)=>{changeSelect(item.prop, value)})"
            >
              <el-option
                v-for="option in item.config.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              >
              </el-option>
            </el-select>
          </template>
          <!-- 日期选择期 -->
          <template v-else-if="['date', 'datetime'].includes(item.type)">
            <el-date-picker
              v-model="form[item.prop]"
              :type="item.type"
              :placeholder="item.config.placeholder"
              :clearable="item.config.clearable!==false"
              :value-format="item.config.valueFormat"
              style="width: 100%"
            >
            </el-date-picker>
          </template>
          <!-- 开关 -->
          <template v-else-if="item.type === 'switch'">
            <el-switch
              v-model="form[item.prop]"
              :active-value="item.config.activeValue ? item.config.activeValue : 1"
              :inactive-value="item.config.inactiveValue ? item.config.inactiveValue : 0"
            >
            </el-switch>
          </template>
          <template v-else-if="item.type === 'defined'">
            <slot name="formDefinedSlot" :prop="item.prop"></slot>
          </template>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
export default {
  name: 'CompoForm',
  props: {
    formParams: {
      type: Object,
      default: () => {}
    },
    formType: {
      type: String,
      default: null
    }},
  emits: [],

  data() {
    return {
      form: {},
      formItems: [],
      // 行内表单模式
      inline: true,
      // 标签跨度
      labelWidth: 70,
      // 标签对齐方式
      labelPosition: 'right'
    };
  },

  watch: {
    formParams(val) {
      this.formItems = this.initFormItems(val.formItems);
    }
  },

  created() {
    // 初始化参数
    this.labelWidth = this.formParams.labelWidth ? this.formParams.labelWidth : this.labelWidth;
    this.labelPosition = this.formParams.labelPosition ? this.formParams.labelPosition : this.labelPosition;
    this.formItems = this.initFormItems(this.formParams.formItems);

    // Extract and assign default values to the form object
    this.form = this.extractDefaultValues(this.formItems);

    this.$nextTick(() => {
      setTimeout(() => {
        this.$refs.formRef.clearValidate();
      }, 100);
    })
  },

  mounted() {
    // 监听屏幕宽度，重新布局表单
    window.onresize = () => {
      return (() => {
        this.relayout(this.formItems);
      })();
    };
  },

  methods: {
    /**
     * 获取栅格占据的列数
     */
    getSpan() {
      // 屏幕宽度
      const windowWidth = document.documentElement.clientWidth;
      // 栅格占据的列数
      let span = 24 / Math.floor(windowWidth / 310);
      // 对话框栅格占据的列数
      if (this.formType === 'dialog') {
        span = span * 2;
        span = span > 12 ? 12 : span;
      }
      return span;
    },


    extractDefaultValues(formItems) {
      let defaultValues = {};
      formItems.forEach((item) => {
        if (item.config && 'defaultValue' in item.config) {
          if (item.type === 'select' && Array.isArray(item.config.options)) {
            const defaultValue = item.config.defaultValue;
            const matchingOption = item.config.options.find(option => option.value === defaultValue);
            if (matchingOption) {
              defaultValues[item.prop] = defaultValue;
            }
          } else {
            defaultValues[item.prop] = item.config.defaultValue;
          }
        }
      });
      return defaultValues;
    },

    /**
     * 初始化表单项
     */
    initFormItems(formItems) {
      // 判断是否对话框表单
      if (this.formType === 'dialog') {
        // 非行内表单模式
        this.inline = false;
      }
      // 根据屏幕宽度计算 栅格占据的列数
      const span = this.getSpan();

      for (const i in formItems) {
        const row = formItems[i];
        // 判断是否设置'config'
        if (['input', 'select', 'date', 'datetime', 'switch'].includes(row.type)) {
          if (!row.config) {
            row['config'] = {};
          }
        }
        // 判断是否设置 校验规则'rules'
        if (row.rules === true) {
          if (['input'].includes(row.type)) {
            row['rules'] = [{required: true, message: '必填项', trigger: 'blur'}];
          } else if (['select', 'date', 'datetime', 'switch'].includes(row.type)) {
            row['rules'] = [{required: true, message: '必填项', trigger: 'change'}];
          }
        }

        // 判断是否设置 栅格列数'fixedSpan'
        row['span'] = row.fixedSpan ? row.fixedSpan : span;
      }
      this.form = this.extractDefaultValues(formItems);

      return formItems;
    },

    /**
     * 重新布局表单
     */
    relayout(formItems) {
      const span = this.getSpan();
      for (const i in formItems) {
        const row = formItems[i];
        row['span'] = row.fixedSpan ? row.fixedSpan : span;
      }
    },

    /**
     * 重置表单
     */
    reset(resetFrom) {
      // 判断是否存在resetFrom对象
      if (resetFrom === undefined) {
        this.form = {};
      } else if (resetFrom.isTrusted) {
        this.form = {};
      } else {
        this.form = resetFrom;
      }
      setTimeout(() => {
        this.$refs.formRef.clearValidate();
      }, 100);
    },

    /**
     * 获取表单
     */
    getForm() {
      return this.form;
    },

    /**
     * 设置表单参数
     */
    setForm(form) {
      const that = this;
      this.$nextTick(() => {
        // that.form = form
        this.form = {...this.form, ...form};
        console.log(this.form);
      })
    },

    /**
     * 表单验证
     */
    validate(valid) {
      return this.$refs.formRef.validate(valid);
    },

    changeSelect(prop, val) {
      this.$emit('changeSelect', prop, val);
    },

    remoteMethod(prop, val) {
      this.$emit('remoteMethod', prop, val);
    }
  }
};
</script>

<style lang="scss">
</style>
