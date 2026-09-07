const fs = require('node:fs');
// Admin is a public sign-in shell. Authorization lives in RLS and Edge Functions.
fs.writeFileSync('out/.nojekyll', '');
