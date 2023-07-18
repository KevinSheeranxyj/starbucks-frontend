<template>
  <div class="login-container">
    <div class="title-container">
      <div class="logo">
        <img src="../assets/repeat.png">
      </div>
      <h1 class="title">Starbucks Network Management</h1>
    </div>
    <div class="form-container">
      <el-form :model="loginForm">
        <el-form-item>
          <el-input v-model="loginForm.username" size="default">
            <template #prefix>
              <el-icon class="el-input__icon">
                <user />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="loginForm.password" size="default" show-password>
            <template #prefix>
              <el-icon class="el-input__icon">
                <lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item size="large">
          <el-button :loading="loginLoading" class="login-button" type="primary" @click="requestLogin">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-dialog
      v-model="passwordDialogVisible"
      title="密码重置"
      width="300px"
    >
      <el-form ref="passwordFormRef" :model="passwordForm" label-position="right" label-width="70px">
        <el-form-item label="登录账号" prop="email" :rules="rules">
          <el-input v-model="passwordForm.email" size="default">
            <template #prefix>
              <el-icon class="el-input__icon">
                <user />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="原始密码" prop="password" :rules="rules">
          <el-input v-model="passwordForm.password" size="default">
            <template #prefix>
              <el-icon class="el-input__icon">
                <user />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="新的密码" prop="newPassword" :rules="rules">
          <el-input v-model="passwordForm.newPassword" size="default" show-password>
            <template #prefix>
              <el-icon class="el-input__icon">
                <lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="passwordConfirm" :rules="rules">
          <el-input v-model="passwordForm.passwordConfirm" size="default" show-password>
            <template #prefix>
              <el-icon class="el-input__icon">
                <lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" plain @click="passwordDialogVisible = false">
          取 消
        </el-button>
        <el-button type="primary" plain @click="resetPassword">
          确 定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { Lock, User } from '@element-plus/icons-vue'
import { setToken } from '@/utils/auth'
import NProgress from 'nprogress'

export default {
  name: 'Login',
  components: { User, Lock },
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginLoading: false,
      // 重置密码对话框
      passwordDialogVisible: false,
      passwordForm: {
        email: '',
        password: '',
        newPassword: '',
        passwordConfirm: ''
      },
      // 表单规则
      rules: [{ required: true, message: '必填项', trigger: 'blur' }
      ]
    }
  },

  methods: {
    /**
     * 登录
     */
    async requestLogin() {
      this.loginLoading = true

      if (this.loginForm.password === '123456') {
        this.loginLoading = false
        const { data: res } = await this.$http.post('/sys/user/check', { email: this.loginForm.username })
        if (!res.success) {
          return this.$message.error(res.msg)
        }
        // 用户首次登录，需重置密码
        if (res.data.initFlag === 1) {
          this.passwordDialogVisible = true
          this.passwordForm.email = this.loginForm.username
          this.passwordForm.password = this.loginForm.password
          return
        }
      }

      NProgress.start()
      const form = {
        username: this.loginForm.username,
        password: this.loginForm.password
      }
      try {
        const { data: res } = await this.$http.formPost('/login', form)
        if (!res.success) {
          return this.$message.error(res.msg)
        }
        this.saveLoginStatus(res.data.sessionId)
        const targetPath = this.$route.query.redirect
        if (targetPath) {
          this.$router.push(targetPath)
        } else {
          const { data: res } = await this.$http.get('/sys/user/info')
          const roles = res.data.roleList
          if (roles.length === 1 && roles[0] === 'L1') {
            this.$router.push('/device/restart')
          } else {
            this.$router.push('/')
          }
        }
      } catch (e) {
        console.log('登录失败')
      } finally {
        this.loginLoading = false
        NProgress.done()
      }
    },

    saveLoginStatus(token) {
      // 保存两天
      setToken(token, 2)
    },

    /**
     * 重置密码
     */
    async resetPassword() {
      this.$refs.passwordFormRef.validate(async(valid) => {
        if (valid) {
          const { data: res } = await this.$http.post('/sys/user/password/reset', this.passwordForm)
          if (!res.success) {
            return this.$message.error(res.msg)
          }
          this.passwordDialogVisible = false
          return this.$message.success(res.msg)
        }
      })
    }
  }
}
</script>

<style lang="scss">
.login-container {
  height: 100%;
  width: 100%;
  // overflow: hidden;
  display: flex;
  flex-direction: column;
  // justify-content: center;
  align-items: center;

  background-color: rgba(0, 0, 0, 0);
  background-position-x: 0%, 0%, 0%;
  background-position-y: 0%, 0%, 0%;
  background-repeat: repeat, repeat, repeat;
  background-attachment: scroll, scroll, scroll;
  background-image: linear-gradient(to right, #434343 0%, black 100%);
  background-size: auto, auto, auto;
  background-origin: padding-box, padding-box, padding-box;
  background-clip: border-box, border-box, border-box;

  .title-container {
    margin-top: 5%;

    .logo {
      text-align: center;
    }

    .title {
      color: #ffffff;
    }
  }

  .form-container {
    width: 300px;

    .el-form-item {
      margin-right: 0;
    }

    .login-button {
      width: 300px;
    }
  }
}
</style>
