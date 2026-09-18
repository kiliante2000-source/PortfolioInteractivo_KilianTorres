# Portfolio Interactivo — Kilian Torres

Portfolio digital de **Kilian Torres**, diseñador gráfico y desarrollador Full Stack (Santa Cruz de Tenerife, 2026).

Es un sitio estático (HTML, CSS y JavaScript). La primera vista es el currículum en formato A4. Desde `(portfolio)` se entra a un escritorio interactivo con carpetas, archivos, ventanas y tres webs embebidas: Magua Canaria, PLIEGO y Kojurebi.

## Arrancar en local

Hace falta un servidor HTTP. Abrir los archivos con `file://` no sirve: el vídeo, las fuentes y varias rutas internas fallan.

Desde la raíz del proyecto:

```bash
python3 -m http.server 4174
```

Luego, en el navegador:

- CV: [http://127.0.0.1:4174/index.html](http://127.0.0.1:4174/index.html)
- Escritorio: [http://127.0.0.1:4174/portfolio.html](http://127.0.0.1:4174/portfolio.html)

Cualquier otro puerto vale. Ejemplos:

```bash
npx --yes serve -l 4174
```

```bash
php -S 127.0.0.1:4174
```

## Qué hay dentro

| Ruta | Qué es |
| --- | --- |
| `index.html` | CV A4. Pellizco, rueda o doble clic para ampliar el texto. `(descargar cv)` baja el PDF. |
| `portfolio.html` | Escritorio: iconos, dock, papelera, Finder y ventanas. |
| `css/` `js/` | Estilos y lógica del CV y del escritorio. |
| `assets/` | Foto, firma, CV en PDF, iconos de proyectos y `Publi.mp4`. |
| `works/` | Sitios de Magua, PLIEGO y Kojurebi, con su propio “volver al portfolio”. |
| `fonts/` | DejaVu Serif y DejaVu Sans Mono (ver `fonts/LICENSE`). |

## Uso breve

- En el CV, `(portfolio)` abre el escritorio.
- En el escritorio, clic abre; arrastrar mueve iconos y ventanas; la papelera guarda lo que sueltas.
- `CV.pdf` vuelve al currículum. El correo del pie abre una ventana para escribir a kiliante2000@gmail.com.

## Publicar

Se puede servir la carpeta tal cual (Netlify, Vercel, GitHub Pages, un hosting estático). En GitHub Pages: Settings → Pages → Deploy from a branch → `main` / raíz (`/`).

## Contacto

Kilian Torres  
kiliante2000@gmail.com  
+34 617 39 24 21  
[Instagram @kiliantxrres](https://www.instagram.com/kiliantxrres/)
