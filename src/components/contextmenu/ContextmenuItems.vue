<template>
  <component
    v-for="(item, index) in itemList"
    :key="index"
    :is="item.component"
    :title="item.title"
    @click="menuItemClick(item)"
  >
    <template #title v-if="item.children && item.children.length > 0">
      <span class="contextmenu-item">
        <span class="title">{{ item.title }}</span>
        <span class="tips">{{ item.tips }}</span>
      </span>
    </template>
    <contextmenu-items v-if="'children' in item" :list="item.children" @itemClick="menuItemClick" />

    <span v-if="!item.children || item.children.length == 0" class="contextmenu-item">
      <span class="title">{{ item.title }}</span>
      <span class="tips">{{ item.tips }}</span>
    </span>
  </component>
</template>

<script>
import {
  Contextmenu,
  ContextmenuItem,
  // ContextmenuDivider,
  // ContextmenuGroup,
  ContextmenuSubmenu,
} from 'v-contextmenu';
import 'v-contextmenu/dist/themes/default.css';

export default {
  name: 'ApiScriptEditor',
  components: {
    VContextmenu: Contextmenu,
    // ContextmenuItem,
    // VContextmenuDivider: ContextmenuDivider,
    // VContextmenuGroup: ContextmenuGroup,
    // ContextmenuSubmenu,
  },
  emits: ['itemClick'],

  props: {
    list: {
      type: Array,
      default: () => [],
    },
  },

  computed: {
    itemList() {
      const result = [];
      this.list.forEach((o) => {
        if (o.children && o.children.length > 0) {
          result.push({
            title: o.title,
            tips: o.tips,
            command: o.command,
            component: ContextmenuSubmenu,
            children: o.children,
          });
        } else {
          result.push({
            title: o.title,
            tips: o.tips,
            command: o.command,
            component: ContextmenuItem,
            children: o.children,
          });
        }
      });

      return result;
    },
  },

  methods: {
    menuItemClick(item) {
      this.$emit('itemClick', item);
    },
  },
};
</script>
