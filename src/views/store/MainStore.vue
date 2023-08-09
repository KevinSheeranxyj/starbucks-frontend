<template>
  <div class="store-container">
    <el-container class="el-container">
      <el-main class="el-main">
        <div class="select-sections">
          <div class="section">
            <img class="logo-img" src="../../assets/close-store.png"  alt="closeStore"/>
            <p>关店</p>
          </div>
          <div class="section">
            <img class="logo-img" src="../../assets/open-store.png" alt="openStore"/>
            <p>开店</p>
          </div>
          <div class="section">
            <img class="logo-img" src="../../assets/operation.png"  alt="closeStore"/>
            <p>维护</p>
          </div>
          <div class="section">
            <img class="logo-img" src="../../assets/organization.png"  alt="closeStore"/>
            <p>组织</p>
          </div>
          <div class="section">
            <img class="logo-img" src="../../assets/transfer.png"  alt="closeStore"/>
            <p>转移</p>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  name: "main-store"
}

</script>

<style scoped>
.el-main {
  background-color: #000;
  color: #333;
  text-align: center;
}
.select-sections {
  margin: 0.48rem;
  margin-top: 1.7rem;
  display: flex;
  justify-content: space-between;

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
