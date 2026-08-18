---
layout: seo
---
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root=process.cwd();
const sitemap=await readFile(path.join(root,"sitemap.xml"),"utf8");
const index=await readFile(path.join(root,"index.html"),"utf8");
const sitemapUrls=[...sitemap.matchAll(/<loc>(https:\/\/kacagider\.com\.tr\/[^<]*)<\/loc>/g)].map(([,url])=>url);
const categoryUrls=["tablet","bilgisayar","akilli-saat","oyun-konsolu"].map(slug=>`https://kacagider.com.tr/${slug}/`);
const urls=[...new Set([...sitemapUrls,...categoryUrls])];
const seoLayout=("---\n---\n"+index)
  .replace('href="https://kacagider.com.tr/"','href="https://kacagider.com.tr{{ page.url }}"')
  .replace('content="https://kacagider.com.tr/"','content="https://kacagider.com.tr{{ page.url }}"');
await mkdir(path.join(root,"_layouts"),{recursive:true});
await writeFile(path.join(root,"_layouts","seo.html"),seoLayout);

for(const url of urls){
  const pathname=new URL(url).pathname;
  if(pathname==="/") continue;
  const source=path.join(root,pathname,"index.md");
  await mkdir(path.dirname(source),{recursive:true});
  await writeFile(source,"---\nlayout: seo\n---\n");
}

console.log(`Generated ${urls.length-1} valid SEO page definitions.`);
