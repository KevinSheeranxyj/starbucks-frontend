<template>
  <div id="tags-view-container" class="tags-view-container">
    <scroll-pane ref="scrollPane" class="tags-view-wrapper" @scroll="handleScroll">
      <transition-group name="list">
        <router-link
          v-for="tag in visitedViews"
          :ref="setTagRef"
          :key="tag.path"
          :class="isActive(tag) ? 'active' : ''"
          :to="{ path: tag.path, query: tag.query }"
          tag="span"
          class="tags-view-item"
          @contextmenu.prevent="openMenu(tag, $event)"
        >
          {{ tag.title }}
          <el-icon v-if="!isAffix(tag)" class="el-icon-close" @click.prevent.stop="closeSelectedTag(tag)">
            <close />
          </el-icon>
        </router-link>
      </transition-group>
    </scroll-pane>
    <ul v-show="visible" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">关闭</li>
      <li @click="closeOthersTags">关闭其它</li>
      <li @click="closeAllTags(selectedTag)">关闭全部</li>
    </ul>
  </div>
</template>

<script>
import { constantRoutes } from '@/router';
import { Close } from '@element-plus/icons';
import ScrollPane from './ScrollPane';
import path from 'path';
import { ElMessage } from "element-plus/lib/components";

export default {
  components: {
    ScrollPane,
    Close,
  },
  data() {
    return {
      visible: false,
      top: 0,
      left: 200,
      selectedTag: {},
      affixTags: [],
      tagRefs: [],
    };
  },
  computed: {
    visitedViews() {
      return this.$store.state.tagsView.visitedViews;
    },
    routes() {
      return constantRoutes;
    },
  },
  watch: {
    $route() {
      // 每次路由变化时将tagRefs清空，否则tagRefs会被添加重复数据
      this.tagRefs = [];
      this.addTags();
      this.moveToCurrentTag();
    },
    visible(value) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu);
      } else {
        document.body.removeEventListener('click', this.closeMenu);
      }
    },
  },
  mounted() {
    this.initTags();
    this.addTags();
  },
  methods: {
    setTagRef(el) {
      if (el) {
        this.tagRefs.push(el);
      }
    },

    isActive(route) {
      return route.path === this.$route.path || route.path === this.getParentRoute().path;
    },
    isAffix(tag) {
      return tag.meta && tag.meta.affix;
    },
    filterAffixTags(routes, basePath = '/') {
      let tags = [];
      routes.forEach((route) => {
        if (route.meta && route.meta.affix) {
          const tagPath = path.resolve(basePath, route.path);
          tags.push({
            fullPath: tagPath,
            path: tagPath,
            name: route.name,
            meta: { ...route.meta },
          });
        }
        if (route.children) {
          const tempTags = this.filterAffixTags(route.children, route.path);
          if (tempTags.length >= 1) {
            tags = [...tags, ...tempTags];
          }
        }
      });
      return tags;
    },

    initTags() {
      const affixTags = (this.affixTags = this.filterAffixTags(this.routes));
      for (const tag of affixTags) {
        // Must have tag name
        if (tag.name) {
          this.$store.dispatch('tagsView/addVisitedView', tag);
        }
      }
    },

    addTags() {
      const { name, meta } = this.$route;
      // router中配置name才添加到tagsView
      if (name) {
        const parentRoute = this.getParentRoute();
        if (meta.isChild) {
          this.$store.dispatch('tagsView/addView', parentRoute);
        } else {
          this.$store.dispatch('tagsView/addView', this.$route);
          // 如果标签数大于5，则关闭第一个打开的标签
          if(this.visitedViews.length > 5){
            const firstView = this.visitedViews.slice(0)[0];
            this.$store.dispatch('tagsView/delView', firstView);
          }
        }
      }
      return false;
    },
    getParentRoute() {
      for (const matchedRoute of this.$route.matched) {
        if (matchedRoute.children.map((o) => o.name).indexOf(this.$route.name) > -1) {
          return matchedRoute;
        }
      }
    },
    moveToCurrentTag() {
      const tags = this.tagRefs;
      this.$nextTick(() => {
        for (const tag of tags) {
          if (tag.to.path === this.$route.path) {
            this.$refs.scrollPane.moveToTarget(tag);
            // when query is different then update
            if (tag.to.fullPath !== this.$route.fullPath) {
              this.$store.dispatch('tagsView/updateVisitedView', this.$route);
            }
            break;
          }
        }
      });
    },
    refreshCurrentTag() {
      console.log('刷新');
      const currentTag = this.getCurrentTag();
      console.log(currentTag);
      this.refreshSelectedTag(currentTag, this.$route.query);
    },
    getCurrentTag() {
      for (const tag of this.visitedViews) {
        if (this.isActive(tag)) return tag;
      }
    },
    refreshSelectedTag(view, query) {
      this.$store.dispatch('tagsView/delCachedView', view).then(() => {
        const { fullPath, path } = view;
        const targetPath = fullPath ? fullPath : path;
        this.$nextTick(() => {
          const to = {
            path: '/redirect' + targetPath,
          };
          if (query) {
            to['query'] = query;
          }
          this.$router.replace(to);
        });
      });
    },
    closeSelectedTag(view) {
      if(this.visitedViews.length === 1){
        return ElMessage.warning('请至少保留1个标签！');
      }

      this.$store.dispatch('tagsView/delView', view).then(({ visitedViews }) => {
        if (this.isActive(view)) {
          this.toLastView(visitedViews, view);
        }
      });
    },
    closeOthersTags() {
      this.$router.push(this.selectedTag);
      this.$store.dispatch('tagsView/delOthersViews', this.selectedTag).then(() => {
        this.moveToCurrentTag();
      });
    },
    closeAllTags(view) {
      this.$store.dispatch('tagsView/delAllViews').then(({ visitedViews }) => {
        if (this.affixTags.some((tag) => tag.path === view.path)) {
          return;
        }
        this.toLastView(visitedViews, view);
      });
    },
    toLastView(visitedViews, view) {
      const latestView = visitedViews.slice(-1)[0];
      if (latestView) {
        this.$router.push(latestView.fullPath);
      } else {
        // now the default is to redirect to the home page if there is no tags-view,
        // you can adjust it according to your needs.
        if (view.name === '/home') {
          // to reload home page
          this.$router.replace({ path: '/redirect' + view.fullPath });
        } else {
          const roles = this.$store.state.user.roles;
          if (roles.length === 1 && roles[0] === 'L1') {
            this.$router.push('/device/restart');
          } else {
            this.$router.push('/home');
          }
        }
      }
    },
    openMenu(tag, e) {
      const menuMinWidth = 105;
      // const offsetLeft = this.$el.getBoundingClientRect().left; // container margin left
      const offsetWidth = this.$el.offsetWidth; // container width
      const maxLeft = offsetWidth - menuMinWidth; // left boundary
      // const left = e.clientX - offsetLeft + 15; // 15: margin right
      const left = e.clientX;

      if (left > maxLeft) {
        this.left = maxLeft;
      } else {
        this.left = left;
      }

      this.top = e.clientY;
      this.visible = true;
      this.selectedTag = tag;
    },
    closeMenu() {
      this.visible = false;
    },
    handleScroll() {
      this.closeMenu();
    },
  },
};
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 40px;
  width: 100%;
  // background: #fff;

  .tags-view-wrapper {
    .list-enter-active,
    .list-leave-active {
      transition: all 0.25s ease;
    }
    .list-enter-from,
    .list-leave-to {
      opacity: 0;
      transform: translateY(30px);
    }
    .tags-view-item {
      border-radius: 4px;
      text-decoration-line: none;
      display: inline-block;
      position: relative;
      cursor: pointer;
      height: 24px;
      line-height: 24px;
      border: 1px solid #2a598a;
      color: #E5EAF3;
      background: #000000;
      padding: 0 8px;
      font-size: 14px;
      margin-left: 5px;
      margin-top: 5px;
      &:first-of-type {
        margin-left: 5px;
        margin-top: 53px;
      }
      &:last-of-type {
        margin-right: 5px;
      }
      &:hover {
        background-color: #409eff;
      }
      &.active {
        background-color: #409eff;
        color: #ffffff;
        border-color: #409eff;
        // &::before {
        //   content: '';
        //   background: #fff;
        //   display: inline-block;
        //   width: 8px;
        //   height: 8px;
        //   border-radius: 50%;
        //   position: relative;
        //   margin-right: 2px;
        // }
      }
      .el-icon-close {
        line-height: 18px;
        width: 16px;
        height: 16px;
        vertical-align: -2px;
        border-radius: 50%;
        text-align: center;
        transition: all 0.1s cubic-bezier(0.645, 0.045, 0.355, 1);
        transform-origin: 100% 50%;
        &:before {
          transform: scale(0.6);
          display: inline-block;
          // vertical-align: -2px;
        }
        &:hover {
          background-color: #ff4655;
          color: #fff;
        }
      }
    }
  }
  .contextmenu {
    margin: 0;
    background: #fff;
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
      &:hover {
        background: #eee;
      }
    }
  }
}
</style>
