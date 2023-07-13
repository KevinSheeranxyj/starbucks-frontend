<template>
  <div class="single-data-container">
    <div class="header-container" v-show="$slots.header">
      <slot name="header"></slot>
    </div>
    <div class="body-container" v-show="$slots.body">
      <slot name="body"></slot>
    </div>
    <div class="footer-container" v-show="$slots.footer">
      <slot name="footer"></slot>
    </div>
    <slot name="others"></slot>
  </div>
</template>

<script>
export default {
  name: 'SingleDataView',
  data() {
    return {};
  },

  created() {},

  computed: {},

  methods: {},
};
</script>

<style lang="scss" scoped>
.single-data-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  .header-container {
    padding: 10px;
    padding-bottom: 0;
  }
  .body-container {
    flex: 1;
    overflow: auto;
    padding: 5px 10px 10px 10px;
  }
  .footer-container {
    padding: 10px;
    padding-top: 0;
  }
}
</style>
