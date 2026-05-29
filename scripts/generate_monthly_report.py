#!/usr/bin/env python3
"""Generate MMODRM Monthly Report PDF using ReportLab."""

import json
import sys
import os
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib.units import inch, cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ─── Font Registration ──────────────────────────────────────────
pdfmetrics.registerFont(TTFont('DejaVuSerif', '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSerif-Bold', '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans-Bold', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuMono', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))
registerFontFamily('DejaVuSerif', normal='DejaVuSerif', bold='DejaVuSerif-Bold')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans-Bold')
registerFontFamily('DejaVuMono', normal='DejaVuMono', bold='DejaVuMono')

# ─── Color Palette ──────────────────────────────────────────────
ACCENT       = colors.HexColor('#1a7897')
TEXT_PRIMARY  = colors.HexColor('#1c1e1f')
TEXT_MUTED    = colors.HexColor('#727a7e')
BG_SURFACE   = colors.HexColor('#dbdfe2')
BG_PAGE      = colors.HexColor('#eef0f1')

TABLE_HEADER_COLOR = ACCENT
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = BG_SURFACE



# ─── Styles ─────────────────────────────────────────────────────
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    'ReportTitle', fontName='DejaVuSerif', fontSize=22,
    leading=28, alignment=TA_CENTER, textColor=ACCENT,
    spaceAfter=6
)

subtitle_style = ParagraphStyle(
    'ReportSubtitle', fontName='DejaVuSerif', fontSize=12,
    leading=16, alignment=TA_CENTER, textColor=TEXT_MUTED,
    spaceAfter=18
)

h1_style = ParagraphStyle(
    'H1', fontName='DejaVuSerif', fontSize=16,
    leading=22, textColor=ACCENT, spaceBefore=18, spaceAfter=10
)

h2_style = ParagraphStyle(
    'H2', fontName='DejaVuSerif', fontSize=13,
    leading=18, textColor=TEXT_PRIMARY, spaceBefore=12, spaceAfter=6
)

body_style = ParagraphStyle(
    'Body', fontName='DejaVuSerif', fontSize=10.5,
    leading=16, alignment=TA_JUSTIFY, textColor=TEXT_PRIMARY,
    spaceAfter=6
)

header_cell_style = ParagraphStyle(
    'HeaderCell', fontName='DejaVuSerif', fontSize=9.5,
    leading=13, alignment=TA_CENTER, textColor=TABLE_HEADER_TEXT
)

cell_style = ParagraphStyle(
    'Cell', fontName='DejaVuSerif', fontSize=9,
    leading=12, alignment=TA_CENTER, textColor=TEXT_PRIMARY
)

cell_left_style = ParagraphStyle(
    'CellLeft', fontName='DejaVuSerif', fontSize=9,
    leading=12, alignment=TA_LEFT, textColor=TEXT_PRIMARY
)

caption_style = ParagraphStyle(
    'Caption', fontName='DejaVuSerif', fontSize=9,
    leading=12, alignment=TA_CENTER, textColor=TEXT_MUTED,
    spaceBefore=3, spaceAfter=12
)

# ─── Page Template ──────────────────────────────────────────────
page_w, page_h = A4
left_margin = 0.75 * inch
right_margin = 0.75 * inch
top_margin = 0.6 * inch
bottom_margin = 0.6 * inch
available_width = page_w - left_margin - right_margin

def header_footer(canvas, doc):
    canvas.saveState()
    # Header line
    canvas.setStrokeColor(ACCENT)
    canvas.setLineWidth(1.5)
    canvas.line(left_margin, page_h - 0.45 * inch, page_w - right_margin, page_h - 0.45 * inch)
    # Header text
    canvas.setFont('DejaVuSerif', 8)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(left_margin, page_h - 0.38 * inch, 'MMODRM Monthly Report')
    canvas.drawRightString(page_w - right_margin, page_h - 0.38 * inch, 'Confidential')
    # Footer
    canvas.setStrokeColor(ACCENT)
    canvas.setLineWidth(0.5)
    canvas.line(left_margin, 0.45 * inch, page_w - right_margin, 0.45 * inch)
    canvas.setFont('DejaVuSerif', 8)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(left_margin, 0.3 * inch, f'Generated: {datetime.now().strftime("%B %d, %Y")}')
    canvas.drawRightString(page_w - right_margin, 0.3 * inch, f'Page {doc.page}')
    canvas.restoreState()

# ─── Helpers ────────────────────────────────────────────────────
def make_table_style(num_rows):
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
        ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]
    for i in range(1, num_rows):
        bg = TABLE_ROW_EVEN if i % 2 == 1 else TABLE_ROW_ODD
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    return TableStyle(style_cmds)


def p(text, style=cell_style):
    return Paragraph(str(text), style)


def pl(text, style=cell_left_style):
    return Paragraph(str(text), style)


def ph(text, style=header_cell_style):
    return Paragraph(f'<b>{text}</b>', style)

# ─── Main ───────────────────────────────────────────────────────
def generate_report(data_json_path, output_pdf_path):
    with open(data_json_path, 'r') as f:
        data = json.load(f)

    reports = data.get('reports', [])
    drivers_data = data.get('drivers', [])
    month_label = data.get('monthLabel', 'Monthly')

    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=A4,
        leftMargin=left_margin,
        rightMargin=right_margin,
        topMargin=top_margin,
        bottomMargin=bottom_margin,
    )

    story = []

    # ─── Title Section ────────────────────────────────────────
    story.append(Spacer(1, 20))
    story.append(Paragraph('<b>MMODRM</b>', title_style))
    story.append(Paragraph('Municipal Disaster Risk Reduction Management Office', ParagraphStyle(
        'OrgName', fontName='DejaVuSerif', fontSize=11,
        leading=14, alignment=TA_CENTER, textColor=TEXT_MUTED, spaceAfter=4
    )))
    story.append(HRFlowable(width='60%', thickness=1, color=ACCENT, spaceAfter=8, spaceBefore=4))
    story.append(Paragraph(f'<b>{month_label} Report</b>', ParagraphStyle(
        'MonthTitle', fontName='DejaVuSerif', fontSize=15,
        leading=20, alignment=TA_CENTER, textColor=TEXT_PRIMARY, spaceAfter=4
    )))
    story.append(Paragraph('Emergency Incidents and Driver/Responder Summary', subtitle_style))

    # ─── Section 1: Emergency Reports ─────────────────────────
    story.append(Paragraph('<b>Section 1: Emergency Reports</b>', h1_style))
    story.append(HRFlowable(width='100%', thickness=0.5, color=ACCENT, spaceAfter=8))

    # Incident type breakdown
    type_counts = {}
    for r in reports:
        t = r.get('incidentType', 'Unknown')
        type_counts[t] = type_counts.get(t, 0) + 1

    # Incident Type Breakdown Table
    story.append(Paragraph('<b>1.1 Incident Type Breakdown</b>', h2_style))
    type_data = [[ph('Incident Type'), ph('Count'), ph('Percentage')]]
    total = len(reports) or 1
    for t, c in sorted(type_counts.items(), key=lambda x: -x[1]):
        pct = f'{(c / total) * 100:.1f}%'
        type_data.append([pl(t), p(str(c)), p(pct)])
    type_data.append([pl('<b>Total</b>'), p(f'<b>{len(reports)}</b>'), p('<b>100.0%</b>')])

    type_table = Table(type_data, colWidths=[available_width * 0.50, available_width * 0.25, available_width * 0.25], hAlign='CENTER')
    type_table.setStyle(make_table_style(len(type_data)))
    story.append(type_table)
    story.append(Paragraph('Table 1: Incident Type Breakdown', caption_style))

    # ─── Section 2: Driver/Responder Summary ───────────────────
    story.append(Paragraph('<b>Section 2: Drivers / Responders</b>', h1_style))
    story.append(HRFlowable(width='100%', thickness=0.5, color=ACCENT, spaceAfter=8))

    # Driver Summary Table
    story.append(Paragraph('<b>2.1 Driver Summary</b>', h2_style))
    dr_cols = [0.22, 0.22, 0.14, 0.22, 0.20]
    dr_col_widths = [available_width * r for r in dr_cols]
    dr_header = [ph('Driver Name'), ph('Plate No.'), ph('Reports'), ph('Last Location'), ph('Last Purpose')]
    dr_data = [dr_header]

    for d in drivers_data:
        dr_data.append([
            pl(d.get('driverName', '')),
            pl(d.get('governmentCardPlateNo', '')),
            p(str(d.get('reportCount', 0))),
            pl(d.get('lastLocation', '')),
            pl(d.get('lastPurpose', '')),
        ])

    dr_table = Table(dr_data, colWidths=dr_col_widths, hAlign='CENTER')
    dr_table.setStyle(make_table_style(len(dr_data)))
    story.append(dr_table)
    story.append(Paragraph('Table 2: Driver/Responder Summary', caption_style))

    # Gasoline Usage Table
    story.append(Paragraph('<b>2.2 Gasoline Usage by Driver</b>', h2_style))
    gas_cols = [0.20, 0.14, 0.14, 0.14, 0.14, 0.12, 0.12]
    gas_col_widths = [available_width * r for r in gas_cols]
    gas_header = [ph('Driver'), ph('Balance<br/>In Tank'), ph('Issued<br/>By Office'), ph('Purchased'), ph('Deduct<br/>Used'), ph('Balance<br/>End Trip'), ph('Total<br/>Liters')]
    gas_data = [gas_header]

    for d in drivers_data:
        gas = d.get('gasoline', {})
        bal_in = float(gas.get('balanceInTank', 0))
        issued = float(gas.get('issuedByOffice', 0))
        purchased = float(gas.get('asPurchased', 0))
        deduct = float(gas.get('deductUsed', 0))
        bal_end = float(gas.get('balanceEndTrip', 0))
        total_l = issued + purchased
        gas_data.append([
            pl(d.get('driverName', '')),
            p(f'{bal_in:.0f} L'),
            p(f'{issued:.0f} L'),
            p(f'{purchased:.0f} L'),
            p(f'{deduct:.0f} L'),
            p(f'{bal_end:.0f} L'),
            p(f'{total_l:.0f} L'),
        ])

    gas_table = Table(gas_data, colWidths=gas_col_widths, hAlign='CENTER')
    gas_table.setStyle(make_table_style(len(gas_data)))
    story.append(gas_table)
    story.append(Paragraph('Table 3: Gasoline Usage by Driver (Liters)', caption_style))

    # ─── Build PDF ─────────────────────────────────────────────
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    return output_pdf_path


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print('Usage: python generate_monthly_report.py <input.json> <output.pdf>', file=sys.stderr)
        sys.exit(1)
    input_json = sys.argv[1]
    output_pdf = sys.argv[2]
    result = generate_report(input_json, output_pdf)
    print(f'PDF generated: {result}', file=sys.stderr)
