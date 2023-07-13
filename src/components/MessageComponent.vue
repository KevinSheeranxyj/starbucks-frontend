<template>
  <el-popconfirm title="确定微信提醒吗？" @confirm="wechatSend()">
    <template #reference> <el-button type="primary">微信提醒</el-button></template>
  </el-popconfirm>
  <el-button type="primary" @click="msgDetail()">消息详情</el-button>
</template>

<script>
export default {
  name: 'message-component',
  props: { cfgMsgCodeList: Array, cfgMsgCode: String },

  methods: {
    /**
     * 微信提醒
     */
    wechatSend() {
      this.$message.success('消息发送中，请稍等...');
      const cfgMsgCodes = this.cfgMsgCodeList;

      if (cfgMsgCodes) {
        cfgMsgCodes.forEach((code) => {
          this.sendMessage(code);
        });
      } else {
        this.sendMessage(this.cfgMsgCode);
      }
    },

    /**
     * 调用消息发送接口
     */
    async sendMessage(msgCode) {
      const msgData = {
        code: msgCode,
      };
      const { data: res } = await this.$http.post('/robot/message/send', msgData);
      if (!res.success) {
        return this.$message.error(res.msg);
      }
      return this.$message.success('消息发送成功');
    },

    /**
     * 跳转消息详情
     */
    msgDetail() {
      this.$router.push({
        name: 'MessageLogManager',
        params: {
          messageCode: this.cfgMsgCode,
        },
      });
    },
  },
};
</script>

<style></style>
