import CryptoJS from 'crypto-js';

const DEV_BASE_URL = 'http://192.168.1.8:8080';
const PRO_BASE_URL = 'http://192.168.1.8:8080';

const BASE_URL = process.env.NODE_ENV === 'development' ? DEV_BASE_URL : PRO_BASE_URL;

let encryptionConfig = {
    version: null,
    keyId: null,
    encryptKey: null,
    expireTime: 0,
};

const getEncryptKey = async () => {
    try {
        const res = await request({
            url: '/system/sys-user/crypto/params',
            method: 'GET',
            encrypt: false,
        });
        if (res.success) {
            encryptionConfig = res.result;
        }
    } catch (error) {
        console.error('Failed to get encryption key', error);
    }
};

const refreshEncryptKey = async () => {
    const now = new Date().getTime();
    if (encryptionConfig.expireTime - now < 2 * 60 * 1000) {
        await getEncryptKey();
    }
};

const encryptData = (data) => {
    if (!encryptionConfig.keyId) {
        return data;
    }
	const encryptKey=CryptoJS.enc.Base64.parse(encryptionConfig.encryptKey);
	const iv = CryptoJS.lib.WordArray.random(16);
	const plaintext = CryptoJS.enc.Utf8.parse(JSON.stringify(data));
    const encrypted = CryptoJS.AES.encrypt(plaintext, encryptKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return {
        iv: CryptoJS.enc.Base64.stringify(iv),
      	ciphertext: encrypted.toString(),
		keyId:encryptionConfig.keyId
    };
};

const decryptData = (encryptedResult) => {
    if (!encryptionConfig.encryptKey || !encryptedResult || typeof encryptedResult !== 'object' || !encryptedResult.ciphertext || !encryptedResult.iv) {
        console.warn('Decryption skipped: missing key or invalid encrypted data format.', encryptedResult);
        return encryptedResult;
    }
    try {
        const encryptKey = CryptoJS.enc.Base64.parse(encryptionConfig.encryptKey);
        const iv = CryptoJS.enc.Base64.parse(encryptedResult.iv);
        const ciphertext = encryptedResult.ciphertext;

        const decrypted = CryptoJS.AES.decrypt(ciphertext, encryptKey, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });

        const decryptedText = CryptoJS.enc.Utf8.stringify(decrypted);
        // 尝试将解密后的文本解析为JSON，如果失败，则说明它可能是一个普通字符串，直接返回
        try {
            return JSON.parse(decryptedText);
        } catch (jsonError) {
            return decryptedText;
        }
    } catch (e) {
        console.error("Decryption failed", e);
        return encryptedResult;
    }
};

const request = async (options) => {
    if (options.encrypt) {
        await refreshEncryptKey();
    }

    let data = options.data;
    if (options.encrypt && (options.method === 'POST' || options.method === 'PUT') && data) {
        data = encryptData(data);
    }

	return new Promise((resolve, reject) => {
		uni.showLoading({
			title: '加载中...'
		});

		const token = uni.getStorageSync('token');
		const header = {
			'Content-Type': 'application/json;charset=UTF-8',
			...options.header
		};
		if (token) {
			header.Authorization = 'Bearer ' + token;
		}

		uni.request({
			url: BASE_URL + options.url,
			method: options.method || 'GET',
			data: data,
			header: header,
			timeout: options.timeout || 60000,
			success: (res) => {
				const {
					statusCode,
					data
				} = res;
				if (statusCode === 200) {
					if (data.code === 200) {
						// 如果请求是加密的，并且响应中有 result 字段，则尝试解密
                        if (options.encrypt && data.result) {
                            data.result = decryptData(data.result);
                        }
						resolve(data);
					} else if (data.code === 401) {
						uni.removeStorageSync('token');
						uni.showToast({
							title: '登录已过期，请重新登录',
							icon: 'none',
							duration: 1500
						});
						uni.navigateTo({
							url: '/pages/login/login'
						});
						reject(data);
					} else {
						uni.showToast({
							title: data.message || '请求失败',
							icon: 'none'
						});
						reject(data);
					}
				} else {
					uni.showToast({
						title: '网络错误',
						icon: 'none'
					});
					reject(res);
				}
			},
			fail: (err) => {
				uni.showToast({
					title: '网络连接失败',
					icon: 'none'
				});
				reject(err);
			},
			complete: () => {
				uni.hideLoading();
			}
		});
	});
};

const upload = (url, filePath, fileName, formData = {}) => {
	return new Promise((resolve, reject) => {
		const token = uni.getStorageSync('token');

		if (!filePath) {
			reject({
				message: 'filePath 不能为空'
			});
			return;
		}

		uni.showLoading({
			title: '上传中...'
		});

		const fileSystemManager = uni.getFileSystemManager();

		try {
			const fileData = fileSystemManager.readFileSync(filePath, 'base64');
			const uploadUrl = BASE_URL + url;

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
					if (res.statusCode === 200) {
						if (res.data.code === 200) {
							resolve(res.data);
						} else if (res.data.code === 401) {
							uni.removeStorageSync('token');
							uni.showToast({
								title: '登录已过期，请重新登录',
								icon: 'none',
								duration: 1500
							});
							uni.navigateTo({
								url: '/pages/login/login'
							});
							reject(res.data);
						} else {
							uni.showToast({
								title: res.data.message || '上传失败',
								icon: 'none'
							});
							reject(res.data);
						}
					} else {
						uni.showToast({
							title: '网络错误',
							icon: 'none'
						});
						reject(res);
					}
				},
				fail: (error) => {
					uni.showToast({
						title: error.errMsg || '上传失败',
						icon: 'none'
					});
					reject(error);
				},
				complete: () => {
					uni.hideLoading();
				}
			});

		} catch (error) {
			uni.hideLoading();
			uni.showToast({
				title: '读取文件失败',
				icon: 'none'
			});
			reject(error);
		}
	});
};

export default {
	get: (url, config) => request({
		url,
		...config,
		method: 'GET',
        encrypt: config?.encrypt ?? false,
	}),
	post: (url, data, config) => request({
		url,
		data,
		...config,
		method: 'POST',
        encrypt: config?.encrypt ?? true,
	}),
	put: (url, data, config) => request({
		url,
		data,
		...config,
		method: 'PUT',
        encrypt: config?.encrypt ?? true,
	}),
	delete: (url, config) => request({
		url,
		...config,
		method: 'DELETE',
        encrypt: config?.encrypt ?? false,
	}),
	baseURL: BASE_URL,
	upload: upload,
    getEncryptKey: getEncryptKey
};