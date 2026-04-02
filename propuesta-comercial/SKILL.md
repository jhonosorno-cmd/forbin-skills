---
name: propuesta-comercial
description: >
  Genera propuestas comerciales profesionales en formato PDF con diseño visual tipo revista (portada con degradado de marca, secciones con colores, tablas de precios, phase cards, CTA). Usar esta skill siempre que alguien pida crear, redactar o generar una propuesta, cotización formal o propuesta de proyecto para un cliente — incluso si solo dicen "hazme una propuesta para X", "necesito presentarle algo a un cliente", o "prepara una propuesta". También usar cuando pidan adaptar una propuesta existente a un nuevo cliente o cambiar colores/marca. La skill produce un PDF descargable listo para enviar, con paleta de colores totalmente personalizable.
---

# Skill: Propuesta Comercial (PDF con diseño visual)

Genera propuestas comerciales en PDF con diseño profesional tipo revista, basadas en HTML convertido a PDF con `wkhtmltopdf`.

## Estructura del documento (9 secciones)

| # | Sección | Descripción |
|---|---------|-------------|
| — | **Portada** | Degradado de marca, logo (o placeholder), nombre del cliente |
| 01 | **Datos del cliente** | Barra de info general en 3 columnas |
| 02 | **Resumen ejecutivo** | Síntesis y dos tarjetas de contexto |
| 03 | **Problema / necesidad** | Tabla de desafíos vs. propuesta de valor |
| 04 | **Solución propuesta** | Phase cards por entregable |
| 05 | **Beneficios** | Grid de 4 beneficios con iconos |
| 06 | **Inversión** | Tabla de precios + nota de estructura de pago |
| 07 | **¿Por qué nosotros?** | Grid de diferenciadores |
| 08 | **Términos y condiciones** | Grid de 6 términos clave |
| 09 | **Llamada a la acción** | Box oscuro con datos de contacto |

## Paleta de colores (editable)

En el template HTML (`assets/template.html`), modificar solo el bloque `:root`:

```css
:root {
  --c-primary:    #CC2649;   /* color principal */
  --c-secondary:  #992C4B;   /* color secundario */
  --c-mid:        #66324C;   /* color medio */
  --c-dark:       #33384E;   /* navy oscuro */
  --c-deep:       #003E4F;   /* teal profundo */
  --c-light:      #fdf0f3;   /* fondo suave */
}
```

## Datos a recopilar

Si el usuario no provee algún campo, preguntar antes de continuar:
empresa, taglineEmpresa, contactoEmail, contactoTel, contactoWeb,
clienteNombre, proyectoTitulo, proyectoSubtitulo, clienteSector,
fecha, version, vigencia, resumenP1, resumenP2, objetivo, tecnologia,
desafios[], fases[], beneficios[], precios[], notaPago,
diferenciadores[], terminos[], ctaTitulo, ctaDescripcion.

## Cómo generar el PDF

### Paso 1 — Copiar y editar el template

```bash
cp assets/template.html /home/claude/propuesta-[cliente].html
```

Editar el archivo reemplazando los colores `:root` y todos los datos del cliente.

### Paso 2 — Convertir a PDF

```bash
wkhtmltopdf \
  --page-size A4 \
  --margin-top 0 --margin-bottom 0 \
  --margin-left 0 --margin-right 0 \
  --enable-local-file-access \
  --disable-smart-shrinking \
  --dpi 150 \
  /home/claude/propuesta-[cliente].html \
  /mnt/user-data/outputs/propuesta-[cliente]-v[version].pdf
```

> `--disable-smart-shrinking` evita que wkhtmltopdf reescale el contenido y genere páginas en blanco al final.

### Paso 3 — Verificar páginas

```python
from pypdf import PdfReader
r = PdfReader('propuesta.pdf')
print(f'Páginas: {len(r.pages)}')  # Esperado: 4
```

Si el PDF tiene más de 4 páginas, el contenido de la última sección desbordó. Reducir el `padding-bottom` de `.page-body` de `16px` a `8px` en el HTML generado y regenerar.

### Paso 4 — Entregar

Usar `present_files` con el path del PDF generado.

## Nombre del archivo

Formato: `propuesta-[ClienteSinEspacios]-v[version].pdf`

## Reglas de contenido

- Tono directo y orientado a resultados. Sin frases genéricas.
- Resumen ejecutivo: ¿quién es el cliente?, ¿qué necesita?, ¿qué entregamos?
- Desafíos en la tabla: concretos y reconocibles por el cliente.
- Diferenciadores: verificables, no aspiracionales.
- Phase cards: entregables reales, no generalidades.

## Logo

Reemplazar en la portada:
```html
<!-- Sin logo -->
<div class="cover-logo-box">TU LOGO</div>
<!-- Con logo PNG -->
<img src="logo.png" style="height:48px;width:auto;" alt="Logo">
```

## Personalización avanzada

- Más fases: agregar bloques `.phase-card`
- Más beneficios: cambiar grid a `1fr 1fr 1fr` para 6 items  
- Portada con foto: `background-image: url(foto.jpg); background-size: cover;`
- Inglés: cambiar textos manteniendo la estructura HTML
