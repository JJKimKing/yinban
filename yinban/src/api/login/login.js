import http from '../request.js'

export const wxLogin = (code) => {
	return http.get('/api/wx/login', {
	    params: { code }
	})
}