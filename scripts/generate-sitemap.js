import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = "https://sahilbind.in";

const staticRoutes = [
  "/",
  "/about",
  "/projects",
  "/resources",
  "/blogs",
  "/contact"
];

async function generateSitemap() {
  const routes = [...staticRoutes];

  try {
    const response = await fetch(
      "https://firestore.googleapis.com/v1/projects/my-portfolio-24f2001637/databases/(default)/documents/blogs"
    );
    if (response.ok) {
      const data = await response.json();
      if (data.documents && Array.isArray(data.documents)) {
        data.documents.forEach((doc) => {
          const parts = doc.name.split("/");
          const blogId = parts[parts.length - 1];
          routes.push(`/blogs/${blogId}`);
        });
        console.log(`Fetched ${data.documents.length} blog posts dynamically for the sitemap.`);
      }
    } else {
      console.warn("Failed to fetch blogs from Firestore REST API, generating static sitemap only.");
    }
  } catch (error) {
    console.error("Error fetching blogs for sitemap:", error);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${DOMAIN}${route}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === "/" ? "1.0" : route.startsWith("/blogs/") ? "0.7" : "0.8"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  const outputPath = path.resolve(__dirname, "../public/sitemap.xml");
  fs.writeFileSync(outputPath, sitemap, "utf8");
  console.log(`Sitemap generated successfully at ${outputPath}`);
}

generateSitemap();
