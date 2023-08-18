<template>
  <div class="store-container">
    <el-container class="el-container">
      <el-main class="el-main">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <el-button style="float: right; padding: 3px 0" type="text" @click="openStore()">开店</el-button>
          </div>
          <div class="section">
            <img class="logo-img" src="../../assets/open-store.png" alt="openStore"/>
          </div>
        </el-card>
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <el-button style="float: right; padding: 3px 0" type="text" @click="closeStore()">关店</el-button>
          </div>
          <div class="section" @click="closeStore()">
            <img class="logo-img" src="../../assets/close-store.png"  alt="closeStore"/>
          </div>
        </el-card>
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <el-button style="float: right; padding: 3px 0" type="text">组织</el-button>
          </div>
          <div class="section">
            <img class="logo-img" src="../../assets/operation.png"  alt="closeStore"/>
          </div>
        </el-card>
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <el-button style="float: right; padding: 3px 0" type="text">维护</el-button>
          </div>
          <div class="section">
            <img class="logo-img" src="../../assets/organization.png"  alt="closeStore"/>
          </div>
        </el-card>
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <el-button style="float: right; padding: 3px 0" type="text">转移</el-button>
          </div>
          <div class="section">
            <img class="logo-img" src="../../assets/transfer.png"  alt="closeStore"/>
          </div>
        </el-card>
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <el-button style="float: right; padding: 3px 0" type="text">审批</el-button>
          </div>
          <div class="section">
            <img class="logo-img" src="../../assets/audit.png"  alt="closeStore"/>
          </div>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import {useRouter} from "vue-router";

const router = useRouter();

function openStore() {
  this.router.push('/store/open-store')
}

function closeStore() {
  this.router.push('/store/close-store');
}

function maintainStore() {
  this.router.push('store/maintain-store');
}

</script>

<style scoped>
.el-main {
  background-color: #000;
  color: #333;
  text-align: center;
  display: flex;
  margin: 1.7em 0.48em 0;
  flex-wrap: wrap;
}
.box-card {
  height: 150px;
  width: 400px;
  float: right;
  margin: 10px;
}
.section {
  cursor: pointer;
  width: 4.4rem;
  height: 4.8rem;
  box-shadow: 0px 4px 24px 0px rgba(0, 0, 0, 0.16);
  border-radius: 8px;
}
img {
  width: 100%;
}
p {
  font-size: .29rem;
  font-weight: 400;
  margin-top: .75rem;
  text-align: center;
}
</style>
