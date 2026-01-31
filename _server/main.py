"""
Flask Server for PBAS Form Generation (No Firebase Admin)
Using Firebase Firestore REST API (Read-only)
"""

from flask import Flask, jsonify, send_file
from flask_cors import CORS
from io import BytesIO
from datetime import datetime
import requests
from pbas_form_generator import PBASFormGenerator  # your DOCX generator class

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
    ╔════════════════════════════════════════════════════════════╗
    ║   PBAS Form Generation Server (Firestore REST Integration)  ║
    ╠════════════════════════════════════════════════════════════╣
    ║  Endpoints:                                                ║
    ║  • GET  /api/fetch/<uid>             → Fetch PBAS Data      ║
    ║  • GET  /api/generate/firebase/<uid> → Generate DOCX Form   ║
    ║  • GET  /health                      → Health Check          ║
    ╚════════════════════════════════════════════════════════════╝
    """)
    app.run(debug=True, host='0.0.0.0', port=5000)
