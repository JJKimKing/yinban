<template>
	<view class="message-container">
		<text class="page-title">消息</text>
		<text class="page-desc">查看你的消息记录</text>
	</view>
</template>

<script>
export default {
	data() {
		return {
			
		}
	}
}
</script>

<style scoped>
.message-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
	background-color: #f5f5f5;
}

.page-title {
	font-size: 48rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 20rpx;
}

.page-desc {
	font-size: 28rpx;
	color: #999999;
}
</style>