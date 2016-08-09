--
-- Create users and grant Access to application
--
CREATE USER 'application'@'%' IDENTIFIED BY 'y7F!z6C7U#EKWsI8';
GRANT USAGE ON *.* TO 'application'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON `application`.* TO 'application'@'%';

