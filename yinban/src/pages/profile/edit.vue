<template>
	<view class="edit-profile-container">
		<!-- 头像修改 -->
		<view class="form-section">
			<view class="form-item avatar-item">
				<text class="form-label">头像</text>
				<button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
					<image :src="displayAvatar" mode="aspectFill" class="avatar-preview" :class="{ uploading: isUploadingAvatar, pending: userPending.avatarAuditStatus === 'pending' }"></image>
					<view class="camera-icon" v-if="!isUploadingAvatar && userPending.avatarAuditStatus !== 'pending'">
						<image src="@/static/camera.png"></image>
					</view>
					<view class="upload-loading" v-if="isUploadingAvatar">
						<text class="upload-text">上传中</text>
					</view>
					<view class="audit-status" v-if="userPending.avatarAuditStatus === 'pending'">
						<text class="audit-text">审核中</text>
					</view>
				</button>
			</view>
		</view>

		<!-- 用户信息表单 -->
		<view class="form-section">
			<view class="form-item">
				<text class="form-label">昵称</text>
				<input 
					:value="displayNickname" 
					type="nickname"
					placeholder="请输入昵称" 
					class="form-input"
					maxlength="20"
					@input="onNicknameInput"
				/>
			</view>
			
			<view class="form-item">
				<text class="form-label">手机号</text>
				<input 
					:value="userInfo.phone" 
					type="number"
					placeholder="请输入手机号" 
					class="form-input"
					maxlength="11"
					@input="onPhoneInput"
				/>
			</view>
		</view>

		<!-- 个人简介 -->
		<view class="form-section">
			<view class="form-item textarea-item">
				<text class="form-label">个人简介</text>
				<textarea 
					:value="displaySignature" 
					placeholder="介绍一下自己吧～" 
					class="form-textarea"
					maxlength="200"
					auto-height
					@input="onSignatureInput"
				></textarea>
				<text class="char-count">{{ displaySignature.length }}/200</text>
			</view>
		</view>

		<!-- 保存按钮 -->
		<view class="save-container">
			<view class="save-btn" @click="saveProfile" :class="{ disabled: !isFormValid }">
				<text class="save-text">保存修改</text>
			</view>
		</view>
	</view>
</template>

<script>
import { useUserStore } from '@/stores/user.js'

export default {
	setup() {
		const userStore = useUserStore()
		return {
			userStore
		}
	},
	data() {
		return {}
	},
	computed: {
		userInfo() {
			return this.userStore.userInfo
		},
		userPending() {
			return this.userStore.userPending
		},
		isUploadingAvatar() {
			return this.userStore.isUploadingAvatar
		},
		isFormValid() {
			return this.userStore.isFormValid
		},
		displayAvatar() {
			return this.userStore.displayAvatar
		},
		displayNickname() {
			return this.userStore.displayNickname
		},
		displaySignature() {
			return this.userStore.displaySignature
		}
	},
	onLoad() {
		// 进入编辑状态
		this.userStore.startEditing()
	},
	onUnload() {
		// 退出编辑状态
		this.userStore.stopEditing()
	},
	methods: {
		onNicknameInput(e) {
			this.userStore.updateNickname(e.detail.value)
		},
		
		onSignatureInput(e) {
			this.userStore.updateSignature(e.detail.value)
		},
		
		onPhoneInput(e) {
			this.userStore.updatePhone(e.detail.value)
		},
		
		onChooseAvatar(e) {
			if (this.isUploadingAvatar) {
				uni.showToast({
					title: '正在上传，请稍候',
					icon: 'none'
				})
				return
			}
			
			const { avatarUrl } = e.detail
			if (avatarUrl) {
				const fileName = this.userStore.generateFileName(avatarUrl, 'jpg')
				this.userStore.uploadAvatarImage(avatarUrl, fileName, true)
			}
		},
		
		
		async saveProfile() {
			const result = await this.userStore.saveProfile()
			if (result) {
				// 延迟返回上一页，让用户看到保存成功提示
				setTimeout(() => {
					uni.navigateBack()
				}, 1500)
			}
		}
	}
}
</script>

<style scoped>
.edit-profile-container {
	background-color: #f5f7fa;
	min-height: 100vh;
	padding-top: 20rpx;
	font-family: 'PingFang SC', '苹方-常规体', sans-serif;
}

/* 表单区域 */
.form-section {
	background: white;
	margin: 20rpx 20rpx 0;
	border-radius: 16rpx;
	box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
	overflow: hidden;
}

.form-item {
	padding: 40rpx 30rpx;
	border-bottom: 1rpx solid #f5f5f5;
	display: flex;
	align-items: center;
	transition: background-color 0.2s;
}

.form-item:last-child {
	border-bottom: none;
}

.form-label {
	font-size: 32rpx;
	color: #333;
	width: 160rpx;
	flex-shrink: 0;
	font-weight: 500;
}

.form-input {
	flex: 1;
	font-size: 30rpx;
	color: #333;
	text-align: right;
	background: transparent;
	border: none;
	outline: none;
}

/* 头像按钮样式 */
.avatar-wrapper {
	background: transparent;
	border: none;
	padding: 0;
	margin: 0;
	position: relative;
	width: 140rpx;
	height: 140rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	outline: none;
	border-radius: 70rpx;
	overflow: visible;
}

.avatar-wrapper::after {
	border: none;
}

/* 头像相关 */
.avatar-item {
	justify-content: space-between;
	padding: 50rpx 30rpx !important;
}

.avatar-preview {
	width: 140rpx;
	height: 140rpx;
	border-radius: 70rpx;
	border: 4rpx solid #f0f0f0;
	transition: all 0.3s;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.avatar-preview.uploading {
	opacity: 0.6;
	filter: grayscale(0.3);
}

.avatar-preview.pending {
	opacity: 0.7;
	border-color: #ff6b35;
}

/* 相机图标 */
.camera-icon {
	position: absolute;
	bottom: -12rpx;
	right: -12rpx;
	width: 44rpx;
	height: 44rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 999;
	background: #fcb666;
	border-radius: 22rpx;
	border: 3rpx solid white;
	box-shadow: 0 4rpx 12rpx rgba(252, 182, 102, 0.3);
}

.camera-icon image {
	width: 28rpx;
	height: 28rpx;
}

.upload-loading {
	position: absolute;
	bottom: -2rpx;
	right: -2rpx;
	background: linear-gradient(135deg, #DE44fc 0%, #725aff 100%);
	border-radius: 8rpx;
	padding: 2rpx 6rpx;
	box-shadow: 0 1rpx 4rpx rgba(222, 68, 252, 0.3);
	border: 1rpx solid white;
	animation: pulse 1.5s ease-in-out infinite;
	max-width: 50rpx;
	max-height: 24rpx;
	height: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

@keyframes pulse {
	0%, 100% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.05);
	}
}

.upload-text {
	font-size: 16rpx;
	color: white;
	font-weight: 500;
	white-space: nowrap;
}

/* 审核状态 */
.audit-status {
	position: absolute;
	bottom: -2rpx;
	right: -2rpx;
	background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
	border-radius: 8rpx;
	padding: 2rpx 6rpx;
	box-shadow: 0 1rpx 4rpx rgba(255, 107, 53, 0.3);
	border: 1rpx solid white;
	animation: pulse 1.5s ease-in-out infinite;
	max-width: 50rpx;
	max-height: 24rpx;
	height: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.audit-text {
	font-size: 16rpx;
	color: white;
	font-weight: 500;
	white-space: nowrap;
}

/* 昵称相关 */
.nickname-container {
	flex: 1;
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.nickname-container .form-input {
	flex: 1;
}

.wechat-nickname-btn {
	background: linear-gradient(135deg, #1aad19 0%, #07c160 100%);
	border-radius: 8rpx;
	padding: 16rpx 24rpx;
	white-space: nowrap;
	min-width: 140rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2rpx 8rpx rgba(26, 173, 25, 0.3);
	transition: all 0.2s;
	cursor: pointer;
}

.wechat-nickname-btn:active {
	transform: scale(0.95);
	box-shadow: 0 1rpx 4rpx rgba(26, 173, 25, 0.4);
}

.btn-text {
	font-size: 24rpx;
	color: white;
	font-weight: 500;
}

/* 昵称相关 */
.nickname-container {
	flex: 1;
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.nickname-container .form-input {
	flex: 1;
}

.wechat-nickname-btn {
	background: linear-gradient(135deg, #1aad19 0%, #07c160 100%);
	border-radius: 8rpx;
	padding: 16rpx 24rpx;
	white-space: nowrap;
	min-width: 140rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2rpx 8rpx rgba(26, 173, 25, 0.3);
	transition: all 0.2s;
	cursor: pointer;
}

.wechat-nickname-btn:active {
	transform: scale(0.95);
	box-shadow: 0 1rpx 4rpx rgba(26, 173, 25, 0.4);
}

.btn-text {
	font-size: 24rpx;
	color: white;
	font-weight: 500;
}

/* 手机号相关 */
.phone-container {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	cursor: pointer;
}

.phone-text {
	font-size: 30rpx;
	color: #333;
	margin-right: 12rpx;
}

.phone-text.placeholder {
	color: #999;
	font-style: italic;
}

.arrow-icon {
	width: 28rpx;
	height: 28rpx;
	opacity: 0.5;
	transition: opacity 0.2s;
}

/* 文本域相关 */
.textarea-item {
	align-items: flex-start;
	flex-direction: column;
	padding: 40rpx 30rpx !important;
}

.form-textarea {
	width: 100%;
	min-height: 240rpx;
	font-size: 30rpx;
	color: #333;
	margin-top: 24rpx;
	line-height: 1.6;
	background: #fafafa;
	border-radius: 12rpx;
	padding: 20rpx;
	border: 1rpx solid #e5e5e5;
	transition: border-color 0.2s;
}

.char-count {
	align-self: flex-end;
	font-size: 24rpx;
	color: #999;
	margin-top: 16rpx;
	padding-right: 20rpx;
}

/* 保存按钮 */
.save-container {
	padding: 80rpx 30rpx;
	position: sticky;
	bottom: 0;
	background: #f5f7fa;
}

.save-btn {
	background: linear-gradient(135deg, #DE44fc 0%, #725aff 100%);
	border-radius: 60rpx;
	padding: 32rpx;
	text-align: center;
	box-shadow: 0 12rpx 40rpx rgba(222, 68, 252, 0.35);
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;
}

.save-btn.disabled {
	background: linear-gradient(135deg, #ddd 0%, #ccc 100%);
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
	transform: none;
}

.save-btn:active:not(.disabled) {
	transform: translateY(3rpx) scale(0.98);
	box-shadow: 0 6rpx 20rpx rgba(222, 68, 252, 0.4);
}

.save-text {
	font-size: 34rpx;
	color: white;
	font-weight: 600;
	letter-spacing: 2rpx;
}

/* 交互效果 */
.form-item:active {
	background-color: #f8f9fa;
}

.avatar-container:active .avatar-preview {
	transform: scale(0.95);
}

.phone-container:active .arrow-icon {
	opacity: 0.8;
}

.form-textarea:focus {
	border-color: #725aff;
	background: white;
}

/* 动画效果 */
.form-section {
	animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateY(40rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.save-container {
	animation: slideUp 0.6s ease-out;
}
</style>