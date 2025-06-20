// pa11y-script.js
const pa11y = require('pa11y');
const fs = require('fs');
const path = require('path');

(async () => {
  const results = await pa11y('https://analyze-it-app.fly.dev/login', {
    chromeLaunchConfig: {
      args: ['--no-sandbox']
    }
  });

  const report = JSON.stringify(results, null, 2);
  console.log("🧪 Résultat Pa11y :\n", report);

  const outputDir = path.resolve('./pa11y-output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  fs.writeFileSync(path.join(outputDir, 'pa11y-report.txt'), report);
  console.log('✅ Rapport écrit dans ./pa11y-output/pa11y-report.txt');
})();
