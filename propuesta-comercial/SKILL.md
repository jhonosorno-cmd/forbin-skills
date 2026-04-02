---
name: propuesta-comercial
description: >
  Genera propuestas comerciales profesionales en formato PDF con diseño visual tipo revista (portada con degradado de marca, secciones con colores, tablas de precios, phase cards, CTA). Usar esta skill siempre que alguien pida crear, redactar o generar una propuesta, cotización formal o propuesta de proyecto para un cliente — incluso si solo dicen "hazme una propuesta para X", "necesito presentarle algo a un cliente", o "prepara una propuesta". También usar cuando pidan adaptar una propuesta existente a un nuevo cliente o cambiar colores/marca. La skill produce un PDF descargable listo para enviar, con paleta de colores totalmente personalizable.
---

# Skill: Propuesta Comercial (PDF con diseño visual)

Genera propuestas comerciales en PDF con diseño profesional tipo revista, usando HTML convertido a PDF con **WeasyPrint**.

> ⚠️ **NUNCA usar wkhtmltopdf.** No respeta `height: 297mm` en contenedores flex, no soporta CSS grid correctamente, y produce páginas con gran espacio blanco. WeasyPrint es el único motor correcto para este template.

## Motor PDF: WeasyPrint

```bash
pip install weasyprint --break-system-packages -q
```

```python
import weasyprint, warnings
warnings.filterwarnings('ignore')
weasyprint.HTML(filename='/home/claude/propuesta-[cliente].html').write_pdf(
    '/mnt/user-data/outputs/propuesta-[cliente]-v[version].pdf'
)
```

WeasyPrint respeta correctamente:
- `@page { size: A4; margin: 0; }` → tamaño exacto 210×297mm
- `height: 297mm` en contenedores flex → portada llena la página completa
- `display: flex; flex-direction: column; justify-content: space-between` → distribuye header/body/footer verticalmente
- `display: grid; grid-template-columns: 1fr 1fr` → grids de 2 columnas
- `position: absolute; bottom: 0` → footers fijos al fondo de cada página
- `page-break-after: always` → saltos de página entre secciones
- `linear-gradient()` → gradientes en portada y CTA

## Estructura del documento (4 páginas)

| Página | Secciones |
|--------|-----------|
| **Portada** | Degradado de marca, logo/placeholder, título, cliente, pie de empresa |
| **Pág. 1** | Info general · Resumen ejecutivo · Problema/Necesidad (tabla desafíos) |
| **Pág. 2** | Solución propuesta (phase cards) · Beneficios (grid 2×2) |
| **Pág. 3** | Inversión (tabla precios) · ¿Por qué nosotros? · Términos · CTA |

## Paleta de colores (editable)

Modificar solo el bloque `:root` al inicio del HTML:

```css
:root {
  --c-primary:   #1B4F8A;   /* color principal (botones, tags, bordes) */
  --c-secondary: #1A6B9A;   /* color secundario (diff cards) */
  --c-mid:       #1A7A7A;   /* color medio (term borders) */
  --c-dark:      #1E2A3A;   /* headers, títulos oscuros */
  --c-deep:      #0A1628;   /* footer, CTA fondo */
  --c-light:     #EFF4FB;   /* fondos de cards */
}
```

También actualizar los colores hardcodeados del gradiente de portada:
```css
.cover {
  background: linear-gradient(135deg,
    #1B4F8A 0%, #1A6B9A 28%, #1A7A7A 52%, #1E2A3A 76%, #0A1628 100%);
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

### Paso 1 — Copiar el template y rellenar datos

```bash
cp /mnt/skills/user/propuesta-comercial/assets/template.html /home/claude/propuesta-[cliente].html
```

Editar el archivo reemplazando colores `:root`, gradiente portada, y todos los textos de contenido. Hacerlo con Python string replace es lo más limpio y seguro.

### Paso 2 — Generar PDF con WeasyPrint

```python
import weasyprint, warnings
warnings.filterwarnings('ignore')
weasyprint.HTML(filename='/home/claude/propuesta-[cliente].html').write_pdf(
    '/mnt/user-data/outputs/propuesta-[cliente]-v[version].pdf'
)
```

### Paso 3 — Verificar páginas y dimensiones

```python
from pypdf import PdfReader
r = PdfReader('/mnt/user-data/outputs/propuesta-[cliente]-v[version].pdf')
print(f'Páginas: {len(r.pages)}')  # Esperado: 4
for i, p in enumerate(r.pages):
    w, h = float(p.mediabox.width), float(p.mediabox.height)
    print(f'  P{i+1}: {w/72*25.4:.1f} x {h/72*25.4:.1f} mm')  # Esperado: 210.0 x 297.0
```

Si hay más de 4 páginas: reducir `padding` en `.page-body` o `.challenge-table td`.
Si hay menos de 4: revisar que todos los placeholders fueron reemplazados.

### Paso 4 — Entregar

Usar `present_files` con el path del PDF generado.

## Nombre del archivo

Formato: `propuesta-[ClienteSinEspacios]-v[version].pdf`

## CSS crítico — reglas que DEBEN mantenerse para WeasyPrint

```css
/* PORTADA: flex column con height exacto — WeasyPrint lo respeta */
.cover {
  width: 210mm;
  height: 297mm;
  display: flex;
  flex-direction: column;
  justify-content: space-between;  /* top / body / bottom distribuidos */
  page-break-after: always;
  overflow: hidden;
}

/* PÁGINAS INTERNAS: position:relative + footer absolute al fondo */
.page {
  width: 210mm;
  height: 297mm;
  position: relative;
  page-break-after: always;
  overflow: hidden;
}
.page-footer {
  position: absolute;
  bottom: 0; left: 0; right: 0;
}

/* GRIDS: usar CSS grid, NO flex-wrap */
/* flex-wrap en WeasyPrint no produce layouts de 2 columnas confiablemente */
.benefits-grid    { display: grid; grid-template-columns: 1fr 1fr; }
.differentiators  { display: grid; grid-template-columns: 1fr 1fr; }
.terms-grid       { display: grid; grid-template-columns: 1fr 1fr; }

/* PAGE MODEL — siempre al inicio del CSS */
@page { size: A4; margin: 0; }
```

## Ajuste de espaciado para llenar páginas

El template base llena ~85–90% de cada página. Para ajustar:

**Más espacio (página con huecos):**
- Aumentar `padding` en `.page-body`, `.challenge-table td`, `.phase-left`, `.phase-right`, `.benefit-item`
- Aumentar `margin` en `.sep`, `.two-col`, `.phase-card`
- Aumentar `line-height` de párrafos y celdas

**Menos espacio (página desborda):**
- Reducir `padding-bottom` de `.page-body` primero
- Reducir padding de tablas y phase cards
- Reducir `font-size` de párrafos de `9pt` a `8.5pt`

## Reglas de contenido

- Tono directo y orientado a resultados. Sin frases genéricas.
- Resumen ejecutivo: ¿quién es el cliente?, ¿qué necesita?, ¿qué entregamos?
- Desafíos en la tabla: concretos y reconocibles por el cliente.
- Diferenciadores: verificables, no aspiracionales.
- Phase cards: entregables reales, no generalidades.

## Logo

Reemplazar en la portada:
```html
<!-- Sin logo (placeholder texto) -->
<div class="cover-logo-box">Forbin SAS</div>
<!-- Con logo PNG -->
<img src="logo.png" style="height:48px;width:auto;" alt="Logo">
```

## Personalización avanzada

- **Más fases**: agregar bloques `.phase-card` en página 2
- **Más beneficios**: cambiar grid a `1fr 1fr 1fr` para 6 items
- **Más términos**: la grid ya es 2 columnas; agregar más `.term-item`
- **Portada con foto**: `background-image: url(foto.jpg); background-size: cover;`
- **Inglés**: cambiar textos manteniendo estructura HTML
- **Colores corporativos**: editar bloque `:root` + valores hardcodeados del gradiente `.cover`
