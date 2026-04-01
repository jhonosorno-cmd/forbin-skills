const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageBreak, LevelFormat, SimpleField
} = require('docx');
const fs = require('fs');

// ─── BRAND PALETTE ────────────────────────────────────────────────────────────
const C = {
  primary:    '0A84FF',   // electric blue  — H1, portada highlight
  secondary:  '00C896',   // cyan-green     — H2
  accent:     '6C5CE7',   // violet         — H3, badges
  dark:       '0D1B2A',   // near-black     — portada bg
  darkMid:    '1A2A3D',   // dark navy      — portada text area
  lightBg:    'F0F4FF',   // very light blue— table header bg
  mid:        'C8D6F5',   // light periwinkle— divider / borders
  textMain:   '1A1A2E',   // rich dark      — body text
  textMuted:  '64748B',   // slate          — captions, footer
  white:      'FFFFFF',
};

// ─── PROPOSAL DATA (parametric — skill will inject these) ────────────────────
const DATA = {
  empresa:        'Forbin SAS',
  clienteNombre:  'MASER Colombia',
  clienteRazon:   'Ecosistema Digital MASER',
  fecha:          '30 de marzo de 2026',
  version:        '1.0',
  resumenEjecutivo: `MASER Colombia, distribuidora líder de equipos geotécnicos con más de 35 años de experiencia, requiere un ecosistema digital integrado que unifique sus operaciones de ventas, gestión interna y atención al cliente. Forbin SAS propone una solución en tres fases que transforma sus procesos manuales en un ciclo de venta automatizado, reduciendo tiempos de respuesta y eliminando la intervención humana en transacciones recurrentes.`,
  problema: `MASER opera con procesos de cotización, pedidos y seguimiento de clientes dispersos en hojas de cálculo y correos electrónicos. Esto genera demoras en la atención B2B, precios inconsistentes por cliente y ausencia de visibilidad en tiempo real para la gerencia. La falta de un canal de ventas online limita el crecimiento fuera del horario laboral.`,
  solucion: `Una plataforma web modular compuesta por un panel administrativo (admin.maser.com.co), un canal de ventas online (maser.com.co) y un portal del cliente (cuenta.maser.com.co), sobre infraestructura Supabase + Vercel + n8n, con automatización de notificaciones vía Gmail API y WhatsApp (Twilio).`,
  porQueNosotros: [
    'Experiencia comprobada en arquitecturas Supabase + Next.js para empresas B2B colombianas.',
    'Dominio de integraciones de pagos locales: MercadoPago y Wompi.',
    'Metodología de entrega por hitos: cada fase es funcional e independiente.',
    'Soporte post-entrega con garantía de 2 meses por fase y licencia mensual flexible.',
    'El código y los datos son siempre propiedad de MASER.',
  ],
  fases: [
    {
      nombre: 'Fase 1 — Fundación Operativa',
      objetivo: 'Panel administrativo en producción con base de datos real y CRUDs completos.',
      entregables: ['Supabase configurado', 'admin.maser.com.co', 'CRUDs completos', 'Módulo Purchase Orders', 'Dashboards TV', 'Notificaciones email'],
      valor: '$6.000.000 – $10.000.000 COP',
      tiempo: '4–6 semanas',
    },
    {
      nombre: 'Fase 2 — Canal de Ventas Online',
      objetivo: 'maser.com.co como canal de ventas con pasarela de pagos dual.',
      entregables: ['Catálogo en BD', 'Carrito y checkout', 'MercadoPago + Wompi', 'Órdenes sincronizadas', 'n8n notificaciones'],
      valor: '$8.000.000 – $14.000.000 COP',
      tiempo: '6–8 semanas',
    },
    {
      nombre: 'Fase 3 — Portal del Cliente',
      objetivo: 'Automatización total del ciclo de venta y portal propio para el cliente.',
      entregables: ['Portal cuenta.maser.com.co', 'WhatsApp con número de guía', 'Motor de precios', 'n8n flujo completo', 'Base cotización automática'],
      valor: '$10.000.000 – $18.000.000 COP',
      tiempo: '8–10 semanas',
    },
  ],
  precios: [
    { fase: 'Fase 1 — Fundación Operativa',    valor: '$6M – $10M COP',  anticipo: '$3M – $5M COP', entrega: '$3M – $5M COP' },
    { fase: 'Fase 2 — Canal de Ventas Online',  valor: '$8M – $14M COP', anticipo: '$4M – $7M COP', entrega: '$4M – $7M COP' },
    { fase: 'Fase 3 — Portal del Cliente',      valor: '$10M – $18M COP',anticipo: '$5M – $9M COP', entrega: '$5M – $9M COP' },
    { fase: 'TOTAL DEL PROYECTO',               valor: '$24M – $42M COP',anticipo: '',               entrega: '' },
  ],
  terminos: [
    'El código fuente es propiedad de MASER al completar el pago de cada fase.',
    'Los cambios de alcance durante el desarrollo se cotizarán mediante adendum.',
    'Cada fase incluye 2 meses de garantía de puesta en marcha sin costo adicional.',
    'La licencia mensual post-proyecto oscila entre $600.000 y $1.200.000 COP/mes.',
    'La cancelación de licencia requiere 30 días de preaviso; datos y código permanecen bajo control de MASER.',
  ],
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const border1 = { style: BorderStyle.SINGLE, size: 1, color: C.mid };
const cellBorders = { top: border1, bottom: border1, left: border1, right: border1 };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.primary, space: 4 } },
    children: [new TextRun({ text, font: 'Inter', size: 34, bold: true, color: C.primary })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 80 },
    children: [new TextRun({ text, font: 'Inter', size: 26, bold: true, color: C.secondary })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 60 },
    children: [new TextRun({ text, font: 'Inter', size: 22, bold: true, color: C.accent })],
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 80 },
    children: [new TextRun({ text, font: 'Inter', size: 22, color: C.textMain, ...opts })],
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, font: 'Inter', size: 22, color: C.textMain })],
  });
}

function spacer(lines = 1) {
  return new Paragraph({ spacing: { before: 0, after: 200 * lines }, children: [] });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function sectionBadge(label) {
  return new Paragraph({
    spacing: { before: 0, after: 80 },
    children: [
      new TextRun({ text: `◆  ${label}`, font: 'Inter', size: 18, bold: true, color: C.white,
        highlight: undefined }),
    ],
    shading: { fill: C.accent, type: ShadingType.CLEAR },
  });
}

// ─── COVER PAGE ───────────────────────────────────────────────────────────────
function coverPage() {
  return [
    // Dark header bar
    new Paragraph({
      spacing: { before: 0, after: 0 },
      shading: { fill: C.dark, type: ShadingType.CLEAR },
      children: [new TextRun({ text: '  ', size: 4, font: 'Inter' })],
    }),
    new Paragraph({
      spacing: { before: 600, after: 40 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'PROPUESTA COMERCIAL', font: 'Inter', size: 72, bold: true, color: C.primary })],
    }),
    new Paragraph({
      spacing: { before: 0, after: 200 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: DATA.clienteRazon, font: 'Inter', size: 40, color: C.secondary, bold: false })],
    }),
    new Paragraph({
      spacing: { before: 0, after: 0 },
      alignment: AlignmentType.CENTER,
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.primary, space: 12 } },
      children: [new TextRun({ text: ' ', size: 2 })],
    }),
    spacer(2),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 60 },
      children: [new TextRun({ text: DATA.empresa, font: 'Inter', size: 28, bold: true, color: C.textMain })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 60 },
      children: [new TextRun({ text: `Cliente: ${DATA.clienteNombre}`, font: 'Inter', size: 24, color: C.textMuted })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 60 },
      children: [new TextRun({ text: `Fecha: ${DATA.fecha}  ·  Versión ${DATA.version}`, font: 'Inter', size: 22, color: C.textMuted })],
    }),
    spacer(2),
    pageBreak(),
  ];
}

// ─── PRICE TABLE ──────────────────────────────────────────────────────────────
function priceTable() {
  const colW = [4000, 2000, 1800, 1800]; // DXA, sum = 9600 ≈ full width
  const hdrShading = { fill: C.primary, type: ShadingType.CLEAR };
  const altShading  = { fill: C.lightBg, type: ShadingType.CLEAR };
  const totShading  = { fill: C.dark, type: ShadingType.CLEAR };

  function hdrCell(text, w) {
    return new TableCell({
      width: { size: w, type: WidthType.DXA },
      borders: cellBorders,
      shading: hdrShading,
      margins: { top: 100, bottom: 100, left: 140, right: 140 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text, font: 'Inter', size: 20, bold: true, color: C.white })],
      })],
    });
  }

  function dataCell(text, w, isTotal = false, isAlt = false) {
    return new TableCell({
      width: { size: w, type: WidthType.DXA },
      borders: cellBorders,
      shading: isTotal ? totShading : (isAlt ? altShading : undefined),
      margins: { top: 80, bottom: 80, left: 140, right: 140 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text, font: 'Inter', size: 20, bold: isTotal, color: isTotal ? C.white : C.textMain })],
      })],
    });
  }

  const headers = new TableRow({
    tableHeader: true,
    children: [
      hdrCell('Fase', colW[0]),
      hdrCell('Valor estimado', colW[1]),
      hdrCell('Anticipo (50%)', colW[2]),
      hdrCell('Entrega (50%)', colW[3]),
    ],
  });

  const rows = DATA.precios.map((r, i) => {
    const isTotal = r.fase.startsWith('TOTAL');
    const isAlt   = i % 2 === 1 && !isTotal;
    return new TableRow({
      children: [
        dataCell(r.fase,     colW[0], isTotal, isAlt),
        dataCell(r.valor,    colW[1], isTotal, isAlt),
        dataCell(r.anticipo, colW[2], isTotal, isAlt),
        dataCell(r.entrega,  colW[3], isTotal, isAlt),
      ],
    });
  });

  return new Table({
    width: { size: 9600, type: WidthType.DXA },
    columnWidths: colW,
    rows: [headers, ...rows],
  });
}

// ─── PHASE CARDS TABLE ────────────────────────────────────────────────────────
function phaseCard(fase) {
  const colW = [2200, 7200];
  const leftShading  = { fill: C.primary, type: ShadingType.CLEAR };
  const rightShading = { fill: C.lightBg, type: ShadingType.CLEAR };

  return new Table({
    width: { size: 9400, type: WidthType.DXA },
    columnWidths: colW,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: colW[0], type: WidthType.DXA },
            shading: leftShading,
            borders: { top: border1, bottom: border1, left: border1, right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' } },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `⏱ ${fase.tiempo}`, font: 'Inter', size: 18, bold: true, color: C.white })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: fase.valor, font: 'Inter', size: 18, bold: true, color: C.white })] }),
            ],
          }),
          new TableCell({
            width: { size: colW[1], type: WidthType.DXA },
            shading: rightShading,
            borders: { top: border1, bottom: border1, right: border1, left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' } },
            margins: { top: 100, bottom: 100, left: 180, right: 180 },
            children: [
              new Paragraph({ children: [new TextRun({ text: fase.objetivo, font: 'Inter', size: 20, color: C.textMain })] }),
              new Paragraph({ children: [new TextRun({ text: 'Entregables: ' + fase.entregables.join(' · '), font: 'Inter', size: 18, color: C.textMuted })] }),
            ],
          }),
        ],
      }),
    ],
  });
}

// ─── MAIN DOCUMENT ────────────────────────────────────────────────────────────
const children = [
  ...coverPage(),

  // 1. RESUMEN EJECUTIVO
  h1('1. Resumen Ejecutivo'),
  body(DATA.resumenEjecutivo),
  spacer(),

  // 2. PROBLEMA / NECESIDAD DEL CLIENTE
  pageBreak(),
  h1('2. Problema / Necesidad del Cliente'),
  body(DATA.problema),
  spacer(),

  // 3. SOLUCIÓN PROPUESTA
  h1('3. Solución Propuesta'),
  body(DATA.solucion),
  spacer(),
  h2('Fases del Proyecto'),
  ...DATA.fases.flatMap(f => [h3(f.nombre), phaseCard(f), spacer()]),

  // 4. INVERSIÓN
  pageBreak(),
  h1('4. Inversión'),
  h2('Estructura de hitos'),
  body('Cada fase se factura al 50% de anticipo al inicio y 50% al desplegar en producción.'),
  spacer(),
  priceTable(),
  spacer(),

  // 5. POR QUÉ NOSOTROS
  pageBreak(),
  h1('5. ¿Por Qué Nosotros?'),
  ...DATA.porQueNosotros.map(bullet),
  spacer(),

  // 6. TÉRMINOS Y CONDICIONES
  h1('6. Términos y Condiciones'),
  ...DATA.terminos.map(bullet),
  spacer(),

  // Footer sign-off
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 0 },
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.mid, space: 8 } },
    children: [new TextRun({ text: `${DATA.empresa}  ·  Desarrollo de software a medida con IA`, font: 'Inter', size: 18, color: C.textMuted, italics: true })],
  }),
];

// ─── DOCUMENT ASSEMBLY ────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: '▸',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 560, hanging: 360 } } },
        }],
      },
    ],
  },
  styles: {
    default: {
      document: { run: { font: 'Inter', size: 22, color: C.textMain } },
    },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 34, bold: true, font: 'Inter', color: C.primary },
        paragraph: { spacing: { before: 360, after: 120 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, font: 'Inter', color: C.secondary },
        paragraph: { spacing: { before: 280, after: 80 }, outlineLevel: 1 },
      },
      {
        id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 22, bold: true, font: 'Inter', color: C.accent },
        paragraph: { spacing: { before: 200, after: 60 }, outlineLevel: 2 },
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
      },
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.primary, space: 4 } },
            children: [
              new TextRun({ text: `${DATA.empresa}  ·  ${DATA.clienteNombre}  ·  Propuesta Comercial`, font: 'Inter', size: 16, color: C.textMuted }),
            ],
          }),
        ],
      }),
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.mid, space: 4 } },
            children: [
              new TextRun({ text: 'Confidencial  ·  ', font: 'Inter', size: 16, color: C.textMuted }),
              new TextRun({ text: DATA.fecha, font: 'Inter', size: 16, color: C.textMuted }),
              new TextRun({ text: '  ·  Pág. ', font: 'Inter', size: 16, color: C.textMuted }),
              new SimpleField('PAGE'),
            ],
          }),
        ],
      }),
    },
    children,
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/home/claude/propuesta-skill/propuesta-demo.docx', buf);
  console.log('✅  propuesta-demo.docx generada');
});
