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
    'qualifications': [],
    'research_degrees': [],
    'prior_appointments': [],
    'current_posts': [],
    'pg_experience': '',
    'ug_experience': '',
    'research_experience': '',
    'specialization': '',
    'courses': [],
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
def parse_firestore_fields(fields):
    parsed = {}
    for k, v in fields.items():
        # Firestore stores values in typed keys (e.g. stringValue, integerValue)
        if isinstance(v, dict):
            parsed[k] = next(iter(v.values()))
        else:
            parsed[k] = v
    return parsed


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

        form_header = user_data.get('formHeader', {})
        if isinstance(form_header, dict):
            form_header = parse_firestore_fields(form_header)

        # Merge into PBAS template
        merged_data = {
            **TEMPLATE_DATA,
            'institute': form_header.get('institute_name', ''),
            'department': form_header.get('department_name', user_data.get('department', '')),
            'faculty': form_header.get('faculty_name', ''),
            'academic_year': form_header.get('academic_year', ''),
            'name': user_data.get('name', ''),
            'cas_level': form_header.get('cas_promotion_stage', ''),
            'email': user_data.get('email', ''),
        }

        return jsonify(merged_data)

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

        form_header = user_data.get('formHeader', {})
        if isinstance(form_header, dict):
            form_header = parse_firestore_fields(form_header)

        # Prepare DOCX data
        form_data = {
            **TEMPLATE_DATA,
            'institute': form_header.get('institute_name', ''),
            'department': form_header.get('department_name', user_data.get('department', '')),
            'faculty': form_header.get('faculty_name', ''),
            'academic_year': form_header.get('academic_year', ''),
            'name': user_data.get('name', ''),
            'cas_level': form_header.get('cas_promotion_stage', ''),
            'email': user_data.get('email', ''),
        }

        # Generate DOCX
        generator = PBASFormGenerator()
        docx = generator.generate(form_data)

        # Save to memory
        file_stream = BytesIO()
        docx.save(file_stream)
        file_stream.seek(0)

        filename = f"PBAS_Form_{uid}.docx"
        return send_file(
            file_stream,
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            as_attachment=True,
            download_name=filename
        )

    except Exception as e:
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
