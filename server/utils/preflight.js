/* eslint-env node */
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

dotenv.config();

const REQUIRED_ENV = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'EMAIL_USER',
  'EMAIL_PASS',
  'ADMIN_EMAIL',
];

export const runPreflightChecks = async () => {
  console.log('🔍 Running preflight checks...\n');

  checkEnvironmentVariables();
  await checkSupabaseConnection();

  // Do not let email verification block deployment/startup
  await checkEmailService();

  console.log('\n🚀 All systems ready!\n');
};

const checkEnvironmentVariables = () => {
  for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  }

  console.log('✅ Environment variables OK');
};

const checkSupabaseConnection = async () => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { error } = await supabase.from('tasks').select('id').limit(1);

  if (error) {
    throw new Error(`Supabase connection failed: ${error.message}`);
  }

  console.log('✅ Supabase connection OK');
};

const checkEmailService = async () => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log('✅ Email service OK');
  } catch (error) {
    console.warn(`⚠️ Email service warning: ${error.message}`);
  }
};