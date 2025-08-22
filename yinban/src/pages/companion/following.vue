<template>
	<view class="following-container">
		<!-- 关注列表 -->
		<scroll-view 
			class="scroll-container" 
			scroll-y="true" 
			@scrolltolower="loadMore"
			refresher-enabled="true"
			@refresherrefresh="refreshData"
			:refresher-triggered="isRefreshing"
		>
			<view class="following-list">
				<view 
					class="following-item" 
					v-for="(user, index) in followingList" 
					:key="user.userId"
				>
					<view class="user-info" @click="viewUserProfile(user)">
						<image :src="user.avatar" class="user-avatar" mode="aspectFill"></image>
						<view class="user-details">
							<text class="user-name">{{ user.nickName }}</text>
							<text class="user-desc" v-if="user.signature">{{ user.signature }}</text>
						</view>
					</view>
					<view 
						class="action-btn" 
						:class="user.isMutualFollow ? 'mutual-follow-btn' : 'unfollow-btn'"
						@click="unfollowUser(user, index)"
					>
						<text class="btn-text">{{ user.isMutualFollow ? '互相关注' : '取消关注' }}</text>
					</view>
				</view>
				
				<!-- 空状态 -->
				<view class="empty-state" v-if="followingList.length === 0 && !isLoading">
					<text class="empty-text">还没有关注任何人</text>
					<text class="empty-desc">去发现页面找找感兴趣的人吧</text>
				</view>
			</view>

			<!-- 加载更多 -->
			<view class="load-more" v-if="followingList.length > 0">
				<view v-if="isLoadingMore" class="loading">
					<text class="loading-text">加载中...</text>
				</view>
				<view v-else-if="hasMore" class="load-text">
					<text>上拉加载更多</text>
				</view>
				<view v-else class="no-more">
					<text>没有更多了</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import { getFollowingList, unfollowUser as unfollowUserApi } from '@/api/profile/index.js'

export default {
	data() {
		return {
			followingList: [],
			isLoading: false,
			isRefreshing: false,
			isLoadingMore: false,
			hasMore: true,
			currentPage: 1,
			pageSize: 20
		}
	},
	onLoad() {
		this.loadFollowingList()
	},
	methods: {
		async loadFollowingList(isRefresh = false) {
			if (this.isLoading && !isRefresh) return
			
			this.isLoading = true
			
			try {
				const params = {
					page: isRefresh ? 1 : this.currentPage,
					pageSize: this.pageSize
				}
				
				const response = await getFollowingList(params)
				const data = (response.result || []).map(user => ({
					...user,
					isMutualFollow: user.isMutualFollow === true || user.isMutualFollow === 'true'
				}))
			
				if (isRefresh) {
					this.followingList = data
					this.currentPage = 1
				} else {
					this.followingList = data
				}
				
				this.hasMore = data.length >= this.pageSize
			} catch (error) {
				console.error('加载关注列表失败:', error)
				uni.showToast({
					title: '加载失败，请重试',
					icon: 'none'
				})
			} finally {
				this.isLoading = false
				this.isRefreshing = false
			}
		},
		
		async loadMore() {
			if (!this.hasMore || this.isLoadingMore) return
			
			this.isLoadingMore = true
			
			try {
				const params = {
					page: this.currentPage + 1,
					pageSize: this.pageSize
				}
				
				const response = await getFollowingList(params)
				const data = (response.result || []).map(user => ({
					...user,
					isMutualFollow: user.isMutualFollow === true || user.isMutualFollow === 'true'
				}))
				
				if (data.length > 0) {
					this.followingList.push(...data)
					this.currentPage++
					this.hasMore = data.length >= this.pageSize
				} else {
					this.hasMore = false
				}
			} catch (error) {
				console.error('加载更多失败:', error)
				uni.showToast({
					title: '加载失败，请重试',
					icon: 'none'
				})
			} finally {
				this.isLoadingMore = false
			}
		},
		
		async refreshData() {
			this.isRefreshing = true
			await this.loadFollowingList(true)
		},
		
		async unfollowUser(user, index) {
			try {
				await unfollowUserApi({ userId: user.userId })
				
				this.followingList.splice(index, 1)
				
			} catch (error) {
				console.error('取消关注失败:', error)
				uni.showToast({
					title: '操作失败，请重试',
					icon: 'none'
				})
			}
		},
		
		viewUserProfile(user) {
			uni.navigateTo({
				url: `/pages/user/profile?userId=${user.userId}`
			})
		},
		
		showConfirmDialog(content) {
			return new Promise((resolve) => {
				uni.showModal({
					title: '提示',
					content: content,
					success: (res) => {
						resolve(res.confirm)
					},
					fail: () => {
						resolve(false)
					}
				})
			})
		}
	}
}
</script>

<style scoped>
.following-container {
	background-color: #f5f7fa;
	min-height: 100vh;
	font-family: 'PingFang SC', '苹方-常规体', sans-serif;
}

/* 滚动容器 */
.scroll-container {
	height: 100vh;
}

/* 关注列表 */
.following-list {
	padding: 20rpx;
}

.following-item {
	background: #fafafa;
	border-radius: 12rpx;
	padding: 24rpx;
	margin-bottom: 12rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-shadow: 0 1rpx 8rpx rgba(0, 0, 0, 0.04);
	border: 1rpx solid #f0f0f0;
}

.user-info {
	display: flex;
	align-items: center;
	flex: 1;
	cursor: pointer;
}

.user-avatar {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50rpx;
	margin-right: 24rpx;
	border: 2rpx solid #f0f0f0;
}

.user-details {
	flex: 1;
}

.user-name {
	display: block;
	font-size: 30rpx;
	font-weight: 600;
	color: #2c2c2c;
	margin-bottom: 6rpx;
}

.user-desc {
	font-size: 24rpx;
	color: #666;
	line-height: 1.3;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 1;
	line-clamp: 1;
	overflow: hidden;
}

/* 按钮样式 */
.action-btn {
	border-radius: 20rpx;
	padding: 8rpx 20rpx;
	cursor: pointer;
	transition: all 0.3s;
	margin-left: 16rpx;
}

.unfollow-btn, .mutual-follow-btn {
	background: #BBBBC0;
	border: none;
	box-shadow: 0 2rpx 8rpx rgba(187, 187, 192, 0.3);
}

.unfollow-btn:active, .mutual-follow-btn:active {
	transform: translateY(2rpx);
	box-shadow: 0 1rpx 4rpx rgba(187, 187, 192, 0.3);
}

.btn-text {
	color: white;
	font-size: 22rpx;
	font-weight: 500;
}

/* 空状态 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 40rpx;
	text-align: center;
}

.empty-icon {
	width: 200rpx;
	height: 200rpx;
	margin-bottom: 40rpx;
	opacity: 0.6;
}

.empty-text {
	font-size: 32rpx;
	color: #666;
	margin-bottom: 16rpx;
	font-weight: 500;
}

.empty-desc {
	font-size: 26rpx;
	color: #999;
	line-height: 1.5;
}

/* 加载更多 */
.load-more {
	padding: 30rpx;
	text-align: center;
}

.loading, .load-text, .no-more {
	display: flex;
	align-items: center;
	justify-content: center;
}

.loading-text {
	font-size: 26rpx;
	color: #725aff;
}

.load-text text {
	font-size: 26rpx;
	color: #999;
}

.no-more text {
	font-size: 26rpx;
	color: #ccc;
}
</style>