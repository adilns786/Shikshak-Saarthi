"""
Flask Server for PBAS Form Generation
Provides API endpoints to fill and generate PBAS forms
"""

from flask import Flask, request, jsonify, send_file
from io import BytesIO
import json
from datetime import datetime
from pbas_form_generator import PBASFormGenerator  # Import the generator class

app = Flask(__name__)

# Dummy/Template data
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

# Sample filled data for testing
SAMPLE_DATA = {
    'institute': 'ABC University, Maharashtra',
    'department': 'Computer Science',
    'faculty': 'Engineering and Technology',
    'academic_year': '2024-2025',
    'name': 'DR. RAJESH KUMAR SHARMA',
    'current_designation': 'Assistant Professor, Level 10',
    'last_promotion': '01/07/2020',
    'cas_level': 'Level 11',
    'applied_designation': 'Assistant Professor (Senior Scale), Level 12',
    'eligibility_date': '01/07/2023',
    'address': '123/45, University Campus, Thane, Maharashtra - 400601',
    'mobile': '+91-9876543210',
    'email': 'rajesh.sharma@university.edu.in',
    'qualifications': [
        {
            'examination': 'S.S.C.',
            'board': 'Maharashtra State Board',
            'year': '2000',
            'percentage': '85.60%',
            'division': 'First Class',
            'subject': 'All Subjects'
        },
        {
            'examination': 'H.S.C.',
            'board': 'Maharashtra State Board',
            'year': '2002',
            'percentage': '82.33%',
            'division': 'First Class',
            'subject': 'Science (PCM)'
        },
        {
            'examination': 'B.E.',
            'board': 'University of Mumbai',
            'year': '2006',
            'percentage': '78.45%',
            'division': 'First Class',
            'subject': 'Computer Engineering'
        },
        {
            'examination': 'M.E.',
            'board': 'University of Mumbai',
            'year': '2008',
            'percentage': '80.12%',
            'division': 'First Class with Distinction',
            'subject': 'Computer Engineering'
        }
    ],
    'research_degrees': [
        {
            'title': 'Machine Learning Applications in Network Security',
            'date': '15/03/2015',
            'university': 'ABC University'
        }
    ],
    'prior_appointments': [
        {
            'designation': 'Lecturer',
            'employer': 'XYZ College of Engineering',
            'qualifications': 'M.E. in Computer Engineering',
            'nature': 'Regular',
            'duties': 'Teaching UG & PG courses',
            'joining_date': '15/08/2008',
            'leaving_date': '30/06/2013',
            'salary': 'Level 7',
            'reason': 'Career Advancement'
        }
    ],
    'current_posts': [
        {
            'designation': 'Assistant Professor',
            'department': 'Computer Science',
            'from_date': '01/07/2013',
            'to_date': '30/06/2020',
            'grade_pay': 'Level 10'
        },
        {
            'designation': 'Assistant Professor',
            'department': 'Computer Science',
            'from_date': '01/07/2020',
            'to_date': 'Present',
            'grade_pay': 'Level 11'
        }
    ],
    'pg_experience': '16 years',
    'ug_experience': '16 years',
    'research_experience': '12 years',
    'specialization': 'Machine Learning, Artificial Intelligence, Computer Networks, Cybersecurity, Data Science',
    'courses': [
        {
            'name': 'Refresher Course in Artificial Intelligence',
            'place': 'Mumbai, Maharashtra',
            'duration': '2 weeks (10-24 Jan 2022)',
            'organizer': 'UGC-HRDC, University of Mumbai'
        },
        {
            'name': 'Faculty Development Programme on Data Science',
            'place': 'Pune, Maharashtra',
            'duration': '1 week (15-21 Jun 2023)',
            'organizer': 'AICTE Training and Learning Academy'
        },
        {
            'name': 'Online MOOC on Deep Learning Specialization',
            'place': 'Online (Coursera)',
            'duration': '3 months',
            'organizer': 'deeplearning.ai'
        }
    ],
    'teaching_data': {
        'actual_classes': '285 hours\n\n95.5%',
        'self_grading': 'Good (95.5%)',
        'verified_grading': '',
    },
    'activities_data': {
        'admin_days': '45',
        'admin_grading': 'Good (IQAC Coordinator)',
        'exam_days': '60',
        'exam_grading': 'Good',
        'student_days': '35',
        'student_grading': 'Satisfactory',
    }
}


@app.route('/')
def index():
    """Home page with API documentation"""
    return jsonify({
        'message': 'PBAS Form Generation API',
        'endpoints': {
            '/api/template': 'GET - Returns empty template structure',
            '/api/sample': 'GET - Returns sample filled data',
            '/api/generate': 'POST - Generate DOCX from provided data',
            '/api/generate/sample': 'GET - Generate DOCX with sample data',
        },
        'usage': 'POST JSON data to /api/generate to create a PBAS form'
    })


@app.route('/api/template', methods=['GET'])
def get_template():
    """Return empty template structure"""
    return jsonify(TEMPLATE_DATA)


@app.route('/api/sample', methods=['GET'])
def get_sample():
    """Return sample filled data"""
    return jsonify(SAMPLE_DATA)


@app.route('/api/generate', methods=['POST'])
def generate_form():
    """Generate PBAS form from POST data"""
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Merge with template to ensure all fields exist
        form_data = {**TEMPLATE_DATA, **data}
        
        # Generate the form
        generator = PBASFormGenerator()
        doc = generator.generate(form_data)
        
        # Save to BytesIO object
        file_stream = BytesIO()
        doc.save(file_stream)
        file_stream.seek(0)
        
        # Generate filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'PBAS_Form_{timestamp}.docx'
        
        return send_file(
            file_stream,
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            as_attachment=True,
            download_name=filename
        )
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/generate/sample', methods=['GET'])
def generate_sample_form():
    """Generate PBAS form with sample data"""
    try:
        # Generate the form with sample data
        generator = PBASFormGenerator()
        doc = generator.generate(SAMPLE_DATA)
        
        # Save to BytesIO object
        file_stream = BytesIO()
        doc.save(file_stream)
        file_stream.seek(0)
        
        filename = 'PBAS_Form_Sample.docx'
        
        return send_file(
            file_stream,
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            as_attachment=True,
            download_name=filename
        )
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/validate', methods=['POST'])
def validate_data():
    """Validate incoming data structure"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'valid': False, 'error': 'No data provided'}), 400
        
        errors = []
        warnings = []
        
        # Check required fields
        required_fields = ['name', 'department', 'institute']
        for field in required_fields:
            if not data.get(field):
                errors.append(f'Missing required field: {field}')
        
        # Check data types
        if 'qualifications' in data and not isinstance(data['qualifications'], list):
            errors.append('qualifications must be a list')
        
        if 'research_degrees' in data and not isinstance(data['research_degrees'], list):
            errors.append('research_degrees must be a list')
        
        # Warnings for optional but recommended fields
        recommended = ['email', 'mobile', 'current_designation', 'academic_year']
        for field in recommended:
            if not data.get(field):
                warnings.append(f'Recommended field missing: {field}')
        
        if errors:
            return jsonify({
                'valid': False,
                'errors': errors,
                'warnings': warnings
            }), 400
        
        return jsonify({
            'valid': True,
            'message': 'Data structure is valid',
            'warnings': warnings
        })
    
    except Exception as e:
        return jsonify({'valid': False, 'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })


if __name__ == '__main__':
    print("""
    ╔════════════════════════════════════════════════════════════╗
    ║         PBAS Form Generation Server Started                ║
    ╠════════════════════════════════════════════════════════════╣
    ║  API Endpoints:                                            ║
    ║  • GET  /                    - API Documentation           ║
    ║  • GET  /api/template        - Get empty template          ║
    ║  • GET  /api/sample          - Get sample data             ║
    ║  • POST /api/generate        - Generate form from data     ║
    ║  • GET  /api/generate/sample - Generate sample form        ║
    ║  • POST /api/validate        - Validate data structure     ║
    ║  • GET  /health              - Health check                ║
    ╠════════════════════════════════════════════════════════════╣
    ║  Quick Test:                                               ║
    ║  curl http://localhost:5000/api/generate/sample -o test.docx ║
    ╚════════════════════════════════════════════════════════════╝
    """)
    
    app.run(debug=True, host='0.0.0.0', port=5000)