# Guia para sacar el sitio web live con dominio propio

## Paso 1: Comprar el dominio

**Recomendados:**
- Namecheap (barato, buen soporte) — ~$10-15/ano
- Cloudflare Registrar (precio al costo, sin markup) — ~$9/ano
- GoDaddy (popular pero mas caro)

**Que dominio comprar:**
- `drsergiorios.com` o `sergiorios.co` o `clinicasergiorios.com`
- Preferir `.com` — es el mas confiable para pacientes
- Verificar disponibilidad en namecheap.com

## Paso 2: Elegir donde hospedar

### Opcion A: Quedarse en GitHub Pages (GRATIS)
- Ya esta funcionando
- Solo necesitas conectar el dominio
- Limitacion: solo sitios estaticos (HTML/CSS/JS) — perfecto para este caso
- SSL gratuito incluido

### Opcion B: Netlify (GRATIS, recomendado)
- Mas rapido que GitHub Pages
- Formularios funcionales incluidos (sin backend)
- SSL gratuito
- Deploy automatico desde GitHub
- Analytics basicos gratis

### Opcion C: Vercel (GRATIS)
- Similar a Netlify
- Muy rapido globalmente

### Opcion D: Hosting tradicional (NO recomendado para este sitio)
- Hostinger, SiteGround, etc.
- Innecesario — este sitio es estatico, no necesita servidor
- Mas caro ($3-10/mes) sin beneficio real

**Recomendacion: Netlify** — gratis, los formularios funcionan sin codigo extra, y es mas rapido que GitHub Pages.

## Paso 3: Conectar dominio (paso a paso)

### Si usas GitHub Pages:

1. En el repo de GitHub, ir a Settings > Pages
2. En "Custom domain", escribir `www.drsergiorios.com`
3. En Namecheap/Cloudflare (donde compraste el dominio):
   - Agregar registro CNAME: `www` -> `santiagooptinomics888.github.io`
   - Agregar 4 registros A para el dominio raiz:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
4. Esperar 24-48 horas para propagacion DNS
5. En GitHub Pages, marcar "Enforce HTTPS"

### Si usas Netlify:

1. Crear cuenta en netlify.com
2. "Import from GitHub" > seleccionar el repo `dr-sergio-rios-landing`
3. Deploy automatico (sin configuracion)
4. En Netlify > Domain settings > Add custom domain
5. Netlify te da los nameservers (ej: `dns1.p01.nsone.net`)
6. En Namecheap, cambiar los nameservers al de Netlify
7. SSL se activa automaticamente
8. Listo — cualquier push a GitHub actualiza el sitio

## Paso 4: Hacer que el formulario funcione

El formulario actual no envia datos a ningun lado. Opciones:

### Opcion A: Netlify Forms (si usas Netlify — MAS FACIL)
- Solo agregar `netlify` al tag form:
  ```html
  <form id="contactForm" netlify>
  ```
- Los envios llegan a tu panel de Netlify
- Puedes configurar notificaciones por email
- GRATIS hasta 100 envios/mes

### Opcion B: Formspree (funciona con cualquier hosting)
- Crear cuenta en formspree.io
- Cambiar el action del form:
  ```html
  <form action="https://formspree.io/f/TU_ID" method="POST">
  ```
- Los envios llegan a tu email
- GRATIS hasta 50 envios/mes

### Opcion C: EmailJS (envio directo desde el browser)
- No necesita backend
- Conecta con Gmail/Outlook
- GRATIS hasta 200 envios/mes

**Recomendacion: Netlify Forms** si usas Netlify, **Formspree** si no.

## Paso 5: Checklist antes de ir live

### SEO basico
- [ ] Verificar que el `<title>` y `<meta description>` estan correctos
- [ ] Agregar favicon (icono en la pestana del browser)
- [ ] Crear archivo robots.txt
- [ ] Crear sitemap.xml
- [ ] Registrar en Google Search Console

### Performance
- [ ] Comprimir imagenes (usar tinypng.com — reduce 60-80% sin perder calidad)
- [ ] Las imagenes actuales pesan ~5MB total, deberian ser ~1MB

### Legal
- [ ] Politica de privacidad (obligatorio si recoges datos)
- [ ] Aviso de cookies (si usas analytics)

### Analytics
- [ ] Google Analytics 4 (gratis) — para medir trafico
- [ ] Google Search Console — para ver como apareces en Google

### Contenido
- [ ] Reemplazar numeros de telefono placeholder con los reales
- [ ] Reemplazar email placeholder con el real
- [ ] Reemplazar link de WhatsApp con el numero real
- [ ] Agregar link real de Instagram
- [ ] Agregar fotos antes/despues reales (si las tiene)

## Paso 6: Costos totales

| Concepto | Costo | Frecuencia |
|----------|-------|-----------|
| Dominio .com | ~$10-15 | Anual |
| Hosting (Netlify) | $0 | Gratis |
| SSL (HTTPS) | $0 | Incluido |
| Formularios | $0 | Netlify Forms gratis |
| Email profesional (opcional) | ~$6/mes | Google Workspace |
| **Total minimo** | **~$12/ano** | |

## Resumen: Que hacer ahora

1. Comprar dominio en Namecheap (~$12)
2. Crear cuenta en Netlify (gratis)
3. Conectar repo de GitHub a Netlify
4. Conectar dominio a Netlify
5. Agregar `netlify` al form para que funcione
6. Comprimir imagenes
7. Reemplazar datos placeholder con datos reales
8. Ir live
