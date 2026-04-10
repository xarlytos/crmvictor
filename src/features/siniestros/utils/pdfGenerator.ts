import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { SiniestroGrupo, Siniestro } from '@/types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function generateSiniestroPDF(
  grupo: SiniestroGrupo,
  siniestros: Siniestro[]
) {
  try {
    // Crear documento en landscape (horizontal)
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // ===== CABECERA COMPACTA =====
    let y = 10;

    // Logo/Empresa
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('GESA MEDIACIÓN, S.L.', 8, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('C/ JOSE MANUEL PEDREÑO, N.º 1 - ED. MAISONNAVE - 3.º A  |  MURCIA - 968-938-893', 8, y + 4);

    // Fecha a la derecha
    doc.setFont('helvetica', 'bold');
    doc.text(`Fecha: ${format(new Date(), 'dd/MM/yyyy')}`, pageWidth - 45, y);

    // Línea separadora
    y += 8;
    doc.setDrawColor(150, 150, 150);
    doc.line(8, y, pageWidth - 8, y);

    // ===== DATOS DEL CLIENTE =====
    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(grupo.empresa.nombre.toUpperCase(), 8, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    y += 4.5;
    const direccionCompleta = [
      grupo.empresa.direccion,
      grupo.empresa.cp,
      grupo.empresa.ciudad
    ].filter(Boolean).join(' - ');
    if (direccionCompleta) {
      doc.text(direccionCompleta, 8, y);
    }

    // ===== TABLA DE SINIESTROS (15 columnas completas) =====
    y += 9;

    const tableData = siniestros.map((s, index) => [
      (index + 1).toString(),
      s.nombreTomador || '-',
      s.numeroPoliza || '-',
      s.compania || '-',
      s.matricula || '-',
      formatDate(s.fechaOcurrencia),
      s.tipoSiniestro || '-',
      formatDate(s.fechaApertura),
      s.numSiniestroCompania || '-',
      s.numSiniestroElevia || '-',
      s.estado === 'abierto' ? 'Abierto' : 'Cerrado',
      s.costeTotal ? s.costeTotal.toFixed(2) : '-',
      s.culpa === 'tomador' ? 'Tomador' : s.culpa === 'contrario' ? 'Contrario' : '-',
      s.observaciones || '-',
      formatDate(s.fechaCierre),
      s.valoracion ? s.valoracion.charAt(0).toUpperCase() + s.valoracion.slice(1) : '-',
    ]);

    // Ancho total disponible: 297mm (A4) - 12mm márgenes (6mm cada lado) = 285mm
    autoTable(doc, {
      startY: y,
      head: [
        ['Nº', 'Tomador', 'Póliza', 'Comp', 'Matrícula', 'F.Ocurr.', 'Tipo', 'F.Apert.', 'NºSini.Comp', 'NºSini.Elevia', 'Estado', 'Coste €', 'Culpa', 'Observaciones', 'F.Cierre', 'Valor.'],
      ],
      body: tableData,
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        overflow: 'linebreak',
        font: 'helvetica',
        lineWidth: 0.1,
        valign: 'middle',
      },
      headStyles: {
        fillColor: [60, 60, 60],
        textColor: 255,
        fontSize: 7.5,
        fontStyle: 'bold',
        cellPadding: 2.5,
        valign: 'middle',
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248],
      },
      columnStyles: {
        0: { cellWidth: 6, halign: 'center' },      // Nº
        1: { cellWidth: 26 },                       // Tomador
        2: { cellWidth: 20 },                       // Póliza
        3: { cellWidth: 18 },                       // Cía
        4: { cellWidth: 18 },                       // Matrícula
        5: { cellWidth: 16, halign: 'center' },     // F.Ocurr.
        6: { cellWidth: 18 },                       // Tipo
        7: { cellWidth: 16, halign: 'center' },     // F.Apert.
        8: { cellWidth: 22 },                       // NºSini.Cía
        9: { cellWidth: 22 },                       // NºSini.Elevia
        10: { cellWidth: 14, halign: 'center' },    // Estado
        11: { cellWidth: 16, halign: 'right' },     // Coste
        12: { cellWidth: 14, halign: 'center' },    // Culpa
        13: { cellWidth: 35 },                      // Observaciones
        14: { cellWidth: 16, halign: 'center' },    // F.Cierre
        15: { cellWidth: 12, halign: 'center' },    // Valoración
      },
      margin: { top: 5, right: 6, bottom: 25, left: 6 },
      showHead: 'everyPage',
      pageBreak: 'auto',
      rowPageBreak: 'avoid',
      didDrawPage: (data) => {
        // Número de página en el pie
        const pageCount = doc.getNumberOfPages();
        const currentPage = data.pageNumber;
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(`Página ${currentPage} de ${pageCount}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
      },
    });

    // Obtener la posición final de la tabla
    const finalY = (doc as any).lastAutoTable?.finalY || 160;

    // ===== TEXTO DE CIERRE =====
    let closeY = finalY + 10;

    if (closeY + 20 > pageHeight - 10) {
      doc.addPage('landscape');
      closeY = 15;
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Sin otro particular, quedamos a su disposición para cualquier consulta adicional.', 8, closeY);

    closeY += 12;
    doc.setFont('helvetica', 'bold');
    doc.text('GESA MEDIACIÓN, S.L.', 8, closeY);

    // Guardar PDF
    const fileName = `Siniestros_${grupo.empresa.nombre.replace(/\s+/g, '_')}_${format(
      new Date(),
      'yyyyMMdd'
    )}.pdf`;
    doc.save(fileName);

    return true;
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw error;
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  try {
    return format(parseISO(dateStr), 'dd/MM/yy', { locale: es });
  } catch {
    return '-';
  }
}
