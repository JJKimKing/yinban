import http from '../request.js'

export const updateUserInfo = (data) => {
	return http.post('/system/sys-user/update-v1-userInfo', data)
}

export const createSign = (fileData) => {
	return http.post('/system/image-upload/create-sign', { fileData })
}

export const uploadAvatar = (filePath, fileName, sign = '') => {
	const formData = {}
		if (sign) {
		formData.sign = sign
	}
	
	return http.upload('/system/image-upload/upload-avatar', filePath, fileName, formData)
}

export const updatePhone = (data) => {
	return http.post('/system/sys-user/update-phone', data)
}

export const sendVerificationCode = (data) => {
	return http.post('/system/sys-user/send-code', data);
};

// 获取关注列表
export const getFollowingList = (params) => {
	return http.post('/system/user-follow/following-list', params)
}

// 取消关注
export const unfollowUser = (data) => {
	return http.post('/system/user-follow/unfollow', data)
}

// 获取粉丝列表
export const getFavoritesList = (params) => {
	return http.post('/system/user-follow/favorites-list', params)
}

// 关注用户
export const followUser = (data) => {
	return http.post('/system/user-follow/follow', data)
}