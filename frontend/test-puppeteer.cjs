const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', err => console.log('PAGE ERROR STR:', err.toString()));

        await page.goto('http://localhost:5175/login', { waitUntil: 'networkidle0' });

        const content = await page.content();
        if (content.includes('Something went wrong')) {
            console.log("ERROR RENDERED ON LOGIN PAGE:");
            const errText = await page.evaluate(() => document.querySelector('pre') ? document.querySelector('pre').innerText : 'no text in pre tag');
            console.log(errText);
        } else {
            console.log("LOGIN PAGE RENDERED FINE OR DIFFERENT BLANK. HTML Snapshot:");
            console.log(content.slice(0, 1500));
        }

        await browser.close();
    } catch (e) {
        console.error("Puppeteer Script Error:", e);
    }
})();
