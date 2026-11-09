import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

interface ApplicationInput {
  fullName?: string;
  email?: string;
  phone?: string;
  registrationNumber?: string;
  branch?: string;
  currentYear?: string;
  preferredDepartment?: string;
  motivation?: string;
  skills?: string;
  github?: string | null;
  linkedin?: string | null;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;
const URL_REGEX = /^(https?:\/\/)?([\w\d.-]+\.[\w]{2,})(\/.*)?$/i;

const VALID_YEARS = ['1st', '2nd', '3rd', '4th', '1st Year', '2nd Year', '3rd Year', '4th Year'];
const VALID_DEPARTMENTS = [
  'Technical',
  'Web Development',
  'Design',
  'Marketing',
  'Management',
  'Content',
];

export const applicationRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // POST /api/applications - Create a new recruitment application
  fastify.post('/applications', async (request, reply) => {
    const body = (request.body as ApplicationInput) || {};

    const errors: Record<string, string> = {};

    // 1. Validate fullName
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    if (!fullName) {
      errors.fullName = 'Full Name is required.';
    } else if (fullName.length < 2) {
      errors.fullName = 'Full Name must be at least 2 characters.';
    } else if (fullName.length > 100) {
      errors.fullName = 'Full Name cannot exceed 100 characters.';
    }

    // 2. Validate email
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!email) {
      errors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = 'Please provide a valid email address.';
    }

    // 3. Validate phone
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const digitsOnly = phone.replace(/\D/g, '');
    if (!phone) {
      errors.phone = 'Phone number is required.';
    } else if (!PHONE_REGEX.test(phone) || digitsOnly.length < 10 || digitsOnly.length > 15) {
      errors.phone = 'Please provide a valid phone number (10-15 digits).';
    }

    // 4. Validate registrationNumber
    const registrationNumber =
      typeof body.registrationNumber === 'string'
        ? body.registrationNumber.trim().toUpperCase()
        : '';
    if (!registrationNumber) {
      errors.registrationNumber = 'Registration number is required.';
    } else if (registrationNumber.length < 2 || registrationNumber.length > 30) {
      errors.registrationNumber = 'Registration number must be between 2 and 30 characters.';
    }

    // 5. Validate branch
    const branch = typeof body.branch === 'string' ? body.branch.trim() : '';
    if (!branch) {
      errors.branch = 'Branch selection is required.';
    }

    // 6. Validate currentYear
    const currentYear = typeof body.currentYear === 'string' ? body.currentYear.trim() : '';
    if (!currentYear) {
      errors.currentYear = 'Current Year selection is required.';
    } else if (
      !VALID_YEARS.map((y) => y.toLowerCase()).includes(currentYear.toLowerCase())
    ) {
      errors.currentYear = 'Current Year must be one of: 1st, 2nd, 3rd, 4th.';
    }

    // 7. Validate preferredDepartment
    const preferredDepartment =
      typeof body.preferredDepartment === 'string' ? body.preferredDepartment.trim() : '';
    if (!preferredDepartment) {
      errors.preferredDepartment = 'Preferred Department is required.';
    } else if (
      !VALID_DEPARTMENTS.map((d) => d.toLowerCase()).includes(preferredDepartment.toLowerCase())
    ) {
      errors.preferredDepartment = `Preferred Department must be one of: ${VALID_DEPARTMENTS.join(', ')}.`;
    }

    // 8. Validate motivation
    const motivation = typeof body.motivation === 'string' ? body.motivation.trim() : '';
    if (!motivation) {
      errors.motivation = 'Please share why you want to join.';
    } else if (motivation.length < 10) {
      errors.motivation = 'Motivation must be at least 10 characters long.';
    } else if (motivation.length > 2000) {
      errors.motivation = 'Motivation cannot exceed 2000 characters.';
    }

    // 9. Validate skills
    const skills = typeof body.skills === 'string' ? body.skills.trim() : '';
    if (!skills) {
      errors.skills = 'Skills information is required.';
    } else if (skills.length > 1000) {
      errors.skills = 'Skills description cannot exceed 1000 characters.';
    }

    // 10. Optional URLs
    let github = typeof body.github === 'string' ? body.github.trim() : null;
    if (github) {
      if (!URL_REGEX.test(github)) {
        errors.github = 'Please enter a valid GitHub profile URL.';
      } else if (!github.startsWith('http://') && !github.startsWith('https://')) {
        github = `https://${github}`;
      }
    } else {
      github = null;
    }

    let linkedin = typeof body.linkedin === 'string' ? body.linkedin.trim() : null;
    if (linkedin) {
      if (!URL_REGEX.test(linkedin)) {
        errors.linkedin = 'Please enter a valid LinkedIn profile URL.';
      } else if (!linkedin.startsWith('http://') && !linkedin.startsWith('https://')) {
        linkedin = `https://${linkedin}`;
      }
    } else {
      linkedin = null;
    }

    // Check for validation errors
    if (Object.keys(errors).length > 0) {
      return reply.code(400).send({
        success: false,
        message: 'Validation failed. Please correct the highlighted fields.',
        errors,
      });
    }

    try {
      // Check for existing duplicates before inserting
      const existingEmail = await prisma.application.findUnique({
        where: { email },
        select: { id: true, email: true },
      });

      if (existingEmail) {
        return reply.code(409).send({
          success: false,
          message: 'An application with this email address has already been submitted.',
          field: 'email',
        });
      }

      const existingReg = await prisma.application.findUnique({
        where: { registrationNumber },
        select: { id: true, registrationNumber: true },
      });

      if (existingReg) {
        return reply.code(409).send({
          success: false,
          message: 'An application with this registration number has already been submitted.',
          field: 'registrationNumber',
        });
      }

      // Create new application
      const newApplication = await prisma.application.create({
        data: {
          fullName,
          email,
          phone,
          registrationNumber,
          branch,
          currentYear,
          preferredDepartment,
          motivation,
          skills,
          github,
          linkedin,
        },
      });

      return reply.code(201).send({
        success: true,
        message: 'Application submitted successfully!',
        data: {
          id: newApplication.id,
          fullName: newApplication.fullName,
          email: newApplication.email,
          registrationNumber: newApplication.registrationNumber,
          branch: newApplication.branch,
          currentYear: newApplication.currentYear,
          preferredDepartment: newApplication.preferredDepartment,
          createdAt: newApplication.createdAt,
        },
      });
    } catch (error) {
      // Handle Prisma Unique Constraint Violation (race condition defense)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes('email')) {
          return reply.code(409).send({
            success: false,
            message: 'An application with this email address has already been submitted.',
            field: 'email',
          });
        }
        if (target.includes('registrationNumber')) {
          return reply.code(409).send({
            success: false,
            message:
              'An application with this registration number has already been submitted.',
            field: 'registrationNumber',
          });
        }
        return reply.code(409).send({
          success: false,
          message: 'Duplicate application detected for unique field: ' + target.join(', '),
        });
      }

      fastify.log.error(error, 'Error processing application submission');
      return reply.code(500).send({
        success: false,
        message: 'An unexpected database error occurred while submitting your application. Please try again later.',
      });
    }
  });
};
