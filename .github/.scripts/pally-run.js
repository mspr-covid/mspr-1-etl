// pa11y-run.js
const pa11y = require("pa11y");
const puppeteer = require("puppeteer");

(async () => {
	const browser = await puppeteer.launch({
		args: ["--no-sandbox"],
	});

	const results = await pa11y("http://localhost:5173/login", {
		browser,
	});

	console.log(JSON.stringify(results, null, 2));
	await browser.close();
})();
