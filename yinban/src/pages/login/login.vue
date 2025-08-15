<template>
	<view class="login-container">
		<view class="login-content">
			<view class="logo-section">
				<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
				<text class="app-name">音伴</text>
				<text class="app-desc"> 专业陪练 · 成就更好的你</text>
			</view>
			
			<view class="login-form">
				<button class="wechat-login-btn" :class="{ disabled: !isAgreed }" :disabled="!isAgreed" @click="handleWechatLogin">
					<image class="wechat-icon" src="/static/social-wechat.png" mode="aspectFit"></image>
					<text class="btn-text">一键登录</text>
				</button>
				
				<view class="privacy-notice">
					<view class="checkbox-row" @click="toggleAgreement">
						<view class="checkbox" :class="{ checked: isAgreed }">
							<text class="checkbox-icon" v-if="isAgreed">✓</text>
						</view>
						<text class="notice-text">已阅读并同意</text>
						<text class="link-text" @click.stop="showPrivacy">《隐私政策》</text>
						<text class="notice-text">和</text>
						<text class="link-text" @click.stop="showTerms">《用户条款》</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { wxLogin } from '@/api/login/login.js'
const isAgreed = ref(false)



const handleWechatLogin = () => {
	if (!isAgreed.value) {
		uni.showToast({
			title: '请先同意隐私政策和用户条款',
			icon: 'none'
		})
		return
	}
	
	uni.showLoading({
		title: '登录中...'
	})
	
	uni.login({
		provider: 'weixin',
		success: async (loginRes) => {
			 const code = loginRes.code
			 if(code){
				try {
					const result = await wxLogin(code)
					uni.hideLoading()
					if(result.code==200) {
						const token =result.result.token;
						uni.setStorageSync('token', token)
						uni.showToast({
							title: '登录成功',
							icon: 'success'
						})
						
						setTimeout(() => {
							uni.switchTab({
								url: '/pages/index/index'
							})
						}, 1500)
					}
				} catch (error) {
					console.error('登录请求失败', error)
					uni.hideLoading()
					uni.showToast({
						title: error.message || '登录失败',
						icon: 'none'
					})
				}
			 } else {
				uni.hideLoading()
				uni.showToast({
					title: '获取授权码失败',
					icon: 'none'
				})
			 }
		},
		fail: (err) => {
			console.error('微信登录失败', err)
			uni.hideLoading()
			uni.showToast({
				title: '登录失败',
				icon: 'none'
			})
		}
	})
}

const showPrivacy = () => {
	uni.navigateTo({
		url: '/pages/privacy/privacy'
	})
}

const showTerms = () => {
	uni.navigateTo({
		url: '/pages/terms/terms'
	})
}

const toggleAgreement = () => {
	isAgreed.value = !isAgreed.value
}
</script>

<style scoped>
.login-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx;
}

.login-content {
	width: 100%;
	max-width: 600rpx;
}

.logo-section {
	text-align: center;
	margin-bottom: 100rpx;
}

.logo {
	width: 160rpx;
	height: 160rpx;
	border-radius: 80rpx;
	margin-bottom: 30rpx;
}

.app-name {
	display: block;
	font-size: 48rpx;
	font-weight: bold;
	color: #ffffff;
	margin-bottom: 10rpx;
}

.app-desc {
	display: block;
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.8);
}

.login-form {
	background: rgba(255, 255, 255, 0.95);
	border-radius: 30rpx;
	padding: 60rpx 40rpx;
	box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.1);
}

.welcome-text {
	text-align: center;
	margin-bottom: 60rpx;
}

.welcome-title {
	display: block;
	font-size: 36rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 15rpx;
}

.welcome-subtitle {
	display: block;
	font-size: 28rpx;
	color: #666666;
}

.wechat-login-btn {
	width: 100%;
	height: 88rpx;
	background: #07c160;
	border-radius: 44rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 40rpx;
	border: none;
	box-shadow: 0 8rpx 24rpx rgba(7, 193, 96, 0.3);
}

.wechat-login-btn::after {
	border: none;
}

.wechat-icon {
	width: 40rpx;
	height: 40rpx;
	margin-right: 20rpx;
}

.btn-text {
	font-size: 32rpx;
	color: #ffffff;
	font-weight: 500;
}

.privacy-notice {
	text-align: center;
	line-height: 40rpx;
}

.checkbox-row {
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
}

.checkbox {
	width: 32rpx;
	height: 32rpx;
	border: 2rpx solid #cccccc;
	border-radius: 50%;
	margin-right: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
}

.checkbox.checked {
	background-color: #667eea;
	border-color: #667eea;
}

.checkbox-icon {
	font-size: 20rpx;
	color: #ffffff;
	  border-radius: 50%;
	font-weight: bold;
}

.notice-text {
	font-size: 24rpx;
	color: #999999;
}

.link-text {
	font-size: 24rpx;
	color: #667eea;
	text-decoration: underline;
	margin: 0 4rpx;
}

.wechat-login-btn.disabled {
	background: #cccccc;
	box-shadow: none;
	cursor: not-allowed;
}
</style>