-- Insert sample departments
INSERT INTO departments (name, description) VALUES
('Computer Science', 'Department of Computer Science and Engineering'),
('Electronics Engineering', 'Department of Electronics and Communication Engineering'),
('Mechanical Engineering', 'Department of Mechanical Engineering'),
('Civil Engineering', 'Department of Civil Engineering'),
('Mathematics', 'Department of Mathematics'),
('Physics', 'Department of Physics'),
('Chemistry', 'Department of Chemistry'),
('Management Studies', 'Department of Management Studies')
ON CONFLICT (name) DO NOTHING;

-- Insert sample admin user (this would normally be created through signup)
-- Note: In production, users should be created through the auth system
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'admin-demo-user-id',
  'admin@university.edu',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Create admin profile
INSERT INTO profiles (id, email, full_name, role, department, designation, employee_id)
VALUES (
  'admin-demo-user-id',
  'admin@university.edu',
  'System Administrator',
  'admin',
  'Administration',
  'System Admin',
  'ADMIN001'
) ON CONFLICT (id) DO NOTHING;
