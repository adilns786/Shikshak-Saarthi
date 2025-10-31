"""
Flask Server for PBAS Form Generation
Now integrated with Firebase Firestore (Darshan's actual structure)
"""

from flask import Flask, request, jsonify, send_file
from io import BytesIO
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
from pbas_form_generator import PBASFormGenerator  # your docx generator class

# ---------------------------------------------------------------------------
# Firebase Initialization
# ---------------------------------------------------------------------------
cred = credentials.Certificate("firebaseConfig.json")  # Path to your Firebase service account key
firebase_admin.initialize_app(cred)
db = firestore.client()

# ---------------------------------------------------------------------------
# Flask App
# ---------------------------------------------------------------------------
app = Flask(__name__)

# ---------------------------------------------------------------------------
# Template Structure
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
# 🔸 Fetch PBAS data from Firestore (as per actual structure)
# ---------------------------------------------------------------------------
@app.route('/api/fetch/<uid>', methods=['GET'])
def fetch_from_firestore(uid):
    """Fetch faculty PBAS data from Firestore and map it to template structure"""
    try:
        doc_ref = db.collection("users").document(uid)
        doc = doc_ref.get()

        if not doc.exists:
            return jsonify({'error': f'No user found for UID: {uid}'}), 404

        user_data = doc.to_dict()
        form_header = user_data.get('formHeader', {})

        # Map Firestore data → PBAS template fields
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
# 🔸 Generate PBAS Form from Firestore Data
# ---------------------------------------------------------------------------
@app.route('/api/generate/firebase/<uid>', methods=['GET'])
def generate_from_firestore(uid):
    """Fetch faculty PBAS data from Firestore and generate PBAS DOCX"""
    try:
        doc_ref = db.collection("users").document(uid)
        doc = doc_ref.get()

        if not doc.exists:
            return jsonify({'error': f'No data found for UID: {uid}'}), 404

        user_data = doc.to_dict()
        form_header = user_data.get('formHeader', {})

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

        generator = PBASFormGenerator()
        docx = generator.generate(form_data)

        file_stream = BytesIO()
        docx.save(file_stream)
        file_stream.seek(0)

        filename = f"PBAS_Form_{uid}.docx"
        file_path = "generated_forms/PBAS_Form.docx"

        return send_file(
            file_stream,
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ---------------------------------------------------------------------------
# Health Check
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
    ║   PBAS Form Generation Server (VESIT Firestore Integrated) ║
    ╠════════════════════════════════════════════════════════════╣
    ║  Endpoints:                                                ║
    ║  • GET  /api/fetch/<uid>             → Fetch PBAS Data      ║
    ║  • GET  /api/generate/firebase/<uid> → Generate DOCX Form   ║
    ║  • GET  /health                      → Health Check          ║
    ╚════════════════════════════════════════════════════════════╝
    """)
    app.run(debug=True, host='0.0.0.0', port=5000)
