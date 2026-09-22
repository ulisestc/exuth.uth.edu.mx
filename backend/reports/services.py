import os
from io import BytesIO
from django.http import HttpResponse
from django.utils import timezone
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def exportar_excel(nombre_archivo, titulo_hoja, columnas, filas):
    """
    Genera un archivo Excel (.xlsx) estilizado institucionalmente con openpyxl.
    - columnas: lista de tuplas o strings con los encabezados
    - filas: lista de listas/tuplas con los datos de cada registro
    """
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = titulo_hoja[:30]

    # Estilos UTH (Verde Institucional #006633)
    header_fill = PatternFill(start_color="1B5E20", end_color="1B5E20", fill_type="solid")
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    header_alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

    title_font = Font(name="Calibri", size=14, bold=True, color="1B5E20")
    subtitle_font = Font(name="Calibri", size=10, italic=True, color="555555")

    thin_border = Border(
        left=Side(style="thin", color="DDDDDD"),
        right=Side(style="thin", color="DDDDDD"),
        top=Side(style="thin", color="DDDDDD"),
        bottom=Side(style="thin", color="DDDDDD")
    )

    # Título institucional
    ws.append(["UNIVERSIDAD TECNOLÓGICA DE HUEJOTZINGO"])
    ws.append([f"Bolsa de Trabajo Institucional - {titulo_hoja}"])
    ws.append([f"Fecha de emisión: {timezone.now().strftime('%d/%m/%Y %H:%M')}"])
    ws.append([])  # Fila vacía

    ws.cell(row=1, column=1).font = title_font
    ws.cell(row=2, column=1).font = title_font
    ws.cell(row=3, column=1).font = subtitle_font

    # Encabezados de tabla (Fila 5)
    headers = [col[0] if isinstance(col, (list, tuple)) else str(col) for col in columnas]
    ws.append(headers)
    header_row_idx = 5

    for col_idx in range(1, len(headers) + 1):
        cell = ws.cell(row=header_row_idx, column=col_idx)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = header_alignment

    # Filas de datos
    zebra_fill = PatternFill(start_color="F9FBF9", end_color="F9FBF9", fill_type="solid")
    row_font = Font(name="Calibri", size=10)

    for r_idx, fila in enumerate(filas, start=6):
        fila_datos = [str(val) if val is not None else "-" for val in fila]
        ws.append(fila_datos)
        for col_idx in range(1, len(fila_datos) + 1):
            cell = ws.cell(row=r_idx, column=col_idx)
            cell.font = row_font
            cell.border = thin_border
            if r_idx % 2 == 0:
                cell.fill = zebra_fill

    # Autoajuste de ancho de columnas
    for col in ws.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = openpyxl.utils.get_column_letter(col[0].column)
        ws.column_dimensions[col_letter].width = min(max(max_len + 3, 12), 45)

    output = BytesIO()
    wb.save(output)
    output.seek(0)

    response = HttpResponse(
        output.getvalue(),
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    response['Content-Disposition'] = f'attachment; filename="{nombre_archivo}.xlsx"'
    return response


def exportar_pdf(nombre_archivo, titulo_documento, columnas, filas, es_horizontal=True):
    """
    Genera un archivo PDF tabular institucional usando reportlab.
    """
    buffer = BytesIO()
    tamanio_pagina = landscape(letter) if es_horizontal else letter
    doc = SimpleDocTemplate(
        buffer,
        pagesize=tamanio_pagina,
        rightMargin=30,
        leftMargin=30,
        topMargin=30,
        bottomMargin=30
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=16,
        textColor=colors.HexColor('#1B5E20'),
        alignment=1
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#444444'),
        alignment=1
    )
    cell_style = ParagraphStyle(
        'Cell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#222222')
    )
    header_cell_style = ParagraphStyle(
        'HeaderCell',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white,
        alignment=1
    )

    elementos = []

    # Encabezado institucional
    elementos.append(Paragraph("UNIVERSIDAD TECNOLÓGICA DE HUEJOTZINGO", title_style))
    elementos.append(Paragraph(f"Bolsa de Trabajo Institucional - {titulo_documento}", subtitle_style))
    elementos.append(Paragraph(f"Reporte emitido el {timezone.now().strftime('%d/%m/%Y a las %H:%M')}", subtitle_style))
    elementos.append(Spacer(1, 15))

    # Construcción de la tabla
    headers = [Paragraph(str(col[0] if isinstance(col, (list, tuple)) else col), header_cell_style) for col in columnas]
    data_table = [headers]

    for fila in filas:
        fila_elementos = [Paragraph(str(val if val is not None else '-'), cell_style) for val in fila]
        data_table.append(fila_elementos)

    tabla = Table(data_table, repeatRows=1)
    tabla.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1B5E20')),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CCCCCC')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FBF8')]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))

    elementos.append(tabla)
    doc.build(elementos)
    buffer.seek(0)

    response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="{nombre_archivo}.pdf"'
    return response
