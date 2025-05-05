/*
  # Create Admin User

  Creates the initial admin user for the application.
*/

-- Create admin user
SELECT create_admin_user(
  'admin@essencesmart.com',
  'admin123',  -- Change this password in production!
  'Admin User'
);