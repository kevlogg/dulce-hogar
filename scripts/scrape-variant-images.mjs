// Scrapes one product page and prints what variant image data is available
const URL = "https://dulcehogardisenoyestilo2.mitiendanube.com/productos/almohadon-gervasoni/";

const res = await fetch(URL, { headers: { "User-Agent": "Mozilla/5.0" } });
const html = await res.text();

// Try common Tienda Nube patterns for variant+image data
const patterns = [
  { name: "LS.product", re: /LS\.product\s*=\s*({[\s\S]*?});\s*(?:LS|var|window|<)/ },
  { name: "window.__TNPRODUCT__", re: /window\.__TNPRODUCT__\s*=\s*({[\s\S]*?});\s*</ },
  { name: "var product =", re: /var\s+product\s*=\s*({[\s\S]*?});\s*(?:var|window|LS|<)/ },
  { name: "storefront.product", re: /storefront\.product\s*=\s*({[\s\S]*?});\s*(?:LS|<)/ },
  { name: "data-product attr", re: /data-product="([^"]+)"/ },
  { name: "data-variants attr", re: /data-variants="([^"]+)"/ },
];

for (const { name, re } of patterns) {
  const m = html.match(re);
  if (m) {
    console.log(`\n✓ FOUND: ${name}`);
    try {
      const decoded = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&");
      const obj = JSON.parse(decoded);
      // Look for variant/image data
      const str = JSON.stringify(obj, null, 2);
      const snippet = str.substring(0, 800);
      console.log(snippet);
    } catch {
      console.log(m[1].substring(0, 400));
    }
  } else {
    console.log(`  - Not found: ${name}`);
  }
}

// Also look for inline variant image patterns
const variantImgMatch = html.match(/"variants"\s*:\s*(\[[\s\S]*?\])/);
if (variantImgMatch) {
  console.log("\n✓ FOUND: inline variants array");
  try {
    const arr = JSON.parse(variantImgMatch[1]);
    console.log(JSON.stringify(arr.slice(0, 3), null, 2));
  } catch {
    console.log(variantImgMatch[1].substring(0, 400));
  }
}
