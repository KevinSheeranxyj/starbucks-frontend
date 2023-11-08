<template>
  <div class="app-main-wrap">
    <!-- 包含iframe的vue组件无法通过keep-alive保留状态，故通过v-show控制 -->
    <!-- iframe components -->
    <component
      v-for="item in iframeComponents"
      :key="item.path"
      v-show="isCurrentIframe(item)"
      :is="item.meta.iframeComponent"
    >
    </component>

    <!-- router-view component -->
    <router-view v-show="!isIframe" v-slot="{ Component }">
      <keep-alive :include="cachedViews">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script>
export default {
  name: 'AppMain',
  data() {
    return {
      ManpowerManage: this.$route.meta.iframeComponent,
      iframeComponents: []
    };
  },
  watch: {
    cachedViews() {

      this.refreshIframeComponents();
    }
  },
  computed: {
    key() {
      return this.$route.path;
    },
    isIframe() {
      if (this.$route.meta.isIframe) {
        return true;
      }
      return false;
    },
    cachedViews() {
      const cachedViews = this.$store.state.tagsView.cachedViews;
      // console.log('cachedViews:' + cachedViews);
      // 奇怪的问题: join() 或者 打印一下cachedViews 可解决页面切换后卡死问题
      if (cachedViews.length <= 0) {
        // 奇怪的问题2: cachedViews为空的时候最后一个组件还是会缓存
        return 'NewBee';
      }
      return cachedViews.join();
    }
  },

  created() {},

  methods: {
    isCurrentIframe(item) {
      return this.$route.path == item.path;
    },
    refreshIframeComponents() {
      if (this.isIframe) {
        this.iframeComponents.push(this.$route);
      }
      // 删除缓存中没有组件
      let i = this.iframeComponents.length;
      while (i--) {
        const index = this.$store.state.tagsView.cachedViews.indexOf(this.iframeComponents[i].name);
        if (index > -1) {
          continue;
        }
        this.iframeComponents.splice(i, 1);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.app-main-wrap {
  height: 100%;
  overflow: auto;
}
</style>
