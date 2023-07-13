<template>
  <div class="el-tabs-container">
    <slot name="tabs"></slot>
  </div>
</template>

<script>
export default {
  name: 'TabsContainer',
  components: {},
  data: () => ({}),

  created() {},

  methods: {},
};
</script>

<style lang="scss" scoped>
.el-tabs-container {
  height: 100%;
  padding: 0 0px;
}
</style>

<style lang="scss">
.el-tabs-container {
  .badge-tab .el-badge__content.is-fixed {
    top: 10px;
    right: 5px;
  }

  .el-tabs .el-tabs__header {
    margin: 0 10px 10px 10px;
  }

  .el-tabs {
    height: 100%;

    .el-tabs__header {
      margin-bottom: 10px;
    }

    .el-tabs__content {
      height: calc(100% - 49px);
      .el-tab-pane {
        height: 100%;
      }
    }
  }
}
</style>
