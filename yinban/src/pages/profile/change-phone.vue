<template>
  <view class="change-phone-container">
    <view class="form-section">
      <view class="form-item">
        <text class="form-label">手机号</text>
        <input 
          v-model="newPhone" 
          type="number"
          placeholder="请输入手机号" 
          class="form-input"
          maxlength="11"
        />
      </view>
      <view class="form-item">
        <text class="form-label">验证码</text>
        <input 
          v-model="code" 
          type="number"
          placeholder="请输入验证码" 
          class="form-input code-input"
          maxlength="6"
        />
        <button class="get-code-btn" @click="getCode" :disabled="isCountingDown">
          {{ countdownText }}
        </button>
      </view>
    </view>

    <view class="save-container">
      <view class="save-btn" @click="submit" :class="{ disabled: !isFormValid }">
        <text class="save-text">保存</text>
      </view>
    </view>
  </view>
</template>

<script>
import { useUserStore } from '@/stores/user.js';
import { updatePhone, sendVerificationCode } from '@/api/profile/index.js';

export default {
  data() {
    return {
      newPhone: '',
      code: '',
      countdown: 60,
      isCountingDown: false,
      timer: null
    };
  },
  computed: {
    userStore() {
      return useUserStore();
    },
    countdownText() {
      return this.isCountingDown ? `${this.countdown}s后重试` : '获取验证码';
    },
    isFormValid() {
      return /^\d{11}$/.test(this.newPhone) && /^\d{4,6}$/.test(this.code);
    }
  },
  methods: {
    async getCode() {
      if (!/^\d{11}$/.test(this.newPhone)) {
        uni.showToast({
          title: '请输入有效的新手机号',
          icon: 'none'
        });
        return;
      }

      try {
        const res = await sendVerificationCode({ phone: this.newPhone });
        if (res.success) {
          uni.showToast({
            title: '验证码已发送',
            icon: 'success'
          });

          this.isCountingDown = true;
          this.timer = setInterval(() => {
            if (this.countdown > 1) {
              this.countdown--;
            } else {
              this.resetCountdown();
            }
          }, 1000);
        } else {
          uni.showToast({
            title: res.message || '发送失败，请重试',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('发送验证码失败', error);
        uni.showToast({
          title: '请求失败，请检查网络',
          icon: 'none'
        });
      }
    },
    resetCountdown() {
      clearInterval(this.timer);
      this.timer = null;
      this.isCountingDown = false;
      this.countdown = 60;
    },
    async submit() {
      if (!this.isFormValid) {
        uni.showToast({
          title: '请正确填写手机号和验证码',
          icon: 'none'
        });
        return;
      }

      try {
        const res = await updatePhone({ phone: this.newPhone, code: this.code });
        if (res.success) {
          this.userStore.updatePhone(res.result);
          uni.showToast({
            title: '手机号修改成功',
            icon: 'success'
          });

          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } else {
          uni.showToast({
            title: res.message || '验证失败，请重试',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('手机号修改失败', error);
        uni.showToast({
          title: '请求失败，请检查网络',
          icon: 'none'
        });
      }
    }
  },
  beforeDestroy() {
    this.resetCountdown();
  }
};
</script>

<style scoped>
.change-phone-container {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding-top: 20rpx;
}
.form-section {
  background: white;
  margin: 20rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
}
.form-item {
  padding: 40rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
  display: flex;
  align-items: center;
}
.form-item:last-child {
  border-bottom: none;
}
.form-label {
  font-size: 32rpx;
  color: #333;
  width: 200rpx;
  font-weight: 500;
}
.phone-number {
  font-size: 30rpx;
  color: #333;
}
.form-input {
  flex: 1;
  font-size: 30rpx;
  color: #333;
  text-align: left;
}
.code-input {
  margin-right: 20rpx;
}
.get-code-btn {
  font-size: 28rpx;
  color: #725aff;
  background-color: transparent;
  border: 1rpx solid #725aff;
  border-radius: 30rpx;
  padding: 10rpx 20rpx;
  white-space: nowrap;
}
.get-code-btn[disabled] {
  color: #999;
  border-color: #ccc;
}
.save-container {
  padding: 80rpx 30rpx;
}
.save-btn {
  background: linear-gradient(135deg, #DE44fc 0%, #725aff 100%);
  border-radius: 60rpx;
  padding: 32rpx;
  text-align: center;
  box-shadow: 0 12rpx 40rpx rgba(222, 68, 252, 0.35);
}
.save-btn.disabled {
  background: linear-gradient(135deg, #ddd 0%, #ccc 100%);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}
.save-text {
  font-size: 34rpx;
  color: white;
  font-weight: 600;
}
</style>
