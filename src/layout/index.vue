<template>
  <div class="app-container">
    <div class="app-aside">
      <div class="title-container" @click="onTitleClick" title="跳转概览">
        <div class="logo-container">
          <img class="logo-img" src="../assets/repeat.png" />
        </div>
        <div v-show="!isCollapse" class="title-container">Starbucks</div>
      </div>
      <div class="menu-search-container" v-show="!isCollapse">
        <el-autocomplete
          size="default"
          ref="searchInputRef"
          v-model="menuSearchValue"
          :fetch-suggestions="menuSearch"
          :trigger-on-focus="true"
          :debounce="50"
          :highlight-first-item="true"
          class="menu-search-input"
          placeholder="搜索菜单项"
          @clear="searchCleared"
          @select="menuSearchSelect"
        >
          <template #prefix>
            <el-icon class="el-input__icon">
              <search />
            </el-icon>
          </template>
        </el-autocomplete>
      </div>
      <div class="menu-container">
        <div class="scroll-container">
          <el-scrollbar>
            <el-menu :collapse="isCollapse" :collapse-transition="false">
             <el-menu-item-group>
               <el-menu-item index="1-1" @click="routeHome">
                 <el-icon><Menu /></el-icon>
                 <span>首页</span>
               </el-menu-item>
               <el-menu-item index="1-2" @click="routeStore">
                 <el-icon><Menu /></el-icon>
                 <span>门店操作</span>
               </el-menu-item>
             </el-menu-item-group>

              <el-sub-menu v-for="subMenuData in menuData" :index="subMenuData.index" :key="subMenuData.index">
                <template #title>
                  <el-icon>
                    <component :is="subMenuData.icon" />
                  </el-icon>
                  <span>{{ subMenuData.title }}</span>
                </template>
                <el-menu-item
                  v-for="(item, index) in getMenu(subMenuData.children)"
                  :index="item.path"
                  :key="index"
                  @click="menuItemClick(item)"
                >
                  <template #title>
                    <el-icon>
                      <component :is="item.icon" />
                    </el-icon>
                    <span>{{ item.title }}</span>
                  </template>
                </el-menu-item>
              </el-sub-menu>
            </el-menu>
          </el-scrollbar>

          <!-- <div class="menu-container"></div> -->
        </div>
      </div>

      <div class="collapse-container" @click="toggleMenu">
        <div class="toggle-button">
          <el-icon class="arrow-icon" :class="isCollapse ? '' : 'arrow-icon-animation'">
            <d-arrow-right />
          </el-icon>
        </div>
        <div v-show="!isCollapse" class="toggle-label">折叠菜单</div>
      </div>
    </div>

    <div class="app-body">
      <div class="header-container">
        <div class="tags-container">
          <tags-view ref="tagsView" />
        </div>

        <div class="quick-bar-container">
          <div class="logout-button" @click="logout">退出登录</div>
          <div class="refresh-icon" @click="refreshCurrentTag">
            <el-icon class="refresh-icon">
              <refresh-right />
            </el-icon>
          </div>
        </div>
      </div>


      <div class="app-main-container">
        <app-main />
      </div>
    </div>

  </div>
</template>

<script>
import menu from '../menu';
import {mapGetters} from 'vuex';
import { AppMain, TagsView } from './components';
import {
  Menu,
  DArrowRight,
  RefreshRight,
  Search,
} from '@element-plus/icons-vue';
import { removeToken } from '@/utils/auth';
import PinyinMatch from 'pinyin-match';
import { layoutRoutes } from '../router/index';

export default {
  name: 'Index',
  components: {
    Menu,
    AppMain,
    TagsView,
    DArrowRight,
    RefreshRight,
    Search,
  },
  data() {
    return {
      isCollapse: false,
      menuData: menu,
      menuSearchValue: '',
      menuDataList: [],
      routeData: layoutRoutes,
      drawer: false,

      // 公告
      dialogTitle: '',
      dialogVisiable: false,
      noticeArr: [],
      currentNotice: {},
      noticeReplyContent: '',

    };
  },
  computed: {
    ...mapGetters([
      'permissionRoutes',
      // 'sidebar'
    ]),

    asideWidth() {
      return this.isCollapse ? '64px' : '200px';
    },
  },
  created() {
    console.log('Layout created');

    // const that = this;
    // setInterval(() => {
    //   if (this.dialogVisiable === true) {
    //     return;
    //   }
    //   that.getNoticeArray();
    // }, 3600000);
    this.menuData = this.getMenuL2(this.menuData);
  },

  activated() {
    console.log('Layout activated');
  },
  deactivated() {
    console.log('Layout deactivated');
  },
  mounted() {
    console.log('Layout mounted');
    // 将菜单数据添加到搜索列表中
    this.setSearchData();


  },
  unmounted() {
    console.log('Layout unmounted');
  },
  methods: {
    getMenuL2(menuData) {
      const roles = this.$store.state.user.roles;
      if (roles.length === 1 && roles[0] === 'L1') {
        return
        // return   [{
        //   index: '01',
        //   icon: DataAnalysis,
        //   title: '设备管理',
        //   children: [
        //     { icon: SwitchButton, title: '门店重启', path: '/device/restart', role: 'L1' },
        //   ]
        // }]
      }
      return menuData;
    },

    getMenu(menu) {
      const roles = this.$store.state.user.roles;
      if(roles){
        if (roles.length === 1 && roles[0] === 'L1') {
          return menu.filter(function (menu) {
            if (menu.role === 'L1') {
              return menu;
            }
          });
        }
      }
      return menu;
    },

    toggleMenu() {
      this.isCollapse = !this.isCollapse;
    },

    menuItemClick(item) {
      if (item.name) {
        this.$router.push({ name: item.name, params: item.params });
        return;
      }
      this.$router.push({ path: item.path, query: item.query });
    },

    /**
     * 首页跳转
     */
    routeHome() {
      const roles = this.$store.state.user.roles;
      if (roles.length === 1 && roles[0] === 'L1') {
        this.$router.push('/device/restart');
      } else {
        this.$router.push('/home');
      }
    },

    /**
     * 门店跳转
     *
     */
    routeStore() {
      window.open(window.location.origin + '#/store/main-store')
    },

    refreshCurrentTag() {
      this.$refs.tagsView.refreshCurrentTag();
    },

    async logout() {
      this.setCookie('username', '', -1);
      this.$message.info('已退出登录');
      this.$router.push({ path: '/login' });
      this.$store.dispatch('user/clearUserInfo');
      removeToken();
      this.$store.dispatch('tagsView/delAllViews');
      const { data: res } = await this.$http.get(`/logout`);
      if (!res.success) {
        return this.$message.error(res.errorMsg);
      }
    },

    setCookie(name, value, exdays) {
      let cookie = name + '=' + value + ';';
      if (exdays) {
        let d = new Date();
        d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
        let expires = 'expires=' + d.toGMTString();
        cookie = cookie + ' ' + expires;
      }
      document.cookie = cookie;
    },

    // 搜索框结果点击事件
    menuSearchSelect(item) {
      console.log(item);
      this.$router.push({ name: item.name, query: item.query });
    },

    setSearchData() {
      // 将菜单数据添加到搜索列表中
      this.routeData.forEach((o) => {
        if (o.meta.unsearchable) {
          return;
        }
        this.menuDataList.push({
          value: o.meta.title,
          name: o.name,
        });
        if (o.children) {
          o.children.forEach((menu) => {
            if (menu.meta.unsearchable) {
              return;
            }
            this.menuDataList.push({
              value: menu.meta.title,
              name: menu.name,
            });
          });
        }
      });

      // 如果角色是L2，则清空搜索菜单
      const roles = this.$store.state.user.roles;
      if (roles.length === 1 && roles[0] === 'L1') {
        this.menuDataList = [];
      }
    },

    // 根据搜索框关键字模糊查询
    getListByQueryString(queryString) {
      return this.menuDataList.filter((menuData) => {
        const matchResult = PinyinMatch.match(menuData.value, queryString);
        if (!matchResult) {
          return false;
        }
        return true;
      });
    },

    menuSearch(queryString, callback) {
      const result = queryString ? this.getListByQueryString(queryString) : this.menuDataList;
      callback(result);
    },

    onTitleClick() {
      this.$router.push('/');
    },

    searchCleared() {
      this.$refs.searchInputRef.focus();
    },

    async getNoticeArray() {
      const { data: res } = await this.$http.get(`/notice/show`);
      if (!res.success) {
        return this.$message.error(res.msg);
      }
      let noticeArr = new Array();
      res.body.forEach((o) => {
        noticeArr.unshift(o);
      });
      this.noticeArr = noticeArr;
      this.showNotice();

    },

    showNotice() {
      const notice = this.noticeArr.shift();
      if (notice) {
        this.currentNotice = notice;
        this.dialogTitle = notice.title;
        this.dialogVisiable = true;
      }
    },

    async confirmNotice() {
      this.dialogVisiable = false;
      // 请求后端
      const body = {
        id: this.currentNotice.id,
      };
      const { data: res } = await this.$http.post(`/notice/confirm`, body);
      if (!res.success) {
        return this.$message.error(res.msg);
      } else {
        this.showNotice();
      }
    },

    async replyNotice() {
      if (!this.noticeReplyContent) {
        return this.$message.error('反馈内容不能为空！');
      }
      // 请求后端
      const body = {
        id: this.currentNotice.id,
        content: this.noticeReplyContent,
      };
      const { data: res } = await this.$http.post(`/notice/reply`, body);
      if (!res.success) {
        return this.$message.error(res.msg);
      }
      this.$message.success('反馈成功！');
      this.noticeReplyContent = '';
    },

  },
};
</script>

<style lang="scss" scoped>
$theme-color: #409eff;
$app-bg-color: rgba(255, 255, 255, 0);
$app-bg-transparent: #000;
.app-container {
  display: flex;
  height: 100%;
  width: 100%;
  //background: #000;
  background: linear-gradient(to bottom, #323232 0%, #3F3F3F 40%, #1C1C1C 150%), linear-gradient(to top, rgba(255,255,255,0.40) 0%, rgba(0,0,0,0.25) 200%);
  background-blend-mode: multiply;

  .app-aside {
    flex-grow: 0;
    flex-shrink: 0;
    height: 100vh;
    width: v-bind(asideWidth);
    border-right: 1px solid rgb(38,38,38);
    box-shadow: 0 3px 0 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);
    background-color: $app-bg-transparent;
    user-select: none;

    display: flex;
    flex-direction: column;

    .title-container {
      flex-grow: 0;
      flex-shrink: 0;

      height: 51px;
      display: flex;

      .logo-container {
        height: 50px;
        width: 63px;
        display: flex;
        justify-content: center;
        align-items: center;

        .logo-img {
          width: 50%;
        }
      }

      .title-container {
        width: 130px;
        font-size: 24px;
        line-height: 50px;
        text-align: center;
        color: #006636;
        font-family: Metropolis,"Avenir Next","Helvetica Neue",Arial,sans-serif;
      }
    }

    .menu-search-container {
      height: 40px;
      margin: 0 10px 5px 10px;
    }

    .menu-container {
      flex: 1;
      width: 100%;
      overflow-x: hidden;
      overflow-y: auto;

      .scroll-container {
        height: 100%;
        width: 100%;
        overflow-x: hidden;

        .el-scrollbar {
          height: 100% !important;
          overflow-x: hidden;

          .el-menu {
            border-right: 0px;
          }
        }
      }
    }

    .collapse-container {
      flex-grow: 0;
      flex-shrink: 0;
      height: 50px;
      user-select: none;
      border-top: 1px solid rgb(38,38,38);

      display: flex;

      .toggle-button {
        height: 50px;
        width: 64px;
        font-size: 22px;

        display: flex;
        justify-content: center;
        align-items: center;

        .arrow-icon {
          transition: transform 0.3s;
        }

        .arrow-icon-animation {
          transform: rotate(180deg);
        }
      }

      .toggle-label {
        flex: 1;

        display: flex;
        justify-content: left;
        align-items: center;
        font-size: 15px;
      }
    }

    .collapse-container:hover {
      color: $theme-color;
    }
  }

  .app-body {
    flex: 1;
    height: 100%;
    overflow: auto;

    display: flex;
    flex-direction: column;
    // margin-left: 200px;
    .header-container {
      height: 82px;
      width: 100%;
      border-bottom: 1px solid rgb(38,38,38);
      background-color: $app-bg-transparent;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);

      display: flex;

      .tags-container {
        overflow: auto;
        flex: 1;
      }

      .quick-bar-container {
        // background-color: aliceblue;
        height: 40px;
        width: 130px;
        display: flex;
        flex-direction: row-reverse;
        padding-right: 10px;
        user-select: none;

        .logout-button {
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 14px;
          line-height: 35px;
          margin-left: 10px;
          color: #737373;
        }

        .logout-button:hover {
          color: $theme-color;
        }

        .refresh-icon {
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 17px;
          color: #737373;
        }

        .refresh-icon:hover {
          color: $theme-color;
        }
      }
    }

    .app-main-container {
      flex: 1;
      overflow: auto;
      width: 100%;

      background-color: #000;
    }
  }
}
</style>
<style lang="scss">
.app-container {
  .el-menu {
    background-color: #000;
  }

  .menu-search-input {
    .el-input__wrapper {
      border-radius: 6px;
      border: 0;
    }
  }

  .menu-search-container {
    .el-autocomplete {
      display: inline;
    }
  }

}
</style>
