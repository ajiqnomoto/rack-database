FROM nginx:1.27-alpine

# Serve the static PWA directly
COPY index.html manifest.json sw.js /usr/share/nginx/html/

# Cache policy: never cache the shell files (instant edits), long-cache nothing else (static site)
RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    location = /sw.js {\n\
        add_header Cache-Control "no-cache, must-revalidate";\n\
    }\n\
    location = /index.html {\n\
        add_header Cache-Control "no-cache, must-revalidate";\n\
    }\n\
    location = /manifest.json {\n\
        add_header Cache-Control "no-cache, must-revalidate";\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
