<template>
  <div></div>
</template>
<script>
export default {
  name: 'Redirect',
  mounted() {
    const { params, query } = this.$route;
    const { path } = params;
    // setTimeout(() => {
    //   this.$router.replace({ path: '/' + path, query });
    // }, 2000);
    this.$router.replace({ path: '/' + path, query });
  },

  // beforeRouteEnter(to, from, next) {
  //   console.log('刷新');

  //   next((vm) => {
  //     const { params, query } = vm.$route;
  //     const { path } = params;
  //     vm.$router.replace({ path: '/' + path, query });
  //     // vm.$router.replace(from.path);
  //   });
  // }
};
</script>
