// utils/graphql.js

const GRAPHQL_ENDPOINT = 'http://192.168.1.4:8080/graphql'

export const gqlRequest = async (query, variables = {}) => {
  try {
    const token = uni.getStorageSync('token')
    
    const response = await new Promise((resolve, reject) => {
      uni.request({
        url: GRAPHQL_ENDPOINT,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        data: {
          query,
          variables
        },
        success: (res) => {
          if (res.statusCode === 200) {
            // 检查响应数据中的code字段
            if (res.data && res.data.code === 401) {
              uni.removeStorageSync('token')
              uni.showToast({
                title: '登录已过期，请重新登录',
                icon: 'none',
                duration: 1500
              })
              uni.navigateTo({
                url: '/pages/login/login'
              })
              reject(new Error('Authentication failed'))
              return
            }
            resolve(res.data)
          } else {
            reject(new Error(`HTTP ${res.statusCode}`))
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
    
    if (response.errors) {
      throw new Error(response.errors[0].message)
    }
    
    return response.data
  } catch (e) {
    console.error('GraphQL Error:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
    return null
  }
}

// 便捷方法
export const gql = {
  // 执行查询
  async query(query, variables = {}) {
    return await gqlRequest(query, variables)
  },
  
  // 执行变更
  async mutate(mutation, variables = {}) {
    return await gqlRequest(mutation, variables)
  }
}