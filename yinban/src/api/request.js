const DEV_BASE_URL = 'http://192.168.1.4:8080'
const PRO_BASE_URL = 'http://192.168.1.4:8080'

let http = null

function initHttp() {
	if (!http) {
		http = uni.$u.http
		
		http.setConfig((config) => {
			config.baseURL = process.env.NODE_ENV === 'development' ? DEV_BASE_URL : PRO_BASE_URL
			config.timeout = 60000
			config.header = {
				'Content-Type': 'application/json;charset=UTF-8'
			}
			return config
		})

		http.interceptors.request.use((config) => {
			const token = uni.getStorageSync('token')
			if (token) {
				config.header.Authorization = 'Bearer ' + token
			}
			
			uni.showLoading({
				title: '加载中...'
			})
			
			return config
		}, (config) => {
			return Promise.reject(config)
		})

		http.interceptors.response.use((response) => {
			uni.hideLoading()
			
			const { statusCode, data } = response
			
			if (statusCode === 200) {
				if (data.code === 200) {
					return data
				} else if (data.code === 401) {
					uni.removeStorageSync('token')
					uni.showToast({
						title: '登录已过期，请重新登录',
						icon: 'none',
						duration: 1500
					})
					uni.navigateTo({
						url: '/pages/login/login'
					})
					return Promise.reject(data)
				} else {
					uni.showToast({
						title: data.message || '请求失败',
						icon: 'none'
					})
					return Promise.reject(data)
				}
			} else {
				uni.showToast({
					title: '网络错误',
					icon: 'none'
				})
				return Promise.reject(response)
			}
		}, (response) => {
			uni.hideLoading()
			
			uni.showToast({
				title: '网络连接失败',
				icon: 'none'
			})
			
			return Promise.reject(response)
		})
	}
	return http
}

export default {
	get: (url, config) => initHttp().get(url, config),
	post: (url, data, config) => initHttp().post(url, data, config),
	put: (url, data, config) => initHttp().put(url, data, config),
	delete: (url, config) => initHttp().delete(url, config),
	baseURL: process.env.NODE_ENV === 'development' ? DEV_BASE_URL : PRO_BASE_URL,
	
	upload: (url, filePath, fileName, formData = {}) => {
		return new Promise((resolve, reject) => {
			const token = uni.getStorageSync('token')
			
			if (!filePath) {
				reject({ message: 'filePath 不能为空' })
				return
			}
			
			uni.showLoading({
				title: '上传中...'
			})
			
			// 读取文件并转换为base64
			const fileSystemManager = uni.getFileSystemManager()
			
			try {
				const fileData = fileSystemManager.readFileSync(filePath, 'base64')
				
				// 使用POST请求发送base64数据
				const uploadUrl = (process.env.NODE_ENV === 'development' ? DEV_BASE_URL : PRO_BASE_URL) + url
				
				uni.request({
					url: uploadUrl,
					method: 'POST',
					data: {
						fileData: fileData,
						fileName: fileName,
						...formData
					},
					header: {
						'Content-Type': 'application/json',
						'Authorization': token ? 'Bearer ' + token : ''
					},
					success: (res) => {
						uni.hideLoading()
						
						if (res.statusCode === 200) {
							if (res.data.code === 200) {
								resolve(res.data)
							} else if (res.data.code === 401) {
								uni.removeStorageSync('token')
								uni.showToast({
									title: '登录已过期，请重新登录',
									icon: 'none',
									duration: 1500
								})
								uni.navigateTo({
									url: '/pages/login/login'
								})
								reject(res.data)
							} else {
								uni.showToast({
									title: res.data.message || '上传失败',
									icon: 'none'
								})
								reject(res.data)
							}
						} else {
							uni.showToast({
								title: '网络错误',
								icon: 'none'
							})
							reject(res)
						}
					},
					fail: (error) => {
						uni.hideLoading()
						uni.showToast({
							title: error.errMsg || '上传失败',
							icon: 'none'
						})
						reject(error)
					}
				})
				
			} catch (error) {
				uni.hideLoading()
				uni.showToast({
					title: '读取文件失败',
					icon: 'none'
				})
				reject(error)
			}
		})
	}
}
