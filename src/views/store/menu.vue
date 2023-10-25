<template >
  <div >
    <el-container class="el-container">
      <el-main class="el-main">
        <el-card class="box-card" @click="openStore">
          <div slot="header" class="clearfix">
            <el-button style="float: right; padding: 3px 0" type="text" @click="openStore">开店</el-button>
          </div>
          <div class="section">
            <img class="logo-img" src="../../assets/open-store.png" alt="openStore"/>
          </div>
        </el-card>
        <el-card class="box-card" @click="closeStore">
          <div slot="header" class="clearfix">
            <el-button style="float: right; padding: 3px 0" type="text" >关店</el-button>
          </div>
          <div class="section"  >
            <img class="logo-img" src="../../assets/close-store.png"  alt="closeStore" />
          </div>
        </el-card>



        <el-card class="box-card" @click="organizeStore">
          <div slot="header" class="clearfix">
            <el-button style="float: right; padding: 3px 0" type="text" >组织</el-button>
          </div>
          <div class="section">
            <img class="logo-img" src="../../assets/operation.png"  alt="closeStore"/>
          </div>
        </el-card>
        <el-card class="box-card" @click="maintainStore">
          <div slot="header" class="clearfix">
            <el-button style="float: right; padding: 3px 0" type="text" >维护</el-button>
          </div>
          <div class="section">
            <img class="logo-img" src="../../assets/organization.png"  alt="closeStore"/>
          </div>
        </el-card>
        <el-card class="box-card" @click="transferStore">
          <div slot="header" class="clearfix">
            <el-button style="float: right; padding: 3px 0" type="text" @click="transferStore">转移</el-button>
          </div>
          <div class="section">
            <img class="logo-img" src="../../assets/transfer.png"  alt="closeStore"/>
          </div>
        </el-card>
        <el-card class="box-card" @click="auditStore">
          <div slot="header" class="clearfix">
            <el-button style="float: right; padding: 3px 0" type="text" >审批</el-button>
          </div>
          <div class="section">
            <img class="logo-img" src="../../assets/audit.png"  alt="closeStore"/>
          </div>
        </el-card>

        <el-dialog
            title="警告"
            v-model="dialogVisible"
            width="30%"
            :close="handleClose"
            center
        >
            <span class="confirmation-content">您将进行{{content}}操作？<br/>
              <el-checkbox :checked="checked" @change="handleChecked">我已勾选</el-checkbox></span>
        </el-dialog>

      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import {useRouter} from "vue-router";
import {computed, ref} from "vue";

const router = useRouter();
const dialogVisible = ref(false);
const content = ref('');

function handleClose() {
  dialogVisible.value = false;
}

function openStore() {
  router.push('/store/open');
}

function closeStore() {
  dialogVisible.value = true; // Show the dialog when clicking the image
  content.value = '关店';

}



function maintainStore() {
  dialogVisible.value = true;
  content.value = '维护';
}

const checked = ref(false);

function handleChecked(val) {
  checked.value = val;
  dialogVisible.value = false;
  console.log(content);
  if (content.value === '关店') {
    router.push('/store/close');
  } else if(content.value === '维护') {
    router.push('/store/maintain');
  } else if(content.value === '转移') {
    router.push('/store/transfer');
  } else if(content.value === '组织') {
    router.push({
      path:'/store/organize'
    })
  } else if(content.value === '审批') {
    router.push('/store/audit');
  }
}

function organizeStore() {
  dialogVisible.value = true;
  content.value = '组织';
}

function transferStore() {
  dialogVisible.value = true;
  content.value = '转移';
}

function auditStore() {
  dialogVisible.value = true;
  content.value = '审批';
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
.confirmation-content {
  font-size: 16px;
  color: #ffffff;
  margin: 10px 102px;
  position: relative;
}
</style>
