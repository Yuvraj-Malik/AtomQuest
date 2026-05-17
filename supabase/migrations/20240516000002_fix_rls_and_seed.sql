-- 1. Disable RLS for cycles and goals so we can perform backend updates and seed operations
ALTER TABLE public.cycles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals DISABLE ROW LEVEL SECURITY;

-- 2. Insert active cycle if not exists
INSERT INTO public.cycles (name, is_active)
SELECT 'FY 2026-27 Q1', true
WHERE NOT EXISTS (SELECT 1 FROM public.cycles WHERE is_active = true);

-- 3. Define the manager and direct reports link
-- Manager account ID: ef2932ea-3971-42a3-9536-382e27c56459

-- Update profiles of direct reports to link to this manager
UPDATE public.profiles SET manager_id = 'ef2932ea-3971-42a3-9536-382e27c56459', role = 'employee', name = 'Aryan Kumar', email = 'aryan.kumar@demo.com' WHERE id = 'ed349388-4120-4436-996f-8f6eb20c7a9c';
UPDATE public.profiles SET manager_id = 'ef2932ea-3971-42a3-9536-382e27c56459', role = 'employee', name = 'Shreya Mehta', email = 'shreya.mehta@demo.com' WHERE id = '26912c76-7cd6-4429-9f21-deccff079ecc';
UPDATE public.profiles SET manager_id = 'ef2932ea-3971-42a3-9536-382e27c56459', role = 'employee', name = 'Vivek Rajan', email = 'employee@demo.com' WHERE id = 'cc0428cf-947c-4241-8fee-255d84a9bb82';
UPDATE public.profiles SET manager_id = 'ef2932ea-3971-42a3-9536-382e27c56459', role = 'employee', name = 'Nisha Pillai', email = 'test@example.com' WHERE id = 'cfb12d13-b185-4b68-98b8-8fda1387ce2e';

-- 4. Delete old goals for these direct reports to prevent duplicate seeding
DELETE FROM public.goals WHERE employee_id IN (
  'ed349388-4120-4436-996f-8f6eb20c7a9c',
  '26912c76-7cd6-4429-9f21-deccff079ecc',
  'cc0428cf-947c-4241-8fee-255d84a9bb82',
  'cfb12d13-b185-4b68-98b8-8fda1387ce2e'
);

-- 5. Insert goals for direct reports
-- Aryan Kumar goals (Sum = 100)
INSERT INTO public.goals (employee_id, thrust_area, title, weightage, status) VALUES
('ed349388-4120-4436-996f-8f6eb20c7a9c', 'Revenue', 'Drive Q1 Enterprise ARR', 30, 'submitted'),
('ed349388-4120-4436-996f-8f6eb20c7a9c', 'Efficiency', 'Optimize Pipeline Conversion', 20, 'submitted'),
('ed349388-4120-4436-996f-8f6eb20c7a9c', 'Revenue', 'Close 5 Key Accounts', 15, 'submitted'),
('ed349388-4120-4436-996f-8f6eb20c7a9c', 'Efficiency', 'Reduce Sales Cycle Duration', 15, 'submitted'),
('ed349388-4120-4436-996f-8f6eb20c7a9c', 'Enablement', 'Train Sales Team on New Playbook', 10, 'submitted'),
('ed349388-4120-4436-996f-8f6eb20c7a9c', 'Customer', 'Achieve 95% CSAT in Onboarding', 10, 'submitted');

-- Shreya Mehta goals (Sum = 100)
INSERT INTO public.goals (employee_id, thrust_area, title, weightage, status) VALUES
('26912c76-7cd6-4429-9f21-deccff079ecc', 'Growth', 'Increase Lead Generation by 25%', 30, 'submitted'),
('26912c76-7cd6-4429-9f21-deccff079ecc', 'Branding', 'Revamp Content Marketing Strategy', 20, 'submitted'),
('26912c76-7cd6-4429-9f21-deccff079ecc', 'Needs review', 'Optimize Ad Campaigns', 20, 'submitted'),
('26912c76-7cd6-4429-9f21-deccff079ecc', 'Engagement', 'Host 3 Industry Webinars', 15, 'submitted'),
('26912c76-7cd6-4429-9f21-deccff079ecc', 'Enablement', 'Publish Product Feature Guide', 15, 'submitted');

-- Vivek Rajan goals (Sum = 100)
INSERT INTO public.goals (employee_id, thrust_area, title, weightage, status) VALUES
('cc0428cf-947c-4241-8fee-255d84a9bb82', 'All valid', 'Reduce Server Latency by 40%', 25, 'submitted'),
('cc0428cf-947c-4241-8fee-255d84a9bb82', 'Product', 'Implement Real-time Notifications', 20, 'submitted'),
('cc0428cf-947c-4241-8fee-255d84a9bb82', 'Security', 'Complete Security Audit Fixes', 15, 'submitted'),
('cc0428cf-947c-4241-8fee-255d84a9bb82', 'Tech Debt', 'Refactor Legacy Auth Controller', 15, 'submitted'),
('cc0428cf-947c-4241-8fee-255d84a9bb82', 'Infrastructure', 'Deploy Kubernetes Auto-scaling', 10, 'submitted'),
('cc0428cf-947c-4241-8fee-255d84a9bb82', 'Quality', 'Improve Unit Test Coverage to 90%', 5, 'submitted'),
('cc0428cf-947c-4241-8fee-255d84a9bb82', 'Documentation', 'Document API Architecture', 5, 'submitted'),
('cc0428cf-947c-4241-8fee-255d84a9bb82', 'Culture', 'Mentor 2 Junior Engineers', 5, 'submitted');

-- Nisha Pillai goals (Sum = 85, validation error)
INSERT INTO public.goals (employee_id, thrust_area, title, weightage, status) VALUES
('cfb12d13-b185-4b68-98b8-8fda1387ce2e', 'Finance', 'Finalize Q1 Budget Allocations', 30, 'submitted'),
('cfb12d13-b185-4b68-98b8-8fda1387ce2e', 'Efficiency', 'Automate Invoice Processing', 25, 'submitted'),
('cfb12d13-b185-4b68-98b8-8fda1387ce2e', 'Weightage ≠ 100%', 'Reduce Outstanding AR by 15%', 20, 'submitted'),
('cfb12d13-b185-4b68-98b8-8fda1387ce2e', 'Compliance', 'Conduct Internal Tax Audit', 10, 'submitted');
