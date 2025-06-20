// pa11y-script.js
const pa11y = require('pa11y');
const fs = require('fs');

(async () => {
  const results = await pa11y('http://host.docker.internal:5173/login', {
    chromeLaunchConfig: {
      args: ['--no-sandbox']
    }
  });

  const report = JSON.stringify(results, null, 2);
  console.log("🧪 Résultat Pa11y :\n", report);

  fs.writeFileSync('./pa11y-output/pa11y-report.txt', report);
  console.log('✅ Rapport écrit dans ./pa11y-output/pa11y-report.txt');
})();
