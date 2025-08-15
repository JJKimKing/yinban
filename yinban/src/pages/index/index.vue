<template>
	<view class="index-container">
		<text class="page-title">主页</text>
	</view>
</template>

<script>
	export default {
		data() {
			return {}
		},
		methods: {
			
		},
		onLoad() {
			const token = uni.getStorageSync('token')
			const currentPage = getCurrentPages().pop()
			const currentRoute = currentPage?.route || ''
					
			const whiteList = ['pages/login/login']
					
			if (!token && !whiteList.includes(currentRoute)) {
			  uni.reLaunch({
			    url: '/pages/login/login'
			  })
			}
		},
		onShow() {
		    
		}
	}
</script>

<style scoped>

</style>
