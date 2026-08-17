const PROJECTS = {
    'dr-tank': 'https://dr-tank.vercel.app',
    '4usdesigns': 'https://www.4usdesigns.com',
    lap57: 'https://my-site-4zkwah3n-shashisalwathura78.wix-vibe.com',
    shoety: 'https://shoe-ty.vercel.app',
    'johns-men-hairstylist': 'https://johns-men-hairstylist.vercel.app',
    'laundry-depot': 'https://laundry-depot.vercel.app',
    'two-conversations': 'https://two-conversations.vercel.app',
    salwathurajewellery: 'https://www.salwathurajewellery.lk',
    invito: 'https://invito-tawny-tau.vercel.app/',
    shashi_thimira: 'https://shashi-thimira.vercel.app/',
    kandyan: 'https://shashisal98.github.io/kandyan/',
    western: 'https://western-wedding.vercel.app/',
    golden: 'https://golden-ashi-senuth.vercel.app/',
    'cinematic-gold': 'https://cinematic-gold.vercel.app/',
    'tamil-wedding': 'https://tamil-wedding-phi.vercel.app/',
    opening: 'https://opening-ten.vercel.app/',
    birthday: 'https://birthday-alpha-seven-23.vercel.app/'
};

function rewriteAssetUrls(html, baseUrl) {
    const safeBase = baseUrl.replace(/\/$/, '');

    const rewriteMatch = (match, attr, value) => {
        if (!value || /^(data:|javascript:|mailto:|tel:|#|blob:)/i.test(value)) {
            return match;
        }

        if (/^(https?:)?\/\//i.test(value)) {
            return match;
        }

        try {
            const fullUrl = new URL(value, `${safeBase}/`).toString();
            return `${attr}="${fullUrl}"`;
        } catch (error) {
            return match;
        }
    };

    let rewritten = html.replace(/(href|src)=(['"])([^'"#?]+)(\2)/gi, (match, attr, quote, value) => {
        return rewriteMatch(match, attr, value);
    });

    rewritten = rewritten.replace(/url\((['"]?)([^)'"\s]+)\1\)/gi, (match, quote, value) => {
        if (!value || /^(data:|javascript:|mailto:|tel:|#|blob:)/i.test(value)) {
            return match;
        }

        if (/^(https?:)?\/\//i.test(value)) {
            return match;
        }

        try {
            const fullUrl = new URL(value, `${safeBase}/`).toString();
            return `url(${quote}${fullUrl}${quote})`;
        } catch (error) {
            return match;
        }
    });

    if (!/<base\s+/i.test(rewritten)) {
        rewritten = rewritten.replace(/<head>/i, `<head><base href="${safeBase}/">`);
    }

    return rewritten;
}

module.exports = async function handler(req, res) {
    const url = new URL(req.url, 'https://www.stechsolution.lk');
    const project = url.searchParams.get('project');
    const path = url.searchParams.get('path') || '/';

    if (!project || !PROJECTS[project]) {
        res.status(404).send('Project not found');
        return;
    }

    const baseUrl = PROJECTS[project];
    const targetPath = path === '/' ? '' : path.replace(/^\/+/, '');
    const targetUrl = new URL(targetPath ? `/${targetPath}` : '/', `${baseUrl}/`).toString();

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; STechSolution/1.0)'
            }
        });

        if (!response.ok) {
            const body = await response.text();
            res.status(response.status).send(body || 'Project load failed');
            return;
        }

        const contentType = response.headers.get('content-type') || 'text/html';
        const body = await response.text();

        if (contentType.includes('text/html')) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.status(200).send(rewriteAssetUrls(body, baseUrl));
            return;
        }

        res.setHeader('Content-Type', contentType);
        res.status(200).send(body);
    } catch (error) {
        res.status(502).send('Unable to load project preview');
    }
};
