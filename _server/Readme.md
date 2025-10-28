# PBAS Form Generator - Complete Setup Guide

## 📋 Overview

This system generates **PBAS-S2 (Performance Based Appraisal System)** forms programmatically in DOCX format with exact styling, formatting, tables, and structure as per the original template.

## 🚀 Installation

### Prerequisites

```bash
pip install python-docx flask
```

### File Structure

```
pbas_project/
│
├── pbas_form_generator.py    # Core generator class
├── flask_server.py            # Flask API server
├── requirements.txt           # Dependencies
└── README.md                  # This file
```

### requirements.txt

```
python-docx>=0.8.11
Flask>=2.3.0
```

## 🎯 Usage

### Method 1: Direct Python Usage

```python
from pbas_form_generator import PBASFormGenerator

# Your data
data = {
    'institute': 'ABC University',
    'department': 'Computer Science',
    'name': 'DR. JOHN DOE',
    'email': 'john@university.edu',
    # ... add more fields
}

# Generate form
generator = PBASFormGenerator()
generator.generate(data)
generator.save('output.docx')
```

### Method 2: Flask Server (Recommended)

#### Start the Server

```bash
python flask_server.py
```

Server will start on `http://localhost:5000`

#### API Endpoints

##### 1. Get Template Structure
```bash
curl http://localhost:5000/api/template
```

##### 2. Get Sample Data
```bash
curl http://localhost:5000/api/sample
```

##### 3. Generate Form with Sample Data
```bash
curl http://localhost:5000/api/generate/sample -o sample_pbas.docx
```

##### 4. Generate Form with Your Data
```bash
curl -X POST http://localhost:5000/api/generate \
  -H "Content-Type: application/json" \
  -d @your_data.json \
  -o custom_pbas.docx
```

##### 5. Validate Your Data
```bash
curl -X POST http://localhost:5000/api/validate \
  -H "Content-Type: application/json" \
  -d @your_data.json
```

## 📝 Data Structure

### Complete JSON Structure

```json
{
  "institute": "University Name",
  "department": "Department Name",
  "faculty": "Faculty Name",
  "academic_year": "2024-2025",
  "name": "DR. FULL NAME",
  "current_designation": "Assistant Professor, Level 10",
  "last_promotion": "01/07/2020",
  "cas_level": "Level 11",
  "applied_designation": "Assistant Professor (Senior Scale)",
  "eligibility_date": "01/07/2023",
  "address": "Full Address with Pin",
  "mobile": "+91-XXXXXXXXXX",
  "email": "email@university.edu",
  
  "qualifications": [
    {
      "examination": "S.S.C.",
      "board": "Board Name",
      "year": "2000",
      "percentage": "85%",
      "division": "First",
      "subject": "All Subjects"
    }
  ],
  
  "research_degrees": [
    {
      "title": "Thesis Title",
      "date": "15/03/2015",
      "university": "University Name"
    }
  ],
  
  "prior_appointments": [
    {
      "designation": "Lecturer",
      "employer": "College Name",
      "qualifications": "M.E.",
      "nature": "Regular",
      "duties": "Teaching",
      "joining_date": "01/08/2008",
      "leaving_date": "30/06/2013",
      "salary": "Level 7",
      "reason": "Career Growth"
    }
  ],
  
  "current_posts": [
    {
      "designation": "Assistant Professor",
      "department": "Computer Science",
      "from_date": "01/07/2013",
      "to_date": "Present",
      "grade_pay": "Level 10"
    }
  ],
  
  "pg_experience": "11 years",
  "ug_experience": "11 years",
  "research_experience": "8 years",
  "specialization": "AI, ML, Data Science",
  
  "courses": [
    {
      "name": "Course Name",
      "place": "Location",
      "duration": "2 weeks",
      "organizer": "Organizer Name"
    }
  ],
  
  "teaching_data": {
    "actual_classes": "240 hours\n\n95%",
    "self_grading": "Good",
    "verified_grading": ""
  },
  
  "activities_data": {
    "admin_days": "30",
    "admin_grading": "Good",
    "exam_days": "45",
    "exam_grading": "Good",
    "student_days": "25",
    "student_grading": "Satisfactory"
  }
}
```

## 🔧 Advanced Usage

### Python Script Example

```python
#!/usr/bin/env python3
"""
Generate PBAS forms from CSV or database
"""

import csv
from pbas_form_generator import PBASFormGenerator

def generate_from_csv(csv_file):
    """Generate PBAS forms for multiple teachers from CSV"""
    
    with open(csv_file, 'r') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            data = {
                'name': row['name'],
                'department': row['department'],
                'email': row['email'],
                # Map CSV columns to data structure
            }
            
            generator = PBASFormGenerator()
            generator.generate(data)
            
            filename = f"PBAS_{row['name'].replace(' ', '_')}.docx"
            generator.save(filename)
            print(f"Generated: {filename}")

if __name__ == '__main__':
    generate_from_csv('teachers.csv')
```

### Using with Web Form

```html
<!DOCTYPE html>
<html>
<head>
    <title>PBAS Form Generator</title>
</head>
<body>
    <h1>Generate PBAS Form</h1>
    <form id="pbasForm">
        <input type="text" name="name" placeholder="Full Name" required>
        <input type="text" name="department" placeholder="Department" required>
        <input type="email" name="email" placeholder="Email" required>
        <button type="submit">Generate Form</button>
    </form>

    <script>
        document.getElementById('pbasForm').onsubmit = async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            const response = await fetch('http://localhost:5000/api/generate', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'PBAS_Form.docx';
            a.click();
        };
    </script>
</body>
</html>
```

## 🎨 Customization

### Modify Styling

```python
# In pbas_form_generator.py

def add_title(self):
    title = self.doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    run = title.add_run('Your Custom Title')
    run.bold = True
    run.font.size = Pt(16)  # Change size
    run.font.color.rgb = RGBColor(0, 0, 255)  # Change color
```

### Add New Fields

```python
def add_custom_field(self, data):
    p = self.doc.add_paragraph()
    p.add_run('Custom Field: ').bold = True
    p.add_run(data.get('custom_field', ''))

# Then call in generate()
def generate(self, data):
    # ... existing code ...
    self.add_custom_field(data)
    # ... rest of code ...
```

## 🧪 Testing

```bash
# Test with sample data
curl http://localhost:5000/api/generate/sample -o test.docx

# Validate data before generating
curl -X POST http://localhost:5000/api/validate \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","department":"CS"}'

# Health check
curl http://localhost:5000/health
```

## 📊 Features

✅ Exact replica of original PBAS-S2 format  
✅ Maintains all styling (bold, underline, italics)  
✅ Complex tables with merged cells  
✅ Multiple sections (Part A & Part B)  
✅ Flexible data structure  
✅ RESTful API interface  
✅ Data validation  
✅ Batch processing support  
✅ Easy integration with existing systems  

## 🐛 Troubleshooting

### Issue: Module not found
```bash
pip install python-docx flask
```

### Issue: Port already in use
```python
# Change port in flask_server.py
app.run(debug=True, host='0.0.0.0', port=5001)
```

### Issue: Table formatting issues
Make sure you're using `python-docx` version 0.8.11 or higher

## 📄 License

Free to use for educational and institutional purposes.

## 🤝 Contributing

Feel free to extend and customize based on your institution's requirements!

---

**Generated with ❤️ for Academic Institutions**