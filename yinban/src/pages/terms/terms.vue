<template>
  <div class="user-terms-container">
    <!-- 头部 -->
    <header class="terms-header">
      <h1 class="title">用户服务条款</h1>
      <p class="subtitle">最后更新时间：{{ lastUpdated }}</p>
    </header>

    <!-- 主要内容 -->
    <main class="terms-content">
      <!-- 引言 -->
      <section class="terms-section">
        <h2>引言</h2>
        <p>
          欢迎使用我们的服务！在您使用我们的产品和服务之前，请仔细阅读并理解本用户服务条款（以下简称"条款"）。
          通过访问或使用我们的服务，您表示同意受本条款约束。如果您不同意本条款，请不要使用我们的服务。
        </p>
      </section>

      <!-- 服务条款详细内容 -->
      <section class="terms-section" v-for="section in termsSections" :key="section.id">
        <h2>{{ section.title }}</h2>
        <div v-if="section.subsections">
          <div v-for="subsection in section.subsections" :key="subsection.id" class="subsection">
            <h3>{{ subsection.title }}</h3>
            <p v-for="paragraph in subsection.content" :key="paragraph" v-html="paragraph"></p>
          </div>
        </div>
        <div v-else>
          <p v-for="paragraph in section.content" :key="paragraph" v-html="paragraph"></p>
        </div>
      </section>

      <!-- 联系信息 -->
      <section class="terms-section contact-section">
        <h2>联系我们</h2>
        <p>如果您对本用户条款有任何疑问或建议，请通过以下方式联系我们：</p>
        <div class="contact-info">
          <p><strong>邮箱：</strong>support@example.com</p>
          <p><strong>电话：</strong>400-123-4567</p>
          <p><strong>地址：</strong>北京市朝阳区示例大厦101室</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  name: 'UserTerms',
  props: {
   
  },
  data() {
    return {
      hasRead: false,
      lastUpdated: '2024年8月18日',
      termsSections: [
        {
          id: 1,
          title: '1. 服务说明',
          content: [
            '我们提供的服务包括但不限于网站、移动应用程序、API接口等数字化产品和服务。',
            '我们有权随时修改、暂停或终止服务的任何部分，恕不另行通知。',
            '服务可能包含第三方内容或链接，我们不对此类第三方内容承担责任。'
          ]
        },
        {
          id: 2,
          title: '2. 用户账户',
          subsections: [
            {
              id: '2.1',
              title: '2.1 账户注册',
              content: [
                '您需要创建账户才能使用某些服务功能。',
                '注册时提供的信息必须真实、准确、完整且及时更新。',
                '您有责任维护账户信息的机密性和安全性。'
              ]
            },
            {
              id: '2.2',
              title: '2.2 账户责任',
              content: [
                '您对通过您的账户进行的所有活动承担全部责任。',
                '如发现账户被盗用，请立即通知我们。',
                '我们有权暂停或终止违反本条款的账户。'
              ]
            }
          ]
        },
        {
          id: 3,
          title: '3. 使用规范',
          content: [
            '您同意不会使用服务进行任何非法、有害、威胁、辱骂、骚扰、诽谤、粗俗、淫秽或其他令人反感的行为。',
            '禁止传播病毒、恶意软件或其他有害代码。',
            '不得干扰或破坏服务的正常运行。',
            '不得未经授权访问其他用户的账户或私人信息。'
          ]
        },
        {
          id: 4,
          title: '4. 知识产权',
          content: [
            '我们拥有服务中所有内容的知识产权，包括但不限于文字、图片、音频、视频、软件代码等。',
            '未经我们明确书面同意，您不得复制、修改、分发、销售或租赁服务的任何部分。',
            '您保留对自己创建和上传内容的知识产权，但授予我们使用这些内容的必要权利。'
          ]
        },
        {
          id: 5,
          title: '5. 隐私保护',
          content: [
            '我们重视您的隐私，会按照我们的隐私政策处理您的个人信息。',
            '我们采取合理的安全措施保护您的个人信息。',
            '在法律要求或为保护我们的权利时，我们可能会披露您的信息。'
          ]
        },
        {
          id: 6,
          title: '6. 免责声明',
          content: [
            '服务按"现状"提供，我们不提供任何明示或暗示的保证。',
            '我们不保证服务不会中断或完全无错误。',
            '对于因使用服务而产生的任何直接、间接、特殊或后果性损害，我们不承担责任。'
          ]
        },
        {
          id: 7,
          title: '7. 条款修改',
          content: [
            '我们保留随时修改本条款的权利。',
            '重大修改会通过网站公告、邮件或其他方式通知您。',
            '修改后的条款一经发布即生效，继续使用服务视为接受修改后的条款。'
          ]
        },
        {
          id: 8,
          title: '8. 适用法律',
          content: [
            '本条款受中华人民共和国法律管辖。',
            '因本条款引起的争议应通过友好协商解决。',
            '协商不成的，应提交至我们所在地有管辖权的人民法院解决。'
          ]
        }
      ]
    }
  },
  methods: {
  
  }
}
</script>

<style scoped>
.user-terms-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

.terms-header {
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ddd;
}

.title {
  font-size: 24px;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.terms-content {
  margin-bottom: 30px;
}

.terms-section {
  margin-bottom: 25px;
}

.terms-section h2 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #333;
}

.subsection {
  margin-bottom: 15px;
  padding-left: 20px;
}

.subsection h3 {
  font-size: 16px;
  margin-bottom: 8px;
  color: #333;
}

.terms-section p {
  margin-bottom: 10px;
  color: #555;
}

.contact-info {
  margin-top: 10px;
}

.terms-footer {
  border-top: 1px solid #ddd;
  padding-top: 20px;
}

.accept-section {
  text-align: center;
}

.checkbox-container {
  display: inline-flex;
  align-items: center;
  margin-bottom: 15px;
}

.checkbox-container input[type="checkbox"] {
  margin-right: 8px;
}

.accept-btn {
  padding: 10px 20px;
  border: 1px solid #ccc;
  background: #f8f8f8;
  cursor: pointer;
}

.accept-btn:hover:not(.disabled) {
  background: #e8e8e8;
}

.accept-btn.disabled {
  background: #f0f0f0;
  color: #999;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .user-terms-container {
    padding: 15px;
  }
  
  .subsection {
    padding-left: 15px;
  }
}
</style>