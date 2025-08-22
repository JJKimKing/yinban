<template>
	<view class="profile-container">
		<!-- 用户信息头部 -->
		<view class="user-header">
			<image :src="displayAvatar" mode="aspectFill" class="user-avatar"></image>
			<view class="user-info">
				<view class="nickname-container">
					<text class="user-name">{{ displayNickname }}</text>
					<view class="audit-badge" v-if="userPending.nicknameAuditStatus === 'pending'">
						<text class="audit-badge-text">审核中</text>
					</view>
				</view>
				<view class="signature-container">
					<text class="user-desc">{{ displaySignature }}</text>
					<view class="audit-badge" v-if="userPending.signatureAuditStatus === 'pending'">
						<text class="audit-badge-text">审核中</text>
					</view>
				</view>
			</view>
			<view class="edit-btn" @click="editProfile" :class="{disabled: isLoading}">
				<image src="@/static/edit.png" class="edit-icon"></image>
			</view>
		</view>

		<!-- 数据统计卡片 -->
		<view class="stats-card">
			<view class="stat-item" @click="navigateTo('/pages/wallet/index')">
				<text class="stat-value">¥{{ walletInfo.balance }}</text>
				<text class="stat-label">钱包余额</text>
			</view>
			<view class="stat-divider"></view>
			<view class="stat-item" @click="navigateTo('/pages/order/ongoing')">
				<text class="stat-value">{{ orderInfo.count }}</text>
				<text class="stat-label">进行中订单</text>
			</view>
			<view class="stat-divider"></view>
			<view class="stat-item" @click="navigateTo('/pages/companion/favorites')">
				<text class="stat-value">{{ companionCount.favorites }}</text>
				<text class="stat-label">粉丝</text>
			</view>
		</view>

		<!-- 快捷操作 -->
		<view class="quick-actions">
			<view class="action-item" @click="navigateTo('/pages/wallet/coupons')">
				<image src="@/static/cupon.png" class="action-icon"></image>
				<text class="action-text">优惠券</text>
				<text class="action-badge" v-if="walletInfo.coupons > 0">{{ walletInfo.coupons }}</text>
			</view>
			<view class="action-item" @click="navigateTo('/pages/wallet/recharge')">
				<image src="@/static/money.png" class="action-icon"></image>
				<text class="action-text">充值</text>
			</view>
			<view class="action-item" @click="navigateTo('/pages/companion/following')">
				<image src="@/static/star.png" class="action-icon"></image>
				<text class="action-text">关注</text>
				<text class="action-badge">{{ companionCount.following }}</text>
			</view>
			<view class="action-item" @click="navigateTo('/pages/companion/blacklist')">
				<image src="@/static/gaming.png" class="action-icon"></image>
				<text class="action-text">开黑记录</text>
			</view>
		</view>

		<!-- 服务入口 -->
		<view class="service-card" v-if="!userInfo.companion">
			<view class="service-content">
				<view class="service-info">
					<text class="service-title">成为陪玩</text>
					<text class="service-desc">开启陪玩服务，赚取收益</text>
				</view>
				<view class="service-btn" @click="navigateTo('/pages/auth/apply')">
					<text class="btn-text">立即申请</text>
				</view>
			</view>
		</view>

		<view class="service-card" v-if="userInfo.companion">
			<view class="service-content">
				<view class="service-info">
					<text class="service-title">陪玩管理</text>
					<text class="service-desc">管理我的陪玩服务</text>
				</view>
				<view class="service-btn" @click="navigateTo('/pages/auth/manage')">
					<text class="btn-text">管理中心</text>
				</view>
			</view>
		</view>

		<!-- 功能列表 -->
		<view class="function-list">
			<view class="function-item" @click="navigateTo('/pages/settings/index')">
				<image src="https://img.icons8.com/color/48/settings.png" class="function-icon"></image>
				<text class="function-text">设置</text>
				<image src="@/static/arrow-right-line.png" class="arrow-icon"></image>
			</view>
			<view class="function-item" @click="navigateTo('/pages/feedback/index')">
				<image src="https://img.icons8.com/color/48/feedback.png" class="function-icon"></image>
				<text class="function-text">意见反馈</text>
				<image src="@/static/arrow-right-line.png" class="arrow-icon"></image>
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
		return {
			
		}
	},
	computed: {
		displayAvatar() {
			return this.userStore.displayAvatar
		},
		displayNickname() {
			return this.userStore.displayNickname
		},
		displaySignature() {
			return this.userStore.displaySignature
		},
		userInfo() {
			return this.userStore.userInfo
		},
		userPending() {
			return this.userStore.userPending
		},
		companionCount() {
			return this.userStore.companionCount
		},
		isLoading() {
			return this.userStore.isLoading
		},
		walletInfo() {
			return this.userStore.walletInfo
		},
		orderInfo() {
			return this.userStore.orderInfo
		}
	},
	methods: {
		navigateTo(url) {
			uni.navigateTo({
				url: url
			})
		},
		async editProfile() {
			if (this.isLoading) {
				return
			}
			
			uni.navigateTo({
				url: '/pages/profile/edit'
			})
		},
		async loadUserData() {
			await this.userStore.loadUserData()
		},
	},
	onLoad() {
		this.loadUserData()
	},
	onShow() {
		this.loadUserData()
	},
	onUnload() {
		uni.$off('userInfoUpdated')
	}
}
</script>

<style scoped>
.profile-container {
	background-color: #f5f7fa;
	min-height: 100vh;
	padding-bottom: 40rpx;
	font-family: 'PingFang SC', '苹方-常规体', sans-serif;
}

/* 用户头部 */
.user-header {
	background: linear-gradient(135deg, #DE44fc 0%, #725aff 100%);
	padding: 60rpx 30rpx 40rpx;
	display: flex;
	align-items: center;
	color: white;
}

.user-avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 60rpx;
	margin-right: 30rpx;
	border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.user-info {
	flex: 1;
}

.user-name {
	display: block;
	font-size: 36rpx;
	font-weight: bold;
	margin-bottom: 10rpx;
}

.user-desc {
	font-size: 26rpx;
	opacity: 0.8;
}

.edit-btn {
	padding: 10rpx;
	transition: opacity 0.3s;
}

.edit-btn.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.edit-icon {
	width: 40rpx;
	height: 40rpx;
	filter: brightness(0) invert(1);
}

/* 审核状态样式 */
.nickname-container, .signature-container {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.audit-badge {
	background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
	border-radius: 20rpx;
	padding: 4rpx 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2rpx 8rpx rgba(255, 107, 53, 0.3);
	animation: pulse 2s ease-in-out infinite;
}

.audit-badge-text {
	font-size: 20rpx;
	color: white;
	font-weight: 500;
	white-space: nowrap;
}

@keyframes pulse {
	0%, 100% {
		opacity: 1;
		transform: scale(1);
	}
	50% {
		opacity: 0.8;
		transform: scale(1.02);
	}
}

/* 数据统计卡片 */
.stats-card {
	background: white;
	margin: 20rpx;
	border-radius: 16rpx;
	padding: 40rpx 0;
	display: flex;
	box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.08);
}

.stat-item {
	flex: 1;
	text-align: center;
	cursor: pointer;
}

.stat-value {
	display: block;
	font-size: 32rpx;
	font-weight: bold;
	color: #725aff;
	margin-bottom: 8rpx;
}

.stat-label {
	font-size: 24rpx;
	color: #999;
}

.stat-divider {
	width: 1rpx;
	height: 60rpx;
	background: #eee;
	margin: auto 0;
}

/* 快捷操作 */
.quick-actions {
	background: white;
	margin: 20rpx;
	border-radius: 16rpx;
	padding: 40rpx 20rpx;
	display: flex;
	justify-content: space-around;
	box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.08);
}

.action-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	position: relative;
	cursor: pointer;
	padding: 20rpx;
	border-radius: 12rpx;
	transition: background-color 0.2s;
	min-width: 120rpx;
}

.action-item:active {
	background-color: #f8f9fa;
}

.action-icon {
	width: 64rpx;
	height: 64rpx;
	margin-bottom: 12rpx;
}

.action-text {
	font-size: 26rpx;
	color: #333;
}

.action-badge {
	position: absolute;
	top: 15rpx;
	right: 15rpx;
	background: #fc449c;
	color: white;
	font-size: 20rpx;
	padding: 4rpx 8rpx;
	border-radius: 10rpx;
	min-width: 24rpx;
	text-align: center;
	line-height: 1;
}

/* 服务入口卡片 */
.service-card {
	background: linear-gradient(135deg, #DE44fc 0%, #725aff 100%);
	margin: 20rpx;
	border-radius: 16rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(222, 68, 252, 0.3);
}

.service-content {
	display: flex;
	align-items: center;
}

.service-info {
	flex: 1;
	color: white;
}

.service-title {
	display: block;
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 8rpx;
}

.service-desc {
	font-size: 26rpx;
	opacity: 0.8;
}

.service-btn {
	background: rgba(255, 255, 255, 0.2);
	border: 2rpx solid rgba(255, 255, 255, 0.3);
	border-radius: 50rpx;
	padding: 16rpx 32rpx;
	cursor: pointer;
	transition: all 0.3s;
}

.service-btn:active {
	background: rgba(255, 255, 255, 0.3);
}

.btn-text {
	color: white;
	font-size: 28rpx;
	font-weight: 500;
}

/* 功能列表 */
.function-list {
	background: white;
	margin: 20rpx;
	border-radius: 16rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.08);
}

.function-item {
	display: flex;
	align-items: center;
	padding: 32rpx 30rpx;
	border-bottom: 1rpx solid #f8f8f8;
	cursor: pointer;
	transition: background-color 0.2s;
}

.function-item:last-child {
	border-bottom: none;
}

.function-item:active {
	background-color: #f8f9fa;
}

.function-icon {
	width: 48rpx;
	height: 48rpx;
	margin-right: 24rpx;
}

.function-text {
	flex: 1;
	font-size: 30rpx;
	color: #333;
}

.arrow-icon {
	width: 20rpx;
	height: 20rpx;
	opacity: 0.4;
}
</style>
