<template>
	<view class="favorites-container">
		<!-- 粉丝列表 -->
		<scroll-view 
			class="scroll-container" 
			scroll-y="true" 
			@scrolltolower="loadMore"
			refresher-enabled="true"
			@refresherrefresh="refreshData"
			:refresher-triggered="isRefreshing"
		>
			<view class="favorites-list">
				<view 
					class="favorites-item" 
					v-for="(user, index) in favoritesList" 
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
						:class="user.isMutualFollow ? 'mutual-follow-btn' : 'follow-btn'"
						@click="toggleFollow(user, index)"
					>
						<text class="btn-text">{{ user.isMutualFollow ? '互相关注' : '关注' }}</text>
					</view>
				</view>
				
				<!-- 空状态 -->
				<view class="empty-state" v-if="favoritesList.length === 0 && !isLoading">
					<image src="@/static/heart.png" class="empty-icon"></image>
					<text class="empty-text">还没有粉丝</text>
					<text class="empty-desc">分享更多精彩内容吸引粉丝吧</text>
				</view>
			</view>

			<!-- 加载更多 -->
			<view class="load-more" v-if="favoritesList.length > 0">
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
import { getFavoritesList, followUser, unfollowUser } from '@/api/profile/index.js'

export default {
	data() {
		return {
			favoritesList: [],
			isLoading: false,
			isRefreshing: false,
			isLoadingMore: false,
			hasMore: true,
			currentPage: 1,
			pageSize: 20
		}
	},
	onLoad() {
		this.loadFavoritesList()
	},
	methods: {
		async loadFavoritesList(isRefresh = false) {
			if (this.isLoading && !isRefresh) return
			
			this.isLoading = true
			
			try {
				const params = {
					page: isRefresh ? 1 : this.currentPage,
					pageSize: this.pageSize
				}
				
				const response = await getFavoritesList(params)
				const data = (response.result || []).map(user => ({
					...user,
					isMutualFollow: user.isMutualFollow === true || user.isMutualFollow === 'true'
				}))
				
				if (isRefresh) {
					this.favoritesList = data
					this.currentPage = 1
				} else {
					this.favoritesList = data
				}
				
				this.hasMore = data.length >= this.pageSize
			} catch (error) {
				console.error('加载粉丝列表失败:', error)
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
				
				const response = await getFavoritesList(params)
				const data = (response.result || []).map(user => ({
					...user,
					isMutualFollow: user.isMutualFollow === true || user.isMutualFollow === 'true'
				}))
				
				if (data.length > 0) {
					this.favoritesList.push(...data)
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
			await this.loadFavoritesList(true)
		},
		
		async toggleFollow(user, index) {
			try {
				if (user.isMutualFollow) {
					// 取消关注（变为单向关注我）
					await unfollowUser({ userId: user.userId })
					this.favoritesList[index].isMutualFollow = false
					uni.showToast({
						title: '取消关注成功',
						icon: 'success'
					})
				} else {
					// 关注（变为互相关注）
					await followUser({ userId: user.userId })
					this.favoritesList[index].isMutualFollow = true
					uni.showToast({
						title: '关注成功',
						icon: 'success'
					})
				}
			} catch (error) {
				console.error('操作失败:', error)
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
		}
	}
}
</script>

<style scoped>
.favorites-container {
	background-color: #f5f7fa;
	min-height: 100vh;
	font-family: 'PingFang SC', '苹方-常规体', sans-serif;
}

/* 滚动容器 */
.scroll-container {
	height: 100vh;
}

/* 粉丝列表 */
.favorites-list {
	padding: 20rpx;
}

.favorites-item {
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

.follow-btn {
	background: linear-gradient(135deg, #2148f3 0%, #764ba2 100%);
	border: none;
	box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);
}

.mutual-follow-btn {
	background: #BBBBC0;
	border: none;
	box-shadow: 0 2rpx 8rpx rgba(187, 187, 192, 0.3);
}

.follow-btn:active, .mutual-follow-btn:active {
	transform: translateY(2rpx);
	box-shadow: 0 1rpx 4rpx rgba(102, 126, 234, 0.3);
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
	color: #667eea;
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