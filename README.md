# forbin-skills

Skills de Claude para el equipo de **Forbin SAS** — desarrollo de software basado en IA.

## Skills disponibles

### `propuesta-comercial`

Genera propuestas comerciales en PDF con diseño profesional tipo revista. Produce un PDF A4 listo para enviar al cliente, con portada de marca, secciones estructuradas, tabla de precios y CTA.

**Activa cuando digas cosas como:**
- "hazme una propuesta para X"
- "necesito presentarle algo a un cliente"
- "prepara una cotización para..."

**Incluye:**
- Portada con degradado corporativo
- 9 secciones: datos del cliente, resumen ejecutivo, problema, solución, beneficios, inversión, diferenciadores, términos y CTA
- Paleta de colores editable via CSS variables
- Conversión HTML → PDF con `wkhtmltopdf`

---

## Instalación

### Claude Code (terminal)

```bash
# Clonar el repo
git clone https://github.com/jhonosorno-cmd/forbin-skills.git

# Copiar la skill a la carpeta de skills de Claude
cp -r forbin-skills/propuesta-comercial ~/.claude/skills/
```

### Windows

```cmd
:: Clonar el repo
git clone https://github.com/jhonosorno-cmd/forbin-skills.git

:: Copiar la carpeta propuesta-comercial a:
:: C:\Users\[usuario]\.claude\skills\
```

---

## Estructura del repositorio

```
forbin-skills/
├── README.md
└── propuesta-comercial/
    ├── SKILL.md              ← instrucciones para Claude
    └── assets/
        ├── template.html     ← plantilla HTML del documento
        └── generate-proposal.js
```

---

## Contacto

**Forbin SAS** · hola@forbin.co · forbin.co
