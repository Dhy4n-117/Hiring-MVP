require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const Admin = require('./auth/Admin');
const Job = require('./jobs/Job');

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Admin.deleteMany({});
        await Job.deleteMany({});

        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = await Admin.create({
            name: 'HR Admin',
            email: 'admin@company.com',
            password: hashedPassword,
            role: 'admin'
        });
        console.log('✅ Admin created:', admin.email, '/ password: admin123');

        // Create sample jobs
        const jobs = await Job.insertMany([
            {
                title: 'Frontend Developer',
                department: 'Engineering',
                location: 'Remote',
                description: 'We are looking for a skilled Frontend Developer to build responsive and performant web interfaces using modern frameworks.',
                requirements: 'Experience with React/Vue/Angular, HTML, CSS, JavaScript. Strong understanding of responsive design and REST APIs.',
                employmentType: 'Full-time',
                isActive: true
            },
            {
                title: 'Backend Developer',
                department: 'Engineering',
                location: 'Bangalore',
                description: 'Join our backend team to design and build scalable APIs and microservices powering our platform.',
                requirements: 'Proficiency in Node.js or Python. Experience with MongoDB/PostgreSQL, REST/GraphQL APIs, and cloud services.',
                employmentType: 'Full-time',
                isActive: true
            },
            {
                title: 'UI/UX Designer',
                department: 'Design',
                location: 'Mumbai',
                description: 'Create intuitive, beautiful user interfaces and experiences for our web and mobile products.',
                requirements: 'Proficiency in Figma/Sketch, understanding of design systems, user research, and prototyping.',
                employmentType: 'Full-time',
                isActive: true
            },
            {
                title: 'Marketing Intern',
                department: 'Marketing',
                location: 'Remote',
                description: 'Assist the marketing team in content creation, social media management, and campaign analytics.',
                requirements: 'Currently pursuing a degree in Marketing, Communications, or related field. Familiarity with social media platforms.',
                employmentType: 'Internship',
                isActive: true
            },
            {
                title: 'DevOps Engineer',
                department: 'Engineering',
                location: 'Hyderabad',
                description: 'Manage CI/CD pipelines, cloud infrastructure, and ensure system reliability and security.',
                requirements: 'Experience with AWS/GCP/Azure, Docker, Kubernetes, and CI/CD tools like Jenkins or GitHub Actions.',
                employmentType: 'Full-time',
                isActive: true
            }
        ]);
        console.log(`✅ ${jobs.length} sample jobs created`);

        console.log('\n🎉 Seed complete!');
        console.log('Login: admin@company.com / admin123');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error.message);
        process.exit(1);
    }
};

seedData();
