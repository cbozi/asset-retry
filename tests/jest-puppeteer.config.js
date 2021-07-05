module.exports = {
	launch: {
		// headless: false,
		// devtools: true,
		args: ['--proxy-server=127.0.0.1:8080']
	},
	server: {
		command: `npm run dev`,
		port: 8080
	}
}