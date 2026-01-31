/**
 * Generate Complete Data for All Users (Faculty, HOD, Admin)
 * Run with: node scripts/generate-all-users-data.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';

// Firebase config
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

// Generate random data helpers
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomYear = () => getRandomInt(2020, 2024);

const departments = ['Computer', 'Electronics', 'Mechanical', 'Civil', 'IT'];
const journals = [
  'IEEE Transactions on Pattern Analysis and Machine Intelligence',
  'Nature Machine Intelligence',
  'Journal of Machine Learning Research',
  'ACM Computing Surveys',
  'International Journal of Computer Vision'
];

const conferences = [
  'IEEE International Conference on Computer Vision',
  'NeurIPS - Neural Information Processing Systems',
  'ICML - International Conference on Machine Learning',
  'ACM SIGKDD Conference on Knowledge Discovery'
];

const publishers = ['Springer', 'Wiley', 'Pearson', 'McGraw-Hill', 'Cambridge University Press'];
const fundingAgencies = ['AICTE', 'DST', 'UGC', 'DRDO', 'ISRO'];

function generateResearchPapers(count, name) {
  const papers = [];
  for (let i = 0; i < count; i++) {
    const isJournal = Math.random() > 0.4;
    papers.push({
      title: `Research Paper ${i + 1} on Advanced Computing`,
      authors: `${name}, Co-Author ${i + 1}`,
      journal: isJournal ? journals[getRandomInt(0, journals.length - 1)] : conferences[getRandomInt(0, conferences.length - 1)],
      year: getRandomYear(),
      volume: isJournal ? String(getRandomInt(10, 50)) : '',
      issue: isJournal ? String(getRandomInt(1, 12)) : '',
      pages: `${getRandomInt(100, 500)}-${getRandomInt(501, 600)}`,
      doi: `10.1109/${Math.random().toString(36).substr(2, 9)}`,
      indexed: isJournal ? (Math.random() > 0.5 ? 'SCI' : 'Scopus') : 'IEEE Xplore',
      impact_factor: isJournal ? (Math.random() * 10 + 2).toFixed(3) : ''
    });
  }
  return papers;
}

function generatePublications(count) {
  const pubs = [];
  for (let i = 0; i < count; i++) {
    const isBook = Math.random() > 0.6;
    pubs.push({
      title: isBook ? `Book on ${['AI', 'ML', 'Data Science', 'IoT'][getRandomInt(0, 3)]}` : `Chapter on Advanced Topics`,
      type: isBook ? 'Book' : 'Book Chapter',
      authorship: Math.random() > 0.5 ? 'Sole Author' : 'Co-Author',
      publisher: publishers[getRandomInt(0, publishers.length - 1)],
      isbn: `978-${getRandomInt(1000000000, 9999999999)}`,
      year: getRandomYear(),
      pages: String(getRandomInt(20, 500))
    });
  }
  return pubs;
}

function generatePatentsAwards(count) {
  const items = [];
  for (let i = 0; i < count; i++) {
    const isPatent = Math.random() > 0.3;
    items.push({
      title: isPatent ? `Patent ${i + 1} on Innovation` : `Award ${i + 1} for Excellence`,
      category: isPatent ? 'Patent' : 'Award',
      status: isPatent ? (Math.random() > 0.5 ? 'Filed' : 'Granted') : 'Received',
      year: String(getRandomYear()),
      recognition: isPatent ? 'Government of India - IPO' : ['Institution', 'State', 'National'][getRandomInt(0, 2)],
      application_no: isPatent ? `${getRandomYear()}${getRandomInt(10000000, 99999999)}` : '',
      score: String(getRandomInt(10, 20))
    });
  }
  return items;
}

function generateLectures(count) {
  const lectures = [];
  for (let i = 0; i < count; i++) {
    lectures.push({
      title: `Invited Talk ${i + 1} on Emerging Technologies`,
      organizer: ['IEEE', 'ACM', 'Institution', 'Industry Partner'][getRandomInt(0, 3)],
      venue: ['Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Online'][getRandomInt(0, 4)],
      date: `${getRandomYear()}-${String(getRandomInt(1, 12)).padStart(2, '0')}-${String(getRandomInt(1, 28)).padStart(2, '0')}`,
      type: ['Invited Talk', 'Keynote', 'Workshop', 'Seminar'][getRandomInt(0, 3)]
    });
  }
  return lectures;
}

function generateProjects(count) {
  const projects = [];
  for (let i = 0; i < count; i++) {
    projects.push({
      title: `Research Project ${i + 1} on Advanced Computing`,
      funding_agency: fundingAgencies[getRandomInt(0, fundingAgencies.length - 1)],
      amount: String(getRandomInt(300000, 2000000)),
      duration: `${getRandomInt(1, 3)} years`,
      role: Math.random() > 0.5 ? 'Principal Investigator' : 'Co-Investigator',
      status: Math.random() > 0.5 ? 'Ongoing' : 'Completed',
      start_date: `${getRandomYear() - 1}-01-01`,
      end_date: `${getRandomYear() + 1}-12-31`
    });
  }
  return projects;
}

function generateGuidance(count, name) {
  const guidance = [];
  const studentNames = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anita', 'Kiran', 'Deepak'];
  for (let i = 0; i < count; i++) {
    guidance.push({
      student_name: `${studentNames[getRandomInt(0, studentNames.length - 1)]} ${['Sharma', 'Patel', 'Singh', 'Kumar'][getRandomInt(0, 3)]}`,
      level: Math.random() > 0.6 ? 'Ph.D.' : 'M.Tech',
      title: `Research on ${['AI', 'ML', 'Blockchain', 'IoT', 'Cloud Computing'][getRandomInt(0, 4)]}`,
      status: Math.random() > 0.5 ? 'Ongoing' : 'Completed',
      year: String(getRandomYear())
    });
  }
  return guidance;
}

function generateCompleteData(name, department, role) {
  const paperCount = getRandomInt(3, 8);
  const pubCount = getRandomInt(1, 3);
  const patentCount = getRandomInt(2, 5);
  
  return {
    formHeader: {
      institute_name: "Vivekanand Education Society's Institute of Technology",
      department_name: department,
      faculty_name: "Faculty of Engineering and Technology",
      academic_year: "2025-26",
      cas_promotion_stage: role === 'hod' ? 'Stage 2 (Senior Scale)' : 'Stage 1'
    },
    part_a: {
      academic_qualifications: [
        {
          examination: "S.S.C.",
          board_university: "Maharashtra State Board",
          year_passing: String(getRandomInt(2005, 2010)),
          percentage: (Math.random() * 10 + 85).toFixed(2),
          class_division: "Distinction",
          subject: "All Subjects"
        },
        {
          examination: "H.S.C.",
          board_university: "Maharashtra State Board",
          year_passing: String(getRandomInt(2010, 2012)),
          percentage: (Math.random() * 10 + 80).toFixed(2),
          class_division: "First Class",
          subject: "Science (PCM)"
        },
        {
          examination: "B.E.",
          board_university: "University of Mumbai",
          year_passing: String(getRandomInt(2012, 2016)),
          percentage: (Math.random() * 10 + 75).toFixed(2),
          class_division: "First Class with Distinction",
          subject: `${department} Engineering`
        },
        {
          examination: "M.E./M.Tech",
          board_university: ["IIT Bombay", "IIT Delhi", "University of Mumbai"][getRandomInt(0, 2)],
          year_passing: String(getRandomInt(2016, 2018)),
          percentage: (Math.random() * 10 + 78).toFixed(2),
          class_division: "First Class",
          subject: `${department} Engineering`
        }
      ],
      research_degrees: role !== 'faculty' ? [
        {
          degree: "Ph.D.",
          title: `Advanced Research in ${department} Engineering`,
          date_of_award: `${getRandomInt(2019, 2022)}-06-15`,
          university: "University of Mumbai",
          supervisor: "Dr. Research Supervisor"
        }
      ] : [],
      employment: {
        prior: [
          {
            designation: "Junior Research Fellow",
            employer: "IIT Bombay",
            qualifications: "M.Tech",
            nature: "Contract",
            duties: "Research and Development",
            joining_date: `${getRandomInt(2018, 2019)}-08-01`,
            leaving_date: `${getRandomInt(2020, 2021)}-07-31`,
            salary: "₹31,000 per month",
            reason: "Career Advancement"
          }
        ],
        posts: [
          {
            designation: role === 'hod' ? 'Head of Department' : 'Assistant Professor',
            department: department,
            joining_date: `${getRandomInt(2020, 2021)}-08-01`,
            grade_pay: role === 'hod' ? 'Level 12' : 'Level 10'
          }
        ]
      },
      personal_in: {
        address: `${getRandomInt(1, 100)}, Sector ${getRandomInt(1, 20)}, ${['Nerul', 'Vashi', 'Belapur'][getRandomInt(0, 2)]}, Navi Mumbai - 400${getRandomInt(600, 800)}`,
        current_designation: role === 'hod' ? 'Head of Department' : 'Assistant Professor',
        date_eligibility: `${getRandomInt(2023, 2024)}-08-01`,
        date_last_promotion: `${getRandomInt(2020, 2022)}-08-01`,
        department: department,
        designation_applied: role === 'hod' ? 'Professor' : 'Assistant Professor (Senior Scale)',
        email: name.toLowerCase().replace(/\s/g, '.') + '@ves.ac.in',
        level_cas: role === 'hod' ? 'Stage 2' : 'Stage 1',
        name: name,
        telephone: `98${getRandomInt(10000000, 99999999)}`
      },
      teaching_research_experience: {
        pg_years: String(getRandomInt(3, 8)),
        ug_years: String(getRandomInt(3, 8)),
        research_years: String(getRandomInt(2, 10)),
        specialization: `${department} Engineering, AI, Machine Learning`
      },
      courses_fdp: Array.from({ length: getRandomInt(3, 6) }, (_, i) => ({
        name: `Professional Development Course ${i + 1}`,
        organizer: ['IIT Bombay', 'AICTE', 'NPTEL', 'Industry Partner'][getRandomInt(0, 3)],
        duration: `${getRandomInt(1, 12)} ${Math.random() > 0.5 ? 'weeks' : 'days'}`,
        place: ['Mumbai', 'Online', 'Pune', 'Bangalore'][getRandomInt(0, 3)],
        date: `${getRandomYear()}-${String(getRandomInt(1, 12)).padStart(2, '0')}-${String(getRandomInt(1, 28)).padStart(2, '0')}`
      })),
      teaching_student_assessment: {
        teaching: Array.from({ length: getRandomInt(2, 4) }, (_, i) => ({
          activity_name: `Subject ${i + 1}`,
          category: Math.random() > 0.5 ? 'Theory' : 'Practical',
          unit_of_calculation: 'Hours',
          actual_class_spent: String(getRandomInt(40, 80)),
          percent_teaching: String(getRandomInt(85, 98)),
          self_appraisal: ['Excellent', 'Very Good', 'Good'][getRandomInt(0, 2)],
          verified_grading: ['Excellent', 'Very Good', 'Good'][getRandomInt(0, 2)]
        })),
        activities: Array.from({ length: getRandomInt(3, 5) }, (_, i) => ({
          activity_category: ['Departmental', 'College', 'Examination', 'Student Activities'][getRandomInt(0, 3)],
          description: `Activity ${i + 1} Description`,
          total_days: String(getRandomInt(5, 20)),
          self_appraisal: ['Excellent', 'Very Good', 'Good'][getRandomInt(0, 2)],
          verified_grading: ['Excellent', 'Very Good', 'Good'][getRandomInt(0, 2)]
        }))
      }
    },
    part_b: {
      invited_lectures: generateLectures(getRandomInt(2, 5)),
      patents_policy_awards: generatePatentsAwards(patentCount),
      table2: {
        publications: generatePublications(pubCount),
        researchPapers: generateResearchPapers(paperCount, name),
        researchProjects: generateProjects(getRandomInt(1, 3)),
        consultancyProjects: Array.from({ length: getRandomInt(1, 2) }, (_, i) => ({
          title: `Consultancy Project ${i + 1}`,
          organization: `Company ${i + 1} Pvt Ltd`,
          amount: String(getRandomInt(150000, 500000)),
          duration: `${getRandomInt(3, 12)} months`,
          year: String(getRandomYear()),
          role: 'Technical Consultant'
        })),
        ictInnovations: Array.from({ length: getRandomInt(1, 3) }, (_, i) => ({
          title: `ICT Innovation ${i + 1}`,
          description: `Description of innovation ${i + 1}`,
          year: String(getRandomYear()),
          impact: `Impacted ${getRandomInt(100, 1000)}+ users`
        })),
        researchGuidance: generateGuidance(getRandomInt(2, 6), name)
      }
    }
  };
}

async function generateAllUsersData() {
  try {
    console.log('🔍 Fetching all users...\n');

    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);

    let updatedCount = 0;

    for (const userDoc of querySnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      // Skip if user already has complete data
      const hasPapers = userData.part_b?.table2?.researchPapers?.length > 0;
      const hasQualifications = userData.part_a?.academic_qualifications?.length > 0;
      
      if (hasPapers && hasQualifications) {
        console.log(`✓ ${userData.name || userData.email} - Already has data`);
        continue;
      }

      // Generate complete data
      const completeData = generateCompleteData(
        userData.name || userData.full_name || 'Faculty Member',
        userData.department || departments[getRandomInt(0, departments.length - 1)],
        userData.role || 'faculty'
      );

      // Merge with existing data
      const mergedData = {
        ...userData,
        ...completeData,
        formHeader: {
          ...userData.formHeader,
          ...completeData.formHeader
        }
      };

      // Update Firestore
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, mergedData, { merge: true });

      updatedCount++;
      console.log(`✅ ${userData.name || userData.email} - Data generated`);
      console.log(`   • Role: ${userData.role || 'faculty'}`);
      console.log(`   • Department: ${mergedData.formHeader.department_name}`);
      console.log(`   • Research Papers: ${completeData.part_b.table2.researchPapers.length}`);
      console.log(`   • Publications: ${completeData.part_b.table2.publications.length}`);
      console.log(`   • Patents/Awards: ${completeData.part_b.patents_policy_awards.length}\n`);
    }

    console.log(`\n🎉 Complete! Updated ${updatedCount} users with comprehensive data.`);
    console.log('\n📊 All users now have:');
    console.log('   • Complete academic qualifications');
    console.log('   • Research papers and publications');
    console.log('   • Patents and awards');
    console.log('   • Research projects and guidance');
    console.log('   • Teaching and administrative activities');
    console.log('\n✨ Dashboard statistics will look beautiful!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateAllUsersData();
