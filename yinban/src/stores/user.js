import { defineStore } from 'pinia'
import { gql } from '@/utils/graphql.js'
import { updateUserInfo, uploadAvatar, createSign } from '@/api/profile/index.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: {
      nickname: '',
      phone: '',
      avatar: '/static/default-avatar.png',
      signature: '',
      companion: false
    },
    userPending: {
      avatarAuditStatus: 'approved', 
      pendingAvatarUrl: '', // 审核中的头像URL
      signatureAuditStatus: 'approved', // 签名审核状态
      nicknameAuditStatus: 'approved', // 昵称审核状态
      signatureContent: '',
      nicknameContent: ''
    },
    // 编辑时的临时状态
    editingData: {
      nickname: '',
      signature: '',
      phone: ''
    },
    companionCount: {
      favorites: 0,
      following: 0
    },
    // 钱包信息
    walletInfo: {
      balance: '0',
      coupons: 0
    },
    // 订单信息
    orderInfo: {
      count: 0
    },
    isEditing: false,
    isLoading: false,
    isUploadingAvatar: false
  }),

  getters: {
    displayAvatar: (state) => {
      // 如果有审核状态且状态为pending，优先使用pendingAvatarUrl
      if (state.userPending.avatarAuditStatus === 'pending' && state.userPending.pendingAvatarUrl) {
        return state.userPending.pendingAvatarUrl
      }
      // 否则使用常规的avatar
      return state.userInfo.avatar || '/static/default-avatar.png'
    },
    
    displayNickname: (state) => {
      // 如果在编辑状态，使用编辑数据
      if (state.isEditing) {
        return state.editingData.nickname
      }
      
      if (state.userPending.nicknameAuditStatus === 'pending' && state.userPending.nicknameContent) {
        return state.userPending.nicknameContent
      }
      return state.userInfo.nickname || ''
    },
    
    displaySignature: (state) => {
      // 如果在编辑状态，使用编辑数据
      if (state.isEditing) {
        return state.editingData.signature
      }
      
      if (state.userPending.signatureAuditStatus === 'pending' && state.userPending.signatureContent) {
        return state.userPending.signatureContent
      }
      return state.userInfo.signature || '这个人很懒，什么都没留下～'
    },

    isFormValid: (state) => {
      const nickname = state.isEditing 
        ? state.editingData.nickname
        : (state.userPending.nicknameAuditStatus === 'pending' && state.userPending.nicknameContent 
           ? state.userPending.nicknameContent 
           : state.userInfo.nickname)
      return nickname?.trim().length > 0
    }
  },

  actions: {
    async loadUserData() {
      this.isLoading = true
      try {
        const query = `
          query {
            userProfile {
              nickname
              signature
              avatar
              companion
              phone
            }
            userPending {
              avatarAuditStatus
              pendingAvatarUrl
              signatureAuditStatus
              signatureContent
              nicknameAuditStatus
              nicknameContent
            }
            userCompanionCount{
              favorites
              following
            }  
            queryWalletInfo{
              balance
              coupons
            }
			queryOderInfo{
				count
			}
          }
        `
        const data = await gql.query(query)
        
        if (data) {
          // 更新用户基本信息
          if (data.userProfile) {
            this.userInfo = { ...data.userProfile }
          }

          // 更新审核状态信息
          if (data.userPending) {
            this.userPending = { ...data.userPending }
          }

          // 更新陪玩统计数据
          if (data.userCompanionCount) {
            this.companionCount = { ...data.userCompanionCount }
          }
          //更新钱包信息
          if (data.queryWalletInfo) {
            this.walletInfo = { ...data.queryWalletInfo }
          }
          //更新订单信息
          if (data.queryOderInfo) {
            this.orderInfo = { ...data.queryOderInfo }
          }
        }
      } catch (error) {
        console.error('加载用户数据失败:', error)
      } finally {
        this.isLoading = false
      }
    },

    // 进入编辑状态
    startEditing() {
      this.isEditing = true
      // 初始化编辑数据
      this.editingData.nickname = this.userPending.nicknameAuditStatus === 'pending' && this.userPending.nicknameContent
        ? this.userPending.nicknameContent
        : this.userInfo.nickname || ''
        
      this.editingData.signature = this.userPending.signatureAuditStatus === 'pending' && this.userPending.signatureContent
        ? this.userPending.signatureContent
        : this.userInfo.signature || ''
        
      this.editingData.phone = this.userInfo.phone || ''
    },

    // 退出编辑状态
    stopEditing() {
      this.isEditing = false
      // 清空编辑数据
      this.editingData = {
        nickname: '',
        signature: '',
        phone: ''
      }
    },

    updateNickname(value) {
      if (this.isEditing) {
        this.editingData.nickname = value
      } else {
        // 如果当前是审核状态，更新审核内容
        if (this.userPending.nicknameAuditStatus === 'pending') {
          this.userPending.nicknameContent = value
        } else {
          this.userInfo.nickname = value
        }
      }
    },

    updateSignature(value) {
      if (this.isEditing) {
        this.editingData.signature = value
      } else {
        // 如果当前是审核状态，更新审核内容
        if (this.userPending.signatureAuditStatus === 'pending') {
          this.userPending.signatureContent = value
        } else {
          this.userInfo.signature = value
        }
      }
    },

    updatePhone(value) {
      if (this.isEditing) {
        this.editingData.phone = value
      } else {
        this.userInfo.phone = value
      }
    },

    generateFileName(filePath, defaultExt = 'png') {
      // 从文件路径中提取文件名和扩展名
      const fileName = filePath.split('/').pop() || 'avatar'
      
      // 如果文件名已经包含扩展名，直接返回
      if (fileName.includes('.')) {
        return fileName
      }
      
      // 否则使用默认扩展名
      return `${fileName}.${defaultExt}`
    },

    async getFileData(filePath) {
      try {
        // 使用文件系统管理器读取文件为base64数据
        const fileSystemManager = uni.getFileSystemManager()
        const fileData = fileSystemManager.readFileSync(filePath, 'base64')
        return fileData
      } catch (error) {
        throw error
      }
    },

    async uploadAvatarImage(filePath, fileName, isWechatImage = false) {
      if (this.isUploadingAvatar) {
        uni.showToast({
          title: '正在上传，请稍候',
          icon: 'none'
        })
        return
      }

      this.isUploadingAvatar = true
      
      try {
        let sign = ''
        
        // 如果是微信图片，先获取文件信息并请求sign
        if (isWechatImage) {
          const fileData = await this.getFileData(filePath)
          const signResult = await createSign(fileData)
          if (signResult.code == 200) {
            sign = signResult.result
          }
        }
        
        // 调用上传接口
        const result = await uploadAvatar(filePath, fileName, sign)
        
        if (result.result && result.result.originFileUrl) {
          this.userPending.pendingAvatarUrl = result.result.originFileUrl
          this.userPending.avatarAuditStatus = 'pending'
          uni.showToast({
            title: '图片审核中，请耐心等待',
            icon: 'none',
            duration: 2000
          })
        } else {
          throw new Error(result.message || '上传失败，请重试')
        }
      } catch (error) {
        uni.showToast({
          title: error.message || '上传失败',
          icon: 'none'
        })
        throw error
      } finally {
        this.isUploadingAvatar = false
      }
    },

    async saveProfile() {
      // 验证表单 - 在编辑状态下使用编辑数据验证
      const nickname = this.isEditing ? this.editingData.nickname : this.displayNickname
      if (!nickname?.trim()) {
        uni.showToast({
          title: '请填写昵称',
          icon: 'none'
        })
        return false
      }
      
      // 如果有审核中的头像，提示用户
      if (this.userPending.avatarAuditStatus === 'pending') {
        // 在弹窗前先保存所有需要的数据，避免异步过程中数据丢失
        const saveData = {
          isEditing: this.isEditing,
          nickname: this.isEditing ? this.editingData.nickname : this.displayNickname,
          signature: this.isEditing ? this.editingData.signature : this.displaySignature,
          phone: this.isEditing ? this.editingData.phone : this.userInfo.phone
        }
        
        return new Promise((resolve) => {
          uni.showModal({
            title: '提示',
            content: '您的头像正在审核中，审核通过后将使用当前显示的头像',
            success: (res) => {
              if (res.confirm) {
                // 使用保存的数据直接调用保存逻辑
                this.doSaveProfile(saveData).then(resolve)
              } else {
                resolve(false)
              }
            }
          })
        })
      }
      
      return this.doSaveProfile()
    },

    async doSaveProfile(saveData = null) {
      uni.showLoading({
        title: '保存中...'
      })
      
      try {
        let nickname, signature, phone
        
        if (saveData) {
          // 使用传入的保存数据（主要用于头像审核弹窗确认后的保存）
          nickname = saveData.nickname
          signature = saveData.signature
          phone = saveData.phone
          
          // 根据审核状态决定更新位置
          if (this.userPending.nicknameAuditStatus === 'pending') {
            this.userPending.nicknameContent = nickname
          } else {
            this.userInfo.nickname = nickname
          }
          
          if (this.userPending.signatureAuditStatus === 'pending') {
            this.userPending.signatureContent = signature
          } else {
            this.userInfo.signature = signature
          }
          
          this.userInfo.phone = phone
        } else {
          // 使用当前状态数据（正常保存流程）
          if (this.isEditing) {
            // 根据审核状态决定更新位置
            if (this.userPending.nicknameAuditStatus === 'pending') {
              this.userPending.nicknameContent = this.editingData.nickname
            } else {
              this.userInfo.nickname = this.editingData.nickname
            }
            
            if (this.userPending.signatureAuditStatus === 'pending') {
              this.userPending.signatureContent = this.editingData.signature
            } else {
              this.userInfo.signature = this.editingData.signature
            }
            
            this.userInfo.phone = this.editingData.phone
          }
        }
        
        // 构造提交数据时，根据审核状态使用正确的值
        const updateData = {
          nickname: this.userPending.nicknameAuditStatus === 'pending' 
            ? this.userPending.nicknameContent 
            : this.userInfo.nickname,
          signature: this.userPending.signatureAuditStatus === 'pending' 
            ? this.userPending.signatureContent 
            : this.userInfo.signature,
          avatar: this.userInfo.avatar,
          phone: this.userInfo.phone,
          companion: this.userInfo.companion,
          avatarAuditStatus: this.userPending.avatarAuditStatus,
          pendingAvatarUrl: this.userPending.pendingAvatarUrl,
          signatureAuditStatus: this.userPending.signatureAuditStatus,
          nicknameAuditStatus: this.userPending.nicknameAuditStatus,
          signatureContent: this.userPending.signatureContent,
          nicknameContent: this.userPending.nicknameContent
        }
        
        const result = await updateUserInfo(updateData)
        
        if (result.success || result.code === 200) {
          // 处理AI审核结果
          if (result.result) {
            const auditResult = result.result
            
            // 更新昵称审核状态
            if (auditResult.nicknameAuditStatus) {
              this.userPending.nicknameAuditStatus = auditResult.nicknameAuditStatus
            }
            
            // 更新签名审核状态
            if (auditResult.signatureAuditStatus) {
              this.userPending.signatureAuditStatus = auditResult.signatureAuditStatus
            }
            
            // 如果有内容需要人工审核，显示提示
            if (auditResult.nicknameAuditStatus === 'pending' || auditResult.signatureAuditStatus === 'pending') {
              uni.showToast({
                title: '内容正在审核中，审核通过后将显示新内容',
                icon: 'none',
                duration: 3000
              })
            } else {
              uni.showToast({
                title: '保存成功!',
                icon: 'success'
              })
            }
          } else {
            uni.showToast({
              title: '保存成功!',
              icon: 'success'
            })
          }
          
          // 保存成功后退出编辑状态
          this.stopEditing()
          
          return true
        } else {
          throw new Error(result.message || '保存失败')
        }
      } catch (error) {
        uni.showToast({
          title: error.message || '保存失败',
          icon: 'none'
        })
        return false
      } finally {
        uni.hideLoading()
      }
    }
  }
})