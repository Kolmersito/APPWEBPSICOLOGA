import jsPDF from 'jspdf'

export function exportarInformePDF(informe: any, paciente: any) {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    const margen = 15
    const ancho = 210 - margen * 2
    const pageHeight = doc.internal.pageSize.getHeight()
    let y = margen

    // Función para agregar nueva página si es necesario
    const verificarPagina = () => {
      if (y > pageHeight - 20) {
        doc.addPage()
        y = margen
        
        // Header ligero en páginas adicionales
        doc.setFillColor(139, 45, 61)
        doc.rect(0, 0, 210, 10, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(informe.titulo || 'Informe', margen, 6)
        y = margen + 8
      }
      return y
    }

    // Header principal con color vino
    doc.setFillColor(139, 45, 61) // color vino (variable --vino)
    doc.rect(0, 0, 210, 32, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('INFORME CLÍNICO', margen, 12)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    const nombrePaciente = `${paciente?.nombre || ''} ${paciente?.apellido || ''}`
    doc.text(nombrePaciente, margen, 20)
    
    const fechaActual = new Date().toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    doc.text(fechaActual, 210 - margen, 20, { align: 'right' })
    
    // Tipo de informe
    const tipoMap: { [key: string]: string } = {
      'evolucion': 'Evolución Terapéutica',
      'inicial': 'Evaluación Inicial',
      'alta': 'Informe de Alta'
    }
    const tipoInforme = tipoMap[informe.contenido_json?.tipo] || 'Informe'
    doc.setFontSize(8)
    doc.text(`Tipo: ${tipoInforme} | Estado: ${informe.estado === 'finalizado' ? 'Finalizado' : 'Borrador'}`, margen, 28)

    y = 40

    // Bloque de información del paciente
    if (paciente) {
      doc.setFillColor(245, 245, 245)
      doc.rect(margen - 1, y - 4, ancho + 2, 14, 'F')
      
      doc.setTextColor(139, 45, 61)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('INFORMACIÓN DEL PACIENTE', margen, y)
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 80)
      
      let infoY = y + 6
      if (paciente.telefono) {
        doc.text(`Tel: ${paciente.telefono}`, margen, infoY)
        infoY += 4
      }
      if (paciente.email) {
        doc.text(`Email: ${paciente.email}`, margen, infoY)
      }
      
      y = infoY + 6
    }

    // Título del informe
    y = verificarPagina()
    doc.setTextColor(139, 45, 61)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    
    const lineasTitulo = doc.splitTextToSize(informe.titulo || 'Informe', ancho)
    lineasTitulo.forEach((linea: string) => {
      y = verificarPagina()
      doc.text(linea, margen, y)
      y += 5
    })

    y += 3

    // Línea divisoria
    doc.setDrawColor(139, 45, 61)
    doc.setLineWidth(0.3)
    y = verificarPagina()
    doc.line(margen, y, 210 - margen, y)
    y += 5

    // Contenido principal
    const texto = informe.contenido_json?.texto || ''
    // Limpiar HTML y markdown
    const textoLimpio = texto
      .replace(/<[^>]*>/g, '') // Remover HTML
      .replace(/#{1,6}\s/g, '') // Remover headers markdown
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/---/g, '')
      .replace(/`/g, '')
      .trim()

    doc.setTextColor(30, 30, 30)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    const lineas = doc.splitTextToSize(textoLimpio, ancho)
    const lineHeight = 5

    lineas.forEach((linea: string) => {
      y = verificarPagina()
      
      if (linea.trim() === '') {
        y += 2
      } else {
        doc.text(linea, margen, y)
        y += lineHeight
      }
    })

    // Footer en todas las páginas
    const totalPages = (doc as any).internal.pages.length - 1
    for (let i = 1; i <= totalPages; i++) {
      (doc as any).setPage(i)
      
      // Línea superior del footer
      doc.setDrawColor(139, 45, 61)
      doc.setLineWidth(0.2)
      doc.line(margen, pageHeight - 12, 210 - margen, pageHeight - 12)
      
      doc.setTextColor(150, 150, 150)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text('Documento confidencial — Generado por PsicoApp', margen, pageHeight - 8)
      doc.text(`Página ${i} de ${totalPages}`, 210 - margen, pageHeight - 8, { align: 'right' })
    }

    // Generar nombre de archivo
    const nombreArchivo = (informe.titulo || 'informe')
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')

    doc.save(`${nombreArchivo}.pdf`)
  } catch (error) {
    console.error('Error al generar PDF:', error)
    alert('Error al generar el PDF. Intenta de nuevo.')
  }
}