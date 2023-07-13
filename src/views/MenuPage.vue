<template>
  <div class="menu-page-wrap">
    <el-menu
      :default-active="currentIndex"
      ref="menuPageRef"
      class="sub-page-menu"
      mode="horizontal"
      :ellipsis="false"
      @select="handleSelect"
    >
      <el-menu-item v-for="item in menuData" :index="item.name" :key="item.name">
        <el-badge :value="item.meta.badge" :hidden="!item.meta.badge" type="danger" class="badge-tab">
          {{ item.meta.title }}
        </el-badge>
      </el-menu-item>
    </el-menu>
    <!-- router-view component -->
    <div class="sub-page-wrap">
      <!-- 包含iframe的vue组件无法通过keep-alive保留状态，故通过v-show控制 -->
      <!-- iframe components -->
      <component v-show="isIframe" :is="iframeComponent"> </component>

      <!-- router-view component -->
      <router-view v-show="!isIframe" v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MenuPage',
  created() {
    // 监听小红点数量更新事件
    this.$mitt.on('updateTodo', (o) => {
      for (const key in o) {
        for (let item of this.menuData) {
          if (item.name === key) {
            item.meta[item.name] = o[key];
          }
        }
      }
    });
  },

  data() {
    return {
      menuData: Array,
      defaultMenu: String,

      iframeComponent: null,
      currentIndex: '',
      activated: false,
    };
  },

  watch: {
    $route() {
      if (this.isIframe) {
        this.iframeComponent = this.$route.meta.iframeComponent;
      }
      this.$nextTick(() => {
        this.setCurrentMenu();
      });
    },
  },

  computed: {
    isIframe() {
      if (this.$route.meta.isSubIframe) {
        return true;
      }
      return false;
    },
  },
  mounted() {
    this.defaultMenu = this.getDefaultRoute();
    this.menuData = this.getChildrenRoute();
    if (this.isIframe) {
      this.iframeComponent = this.$route.meta.iframeComponent;
    }

    this.activated = true;
    this.$nextTick(() => {
      this.setCurrentMenu();
      this.selectCurrentMenu();
    });
  },

  activated() {
    if (this.activated) {
      return;
    }
    this.activated = true;
    this.$nextTick(() => {
      this.setCurrentMenu();
      this.selectCurrentMenu();
    });
  },

  deactivated() {
    this.activated = false;
  },

  methods: {
    setCurrentMenu() {
      if (!this.activated) {
        return;
      }
      if (this.$route.meta.isChild) {
        this.currentIndex = this.$route.name;
        return;
      }
      if (!this.currentIndex) {
        this.currentIndex = this.defaultMenu;
        return;
      }
    },
    selectCurrentMenu() {
      this.handleSelect(this.currentIndex);
    },

    handleSelect(index) {
      this.currentIndex = index;
      this.$router.push({ name: index });
    },

    // 获取当前菜单页的默认路由
    getDefaultRoute() {
      let menuPageRoute = null;
      if (this.$route.meta.isChild) {
        menuPageRoute = this.getParentRoute();
      } else {
        menuPageRoute = this.$route;
      }
      return menuPageRoute.meta.defaultMenu;
    },

    // 获取当前菜单页的子路由
    getChildrenRoute() {
      let menuPageRoute = null;
      if (this.$route.meta.isChild) {
        menuPageRoute = this.getParentRoute();
      } else {
        menuPageRoute = this.$route;
      }
      const fullRouteInfo = this.getFullRouteInfo(menuPageRoute.name, this.$router.options.routes);
      return fullRouteInfo.children;
    },

    // 获取完整的路由信息
    getFullRouteInfo(name, routes) {
      for (const route of routes) {
        if (route.name == name) {
          return route;
        }
        if (route.children) {
          const target = this.getFullRouteInfo(name, route.children);
          if (target && target.name == name) {
            return target;
          }
        }
      }
    },

    getParentRoute() {
      for (const matchedRoute of this.$route.matched) {
        if (matchedRoute.children.map((o) => o.name).indexOf(this.$route.name) > -1) {
          return matchedRoute;
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.menu-page-wrap {
  height: 100%;

  .sub-page-menu {
    height: 40px;
    width: 100%;
  }

  .sub-page-wrap {
    height: calc(100% - 40px);
  }
}
</style>

<style lang="scss">
.menu-page-wrap {
  .el-menu--horizontal > .el-menu-item {
    height: 40px;
  }
  .badge-tab .el-badge__content.is-fixed {
    top: 18px;
    right: 5px;
  }
}
</style>
