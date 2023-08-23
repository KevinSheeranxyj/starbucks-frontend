<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogParams.title"
    :width="dialogParams.width"
    :fullscreen="dialogParams.fullscreen"
  >
    <div class="dialog-header">
      <slot name="headerSlot"></slot>
    </div>
    <!-- 表单组件 -->
    <compo-form ref="compoFormRef" :form-params="dialogParams.form" form-type="dialog">
      <template #formDefinedSlot="slotProps">
        <slot name="dialogFormSlot" :prop="slotProps.prop"></slot>
      </template>
    </compo-form>

    <slot name="dialogSlot"></slot>

    <div class="dialog-footer">
      <el-button @click="closeDialog()">取 消</el-button>
      <!-- 自定义按钮 插槽 -->
      <slot name="dialogButtonSlot"></slot>
      <el-button v-if="dialogParams.button!==false" type="primary" plain :loading="dialogLoading" @click="confirm()">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'CompoDialog',
  components: {},
  props: {
    dialogParams: { type: Object }
  },
  emits: ['confirmSuccess', 'initDialog'],
  data() {
    return {
      dialogForm: {},
      dialogVisible: false,
      dialogLoading: false
    };
  },

  created() {},

  methods: {
    /**
     * 打开对话框
     */
    openDialog() {
      this.$emit('initDialog');
      this.dialogVisible = true;
    },

    // 获取表单组件form对象
    getForm() {
      // console.log(this.$refs.compoFormRef.form)
      let finalForm = {}
      const obj = this.$refs.compoFormRef.form;
      const filtered = Object.entries(obj)
          .filter(([key]) => key.startsWith('checkField') ||
              key.startsWith('thresholdOperator') ||
              key.startsWith('highThreshold'))
          .map(([key, value]) => ({key, value}));
      const alarmConfigDetailDTOList = [];
      let currentObj = {};
      if (Array.isArray(filtered) && filtered.length >= 0) {
        filtered.forEach(item => {
          if(item.key.startsWith('checkField')) {
            currentObj.checkField = item.value;
          } else if(item.key.startsWith('thresholdOperator')) {
            currentObj.thresholdOperator = item.value;
          } else if(item.key.startsWith('highThreshold')) {
            currentObj.highThreshold = Number(item.value);
            alarmConfigDetailDTOList.push(currentObj);
            currentObj = {};
          }
        });
      }
      finalForm = {
        ...this.$refs.compoFormRef.getForm(),
        alarmConfigDetailDTOList
      };

      return finalForm;
    },

    // 设置表单组件form对象
    setForm(form) {
      this.$refs.compoFormRef.setForm(form);
    },

    // 重置表单组件form对象
    reset(resetFrom) {
      this.$refs.compoFormRef.reset(resetFrom);
    },

    /**
     * 关闭对话框
     */
    closeDialog() {
      this.dialogVisible = false;
      this.reset();
    },

    /**
     * 确定
     */
    confirm() {
      // 表单检验
      this.$refs.compoFormRef.validate(async(valid) => {
        if (valid) {
          this.dialogForm = this.getForm();
          this.dialogLoading = true;
          const { data: res } = await this.$http.post(this.dialogParams.url, this.dialogForm);
          this.dialogLoading = false;
          if (!res.success) {
            return this.$message.error(res.msg);
          }

          this.closeDialog();
          this.reset();
          // 通知主页面成功
          this.$emit('confirmSuccess', '');
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
