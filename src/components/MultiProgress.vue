<template>
  <div class="multi-progress">
    <div class="container">
      <div class="a"></div>
      <div class="b"></div>
      <div class="desc">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MultiProgress',
  props: {
    strokeWidth: {
      type: Number,
      default: 18,
    },

    percentageA: {
      type: Number,
      default: 0,
    },

    percentageB: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
        borderRadius: "",
        addWidth: "",
        marginLeft: "",
        progressHeight: "",
        percentageAValue: "0%",
        percentageBValue: "0%",
    };
  },

  created() {
      this.percentageAValue = "0px";
      this.percentageBValue = "0px";
      if (this.percentageA + this.percentageB > 100){
          console.error("进度总值不可超过100");
          return
      }
      this.borderRadius = this.strokeWidth / 2 + 'px';
      this.marginLeft = "-" + this.strokeWidth + 'px';
      this.addWidth = this.strokeWidth + 'px';
      this.progressHeight = this.strokeWidth + 'px';
      this.percentageAValue = this.percentageA.toFixed(0)+"%";
      this.percentageBValue = this.percentageB.toFixed(0)+"%";
  },

  computed: {},

  methods: {},
};
</script>

<style lang="scss" scoped>
.multi-progress {
  width: 100%;
  padding: 0 5%;

  .container {
    display: flex;
    // justify-content: center;
    // align-items: center;
    position: relative;

    width: 100%;
    height: v-bind(progressHeight);
    background-color: #a7a7a7;
    border-radius: v-bind(borderRadius);
    line-height: v-bind(progressHeight);
    overflow: hidden;

    .a {
      width: v-bind(percentageAValue);
      height: 100%;
      float: left;
      background-color: #67c23a;
      border-radius: v-bind(borderRadius);
      z-index: 1;
    }
    .b {
      width: calc(v-bind(percentageBValue) + v-bind(addWidth));
      height: 100%;
      float: left;
      margin-left: v-bind(marginLeft);
      background-color: #e6a23c;
      border-radius: v-bind(borderRadius);
    }
    .desc {
      position: absolute;
      left: 5px;
      color: #ffffff;
      z-index: 2;
    }
  }
}
</style>
