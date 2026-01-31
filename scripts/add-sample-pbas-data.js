/**
 * Add Sample PBAS Data to Firebase Users
 * Run with: node scripts/add-sample-pbas-data.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

// Firebase config (from your firebaseConfig.js)
const firebaseConfig = {
  apiKey: "AIzaSyDGQBmII23F0_FcapkfbkYlRPvPsWF0AoI",
  authDomain: "shikshak-sarthi.firebaseapp.com",
  projectId: "shikshak-sarthi",
  storageBucket: "shikshak-sarthi.firebasestorage.app",
  messagingSenderId: "288398474610",
  appId: "1:288398474610:web:2f6b5130055b0a3b821cd2",
  measurementId: "G-9WX81T1H88"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample PBAS data
const sampleData = {
  part_b: {
    invited_lectures: [
      {
        title: "Advances in Machine Learning for Healthcare",
        organizer: "IEEE Computer Society",
        venue: "Mumbai, India",
        date: "2024-03-15",
        type: "Invited Talk"
      },
      {
        title: "Deep Learning Applications in Computer Vision",
        organizer: "VESIT",
        venue: "Online",
        date: "2024-08-20",
        type: "Keynote"
      },
      {
        title: "Blockchain Technology in Education",
        organizer: "ACM India",
        venue: "Bangalore",
        date: "2023-11-10",
        type: "Workshop"
      }
    ],
    patents_policy_awards: [
      {
        title: "AI-Based Automated Attendance System",
        category: "Patent",
        status: "Filed",
        year: "2024",
        recognition: "Government of India - IPO",
        application_no: "202411012345",
        score: "10"
      },
      {
        title: "Smart Classroom Management System",
        category: "Patent",
        status: "Granted",
        year: "2023",
        recognition: "Government of India - IPO",
        patent_no: "IN456789",
        score: "15"
      },
      {
        title: "Best Teacher Award",
        category: "Award",
        status: "Received",
        year: "2024",
        recognition: "VESIT",
        remarks: "Excellence in Teaching"
      }
    ],
    table2: {
      publications: [
        {
          title: "Introduction to Artificial Intelligence",
          type: "Book",
          authorship: "Co-Author",
          publisher: "Pearson Education",
          isbn: "978-93-5342-714-3",
          year: 2024,
          pages: "450"
        },
        {
          title: "Machine Learning Fundamentals",
          type: "Book Chapter",
          authorship: "Sole Author",
          publisher: "Springer",
          isbn: "978-3-030-12345-6",
          year: 2023,
          pages: "25"
        }
      ],
      researchPapers: [
        {
          title: "Deep Learning Based Image Classification for Medical Diagnosis",
          authors: "D. Khapekar, R. Sharma, A. Patel",
          journal: "IEEE Transactions on Medical Imaging",
          year: 2024,
          volume: "43",
          issue: "2",
          pages: "234-245",
          doi: "10.1109/TMI.2024.12345",
          indexed: "SCI",
          impact_factor: "11.037"
        },
        {
          title: "Natural Language Processing for Educational Assessment",
          authors: "D. Khapekar, N. Giri",
          journal: "International Journal of Artificial Intelligence in Education",
          year: 2023,
          volume: "33",
          issue: "4",
          pages: "567-589",
          doi: "10.1007/s40593-023-12345",
          indexed: "Scopus",
          impact_factor: "7.652"
        },
        {
          title: "Blockchain Technology in Academic Credential Verification",
          authors: "D. Khapekar, M. Kumar, S. Singh",
          conference: "International Conference on Computer Science and Engineering",
          year: 2024,
          pages: "123-130",
          doi: "10.1109/ICCSE.2024.12345",
          indexed: "IEEE Xplore"
        },
        {
          title: "IoT-Based Smart Campus Management System",
          authors: "D. Khapekar",
          conference: "ACM International Conference on Smart Systems",
          year: 2023,
          pages: "45-52",
          doi: "10.1145/3512345.3512456",
          indexed: "ACM Digital Library"
        }
      ],
      researchProjects: [
        {
          title: "AI-Driven Personalized Learning Platform",
          funding_agency: "AICTE",
          amount: "500000",
          duration: "2 years",
          role: "Principal Investigator",
          status: "Ongoing",
          start_date: "2023-06-01",
          end_date: "2025-05-31"
        },
        {
          title: "Smart City Infrastructure Using IoT",
          funding_agency: "DST",
          amount: "1200000",
          duration: "3 years",
          role: "Co-Investigator",
          status: "Completed",
          start_date: "2021-01-01",
          end_date: "2023-12-31"
        }
      ],
      consultancyProjects: [
        {
          title: "AI Chatbot Development for E-commerce",
          organization: "TechCorp Solutions Pvt Ltd",
          amount: "250000",
          duration: "6 months",
          year: "2024",
          role: "Technical Consultant"
        },
        {
          title: "Data Analytics Dashboard for Healthcare",
          organization: "MediHealth Systems",
          amount: "180000",
          duration: "4 months",
          year: "2023",
          role: "Lead Developer"
        }
      ],
      ictInnovations: [
        {
          title: "Online Assessment Platform with Anti-Cheating Mechanisms",
          description: "Developed a comprehensive platform for conducting secure online exams",
          year: "2024",
          impact: "Used by 500+ students"
        },
        {
          title: "Student Performance Analytics System",
          description: "Predictive analytics system for early identification of at-risk students",
          year: "2023",
          impact: "Implemented college-wide"
        }
      ],
      researchGuidance: [
        {
          student_name: "Rahul Sharma",
          level: "M.Tech",
          title: "Deep Learning for Anomaly Detection",
          status: "Ongoing",
          year: "2024"
        },
        {
          student_name: "Priya Desai",
          level: "Ph.D.",
          title: "Federated Learning in Healthcare",
          status: "Ongoing",
          year: "2023"
        },
        {
          student_name: "Amit Verma",
          level: "M.Tech",
          title: "Blockchain in Supply Chain",
          status: "Completed",
          year: "2023"
        },
        {
          student_name: "Sneha Patel",
          level: "M.Tech",
          title: "Natural Language Processing for Sentiment Analysis",
          status: "Completed",
          year: "2022"
        },
        {
          student_name: "Vikram Singh",
          level: "Ph.D.",
          title: "Computer Vision for Medical Diagnostics",
          status: "Ongoing",
          year: "2022"
        }
      ]
    }
  },
  part_a: {
    academic_qualifications: [
      {
        examination: "S.S.C.",
        board_university: "Maharashtra State Board",
        year_passing: "2010",
        percentage: "88.50",
        class_division: "Distinction",
        subject: "All Subjects"
      },
      {
        examination: "H.S.C.",
        board_university: "Maharashtra State Board",
        year_passing: "2012",
        percentage: "85.20",
        class_division: "First Class",
        subject: "Science (PCM)"
      },
      {
        examination: "B.E.",
        board_university: "University of Mumbai",
        year_passing: "2016",
        percentage: "78.45",
        class_division: "First Class with Distinction",
        subject: "Computer Engineering"
      },
      {
        examination: "M.E./M.Tech",
        board_university: "IIT Bombay",
        year_passing: "2018",
        percentage: "82.67",
        class_division: "First Class",
        subject: "Computer Science & Engineering"
      }
    ],
    research_degrees: [
      {
        degree: "Ph.D.",
        title: "Deep Learning Approaches for Medical Image Analysis",
        date_of_award: "2022-06-15",
        university: "University of Mumbai",
        supervisor: "Dr. Rajesh Kumar"
      }
    ],
    employment: {
      prior: [
        {
          designation: "Junior Research Fellow",
          employer: "IIT Bombay",
          qualifications: "M.Tech in CSE",
          nature: "Contract",
          duties: "Research and Development",
          joining_date: "2018-08-01",
          leaving_date: "2020-07-31",
          salary: "₹31,000 per month",
          reason: "Joined for Higher Studies"
        }
      ],
      posts: [
        {
          designation: "Assistant Professor",
          department: "Computer Engineering",
          joining_date: "2020-08-01",
          grade_pay: "Level 10 (₹57,700-1,82,400)"
        }
      ]
    },
    personal_in: {
      address: "Plot No. 45, Sector 7, Nerul, Navi Mumbai, Maharashtra - 400706",
      current_designation: "Assistant Professor",
      date_eligibility: "2023-08-01",
      date_last_promotion: "2020-08-01",
      department: "Computer",
      designation_applied: "Assistant Professor (Senior Scale)",
      email: "d2022.darshan.khapekar@ves.ac.in",
      level_cas: "Stage 1 (Level 10 to Level 11)",
      name: "Dr. Darshan Khapekar",
      telephone: "9876543210"
    },
    teaching_research_experience: {
      pg_years: "4",
      ug_years: "4",
      research_years: "6",
      specialization: "Artificial Intelligence, Machine Learning, Computer Vision, Deep Learning"
    },
    courses_fdp: [
      {
        name: "Faculty Development Program on AI and ML",
        organizer: "IIT Bombay",
        duration: "2 weeks",
        place: "Mumbai",
        date: "2024-05-10"
      },
      {
        name: "Workshop on Research Methodology",
        organizer: "AICTE",
        duration: "1 week",
        place: "Online",
        date: "2023-09-15"
      },
      {
        name: "NPTEL Course: Deep Learning",
        organizer: "IIT Madras",
        duration: "12 weeks",
        place: "Online",
        date: "2023-01-20"
      },
      {
        name: "International Conference on AI and ML",
        organizer: "Springer",
        duration: "3 days",
        place: "Singapore",
        date: "2023-12-05"
      },
      {
        name: "Python for Data Science Workshop",
        organizer: "VESIT",
        duration: "1 week",
        place: "Mumbai",
        date: "2024-02-10"
      }
    ],
    teaching_student_assessment: {
      teaching: [
        {
          activity_name: "Data Structures and Algorithms",
          category: "Theory",
          unit_of_calculation: "Hours",
          actual_class_spent: "60",
          percent_teaching: "95",
          self_appraisal: "Excellent",
          verified_grading: "Very Good"
        },
        {
          activity_name: "Machine Learning",
          category: "Theory",
          unit_of_calculation: "Hours",
          actual_class_spent: "45",
          percent_teaching: "90",
          self_appraisal: "Very Good",
          verified_grading: "Very Good"
        },
        {
          activity_name: "Database Management Systems Lab",
          category: "Practical",
          unit_of_calculation: "Hours",
          actual_class_spent: "30",
          percent_teaching: "92",
          self_appraisal: "Excellent",
          verified_grading: "Good"
        }
      ],
      activities: [
        {
          activity_category: "Departmental",
          description: "Organized Technical Symposium 'TechFest 2024'",
          total_days: "5",
          self_appraisal: "Excellent",
          verified_grading: "Excellent"
        },
        {
          activity_category: "College",
          description: "Member of Admission Committee",
          total_days: "10",
          self_appraisal: "Very Good",
          verified_grading: "Good"
        },
        {
          activity_category: "Examination",
          description: "Paper Setting and Evaluation for University Exams",
          total_days: "15",
          self_appraisal: "Good",
          verified_grading: "Good"
        },
        {
          activity_category: "Student Activities",
          description: "Faculty Coordinator for NSS Activities",
          total_days: "8",
          self_appraisal: "Very Good",
          verified_grading: "Very Good"
        }
      ]
    }
  },
};

async function addSampleData() {
  try {
    console.log('🔍 Looking for dev users...\n');

    // Find the faculty user
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', 'd2022.darshan.khapekar@ves.ac.in'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('❌ User d2022.darshan.khapekar@ves.ac.in not found!');
      console.log('Please create the user first using /admin/create-dev-users');
      process.exit(1);
    }

    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();

    console.log('✅ Found user:', userData.name || userData.email);
    console.log('📝 User ID:', userId);
    console.log('\n📊 Adding sample PBAS data...\n');

    // Update the user with sample data
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, sampleData);

    console.log('✅ Successfully added sample data!\n');
    console.log('📈 Data Summary:');
    console.log(`   • Academic Qualifications: ${sampleData.part_a.academic_qualifications.length}`);
    console.log(`   • Research Degrees: ${sampleData.part_a.research_degrees.length}`);
    console.log(`   • Prior Appointments: ${sampleData.part_a.employment.prior.length}`);
    console.log(`   • Current Posts: ${sampleData.part_a.employment.posts.length}`);
    console.log(`   • Research Papers: ${sampleData.part_b.table2.researchPapers.length}`);
    console.log(`   • Publications: ${sampleData.part_b.table2.publications.length}`);
    console.log(`   • Patents & Awards: ${sampleData.part_b.patents_policy_awards.length}`);
    console.log(`   • Invited Lectures: ${sampleData.part_b.invited_lectures.length}`);
    console.log(`   • Research Projects: ${sampleData.part_b.table2.researchProjects.length}`);
    console.log(`   • Consultancy Projects: ${sampleData.part_b.table2.consultancyProjects.length}`);
    console.log(`   • ICT Innovations: ${sampleData.part_b.table2.ictInnovations.length}`);
    console.log(`   • Research Guidance: ${sampleData.part_b.table2.researchGuidance.length}`);
    console.log(`   • FDP/Courses: ${sampleData.part_a.courses_fdp.length}`);
    console.log(`   • Teaching Activities: ${sampleData.part_a.teaching_student_assessment.teaching.length}`);
    console.log(`   • Other Activities: ${sampleData.part_a.teaching_student_assessment.activities.length}`);
    
    console.log('\n🎉 Done! Login to see the updated dashboard.');
    console.log('   Email: d2022.darshan.khapekar@ves.ac.in');
    console.log('   Password: 123456789\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addSampleData();
