interface MetaTags {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
}

const metaTagsConfig: Record<string, MetaTags> = {
  '/': {
    title: 'Auto Dealership CRM & Website Software | DealerDelight US, UK & Ireland',
    description: 'Complete dealership management platform for US, UK & Ireland. Beautiful websites, powerful CRM, and inventory management for car dealers. From $219/month with all features. Book your free demo today.',
    keywords: 'auto dealership software USA, car dealer CRM United States, dealership website builder America, auto dealer software UK, car dealership CRM United Kingdom, British dealership platform, dealership software Ireland, Dublin car dealers, inventory management',
    ogImage: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&h=630&fit=crop'
  },
  '/demo': {
    title: 'Dealership Website Templates - Classic, Luxury, Modern',
    description: 'Preview our professional auto dealership website templates: Classic Pro, Luxury Elite, and Modern Edge. Interactive demos with real vehicle inventory displays. Choose the perfect design for your dealership.',
    keywords: 'dealership website templates, car dealer website design, auto dealership themes, luxury car websites, modern dealership designs, vehicle inventory showcase',
    ogImage: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=630&fit=crop'
  }
};

const defaultMetaTags: MetaTags = {
  title: 'Page Not Found - DealerDelight',
  description: 'The page you\'re looking for doesn\'t exist. Return to DealerDelight to explore our auto dealership website solutions.',
  keywords: 'auto dealership software, car dealer websites',
  ogImage: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&h=630&fit=crop'
};

export function getMetaTagsForPath(path: string): MetaTags {
  // Remove query parameters and trailing slashes
  const cleanPath = path.split('?')[0].replace(/\/$/, '') || '/';
  return metaTagsConfig[cleanPath] || defaultMetaTags;
}

export function injectMetaTags(html: string, path: string, baseUrl: string): string {
  const meta = getMetaTagsForPath(path);
  const url = `${baseUrl}${path}`;
  
  // Generate structured data based on path
  let structuredData = '';
  if (path === '/' || path === '') {
    structuredData = `
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "DealerDelight",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "219",
        "priceCurrency": "USD"
      },
      "description": "${meta.description}",
      "url": "${baseUrl}",
      "screenshot": "${meta.ogImage}",
      "provider": {
        "@type": "Organization",
        "name": "DealerDelight",
        "url": "${baseUrl}"
      },
      "areaServed": [
        {
          "@type": "Country",
          "name": "United States"
        },
        {
          "@type": "Country",
          "name": "United Kingdom"
        },
        {
          "@type": "Country",
          "name": "Ireland"
        }
      ]
    }
    </script>`;
  }
  
  const metaTagsHtml = `
    <title>${meta.title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${meta.description}">
    <meta name="keywords" content="${meta.keywords}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${meta.title}">
    <meta property="og:description" content="${meta.description}">
    <meta property="og:image" content="${meta.ogImage}">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${url}">
    <meta name="twitter:title" content="${meta.title}">
    <meta name="twitter:description" content="${meta.description}">
    <meta name="twitter:image" content="${meta.ogImage}">
    ${structuredData}
  `;
  
  // Replace the existing title and description
  let result = html.replace(/<title>.*?<\/title>/, '');
  result = result.replace(/<meta name="description"[^>]*>/, '');
  
  // Inject all meta tags in the head
  result = result.replace('</head>', `${metaTagsHtml}\n  </head>`);
  
  return result;
}
