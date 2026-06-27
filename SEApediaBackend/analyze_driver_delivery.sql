-- ANALISIS RELATIONSHIP DRIVER DAN DELIVERY
-- ==========================================

-- 1. Cek struktur database
SELECT '=== STRUKTUR DATABASE ===' as info;

-- Cek drivers table structure
DESCRIBE drivers;

-- Cek deliveries table structure
DESCRIBE deliveries;

-- Cek users table structure
DESCRIBE users;

-- 2. Cek data yang ada
SELECT '=== DATA YANG ADA ===' as info;

-- Total records
SELECT 'drivers' as table_name, COUNT(*) as total_records FROM drivers
UNION ALL
SELECT 'deliveries', COUNT(*) FROM deliveries
UNION ALL
SELECT 'users', COUNT(*) FROM users;

-- 3. Cek driver records
SELECT '=== DRIVER RECORDS ===' as info;
SELECT 
    d.id as driver_id,
    d.user_id,
    u.username,
    u.email,
    d.name as driver_name,
    d.phone' as driver_phone,
    d.vehicle_type,
    d.vehicle_plate_number,
    d.is_active,
    d.created_at
FROM drivers d
JOIN users u ON d.user_id = u.id;

-- 4. Cek delivery records
SELECT '=== DELIVERY RECORDS ===' as info;
SELECT 
    id,
    order_id,
    driver_id,
    method,
    fee,
    status,
    taken_at,
    completed_at,
    created_at
FROM deliveries;

-- 5. Cek deliveries dengan driver_id
SELECT '=== DELIVERIES DENGAN DRIVER_ID ===' as info;
SELECT 
    d.id as delivery_id,
    d.order_id,
    d.driver_id,
    u.username as driver_username,
    u.email as driver_email,
    dr.name as driver_record_name,
    d.status,
    d.taken_at,
    d.completed_at
FROM deliveries d
LEFT JOIN users u ON d.driver_id = u.id
LEFT JOIN drivers dr ON u.id = dr.user_id
WHERE d.driver_id IS NOT NULL;

-- 6. Cek deliveries tanpa driver_id
SELECT '=== DELIVERIES TANPA DRIVER (WAITING DRIVER) ===' as info;
SELECT 
    id,
    order_id,
    status,
    method,
    fee,
    created_at
FROM deliveries
WHERE driver_id IS NULL;

-- 7. Cek deliveries dengan status in_progress
SELECT '=== DELIVERIES IN PROGRESS ===' as info;
SELECT 
    d.id as delivery_id,
    d.order_id,
    d.driver_id,
    u.username as driver_username,
    dr.name as driver_record_name,
    d.status,
    d.taken_at,
    d.completed_at
FROM deliveries d
LEFT JOIN users u ON d.driver_id = u.id
LEFT JOIN drivers dr ON u.id = dr.user_id
WHERE d.status = 'in_progress';

-- 8. Cek deliveries dengan status completed
SELECT '=== DELIVERIES COMPLETED ===' as info;
SELECT 
    d.id as delivery_id,
    d.order_id,
    d.driver_id,
    u.username as driver_username,
    dr.name as driver_record_name,
    d.status,
    d.taken_at,
    d.completed_at
FROM deliveries d
LEFT JOIN users u ON d.driver_id = u.id
LEFT JOIN drivers dr ON u.id = dr.user_id
WHERE d.status = 'completed';

-- 9. Cek status distribution
SELECT '=== STATUS DISTRIBUTION ===' as info;
SELECT 
    status,
    COUNT(*) as total,
    COUNT(CASE WHEN driver_id IS NOT NULL THEN 1 END) as with_driver,
    COUNT(CASE WHEN driver_id IS NULL THEN 1 END) as without_driver
FROM deliveries
GROUP BY status;

-- 10. Cek driver yang punya deliveries
SELECT '=== DRIVER DENGAN DELIVERIES ===' as info;
SELECT 
    dr.id as driver_id,
    dr.user_id,
    u.username,
    dr.name as driver_name,
    COUNT(d.id) as total_deliveries,
    COUNT(CASE WHEN d.status = 'in_progress' THEN 1 END) as in_progress,
    COUNT(CASE WHEN d.status = 'completed' THEN 1 END) as completed,
    COUNT(CASE WHEN d.status = 'waiting_driver' THEN 1 END) as waiting,
    SUM(CASE WHEN d.status = 'completed' THEN d.fee ELSE 0 END) as total_earnings
FROM drivers dr
JOIN users u ON dr.user_id = u.id
LEFT JOIN deliveries d ON u.id = d.driver_id
GROUP BY dr.id, dr.user_id, u.username, dr.name;

-- 11. Cek potential issues
SELECT '=== POTENTIAL ISSUES ===' as info;

-- Deliveries dengan driver_id tapi tidak ada di drivers table
SELECT 'Deliveries dengan driver_id tapi tidak ada di drivers table' as issue_type,
       COUNT(*) as count
FROM deliveries d
LEFT JOIN users u ON d.driver_id = u.id
LEFT JOIN drivers dr ON u.id = dr.user_id
WHERE d.driver_id IS NOT NULL AND dr.id IS NULL;

-- Deliveries dengan status in_progress tapi taken_at NULL
SELECT 'Deliveries in_progress tapi taken_at NULL' as issue_type,
       COUNT(*) as count
FROM deliveries
WHERE status = 'in_progress' AND taken_at IS NULL;

-- Deliveries dengan status completed tapi completed_at NULL
SELECT 'Deliveries completed tapi completed_at NULL' as issue_type,
       COUNT(*) as count
FROM deliveries
WHERE status = 'completed' AND completed_at IS NULL;