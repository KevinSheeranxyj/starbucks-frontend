<template>
  <div class="page-not-found-container">
    <div class="content-container">
      <h1>:(</h1>
      <h2>404：你访问的网页地址不存在，正在跳转至首页...</h2>
      <h2>
        完成 <span id="percentage">{{ progressValue }}</span
        >%
      </h2>
      <div class="details">
        <div class="stopcode">
          <h5 style="font-size: 16px;">
            不好意思！该页面还未建设或者已经被移除！立即返回请点击：<a href="/app">返回首页</a>
          </h5>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Error404',
  components: {},

  data() {
    return {
      message: '',
      inputValue: '',
      progressValue: 0
    };
  },

  created() {
    this.showProgress();
  },

  methods: {
    showProgress() {
      let progressValue = 0;
      const interval = setInterval(() => {
        progressValue += Math.ceil(Math.random() * 30);
        if (progressValue >= 100) {
          this.progressValue = 100;
          clearInterval(interval);
          this.backToHome();
          return;
        }
        this.progressValue = progressValue;
      }, 1000);
    },
    backToHome() {
      setTimeout(() => {
        this.$router.push('/');
      }, 1000);
    }
  }
};
</script>

<style lang="scss" scoped>
.page-not-found-container {
  height: 100%;
  width: 100%;
  display: table;
  background: #0078d7;
  color: #fefeff;
  font-family: Calibri, Candara, Segoe, 'Segoe UI', Optima, Arial, sans-serif;

  display: flex;
  justify-content: center;
  align-items: center;

  .content-container {
    width: 60%;
    height: 80%;
    h1 {
      margin: 10px;
      font-size: 9.5em;
      font-weight: 300;
      line-height: 180px;
    }
    h2 {
      margin-bottom: 10px;
      font-size: 2em;
      font-weight: 300;
    }

    .details {
      // width: 70%;
      margin-top: 50px;
      display: flex;
      justify-content: center;
      align-items: center;

      .qr {
        width: 100px;
        height: 100px;
        display: flex;
        justify-content: center;
        align-items: center;

        .image img {
          width: 80%;
          height: 80%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
      .stopcode {
        flex: 1;

        h5 {
          margin: 0;
          font-size: 2em;
          font-weight: 300;

          a: {
            color: #fefeff;
            text-decoration: none;
          }
          a:link {
            color: #fefeff;
          }
          a:visited {
            color: #fefeff;
          }
          a:hover {
            color: #fefeff;
          }
        }
      }
    }
  }
}
</style>
