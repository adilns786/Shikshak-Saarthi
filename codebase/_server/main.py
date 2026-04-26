"""
Flask Server for PBAS Form Generation (No Firebase Admin)
Using Firebase Firestore REST API (Read-only)
Includes ReportLab-based PDF generation with VESIT branding.
"""

from flask import Flask, jsonify, send_file, request
from flask_cors import CORS
from io import BytesIO
from datetime import datetime
import requests
from pbas_form_generator import PBASFormGenerator  # your DOCX generator class

# ── ReportLab PDF imports ───────────────────────────────────────────────────
try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import cm, mm
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        HRFlowable, PageBreak, KeepTogether, Image as RLImage,
    )
    from reportlab.platypus.tableofcontents import TableOfContents
    from reportlab.pdfgen import canvas as rl_canvas
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False
    print("⚠️  reportlab not installed – PDF endpoints disabled. Run: pip install reportlab")

# ---------------------------------------------------------------------------
# Flask App Setup
# ---------------------------------------------------------------------------
app = Flask(__name__)
CORS(app)  # allow frontend (Next.js) to call this API

# ---------------------------------------------------------------------------
# Firebase Config (client-side credentials)
# ---------------------------------------------------------------------------
PROJECT_ID = "shikshak-sarthi"
API_KEY = "AIzaSyBdv7Fam8KP8mkyF_UP7RfURM6OwFNd7vQ"
COLLECTION = "users"

# ---------------------------------------------------------------------------
# Default PBAS Template Structure
# ---------------------------------------------------------------------------
TEMPLATE_DATA = {
    'institute': '',
    'department': '',
    'faculty': '',
    'academic_year': '',
    'name': '',
    'current_designation': '',
    'last_promotion': '',
    'cas_level': '',
    'applied_designation': '',
    'eligibility_date': '',
    'address': '',
    'mobile': '',
    'email': '',
    'academic_qualifications': [],
    'research_degrees': [],
    'prior_appointments': [],
    'current_posts': [],
    'pg_experience': '',
    'ug_experience': '',
    'research_experience': '',
    'specialization': '',
    'courses_fdp': [],
    'teaching_data': {
        'actual_classes': '',
        'self_grading': '',
        'verified_grading': '',
    },
    'activities_data': {
        'admin_days': '',
        'admin_grading': '',
        'exam_days': '',
        'exam_grading': '',
        'student_days': '',
        'student_grading': '',
    }
}

# ---------------------------------------------------------------------------
# 🔸 Helper: Parse Firestore REST API response fields
# ---------------------------------------------------------------------------
def parse_firestore_value(v):
    """Parse a single Firestore value"""
    if isinstance(v, dict):
        if 'stringValue' in v:
            return v['stringValue']
        elif 'integerValue' in v:
            return int(v['integerValue'])
        elif 'doubleValue' in v:
            return float(v['doubleValue'])
        elif 'booleanValue' in v:
            return v['booleanValue']
        elif 'nullValue' in v:
            return None
        elif 'mapValue' in v:
            return parse_firestore_fields(v['mapValue'].get('fields', {}))
        elif 'arrayValue' in v:
            values = v['arrayValue'].get('values', [])
            return [parse_firestore_value(item) for item in values]
        else:
            return next(iter(v.values()), None)
    return v


def parse_firestore_fields(fields):
    """Parse Firestore fields recursively"""
    if not fields:
        return {}
    parsed = {}
    for k, v in fields.items():
        parsed[k] = parse_firestore_value(v)
    return parsed


def extract_pbas_data(user_data):
    """Extract all PBAS data from Firebase user document"""
    # Form header
    form_header = user_data.get('formHeader', {})
    if isinstance(form_header, dict):
        form_header = form_header
    
    # Part A data
    part_a = user_data.get('part_a', {})
    personal_info = part_a.get('personal_in', {})
    teaching_exp = part_a.get('teaching_research_experience', {})
    teaching_assessment = part_a.get('teaching_student_assessment', {})
    
    # Part B data
    part_b = user_data.get('part_b', {})
    table2 = part_b.get('table2', {})
    
    # Academic qualifications
    academic_qualifications = []
    for qual in part_a.get('academic_qualifications', []):
        academic_qualifications.append({
            'examination': qual.get('examination', ''),
            'board': qual.get('board_university', ''),
            'year': str(qual.get('year_passing', '')),
            'percentage': str(qual.get('percentage', '')),
            'division': qual.get('class_division', ''),
            'subject': qual.get('subject', '')
        })
    
    # Research degrees
    research_degrees = []
    for deg in part_a.get('research_degrees', []):
        research_degrees.append({
            'title': deg.get('title', ''),
            'date': deg.get('date_of_award', ''),
            'university': deg.get('university', '')
        })
    
    # Prior appointments
    prior_appointments = []
    employment = part_a.get('employment', {})
    for appt in employment.get('prior', []):
        prior_appointments.append({
            'designation': appt.get('designation', ''),
            'employer': appt.get('employer', ''),
            'qualifications': appt.get('qualifications', ''),
            'nature': appt.get('nature', ''),
            'duties': appt.get('duties', ''),
            'joining_date': appt.get('joining_date', ''),
            'leaving_date': appt.get('leaving_date', ''),
            'salary': appt.get('salary', ''),
            'reason': appt.get('reason', '')
        })
    
    # Current posts
    current_posts = []
    for post in employment.get('posts', []):
        current_posts.append({
            'designation': post.get('designation', ''),
            'department': post.get('department', ''),
            'joining_date': post.get('joining_date', ''),
            'grade_pay': post.get('grade_pay', '')
        })
    
    # Courses/FDP
    courses_fdp = []
    for course in part_a.get('courses_fdp', []):
        courses_fdp.append({
            'name': course.get('name', ''),
            'organizer': course.get('organizer', ''),
            'duration': course.get('duration', ''),
            'place': course.get('place', ''),
            'date': course.get('date', '')
        })
    
    # Teaching data
    teaching_list = teaching_assessment.get('teaching', [])
    teaching_data = {
        'actual_classes': '',
        'self_grading': '',
        'verified_grading': ''
    }
    if teaching_list:
        first_teaching = teaching_list[0] if teaching_list else {}
        teaching_data = {
            'actual_classes': str(first_teaching.get('actual_class_spent', '')),
            'self_grading': first_teaching.get('self_appraisal', ''),
            'verified_grading': first_teaching.get('verified_grading', '')
        }
    
    # Activities data
    activities_list = teaching_assessment.get('activities', [])
    activities_data = {
        'admin_days': '',
        'admin_grading': '',
        'exam_days': '',
        'exam_grading': '',
        'student_days': '',
        'student_grading': ''
    }
    for activity in activities_list:
        category = activity.get('activity_category', '').lower()
        if 'admin' in category or 'department' in category:
            activities_data['admin_days'] = str(activity.get('total_days', ''))
            activities_data['admin_grading'] = activity.get('verified_grading', '')
        elif 'exam' in category:
            activities_data['exam_days'] = str(activity.get('total_days', ''))
            activities_data['exam_grading'] = activity.get('verified_grading', '')
        elif 'student' in category or 'college' in category:
            activities_data['student_days'] = str(activity.get('total_days', ''))
            activities_data['student_grading'] = activity.get('verified_grading', '')
    
    # Part B - Research data
    research_papers = []
    for paper in table2.get('researchPapers', []):
        research_papers.append({
            'title': paper.get('title', ''),
            'authors': paper.get('authors', ''),
            'journal': paper.get('journal', paper.get('conference', '')),
            'year': str(paper.get('year', '')),
            'volume': paper.get('volume', ''),
            'pages': paper.get('pages', ''),
            'indexed': paper.get('indexed', ''),
            'impact_factor': paper.get('impact_factor', '')
        })
    
    publications = []
    for pub in table2.get('publications', []):
        publications.append({
            'title': pub.get('title', ''),
            'type': pub.get('type', ''),
            'publisher': pub.get('publisher', ''),
            'isbn': pub.get('isbn', ''),
            'year': str(pub.get('year', '')),
            'authorship': pub.get('authorship', '')
        })
    
    patents_awards = []
    for patent in part_b.get('patents_policy_awards', []):
        patents_awards.append({
            'title': patent.get('title', ''),
            'category': patent.get('category', ''),
            'status': patent.get('status', ''),
            'year': str(patent.get('year', '')),
            'recognition': patent.get('recognition', '')
        })
    
    invited_lectures = []
    for lecture in part_b.get('invited_lectures', []):
        invited_lectures.append({
            'title': lecture.get('title', ''),
            'organizer': lecture.get('organizer', ''),
            'venue': lecture.get('venue', ''),
            'date': lecture.get('date', ''),
            'type': lecture.get('type', '')
        })
    
    research_projects = []
    for proj in table2.get('researchProjects', []):
        research_projects.append({
            'title': proj.get('title', ''),
            'funding_agency': proj.get('funding_agency', ''),
            'amount': str(proj.get('amount', '')),
            'duration': proj.get('duration', ''),
            'role': proj.get('role', ''),
            'status': proj.get('status', '')
        })
    
    consultancy_projects = []
    for proj in table2.get('consultancyProjects', []):
        consultancy_projects.append({
            'title': proj.get('title', ''),
            'organization': proj.get('organization', ''),
            'amount': str(proj.get('amount', '')),
            'year': str(proj.get('year', ''))
        })
    
    research_guidance = []
    for guidance in table2.get('researchGuidance', []):
        research_guidance.append({
            'student_name': guidance.get('student_name', ''),
            'level': guidance.get('level', ''),
            'title': guidance.get('title', ''),
            'status': guidance.get('status', ''),
            'year': str(guidance.get('year', ''))
        })
    
    ict_innovations = []
    for ict in table2.get('ictInnovations', []):
        ict_innovations.append({
            'title': ict.get('title', ''),
            'description': ict.get('description', ''),
            'year': str(ict.get('year', '')),
            'impact': ict.get('impact', '')
        })
    
    return {
        'institute': form_header.get('institute_name', ''),
        'department': form_header.get('department_name', user_data.get('department', '')),
        'faculty': form_header.get('faculty_name', ''),
        'academic_year': form_header.get('academic_year', ''),
        'name': personal_info.get('name', user_data.get('name', '')),
        'current_designation': personal_info.get('current_designation', user_data.get('designation', '')),
        'last_promotion': personal_info.get('date_last_promotion', ''),
        'cas_level': personal_info.get('level_cas', form_header.get('cas_promotion_stage', '')),
        'applied_designation': personal_info.get('designation_applied', ''),
        'eligibility_date': personal_info.get('date_eligibility', ''),
        'address': personal_info.get('address', ''),
        'mobile': personal_info.get('telephone', user_data.get('phone', '')),
        'email': personal_info.get('email', user_data.get('email', '')),
        'academic_qualifications': academic_qualifications,
        'research_degrees': research_degrees,
        'prior_appointments': prior_appointments,
        'current_posts': current_posts,
        'pg_experience': str(teaching_exp.get('pg_years', '')),
        'ug_experience': str(teaching_exp.get('ug_years', '')),
        'research_experience': str(teaching_exp.get('research_years', '')),
        'specialization': teaching_exp.get('specialization', ''),
        'courses_fdp': courses_fdp,
        'teaching_data': teaching_data,
        'activities_data': activities_data,
        # Part B data
        'research_papers': research_papers,
        'publications': publications,
        'patents_awards': patents_awards,
        'invited_lectures': invited_lectures,
        'research_projects': research_projects,
        'consultancy_projects': consultancy_projects,
        'research_guidance': research_guidance,
        'ict_innovations': ict_innovations
    }


# ---------------------------------------------------------------------------
# 🔹 Route 1: Fetch PBAS Data from Firestore (via REST API)
# ---------------------------------------------------------------------------
@app.route('/api/fetch/<uid>', methods=['GET'])
def fetch_from_firestore(uid):
    """Fetch faculty PBAS data from Firestore using REST API"""
    try:
        url = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/{COLLECTION}/{uid}?key={API_KEY}"
        response = requests.get(url)

        if response.status_code != 200:
            return jsonify({'error': 'Firestore fetch failed', 'details': response.text}), response.status_code

        data = response.json()
        fields = data.get("fields", {})
        user_data = parse_firestore_fields(fields)

        # Extract full PBAS data
        form_data = extract_pbas_data(user_data)

        return jsonify(form_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ---------------------------------------------------------------------------
# 🔹 Route 2: Generate PBAS Form DOCX (from Firestore data)
# ---------------------------------------------------------------------------
@app.route('/api/generate/firebase/<uid>', methods=['GET'])
def generate_from_firestore(uid):
    """Fetch PBAS data via REST and generate DOCX form"""
    try:
        url = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/{COLLECTION}/{uid}?key={API_KEY}"
        response = requests.get(url)

        if response.status_code != 200:
            return jsonify({'error': 'Firestore fetch failed', 'details': response.text}), response.status_code

        data = response.json()
        fields = data.get("fields", {})
        user_data = parse_firestore_fields(fields)

        # Extract full PBAS data from Firebase structure
        form_data = extract_pbas_data(user_data)
        
        print(f"📊 Generating PBAS for user: {form_data.get('name', uid)}")
        print(f"   • Academic Qualifications: {len(form_data.get('academic_qualifications', []))}")
        print(f"   • Research Degrees: {len(form_data.get('research_degrees', []))}")
        print(f"   • Prior Appointments: {len(form_data.get('prior_appointments', []))}")
        print(f"   • Current Posts: {len(form_data.get('current_posts', []))}")
        print(f"   • Courses/FDP: {len(form_data.get('courses_fdp', []))}")
        print(f"   • Research Papers: {len(form_data.get('research_papers', []))}")
        print(f"   • Publications: {len(form_data.get('publications', []))}")
        print(f"   • Patents/Awards: {len(form_data.get('patents_awards', []))}")
        print(f"   • Invited Lectures: {len(form_data.get('invited_lectures', []))}")
        print(f"   • Research Projects: {len(form_data.get('research_projects', []))}")
        print(f"   • Consultancy Projects: {len(form_data.get('consultancy_projects', []))}")
        print(f"   • ICT Innovations: {len(form_data.get('ict_innovations', []))}")
        print(f"   • Research Guidance: {len(form_data.get('research_guidance', []))}")

        # Generate DOCX
        generator = PBASFormGenerator()
        docx = generator.generate(form_data)

        # Save to memory
        file_stream = BytesIO()
        docx.save(file_stream)
        file_stream.seek(0)

        filename = f"PBAS_Form_{form_data.get('name', uid).replace(' ', '_')}.docx"
        return send_file(
            file_stream,
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            as_attachment=True,
            download_name=filename
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# ===========================================================================
# ⚡ ReportLab PDF Generation — VESIT Branded
# ===========================================================================

VESIT_LOGO_URL = "https://vesit.ves.ac.in/navbar2024nobackground.png"

# Define branding colors. If reportlab isn't available, provide simple
# fallbacks so the module can be imported without raising NameError.
if REPORTLAB_AVAILABLE:
    BRAND_RED   = colors.HexColor("#ff5c35")
    BRAND_DARK  = colors.HexColor("#1a1a2e")
    BRAND_LIGHT = colors.HexColor("#f4f4f6")
    BRAND_GRAY  = colors.HexColor("#555555")
    WHITE       = colors.white
    BLACK       = colors.black
else:
    BRAND_RED   = "#ff5c35"
    BRAND_DARK  = "#1a1a2e"
    BRAND_LIGHT = "#f4f4f6"
    BRAND_GRAY  = "#555555"
    WHITE       = "#ffffff"
    BLACK       = "#000000"

    # Minimal fallback replacement for the parts of the API the code
    # expects (colors.HexColor and color constants). Returning raw
    # hex strings is sufficient because PDF-generation functions are
    # guarded by REPORTLAB_AVAILABLE and won't run without reportlab.
    class _FallbackColors:
        @staticmethod
        def HexColor(val):
            return val

        white = WHITE
        black = BLACK

    colors = _FallbackColors()
    # Provide minimal placeholders for ReportLab symbols so function
    # annotations and references don't raise NameError at import time.
    # The actual PDF-generation functions check REPORTLAB_AVAILABLE
    # and will not execute without reportlab installed.
    Table = object
    Paragraph = object
    Spacer = object
    HRFlowable = object
    PageBreak = object
    RLImage = object
    SimpleDocTemplate = object
    ParagraphStyle = object
    TableStyle = object
    rl_canvas = object


def _download_logo() -> BytesIO | None:
    """Try to download VESIT logo; return None on failure."""
    try:
        resp = requests.get(VESIT_LOGO_URL, timeout=5)
        if resp.status_code == 200:
            buf = BytesIO(resp.content)
            buf.seek(0)
            return buf
    except Exception:
        pass
    return None


def _get_pdf_styles():
    """Return a dict of ParagraphStyles for the PDF."""
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "title",
            parent=base["Heading1"],
            fontSize=20,
            leading=26,
            textColor=BRAND_DARK,
            alignment=TA_CENTER,
            spaceAfter=6,
            fontName="Helvetica-Bold",
        ),
        "subtitle": ParagraphStyle(
            "subtitle",
            fontSize=11,
            leading=14,
            textColor=BRAND_GRAY,
            alignment=TA_CENTER,
            spaceAfter=4,
            fontName="Helvetica",
        ),
        "section": ParagraphStyle(
            "section",
            fontSize=13,
            leading=16,
            textColor=WHITE,
            spaceBefore=12,
            spaceAfter=6,
            fontName="Helvetica-Bold",
            leftIndent=0,
        ),
        "subsection": ParagraphStyle(
            "subsection",
            fontSize=11,
            leading=14,
            textColor=BRAND_DARK,
            spaceBefore=8,
            spaceAfter=4,
            fontName="Helvetica-Bold",
        ),
        "body": ParagraphStyle(
            "body",
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#333333"),
            spaceAfter=4,
            fontName="Helvetica",
        ),
        "small": ParagraphStyle(
            "small",
            fontSize=8,
            leading=11,
            textColor=BRAND_GRAY,
            fontName="Helvetica",
        ),
        "label": ParagraphStyle(
            "label",
            fontSize=9,
            leading=12,
            textColor=BRAND_GRAY,
            fontName="Helvetica-Bold",
            spaceAfter=1,
        ),
        "value": ParagraphStyle(
            "value",
            fontSize=10,
            leading=14,
            textColor=BRAND_DARK,
            fontName="Helvetica",
            spaceAfter=4,
        ),
        "table_header": ParagraphStyle(
            "table_header",
            fontSize=9,
            leading=12,
            textColor=WHITE,
            fontName="Helvetica-Bold",
            alignment=TA_CENTER,
        ),
        "table_cell": ParagraphStyle(
            "table_cell",
            fontSize=9,
            leading=12,
            textColor=BRAND_DARK,
            fontName="Helvetica",
        ),
        "insight": ParagraphStyle(
            "insight",
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#1a1a2e"),
            fontName="Helvetica",
            leftIndent=12,
            spaceBefore=2,
            spaceAfter=2,
        ),
    }


class _VESITPageTemplate:
    """Callable that draws header + footer on every page."""

    def __init__(self, logo_buf: BytesIO | None, report_title: str, generated_by: str):
        self.logo_buf = logo_buf
        self.report_title = report_title
        self.generated_by = generated_by

    def __call__(self, c, doc):
        c.saveState()
        W, H = A4

        # ── Header ─────────────────────────────────────────────────────────
        # Red bar across top
        c.setFillColor(BRAND_RED)
        c.rect(0, H - 28 * mm, W, 28 * mm, fill=True, stroke=False)

        # Logo (left side of header)
        if self.logo_buf:
            try:
                self.logo_buf.seek(0)
                c.drawImage(
                    RLImage(self.logo_buf),  # type: ignore[arg-type]
                    8 * mm,
                    H - 26 * mm,
                    width=40 * mm,
                    height=18 * mm,
                    preserveAspectRatio=True,
                    mask="auto",
                )
            except Exception:
                pass

        # College name in header
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(55 * mm, H - 11 * mm, "Vivekanand Education Society's Institute of Technology")
        c.setFont("Helvetica", 9)
        c.drawString(55 * mm, H - 17 * mm, "Chembur, Mumbai - 400 074  |  Autonomous Institution")

        # Report title right-aligned
        c.setFont("Helvetica-Bold", 9)
        title_w = c.stringWidth(self.report_title, "Helvetica-Bold", 9)
        c.drawString(W - title_w - 8 * mm, H - 11 * mm, self.report_title)

        # ── Footer ─────────────────────────────────────────────────────────
        c.setFillColor(BRAND_DARK)
        c.rect(0, 0, W, 12 * mm, fill=True, stroke=False)

        c.setFillColor(WHITE)
        c.setFont("Helvetica", 7)
        c.drawString(8 * mm, 4 * mm, f"Generated by Shikshak Sarthi · VESIT PBAS Management Platform")
        c.drawString(8 * mm, 8 * mm, f"Generated on: {datetime.now().strftime('%d %b %Y %H:%M')}  |  {self.generated_by}")

        # Page number
        c.setFont("Helvetica-Bold", 9)
        page_str = f"Page {doc.page}"
        pw = c.stringWidth(page_str, "Helvetica-Bold", 9)
        c.drawString(W - pw - 8 * mm, 4 * mm, page_str)

        c.restoreState()


def _section_header(title: str, styles: dict) -> list:
    """Return a list of flowables representing a coloured section header."""
    data = [[Paragraph(title, styles["section"])]]
    tbl = Table(data, colWidths=["100%"])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), BRAND_RED),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
    ]))
    return [Spacer(1, 4 * mm), tbl, Spacer(1, 2 * mm)]


def _kv_row(label: str, value: str, styles: dict) -> Table:
    """Create a two-column key-value row."""
    data = [[
        Paragraph(label, styles["label"]),
        Paragraph(value or "—", styles["value"]),
    ]]
    tbl = Table(data, colWidths=[50 * mm, 110 * mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), colors.HexColor("#f0f0f0")),
        ("BACKGROUND", (1, 0), (1, 0), WHITE),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#dddddd")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#eeeeee")),
        ("TOPPADDING",    (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
    ]))
    return tbl


def _generic_table(headers: list[str], rows: list[list], styles: dict, col_widths=None) -> Table:
    """Render a styled table with header row."""
    if not rows:
        return Table([[Paragraph("No records found.", styles["body"])]])
    page_w = A4[0] - 2 * 2 * cm
    if col_widths is None:
        col_widths = [page_w / len(headers)] * len(headers)
    header_row = [Paragraph(h, styles["table_header"]) for h in headers]
    data = [header_row] + [
        [Paragraph(str(c) if c else "—", styles["table_cell"]) for c in row]
        for row in rows
    ]
    tbl = Table(data, colWidths=col_widths, repeatRows=1)
    ts = TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0), BRAND_DARK),
        ("TEXTCOLOR",     (0, 0), (-1, 0), WHITE),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, 0), 9),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#ffffff"), colors.HexColor("#f8f8f8")]),
        ("BOX",           (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
        ("INNERGRID",     (0, 0), (-1, -1), 0.3, colors.HexColor("#dddddd")),
        ("TOPPADDING",    (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
        ("ALIGN",         (0, 0), (-1, -1), "LEFT"),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ])
    tbl.setStyle(ts)
    return tbl


def generate_faculty_pdf(uid: str, user_data: dict,
                          filters: dict | None = None) -> BytesIO:
    """Generate a complete faculty PBAS PDF report."""
    if not REPORTLAB_AVAILABLE:
        raise RuntimeError("reportlab is not installed")

    styles = _get_pdf_styles()
    logo_buf = _download_logo()
    form_data = extract_pbas_data(user_data)

    # Apply optional year filter
    year_from = int(filters.get("year_from", 0)) if filters else 0
    year_to   = int(filters.get("year_to",   9999)) if filters else 9999

    def _year_ok(item):
        y = item.get("year") or item.get("year_passing")
        if not y:
            return True
        try:
            return year_from <= int(str(y)) <= year_to
        except Exception:
            return True

    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        topMargin=35 * mm,
        bottomMargin=20 * mm,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
    )

    report_title = "Faculty PBAS Report"
    generated_by = form_data.get("name") or uid
    page_tmpl = _VESITPageTemplate(logo_buf, report_title, generated_by)

    story = []

    # ── Cover / Faculty Info ────────────────────────────────────────────────
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph("FACULTY PBAS REPORT", styles["title"]))
    story.append(Paragraph("Performance Based Appraisal System", styles["subtitle"]))
    story.append(Paragraph(
        "Vivekanand Education Society's Institute of Technology, Mumbai",
        styles["subtitle"],
    ))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND_RED, spaceAfter=6))
    story.append(Spacer(1, 4 * mm))

    # Faculty info card
    info_rows = [
        ("Full Name",        form_data.get("name", "")),
        ("Department",       form_data.get("department", "")),
        ("Designation",      form_data.get("current_designation", "")),
        ("Academic Year",    form_data.get("academic_year", "")),
        ("CAS Level",        form_data.get("cas_level", "")),
        ("Email",            form_data.get("email", "")),
        ("Mobile",           form_data.get("mobile", "")),
        ("Specialization",   form_data.get("specialization", "")),
        ("UG Experience",    f"{form_data.get('ug_experience', '')} years"),
        ("PG Experience",    f"{form_data.get('pg_experience', '')} years"),
        ("Research Exp.",    f"{form_data.get('research_experience', '')} years"),
    ]
    for label, val in info_rows:
        story.append(_kv_row(label, str(val), styles))

    # ── Academic Qualifications ─────────────────────────────────────────────
    story += _section_header("ACADEMIC QUALIFICATIONS", styles)
    quals = form_data.get("academic_qualifications", [])
    if quals:
        rows = [[q.get("examination"), q.get("board"), q.get("year"),
                 q.get("percentage"), q.get("division"), q.get("subject")]
                for q in quals]
        story.append(_generic_table(
            ["Examination", "Board / University", "Year", "Marks %", "Division", "Subject"],
            rows, styles, col_widths=[35*mm, 45*mm, 20*mm, 20*mm, 22*mm, 28*mm],
        ))

    # ── Research Degrees ────────────────────────────────────────────────────
    research_degrees = form_data.get("research_degrees", [])
    if research_degrees:
        story += _section_header("RESEARCH DEGREES", styles)
        rows = [[d.get("title"), d.get("date"), d.get("university")] for d in research_degrees]
        story.append(_generic_table(
            ["Title / Topic", "Date of Award", "University"],
            rows, styles, col_widths=[70*mm, 30*mm, 70*mm],
        ))

    # ── Courses & FDP ───────────────────────────────────────────────────────
    courses = form_data.get("courses_fdp", [])
    if courses:
        story += _section_header("COURSES, FDP & REFRESHER PROGRAMMES", styles)
        rows = [[c.get("name"), c.get("organizer"), c.get("duration"), c.get("date")]
                for c in courses]
        story.append(_generic_table(
            ["Course / Programme", "Organizer", "Duration", "Date"],
            rows, styles, col_widths=[65*mm, 55*mm, 25*mm, 25*mm],
        ))

    # ── Research Papers ─────────────────────────────────────────────────────
    papers = [p for p in form_data.get("research_papers", []) if _year_ok(p)]
    if papers:
        story += _section_header(f"RESEARCH PAPERS PUBLISHED  ({len(papers)})", styles)
        rows = [[p.get("title"), p.get("authors"), p.get("journal"),
                 p.get("year"), p.get("indexed"), p.get("impact_factor")]
                for p in papers]
        story.append(_generic_table(
            ["Title", "Authors", "Journal / Conference", "Year", "Indexed", "Impact Factor"],
            rows, styles, col_widths=[50*mm, 30*mm, 40*mm, 15*mm, 20*mm, 15*mm],
        ))

    # ── Publications (Books / Chapters) ────────────────────────────────────
    pubs = [p for p in form_data.get("publications", []) if _year_ok(p)]
    if pubs:
        story += _section_header(f"BOOKS & PUBLICATIONS  ({len(pubs)})", styles)
        rows = [[p.get("title"), p.get("type"), p.get("publisher"),
                 p.get("isbn"), p.get("year"), p.get("authorship")]
                for p in pubs]
        story.append(_generic_table(
            ["Title", "Type", "Publisher", "ISBN", "Year", "Authorship"],
            rows, styles, col_widths=[55*mm, 25*mm, 40*mm, 22*mm, 12*mm, 16*mm],
        ))

    # ── Research Projects ───────────────────────────────────────────────────
    projects = [p for p in form_data.get("research_projects", []) if _year_ok(p)]
    if projects:
        story += _section_header(f"RESEARCH PROJECTS  ({len(projects)})", styles)
        rows = [[p.get("title"), p.get("funding_agency"), p.get("amount"),
                 p.get("duration"), p.get("role"), p.get("status")]
                for p in projects]
        story.append(_generic_table(
            ["Title", "Funding Agency", "Amount (₹)", "Duration", "Role", "Status"],
            rows, styles, col_widths=[55*mm, 40*mm, 20*mm, 20*mm, 20*mm, 15*mm],
        ))

    # ── Consultancy Projects ────────────────────────────────────────────────
    consult = [p for p in form_data.get("consultancy_projects", []) if _year_ok(p)]
    if consult:
        story += _section_header(f"CONSULTANCY PROJECTS  ({len(consult)})", styles)
        rows = [[p.get("title"), p.get("organization"), p.get("amount"), p.get("year")]
                for p in consult]
        story.append(_generic_table(
            ["Title", "Organization", "Amount (₹)", "Year"],
            rows, styles, col_widths=[70*mm, 60*mm, 25*mm, 15*mm],
        ))

    # ── Patents & Awards ────────────────────────────────────────────────────
    patents = [p for p in form_data.get("patents_awards", []) if _year_ok(p)]
    if patents:
        story += _section_header(f"PATENTS, POLICIES & AWARDS  ({len(patents)})", styles)
        rows = [[p.get("title"), p.get("category"), p.get("status"),
                 p.get("year"), p.get("recognition")]
                for p in patents]
        story.append(_generic_table(
            ["Title", "Category", "Status", "Year", "Recognition"],
            rows, styles, col_widths=[60*mm, 30*mm, 25*mm, 15*mm, 40*mm],
        ))

    # ── Invited Lectures ────────────────────────────────────────────────────
    lectures = [l for l in form_data.get("invited_lectures", []) if _year_ok(l)]
    if lectures:
        story += _section_header(f"INVITED LECTURES & PRESENTATIONS  ({len(lectures)})", styles)
        rows = [[l.get("title"), l.get("organizer"), l.get("venue"),
                 l.get("date"), l.get("type")]
                for l in lectures]
        story.append(_generic_table(
            ["Title", "Organizer", "Venue", "Date", "Type"],
            rows, styles, col_widths=[55*mm, 40*mm, 35*mm, 22*mm, 18*mm],
        ))

    # ── Research Guidance ───────────────────────────────────────────────────
    guidance = [g for g in form_data.get("research_guidance", []) if _year_ok(g)]
    if guidance:
        story += _section_header(f"RESEARCH GUIDANCE  ({len(guidance)})", styles)
        rows = [[g.get("student_name"), g.get("level"), g.get("title"),
                 g.get("status"), g.get("year")]
                for g in guidance]
        story.append(_generic_table(
            ["Student Name", "Level", "Thesis Title", "Status", "Year"],
            rows, styles, col_widths=[35*mm, 20*mm, 70*mm, 22*mm, 13*mm],
        ))

    # ── ICT Innovations ─────────────────────────────────────────────────────
    ict = [i for i in form_data.get("ict_innovations", []) if _year_ok(i)]
    if ict:
        story += _section_header(f"ICT INNOVATIONS  ({len(ict)})", styles)
        rows = [[i.get("title"), i.get("description"), i.get("year"), i.get("impact")]
                for i in ict]
        story.append(_generic_table(
            ["Title", "Description", "Year", "Impact"],
            rows, styles, col_widths=[45*mm, 80*mm, 15*mm, 30*mm],
        ))

    # ── Summary statistics ──────────────────────────────────────────────────
    story += _section_header("SUMMARY OF ACADEMIC CONTRIBUTIONS", styles)
    total_pubs = len(form_data.get("research_papers", [])) + len(form_data.get("publications", []))
    summary_data = [
        ["Metric", "Count"],
        ["Research Papers", str(len(form_data.get("research_papers", [])))],
        ["Books & Publications", str(len(form_data.get("publications", [])))],
        ["Research Projects", str(len(form_data.get("research_projects", [])))],
        ["Consultancy Projects", str(len(form_data.get("consultancy_projects", [])))],
        ["Patents & Awards", str(len(form_data.get("patents_awards", [])))],
        ["Invited Lectures", str(len(form_data.get("invited_lectures", [])))],
        ["Research Guidance", str(len(form_data.get("research_guidance", [])))],
        ["ICT Innovations", str(len(form_data.get("ict_innovations", [])))],
        ["FDP / Courses Attended", str(len(form_data.get("courses_fdp", [])))],
        ["TOTAL Academic Outputs", str(total_pubs + len(form_data.get("patents_awards", [])) +
                                       len(form_data.get("lectures", [])))],
    ]
    summary_tbl = Table(summary_data, colWidths=[100*mm, 40*mm])
    summary_tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0), BRAND_DARK),
        ("TEXTCOLOR",     (0, 0), (-1, 0), WHITE),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2),
         [colors.HexColor("#ffffff"), colors.HexColor("#fff5f2")]),
        ("BACKGROUND",    (0, -1), (-1, -1), colors.HexColor("#fff0ec")),
        ("FONTNAME",      (0, -1), (-1, -1), "Helvetica-Bold"),
        ("TEXTCOLOR",     (0, -1), (-1, -1), BRAND_RED),
        ("BOX",           (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
        ("INNERGRID",     (0, 0), (-1, -1), 0.3, colors.HexColor("#eeeeee")),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("ALIGN",         (1, 0), (1, -1), "CENTER"),
    ]))
    story.append(summary_tbl)

    story.append(Spacer(1, 8 * mm))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#dddddd")))
    story.append(Spacer(1, 2 * mm))
    story.append(Paragraph(
        "This is a computer-generated document produced by Shikshak Sarthi, "
        "VESIT's PBAS Management Platform. No manual signature is required.",
        styles["small"],
    ))

    doc.build(story, onFirstPage=page_tmpl, onLaterPages=page_tmpl)
    buf.seek(0)
    return buf


def generate_department_report_pdf(department: str, faculty_list: list,
                                   filters: dict | None = None) -> BytesIO:
    """Generate a department-wide analytics PDF for HOD/Admin."""
    if not REPORTLAB_AVAILABLE:
        raise RuntimeError("reportlab is not installed")

    styles = _get_pdf_styles()
    logo_buf = _download_logo()

    year_from = int(filters.get("year_from", 0))   if filters else 0
    year_to   = int(filters.get("year_to",   9999)) if filters else 9999
    role_filter = (filters.get("role") or "").strip() if filters else ""

    def _year_ok(item):
        y = item.get("year") or item.get("year_passing")
        if not y:
            return True
        try:
            return year_from <= int(str(y)) <= year_to
        except Exception:
            return True

    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        topMargin=35 * mm, bottomMargin=20 * mm,
        leftMargin=20 * mm, rightMargin=20 * mm,
    )

    report_title = f"{department} — Dept. Report"
    page_tmpl = _VESITPageTemplate(logo_buf, report_title, f"HOD / {department}")

    story = []

    # Cover
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph("DEPARTMENT PERFORMANCE REPORT", styles["title"]))
    story.append(Paragraph(f"{department} Department", styles["subtitle"]))
    story.append(Paragraph(
        "Vivekanand Education Society's Institute of Technology, Mumbai",
        styles["subtitle"],
    ))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND_RED, spaceAfter=6))

    # Filter info
    if filters and any(filters.values()):
        filter_str = "  |  ".join(
            f"{k.replace('_', ' ').title()}: {v}" for k, v in filters.items() if v
        )
        story.append(Paragraph(f"Applied Filters: {filter_str}", styles["small"]))
        story.append(Spacer(1, 3 * mm))

    # Filter faculty list
    filtered_faculty = [
        f for f in faculty_list
        if (not role_filter or f.get("role", "") == role_filter)
    ]

    # Department summary
    totals = {
        "papers": 0, "pubs": 0, "patents": 0,
        "projects": 0, "guidance": 0, "lectures": 0,
    }
    for f in filtered_faculty:
        pb = f.get("part_b", {}) or {}
        t2 = pb.get("table2", {}) or {}
        totals["papers"]   += len([p for p in (t2.get("researchPapers") or []) if _year_ok(p)])
        totals["pubs"]     += len([p for p in (t2.get("publications") or []) if _year_ok(p)])
        totals["patents"]  += len([p for p in (pb.get("patents_policy_awards") or []) if _year_ok(p)])
        totals["projects"] += len([p for p in (t2.get("researchProjects") or []) if _year_ok(p)])
        totals["projects"] += len([p for p in (t2.get("consultancyProjects") or []) if _year_ok(p)])
        totals["guidance"] += len([g for g in (t2.get("researchGuidance") or []) if _year_ok(g)])
        totals["lectures"] += len([l for l in (pb.get("invited_lectures") or []) if _year_ok(l)])

    story += _section_header("DEPARTMENT SUMMARY", styles)
    dep_sum_data = [
        ["Total Faculty", str(len(filtered_faculty))],
        ["Research Papers", str(totals["papers"])],
        ["Books & Publications", str(totals["pubs"])],
        ["Patents & Awards", str(totals["patents"])],
        ["Research / Consultancy Projects", str(totals["projects"])],
        ["Research Guidance (Students)", str(totals["guidance"])],
        ["Invited Lectures", str(totals["lectures"])],
        ["Avg. Publications / Faculty",
         f"{(totals['papers']+totals['pubs'])/max(len(filtered_faculty),1):.1f}"],
    ]
    sum_tbl = Table(dep_sum_data, colWidths=[100 * mm, 40 * mm])
    sum_tbl.setStyle(TableStyle([
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [WHITE, colors.HexColor("#fff5f2")]),
        ("BOX",           (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
        ("INNERGRID",     (0, 0), (-1, -1), 0.3, colors.HexColor("#eeeeee")),
        ("FONTNAME",      (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 10),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("ALIGN",         (1, 0), (1, -1), "CENTER"),
    ]))
    story.append(sum_tbl)

    # Faculty-wise breakdown table
    story += _section_header("FACULTY-WISE BREAKDOWN", styles)
    fac_rows = []
    for fac in filtered_faculty:
        pb = fac.get("part_b", {}) or {}
        t2 = pb.get("table2", {}) or {}
        papers  = len([p for p in (t2.get("researchPapers") or []) if _year_ok(p)])
        pubs    = len([p for p in (t2.get("publications") or []) if _year_ok(p)])
        patents = len([p for p in (pb.get("patents_policy_awards") or []) if _year_ok(p)])
        projs   = len([p for p in (t2.get("researchProjects") or []) if _year_ok(p)])
        fac_rows.append([
            fac.get("name") or fac.get("full_name") or "—",
            fac.get("designation") or "—",
            str(papers), str(pubs), str(patents), str(projs),
            str(papers + pubs + patents + projs),
        ])
    story.append(_generic_table(
        ["Faculty Name", "Designation", "Papers", "Pubs", "Patents", "Projects", "Total"],
        fac_rows, styles,
        col_widths=[50*mm, 40*mm, 18*mm, 18*mm, 18*mm, 18*mm, 18*mm],
    ))

    # Individual faculty sections
    for fac in filtered_faculty:
        form_data = extract_pbas_data(fac)
        story.append(PageBreak())
        story += _section_header(
            f"FACULTY PROFILE: {form_data.get('name', 'Unknown')}", styles
        )
        info_rows = [
            ("Department",       form_data.get("department", "")),
            ("Designation",      form_data.get("current_designation", "")),
            ("Academic Year",    form_data.get("academic_year", "")),
            ("Email",            form_data.get("email", "")),
            ("Specialization",   form_data.get("specialization", "")),
        ]
        for label, val in info_rows:
            story.append(_kv_row(label, str(val), styles))

        papers = [p for p in form_data.get("research_papers", []) if _year_ok(p)]
        if papers:
            story.append(Paragraph(f"Research Papers ({len(papers)})", styles["subsection"]))
            rows = [[p.get("title"), p.get("journal"), p.get("year"),
                     p.get("indexed")] for p in papers]
            story.append(_generic_table(
                ["Title", "Journal / Conference", "Year", "Indexed"],
                rows, styles, col_widths=[70*mm, 60*mm, 16*mm, 24*mm],
            ))

        pubs = [p for p in form_data.get("publications", []) if _year_ok(p)]
        if pubs:
            story.append(Paragraph(f"Books & Publications ({len(pubs)})", styles["subsection"]))
            rows = [[p.get("title"), p.get("publisher"), p.get("year")] for p in pubs]
            story.append(_generic_table(
                ["Title", "Publisher", "Year"],
                rows, styles, col_widths=[90*mm, 60*mm, 20*mm],
            ))

    story.append(Spacer(1, 8 * mm))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#dddddd")))
    story.append(Paragraph(
        "This report was generated by Shikshak Sarthi, VESIT's PBAS Management Platform.",
        styles["small"],
    ))

    doc.build(story, onFirstPage=page_tmpl, onLaterPages=page_tmpl)
    buf.seek(0)
    return buf


# ===========================================================================
# 🔹 New PDF Routes
# ===========================================================================

@app.route('/api/generate/pdf/<uid>', methods=['GET'])
def generate_pdf_report(uid):
    """Generate a ReportLab PDF report for a faculty member."""
    if not REPORTLAB_AVAILABLE:
        return jsonify({'error': 'reportlab not installed on server'}), 500

    # Accept optional filters as query-params
    filters = {
        "year_from": request.args.get("year_from", ""),
        "year_to":   request.args.get("year_to",   ""),
    }

    try:
        url = (
            f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}"
            f"/databases/(default)/documents/{COLLECTION}/{uid}?key={API_KEY}"
        )
        resp = requests.get(url)
        if resp.status_code != 200:
            return jsonify({'error': 'Firestore fetch failed', 'details': resp.text}), resp.status_code

        fields    = resp.json().get("fields", {})
        user_data = parse_firestore_fields(fields)

        pdf_buf  = generate_faculty_pdf(uid, user_data, filters or None)
        form_data = extract_pbas_data(user_data)
        filename  = f"PBAS_Report_{form_data.get('name', uid).replace(' ', '_')}.pdf"

        return send_file(
            pdf_buf,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename,
        )
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/generate/report/department', methods=['GET', 'POST'])
def generate_department_report():
    """Generate a department-wide analytics PDF (HOD / Admin)."""
    if not REPORTLAB_AVAILABLE:
        return jsonify({'error': 'reportlab not installed on server'}), 500

    try:
        if request.method == 'POST':
            payload = request.get_json(force=True) or {}
        else:
            payload = {}

        department  = request.args.get("department") or payload.get("department", "")
        year_from   = request.args.get("year_from")  or payload.get("year_from",  "")
        year_to     = request.args.get("year_to")    or payload.get("year_to",    "")
        role_filter = request.args.get("role")       or payload.get("role",       "")
        uids        = payload.get("uids", [])          # optional explicit list of UIDs

        filters = {"year_from": year_from, "year_to": year_to, "role": role_filter}

        faculty_list = []

        if uids:
            for uid in uids:
                url = (
                    f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}"
                    f"/databases/(default)/documents/{COLLECTION}/{uid}?key={API_KEY}"
                )
                r = requests.get(url)
                if r.status_code == 200:
                    fields = r.json().get("fields", {})
                    faculty_list.append(parse_firestore_fields(fields))
        else:
            # Fetch ALL users from Firestore REST API (up to 300)
            url = (
                f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}"
                f"/databases/(default)/documents/{COLLECTION}?key={API_KEY}&pageSize=300"
            )
            r = requests.get(url)
            if r.status_code != 200:
                return jsonify({'error': 'Firestore list failed'}), r.status_code

            docs = r.json().get("documents", [])
            for d in docs:
                fdata = parse_firestore_fields(d.get("fields", {}))
                if department and fdata.get("department") != department:
                    continue
                faculty_list.append(fdata)

        if not faculty_list:
            return jsonify({'error': 'No faculty found for the given filters'}), 404

        pdf_buf  = generate_department_report_pdf(department or "All Departments", faculty_list, filters)
        dept_str = department.replace(" ", "_") if department else "All"
        filename = f"Department_Report_{dept_str}_{datetime.now().strftime('%Y%m%d')}.pdf"

        return send_file(
            pdf_buf,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename,
        )
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# ---------------------------------------------------------------------------
# 🔹 Health Check
# ---------------------------------------------------------------------------
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})


# ---------------------------------------------------------------------------
# Run Server
# ---------------------------------------------------------------------------
if __name__ == '__main__':
    print("""
    ╔══════════════════════════════════════════════════════════════════╗
    ║  PBAS Server  –  Firestore REST + ReportLab PDF (VESIT branded) ║
    ╠══════════════════════════════════════════════════════════════════╣
    ║  GET  /api/fetch/<uid>                 Fetch PBAS Data           ║
    ║  GET  /api/generate/firebase/<uid>     Generate DOCX Form        ║
    ║  GET  /api/generate/pdf/<uid>          Generate Faculty PDF       ║
    ║  GET/POST /api/generate/report/department  Dept. Analytics PDF    ║
    ║  GET  /health                          Health Check               ║
    ╚══════════════════════════════════════════════════════════════════╝
    """)
    app.run(debug=True, host='0.0.0.0', port=5000)
