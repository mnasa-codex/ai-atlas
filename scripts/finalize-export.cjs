const fs=require('node:fs');
// Local authoring is never published on the static host.
for(const path of ['out/admin','out/admin.html','out/admin.txt'])fs.rmSync(path,{recursive:true,force:true});
