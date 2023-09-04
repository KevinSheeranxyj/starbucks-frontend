<script>
export default {
  data() {
    return {
      hasApprovalPermission: false, // 根据你的逻辑来确定
      pendingApprovals: [
        // 示例数据
        { submitter: 'Alice', content: 'Approval request 1' },
        { submitter: 'Bob', content: 'Approval request 2' },
      ],
      mySubmissions: [
        // 示例数据
        { content: 'My approval request 1', status: 'Pending' },
        { content: 'My approval request 2', status: 'Approved' },
      ],
    };
  },
  methods: {
    approve(row) {
      // 审核通过的逻辑
      alert(`Approved: ${row.content}`);
    },
    reject(row) {
      // 驳回的逻辑
      alert(`Rejected: ${row.content}`);
    },
    performAction(row) {
      // 执行后续操作的逻辑
      alert(`Performing action for: ${row.content}`);
    },
  },
};
</script>

<template >
  <div class="padded-container">
    <!-- 审批人员视图 -->
    <div v-if="hasApprovalPermission">
      <h3>待审批的记录</h3>
      <el-table :data="mySubmissions">
        <el-table-column prop="submitter" label="提交人"></el-table-column>
        <el-table-column prop="content" label="内容"></el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button @click="approve(scope.row)">批准</el-button>
            <el-button @click="reject(scope.row)">驳回</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>



    <!-- 普通用户视图 -->
    <div v-else  >
      <h3>我提交的审批记录</h3>
      <el-table :data="mySubmissions">
        <el-table-column prop="content" label="内容"></el-table-column>
        <el-table-column prop="status" label="状态"></el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button v-if="scope.row.status === 'Approved'" @click="performAction(scope.row)">执行操作</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<style>
.padded-container {
  padding: 10px;  /* 内边距 */
  margin: 20px;  /* 外边距 */
}
</style>
