import http from '../request.js'

export const wxLogin = (code) => {
	return http.post('/api/wx/login', {code},{encrypt:false})
}