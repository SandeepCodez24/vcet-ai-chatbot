/**
 * Build script for creating the public directory
 * Converts Flask templates to static HTML for Netlify deployment
 */

const fs = require('fs');
const path = require('path');

// Paths
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const STATIC_DIR = path.join(__dirname, '..', 'static');

// Ensure public directory exists
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
}

// Convert Flask template to static HTML
function convertTemplate(templatePath, outputPath) {
    let content = fs.readFileSync(templatePath, 'utf8');

    // Replace Flask url_for with static paths
    content = content.replace(
        /\{\{\s*url_for\s*\(\s*'static'\s*,\s*filename\s*=\s*'([^']+)'\s*\)\s*\}\}/g,
        '/$1'
    );

    // Remove any other Flask template syntax
    content = content.replace(/\{\{[^}]+\}\}/g, '');
    content = content.replace(/\{%[^%]+%\}/g, '');

    fs.writeFileSync(outputPath, content);
    console.log(`Converted: ${path.basename(templatePath)} -> ${path.basename(outputPath)}`);
}

// Copy directory recursively
function copyDir(src, dest) {
    ensureDir(dest);

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }

    console.log(`Copied: ${src} -> ${dest}`);
}

// Main build process
function build() {
    console.log('=== Building public directory ===\n');

    // Create public directory
    ensureDir(PUBLIC_DIR);

    // Convert index.html template
    const indexTemplate = path.join(TEMPLATES_DIR, 'index.html');
    const indexOutput = path.join(PUBLIC_DIR, 'index.html');

    if (fs.existsSync(indexTemplate)) {
        convertTemplate(indexTemplate, indexOutput);
    } else {
        console.error('ERROR: index.html template not found!');
        process.exit(1);
    }

    // Create additional static files
    createRobotsTxt();
    createManifest();
    createSitemap();

    console.log('\n=== Build complete! ===');
    console.log('Note: Static assets (CSS/JS/images) are copied by npm scripts');
}

function createRobotsTxt() {
    const content = `# Robots.txt for VCET AI Chatbot
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://vcet-ai.netlify.app/sitemap.xml
`;
    fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), content);
    console.log('Created: robots.txt');
}

function createManifest() {
    const manifest = {
        name: "VCET AI Assistant",
        short_name: "VCET AI",
        description: "AI-powered chatbot for Velammal College of Engineering & Technology",
        start_url: "/",
        display: "standalone",
        background_color: "#1e3a8a",
        theme_color: "#1e3a8a",
        icons: [
            {
                src: "/images/icon-192.png",
                sizes: "192x192",
                type: "image/png"
            },
            {
                src: "/images/icon-512.png",
                sizes: "512x512",
                type: "image/png"
            }
        ]
    };

    fs.writeFileSync(
        path.join(PUBLIC_DIR, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
    );
    console.log('Created: manifest.json');
}

function createSitemap() {
    const content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://vcet-ai.netlify.app/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
    fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), content);
    console.log('Created: sitemap.xml');
}

// Run build
build();
