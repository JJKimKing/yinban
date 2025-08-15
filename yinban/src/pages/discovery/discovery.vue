<template>
	<view class="discovery-container">
		<text class="page-title">发现</text>
		<text class="page-desc">发现更多精彩内容</text>
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
.discovery-container {
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