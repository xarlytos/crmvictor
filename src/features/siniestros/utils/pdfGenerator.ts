import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { SiniestroGrupo, Siniestro } from '@/types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function generateSiniestroPDF(
  grupo: SiniestroGrupo,
  siniestros: Siniestro[]
) {
  // Crear documento en landscape (horizontal) para caber las 15 columnas
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Configuración de fuente
  doc.setFont('helvetica', 'normal');

  // ===== CABECERA =====
  let y = 15;

  // Logo/Empresa
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('GESA MEDIACIÓN, S.L.', 15, y);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  y += 5;
  doc.text('C/ JOSE MANUEL PEDREÑO, N.º 1 - EDIFICIO MAISONNAVE - 3.º A', 15, y);
  y += 4;
  doc.text('MURCIA - 968-938-893', 15, y);

  // Línea separadora
  y += 8;
  doc.setDrawColor(200, 200, 200);
  doc.line(15, y, pageWidth - 15, y);

  // ===== DATOS DEL CLIENTE =====
  y += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(grupo.empresa.nombre.toUpperCase(), 15, y);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  y += 5;
  if (grupo.empresa.direccion) {
    doc.text(grupo.empresa.direccion, 15, y);
    y += 4;
  }
  if (grupo.empresa.cp || grupo.empresa.ciudad) {
    const ciudadLine = [grupo.empresa.cp, grupo.empresa.ciudad].filter(Boolean).join(' ');
    if (ciudadLine) {
      doc.text(ciudadLine, 15, y);
      y += 4;
    }
  }

  // Fecha
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text(`Fecha: ${format(new Date(), 'dd/MM/yyyy')}`, 15, y);

  // ===== TEXTO INTRODUCTORIO =====
  y += 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const introText =
    'En respuesta a la solicitud de información sobre los siniestros declarados en su póliza, ' +
    'a continuación detallamos el histórico completo de siniestros registrados:';

  const splitIntro = doc.splitTextToSize(introText, pageWidth - 30);
  doc.text(splitIntro, 15, y);

  // ===== TABLA DE SINIESTROS =====
  y += 20;

  // Preparar datos para la tabla
  const tableData = siniestros.map((s, index) => [
    (index + 1).toString(),
    s.nombreTomador || '',
    s.numeroPoliza || '',
    s.compania || '',
    s.matricula || '',
    formatDate(s.fechaOcurrencia),
    s.tipoSiniestro || '',
    formatDate(s.fechaApertura),
    s.numSiniestroCompania || '',
    s.numSiniestroElevia || '',
    s.estado === 'abierto' ? 'Abierto' : 'Cerrado',
    s.costeTotal ? `€${s.costeTotal.toFixed(2)}` : '',
    s.culpa === 'tomador' ? 'Tomador' : s.culpa === 'contrario' ? 'Contrario' : '',
    s.observaciones || '',
    formatDate(s.fechaCierre),
    s.valoracion
      ? s.valoracion.charAt(0).toUpperCase() + s.valoracion.slice(1)
      : '',
  ]);

  // Generar tabla con autoTable
  (doc as any).autoTable({
    startY: y,
    head: [
      [
        '#',
        'Nombre tomador',
        'Nº póliza',
        'Compañía',
        'Matrícula',
        'Fecha ocurrencia',
        'Tipo',
        'Fecha apertura',
        'Nº siniestro comp.',
        'Nº siniestro Elevia',
        'Estado',
        'Coste total',
        'Culpa',
        'Observaciones',
        'Fecha cierre',
        'Valoración',
      ],
    ],
    body: tableData,
    styles: {
      fontSize: 7,
      cellPadding: 2,
      overflow: 'linebreak',
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [51, 51, 51],
      textColor: 255,
      fontSize: 7,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 8 }, // #
      1: { cellWidth: 25 }, // Nombre tomador
      2: { cellWidth: 22 }, // Nº póliza
      3: { cellWidth: 22 }, // Compañía
      4: { cellWidth: 18 }, // Matrícula
      5: { cellWidth: 20 }, // Fecha ocurrencia
      6: { cellWidth: 20 }, // Tipo
      7: { cellWidth: 20 }, // Fecha apertura
      8: { cellWidth: 25 }, // Nº siniestro compañía
      9: { cellWidth: 25 }, // Nº siniestro Elevia
      10: { cellWidth: 18 }, // Estado
      11: { cellWidth: 20 }, // Coste total
      12: { cellWidth: 18 }, // Culpa
      13: { cellWidth: 35 }, // Observaciones
      14: { cellWidth: 20 }, // Fecha cierre
      15: { cellWidth: 18 }, // Valoración
    },
    margin: { top: 10, right: 15, bottom: 40, left: 15 },
    didDrawPage: (data: any) => {
      // Pie de página en cada página
      const pageCount = doc.getNumberOfPages();
      const currentPage = data.pageNumber;

      if (currentPage === pageCount) {
        // Solo en la última página añadimos el cierre
        const finalY = data.cursor?.y || data.finalY || 150;

        if (finalY + 40 > pageHeight - 20) {
          // No cabe, añadir nueva página
          doc.addPage('landscape');
          addClosingText(doc, 40, pageWidth);
        } else {
          addClosingText(doc, finalY + 20, pageWidth);
        }
      }
    },
  });

  // Guardar PDF
  const fileName = `Siniestros_${grupo.empresa.nombre.replace(/\s+/g, '_')}_${format(
    new Date(),
    'yyyyMMdd'
  )}.pdf`;
  doc.save(fileName);
}

function addClosingText(doc: jsPDF, y: number, pageWidth: number) {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const closingText =
    'Sin otro particular, quedamos a su disposición para cualquier consulta adicional.';
  const splitClosing = doc.splitTextToSize(closingText, pageWidth - 30);
  doc.text(splitClosing, 15, y);

  y += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('GESA MEDIACIÓN, S.L.', 15, y);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: es });
  } catch {
    return '';
  }
}
