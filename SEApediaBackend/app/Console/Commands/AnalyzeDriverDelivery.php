<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AnalyzeDriverDelivery extends Command
{
    protected $signature = 'analyze:driver-delivery';
    protected $description = 'Analyze relationship between drivers and deliveries';

    public function handle()
    {
        $this->info('=== ANALISIS RELATIONSHIP DRIVER DAN DELIVERY ===');
        $this->newLine();

        if (!Schema::hasTable('drivers') || !Schema::hasTable('deliveries') || !Schema::hasTable('users')) {
            $this->error('Required tables do not exist!');
            return 1;
        }

        $this->info('1. Total Records');
        $this->table(
            ['Table', 'Total Records'],
            [
                ['drivers', DB::table('drivers')->count()],
                ['deliveries', DB::table('deliveries')->count()],
                ['users', DB::table('users')->count()],
            ]
        );
        $this->newLine();

        $this->info('2. Driver Records');
        $drivers = DB::table('drivers as d')
            ->join('users as u', 'd.user_id', '=', 'u.id')
            ->select(
                'd.id as driver_id',
                'd.user_id',
                'u.username',
                'u.email',
                'd.name as driver_name',
                'd.phone_number',
                'd.vehicle_type',
                'd.vehicle_plate_number',
                'd.is_active'
            )
            ->get();

        if ($drivers->isEmpty()) {
            $this->warn('No driver records found!');
        } else {
            $this->table(
                ['ID', 'User ID', 'Username', 'Email', 'Driver Name', 'Phone', 'Vehicle', 'Plate', 'Active'],
                $drivers->map(function ($d) {
                    return [
                        $d->driver_id,
                        $d->user_id,
                        $d->username,
                        $d->email,
                        $d->driver_name,
                        $d->phone_number,
                        $d->vehicle_type,
                        $d->vehicle_plate_number,
                        $d->is_active ? 'Yes' : 'No',
                    ];
                })->toArray()
            );
        }
        $this->newLine();

        $this->info('3. Delivery Records');
        $deliveries = DB::table('deliveries')
            ->select(
                'id',
                'order_id',
                'driver_id',
                'method',
                'fee',
                'status',
                'taken_at',
                'completed_at'
            )
            ->get();

        if ($deliveries->isEmpty()) {
            $this->warn('No delivery records found!');
        } else {
            $this->table(
                ['ID', 'Order ID', 'Driver ID', 'Method', 'Fee', 'Status', 'Taken At', 'Completed At'],
                $deliveries->map(function ($d) {
                    return [
                        $d->id,
                        $d->order_id,
                        $d->driver_id ?? 'NULL',
                        $d->method,
                        number_format($d->fee, 2),
                        $d->status,
                        $d->taken_at ?? 'NULL',
                        $d->completed_at ?? 'NULL',
                    ];
                })->toArray()
            );
        }
        $this->newLine();

        $this->info('4. Deliveries with Driver_ID');
        $deliveriesWithDriver = DB::table('deliveries as d')
            ->leftJoin('users as u', 'd.driver_id', '=', 'u.id')
            ->leftJoin('drivers as dr', 'u.id', '=', 'dr.user_id')
            ->whereNotNull('d.driver_id')
            ->select(
                'd.id as delivery_id',
                'd.order_id',
                'd.driver_id',
                'u.username as driver_username',
                'dr.name as driver_record_name',
                'd.status',
                'd.taken_at',
                'd.completed_at'
            )
            ->get();

        if ($deliveriesWithDriver->isEmpty()) {
            $this->warn('No deliveries with driver_id found!');
        } else {
            $this->table(
                ['Delivery ID', 'Order ID', 'Driver ID', 'Username', 'Driver Name', 'Status', 'Taken At', 'Completed At'],
                $deliveriesWithDriver->map(function ($d) {
                    return [
                        $d->delivery_id,
                        $d->order_id,
                        $d->driver_id,
                        $d->driver_username ?? 'NULL',
                        $d->driver_record_name ?? 'NULL',
                        $d->status,
                        $d->taken_at ?? 'NULL',
                        $d->completed_at ?? 'NULL',
                    ];
                })->toArray()
            );
        }
        $this->newLine();

        $this->info('5. Deliveries without Driver (Waiting Driver)');
        $waitingDeliveries = DB::table('deliveries')
            ->whereNull('driver_id')
            ->select('id', 'order_id', 'status', 'method', 'fee', 'created_at')
            ->get();

        if ($waitingDeliveries->isEmpty()) {
            $this->warn('No waiting deliveries found!');
        } else {
            $this->table(
                ['ID', 'Order ID', 'Status', 'Method', 'Fee', 'Created At'],
                $waitingDeliveries->map(function ($d) {
                    return [
                        $d->id,
                        $d->order_id,
                        $d->status,
                        $d->method,
                        number_format($d->fee, 2),
                        $d->created_at,
                    ];
                })->toArray()
            );
        }
        $this->newLine();

        $this->info('6. Deliveries In Progress');
        $inProgressDeliveries = DB::table('deliveries as d')
            ->leftJoin('users as u', 'd.driver_id', '=', 'u.id')
            ->leftJoin('drivers as dr', 'u.id', '=', 'dr.user_id')
            ->where('d.status', 'in_progress')
            ->select(
                'd.id as delivery_id',
                'd.order_id',
                'd.driver_id',
                'u.username as driver_username',
                'dr.name as driver_record_name',
                'd.taken_at',
                'd.completed_at'
            )
            ->get();

        if ($inProgressDeliveries->isEmpty()) {
            $this->warn('No in_progress deliveries found!');
        } else {
            $this->table(
                ['Delivery ID', 'Order ID', 'Driver ID', 'Username', 'Driver Name', 'Taken At', 'Completed At'],
                $inProgressDeliveries->map(function ($d) {
                    return [
                        $d->delivery_id,
                        $d->order_id,
                        $d->driver_id ?? 'NULL',
                        $d->driver_username ?? 'NULL',
                        $d->driver_record_name ?? 'NULL',
                        $d->taken_at ?? 'NULL',
                        $d->completed_at ?? 'NULL',
                    ];
                })->toArray()
            );
        }
        $this->newLine();

        $this->info('7. Deliveries Completed');
        $completedDeliveries = DB::table('deliveries as d')
            ->leftJoin('users as u', 'd.driver_id', '=', 'u.id')
            ->leftJoin('drivers as dr', 'u.id', '=', 'dr.user_id')
            ->where('d.status', 'completed')
            ->select(
                'd.id as delivery_id',
                'd.order_id',
                'd.driver_id',
                'u.username as driver_username',
                'dr.name as driver_record_name',
                'd.taken_at',
                'd.completed_at'
            )
            ->get();

        if ($completedDeliveries->isEmpty()) {
            $this->warn('No completed deliveries found!');
        } else {
            $this->table(
                ['Delivery ID', 'Order ID', 'Driver ID', 'Username', 'Driver Name', 'Taken At', 'Completed At'],
                $completedDeliveries->map(function ($d) {
                    return [
                        $d->delivery_id,
                        $d->order_id,
                        $d->driver_id ?? 'NULL',
                        $d->driver_username ?? 'NULL',
                        $d->driver_record_name ?? 'NULL',
                        $d->taken_at ?? 'NULL',
                        $d->completed_at ?? 'NULL',
                    ];
                })->toArray()
            );
        }
        $this->newLine();

        $this->info('8. Status Distribution');
        $statusDistribution = DB::table('deliveries')
            ->select(
                'status',
                DB::raw('COUNT(*) as total'),
                DB::raw('COUNT(CASE WHEN driver_id IS NOT NULL THEN 1 END) as with_driver'),
                DB::raw('COUNT(CASE WHEN driver_id IS NULL THEN 1 END) as without_driver')
            )
            ->groupBy('status')
            ->get();

        $this->table(
            ['Status', 'Total', 'With Driver', 'Without Driver'],
            $statusDistribution->map(function ($d) {
                return [
                    $d->status,
                    $d->total,
                    $d->with_driver,
                    $d->without_driver,
                ];
            })->toArray()
        );
        $this->newLine();

        $this->info('9. Drivers with Deliveries');
        $driversWithDeliveries = DB::table('drivers as dr')
            ->join('users as u', 'dr.user_id', '=', 'u.id')
            ->leftJoin('deliveries as d', 'u.id', '=', 'd.driver_id')
            ->select(
                'dr.id as driver_id',
                'dr.user_id',
                'u.username',
                'dr.name as driver_name',
                DB::raw('COUNT(d.id) as total_deliveries'),
                DB::raw('COUNT(CASE WHEN d.status = "in_progress" THEN 1 END) as in_progress'),
                DB::raw('COUNT(CASE WHEN d.status = "completed" THEN 1 END) as completed'),
                DB::raw('COUNT(CASE WHEN d.status = "waiting_driver" THEN 1 END) as waiting'),
                DB::raw('SUM(CASE WHEN d.status = "completed" THEN d.fee ELSE 0 END) as total_earnings')
            )
            ->groupBy('dr.id', 'dr.user_id', 'u.username', 'dr.name')
            ->get();

        if ($driversWithDeliveries->isEmpty()) {
            $this->warn('No drivers with deliveries found!');
        } else {
            $this->table(
                ['Driver ID', 'User ID', 'Username', 'Driver Name', 'Total', 'In Progress', 'Completed', 'Waiting', 'Earnings'],
                $driversWithDeliveries->map(function ($d) {
                    return [
                        $d->driver_id,
                        $d->user_id,
                        $d->username,
                        $d->driver_name,
                        $d->total_deliveries,
                        $d->in_progress,
                        $d->completed,
                        $d->waiting,
                        number_format($d->total_earnings, 2),
                    ];
                })->toArray()
            );
        }
        $this->newLine();

        $this->info('10. Potential Issues');
        $issues = [];

        $issue1 = DB::table('DRIVERLESS DELIVERIES as d')
            ->leftJoin('users as u', 'd.driver_id', '=', 'u.id')
            ->leftJoin('drivers as dr', 'u.id', '=', 'dr.user_id')
            ->whereNotNull('d.driver_id')
            ->whereNull('dr.id')
            ->count();

        if ($issue1 > 0) {
            $issues[] = ['Deliveries with driver_id but no driver record', $issue1, 'HIGH'];
        }

        $issue2 = DB::table('deliveries')
            ->where('status', 'in_progress')
            ->whereNull('taken_at')
            ->count();

        if ($issue2 > 0) {
            $issues[] = ['In_progress deliveries without taken_at', $issue2, 'MEDIUM'];
        }

        $issue3 = DB::table('deliveries')
            ->where('status', 'completed')
            ->whereNull('completed_at')
            ->count();

        if ($issue3 > 0) {
            $issues[] = ['Completed deliveries without completed_at', $issue3, 'MEDIUM'];
        }

        if (empty($issues)) {
            $this->info('✓ No potential issues found!');
        } else {
            $this->table(
                ['Issue Type', 'Count', 'Severity'],
                $issues
            );
        }
        $this->newLine();

        $this->info('=== ANALISIS SELESAI ===');

        return 0;
    }
}