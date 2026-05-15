#!/bin/bash
# update-domain.sh — Reemplaza el dominio en todos los archivos del sitio.
#
# Uso: ./update-domain.sh drsergiorios.com
#       ./update-domain.sh www.drsergiorios.com  (si prefieres www)
#
# Reemplaza:
#   - https://santiagooptinomics888.github.io/dr-sergio-rios-landing  →  https://<nuevo>
#   en: canonical, og:url, sitemap.xml, robots.txt, JSON-LD @id/url
#
# Después de ejecutarlo:
#   git add -A && git commit -m "chore: switch to production domain" && git push

set -e

if [ -z "$1" ]; then
  echo "Error: especifica el dominio."
  echo "Uso: ./update-domain.sh drsergiorios.com"
  exit 1
fi

NEW_DOMAIN="$1"
NEW_BASE="https://${NEW_DOMAIN}"
OLD_BASE="https://santiagooptinomics888.github.io/dr-sergio-rios-landing"

echo "═══ Cambiando dominio ═══"
echo "  De: $OLD_BASE"
echo "  A:  $NEW_BASE"
echo ""

# Reemplazo en HTML, XML, TXT
find . -type f \( -name "*.html" -o -name "*.xml" -o -name "*.txt" \) \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -exec /usr/bin/sed -i '' "s|${OLD_BASE}|${NEW_BASE}|g" {} \;

echo "✓ Reemplazos hechos en todos los archivos"
echo ""

# Verificación
remaining=$(grep -rln "santiagooptinomics888.github.io" --include="*.html" --include="*.xml" --include="*.txt" . 2>/dev/null | wc -l | tr -d ' ')
if [ "$remaining" = "0" ]; then
  echo "✓ Cero referencias al dominio viejo"
else
  echo "⚠ Quedan $remaining archivos con dominio viejo (revisa manualmente):"
  grep -rln "santiagooptinomics888.github.io" --include="*.html" --include="*.xml" --include="*.txt" .
fi

echo ""
echo "═══ Próximos pasos ═══"
echo "  1. Revisa los cambios:  git diff"
echo "  2. Commit:              git add -A && git commit -m 'chore: switch domain to ${NEW_DOMAIN}'"
echo "  3. Push:                git push origin main"
echo "  4. En Netlify/GitHub Pages: configura ${NEW_DOMAIN} como custom domain"
echo "  5. En Google Search Console: agrega la nueva propiedad y sube sitemap"
