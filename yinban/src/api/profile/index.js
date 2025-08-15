import http from '../request.js'

export const getUserInfo = (code) => {
	return http.get('/system/sys-user/get-v1-userInfo', {
	})
}

export const updateUserInfo = (data) => {
	return http.post('/system/sys-user/update-v1-userInfo', data)
}

export const createSign = (fileData) => {
	return http.post('/system/image-upload/create-sign', { fileData })
}

export const uploadAvatar = (filePath, fileName, sign = '') => {
	const formData = {}
	
	// 如果有sign（微信图片免检测标识），则传递给后端
	if (sign) {
		formData.sign = sign
	}
	
	return http.upload('/system/image-upload/upload-avatar', filePath, fileName, formData)
}