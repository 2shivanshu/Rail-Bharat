<?php

namespace App\Http\Controllers;

use App\Models\Train;
use App\Models\Station;
use App\Models\Schedule;
use App\Models\Route;
use App\Models\Coach;
use App\Models\Booking;
use App\Models\Passenger;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class TrainController extends Controller
{
    /**
     * Search trains based on source, destination, and date
     */
    public function search(Request $request)
    {
        $request->validate([
            'source' => 'required|exists:stations,code',
            'destination' => 'required|exists:stations,code',
            'date' => 'required|date|after_or_equal:today',
        ]);

        $sourceCode = $request->source;
        $destCode = $request->destination;
        $dateStr = $request->date;

        $sourceStation = Station::where('code', $sourceCode)->firstOrFail();
        $destStation = Station::where('code', $destCode)->firstOrFail();

        // 1. Find trains that have routes passing through both stations, where stop_number for source < stop_number for destination
        $matchingTrains = Train::whereHas('routes', function ($query) use ($sourceStation) {
            $query->where('station_id', $sourceStation->id);
        })->whereHas('routes', function ($query) use ($destStation) {
            $query->where('station_id', $destStation->id);
        })->get();

        $trainList = [];
        $dayOfWeek = Carbon::parse($dateStr)->dayOfWeek === 0 ? 7 : Carbon::parse($dateStr)->dayOfWeek;

        foreach ($matchingTrains as $train) {
            // Verify if train runs on this day of week
            $runsOn = explode(',', $train->runs_on);
            if (!in_array($dayOfWeek, $runsOn)) {
                continue;
            }

            // Get route details for source and destination stops
            $sourceRoute = Route::where('train_id', $train->id)->where('station_id', $sourceStation->id)->first();
            $destRoute = Route::where('train_id', $train->id)->where('station_id', $destStation->id)->first();

            // Check if direction is correct (source stop is before destination stop)
            if ($sourceRoute->stop_number >= $destRoute->stop_number) {
                continue;
            }

            // Get or create Schedule for this train on this date
            $schedule = Schedule::firstOrCreate(
                ['train_id' => $train->id, 'departure_date' => $dateStr],
                ['status' => 'Scheduled', 'delay_minutes' => 0]
            );

            // Compute distance and base fare factor
            $distance = $destRoute->distance_from_source - $sourceRoute->distance_from_source;
            $fareFactor = $destRoute->fare_factor - $sourceRoute->fare_factor;
            if ($fareFactor <= 0) $fareFactor = 1.00;

            // Fetch classes and initial availability
            $coaches = Coach::where('train_id', $train->id)->get();
            $classesAvailable = $coaches->pluck('class_type')->unique()->values()->toArray();

            $classesWithAvailability = [];
            foreach ($classesAvailable as $cls) {
                $availability = $this->calculateSeatAvailability($train->id, $schedule->id, $cls);
                
                // Base fares
                $baseFare = 150.00;
                if ($cls === '1A') $baseFare = 1200.00;
                elseif ($cls === '2A') $baseFare = 800.00;
                elseif ($cls === '3A') $baseFare = 500.00;
                elseif ($cls === 'CC') $baseFare = 450.00;

                $totalFare = round($baseFare * $fareFactor, 2);

                $classesWithAvailability[] = [
                    'class' => $cls,
                    'fare' => $totalFare,
                    'status' => $availability['status'],
                    'count' => $availability['count'],
                    'label' => $availability['label'],
                ];
            }

            $trainList[] = [
                'id' => $train->id,
                'train_number' => $train->train_number,
                'name' => $train->name,
                'type' => $train->type,
                'source_departure' => $sourceRoute->departure_time,
                'dest_arrival' => $destRoute->arrival_time,
                'duration' => $this->calculateDuration($sourceRoute->departure_time, $destRoute->arrival_time),
                'distance' => $distance,
                'schedule_id' => $schedule->id,
                'schedule_status' => $schedule->status,
                'delay_minutes' => $schedule->delay_minutes,
                'classes' => $classesWithAvailability,
            ];
        }

        // Calculate alternative suggestions on adjacent days
        $alternatives = [];
        $searchDate = Carbon::parse($dateStr);
        for ($offset = -2; $offset <= 2; $offset++) {
            if ($offset === 0) continue;
            
            $altDateObj = $searchDate->copy()->addDays($offset);
            if ($altDateObj->isBefore(Carbon::today())) {
                continue;
            }
            
            $altDateStr = $altDateObj->format('Y-m-d');
            $altDayOfWeek = $altDateObj->dayOfWeek === 0 ? 7 : $altDateObj->dayOfWeek;
            
            foreach ($matchingTrains as $train) {
                $runsOn = explode(',', $train->runs_on);
                if (!in_array($altDayOfWeek, $runsOn)) {
                    continue;
                }
                
                $sourceRoute = Route::where('train_id', $train->id)->where('station_id', $sourceStation->id)->first();
                $destRoute = Route::where('train_id', $train->id)->where('station_id', $destStation->id)->first();
                
                if ($sourceRoute && $destRoute && $sourceRoute->stop_number < $destRoute->stop_number) {
                    $alternatives[] = [
                        'train_id' => $train->id,
                        'train_number' => $train->train_number,
                        'name' => $train->name,
                        'date' => $altDateStr,
                        'departure_time' => $sourceRoute->departure_time,
                        'arrival_time' => $destRoute->arrival_time,
                    ];
                }
            }
        }

        return Inertia::render('TrainResults', [
            'trains' => $trainList,
            'alternatives' => $alternatives,
            'source' => $sourceStation,
            'destination' => $destStation,
            'date' => $dateStr,
            'stations' => Station::all(),
        ]);
    }

    /**
     * API Endpoint for Live Seat Availability
     */
    public function liveAvailability(Request $request)
    {
        $request->validate([
            'train_id' => 'required|exists:trains,id',
            'schedule_id' => 'required|exists:schedules,id',
            'class_type' => 'required|string',
        ]);

        $availability = $this->calculateSeatAvailability($request->train_id, $request->schedule_id, $request->class_type);

        return response()->json($availability);
    }

    /**
     * Get Route timing map
     */
    public function routeMap(Train $train)
    {
        $routes = Route::with('station')
            ->where('train_id', $train->id)
            ->orderBy('stop_number')
            ->get();

        return response()->json($routes);
    }

    /**
     * Seat Availability Calculation Helper
     */
    private function calculateSeatAvailability($trainId, $scheduleId, $classType)
    {
        // 1. Sum up capacity for the given class
        $totalSeats = Coach::where('train_id', $trainId)
            ->where('class_type', $classType)
            ->sum('total_seats');

        if ($totalSeats <= 0) {
            return [
                'status' => 'NA',
                'count' => 0,
                'label' => 'Not Available',
            ];
        }

        // 2. Count already booked (confirmed or RAC) passengers on this schedule
        $bookedSeats = Passenger::whereHas('booking', function ($q) use ($scheduleId, $classType) {
            $q->where('schedule_id', $scheduleId)
              ->where('class_type', $classType)
              ->whereIn('status', ['Booked', 'Partial']);
        })->whereIn('status', ['CNF', 'RAC'])->count();

        // 3. Waiting list count
        $wlCount = Passenger::whereHas('booking', function ($q) use ($scheduleId, $classType) {
            $q->where('schedule_id', $scheduleId)
              ->where('class_type', $classType)
              ->whereIn('status', ['Booked', 'Partial']);
        })->where('status', 'WL')->count();

        $availableSeats = $totalSeats - $bookedSeats;
        
        // Define RAC and WL capacity
        $racCapacity = 10;

        if ($availableSeats > 0) {
            return [
                'status' => 'AVBL',
                'count' => $availableSeats,
                'label' => "AVAILABLE - {$availableSeats}",
            ];
        } elseif ($bookedSeats < ($totalSeats + $racCapacity)) {
            $racLeft = ($totalSeats + $racCapacity) - $bookedSeats;
            return [
                'status' => 'RAC',
                'count' => $racLeft,
                'label' => "RAC - {$racLeft}",
            ];
        } else {
            $wlNumber = $wlCount + 1;
            return [
                'status' => 'WL',
                'count' => $wlNumber,
                'label' => "WL - {$wlNumber}",
            ];
        }
    }

    private function calculateDuration($departure, $arrival)
    {
        if (!$departure || !$arrival) return 'N/A';
        $dep = Carbon::parse($departure);
        $arr = Carbon::parse($arrival);
        
        if ($arr->lessThan($dep)) {
            $arr->addDay(); // Arrives next day
        }
        
        $diff = $dep->diff($arr);
        return $diff->format('%h hrs %i mins');
    }

    // --- Admin CRUD methods ---

    public function index()
    {
        $trains = Train::with(['sourceStation', 'destinationStation', 'routes.station', 'coaches'])->get();
        $stations = Station::all();
        return Inertia::render('Admin/TrainManager', [
            'trains' => $trains,
            'stations' => $stations,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'train_number' => 'required|unique:trains,train_number',
            'name' => 'required|string',
            'type' => 'required|in:Express,Superfast,Rajdhani,Shatabdi,Passenger',
            'source_station_id' => 'required|exists:stations,id',
            'destination_station_id' => 'required|exists:stations,id',
            'runs_on' => 'required|string',
            'coaches' => 'required|array',
            'coaches.*.class_type' => 'required|in:SL,3A,2A,1A,CC',
            'coaches.*.coach_number' => 'required|string',
            'coaches.*.total_seats' => 'required|integer|min:1',
            'routes' => 'required|array',
            'routes.*.station_id' => 'required|exists:stations,id',
            'routes.*.stop_number' => 'required|integer',
            'routes.*.arrival_time' => 'nullable|string',
            'routes.*.departure_time' => 'nullable|string',
            'routes.*.distance_from_source' => 'required|integer',
            'routes.*.fare_factor' => 'required|numeric',
        ]);

        DB::transaction(function () use ($validated) {
            $train = Train::create([
                'train_number' => $validated['train_number'],
                'name' => $validated['name'],
                'type' => $validated['type'],
                'source_station_id' => $validated['source_station_id'],
                'destination_station_id' => $validated['destination_station_id'],
                'runs_on' => $validated['runs_on'],
            ]);

            foreach ($validated['coaches'] as $c) {
                Coach::create([
                    'train_id' => $train->id,
                    'coach_number' => $c['coach_number'],
                    'class_type' => $c['class_type'],
                    'total_seats' => $c['total_seats'],
                ]);
            }

            foreach ($validated['routes'] as $r) {
                Route::create([
                    'train_id' => $train->id,
                    'station_id' => $r['station_id'],
                    'stop_number' => $r['stop_number'],
                    'arrival_time' => $r['arrival_time'] ?: null,
                    'departure_time' => $r['departure_time'] ?: null,
                    'distance_from_source' => $r['distance_from_source'],
                    'fare_factor' => $r['fare_factor'],
                ]);
            }
        });

        return redirect()->back()->with('success', 'Train added successfully!');
    }

    public function update(Request $request, Train $train)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'type' => 'required|in:Express,Superfast,Rajdhani,Shatabdi,Passenger',
            'source_station_id' => 'required|exists:stations,id',
            'destination_station_id' => 'required|exists:stations,id',
            'runs_on' => 'required|string',
        ]);

        $train->update($validated);

        return redirect()->back()->with('success', 'Train updated successfully!');
    }

    public function destroy(Train $train)
    {
        $train->delete();
        return redirect()->back()->with('success', 'Train deleted successfully!');
    }

    /**
     * Get GPS / Live tracking details
     */
    public function trackingDetails($scheduleId)
    {
        $schedule = Schedule::with(['train.routes.station'])->findOrFail($scheduleId);
        $routes = $schedule->train->routes->sortBy('stop_number')->values();
        
        $delay = $schedule->delay_minutes;
        $journeyDate = Carbon::parse($schedule->departure_date);
        
        $formattedRoutes = [];
        $currentPosition = 0; // percentage
        $status = 'Scheduled';
        $currentStationId = null;
        $nextStationId = null;
        $transitProgress = 0; // progress between current and next station (0-100)

        // Construct timestamps. If times roll over past midnight, increment the day.
        $currentDay = $journeyDate->copy();
        $lastTime = null;

        foreach ($routes as $index => $route) {
            $arrTimeRaw = $route->arrival_time;
            $depTimeRaw = $route->departure_time;
            
            $arrTime = null;
            $depTime = null;

            if ($arrTimeRaw) {
                if ($lastTime && $arrTimeRaw < $lastTime) {
                    $currentDay->addDay();
                }
                $arrTime = Carbon::parse($currentDay->format('Y-m-d') . ' ' . $arrTimeRaw);
                $lastTime = $arrTimeRaw;
            }

            if ($depTimeRaw) {
                if ($lastTime && $depTimeRaw < $lastTime) {
                    $currentDay->addDay();
                }
                $depTime = Carbon::parse($currentDay->format('Y-m-d') . ' ' . $depTimeRaw);
                $lastTime = $depTimeRaw;
            }

            // Fill missing times for boundary checks
            if (!$arrTime && $depTime) $arrTime = $depTime->copy();
            if (!$depTime && $arrTime) $depTime = $arrTime->copy();

            // Add delay
            $actualArr = $arrTime ? $arrTime->copy()->addMinutes($delay) : null;
            $actualDep = $depTime ? $depTime->copy()->addMinutes($delay) : null;

            $formattedRoutes[] = [
                'route_id' => $route->id,
                'station_id' => $route->station_id,
                'station_name' => $route->station->name,
                'station_code' => $route->station->code,
                'stop_number' => $route->stop_number,
                'distance' => $route->distance_from_source,
                'scheduled_arrival' => $arrTimeRaw,
                'scheduled_departure' => $depTimeRaw,
                'actual_arrival' => $actualArr ? $actualArr->format('H:i') : null,
                'actual_departure' => $actualDep ? $actualDep->format('H:i') : null,
                'raw_actual_arrival' => $actualArr ? $actualArr->toIso8601String() : null,
                'raw_actual_departure' => $actualDep ? $actualDep->toIso8601String() : null,
            ];
        }

        // Determine current transit state
        $now = Carbon::now();
        $totalStops = count($formattedRoutes);
        
        if ($totalStops > 0) {
            $firstStop = $formattedRoutes[0];
            $lastStop = $formattedRoutes[$totalStops - 1];
            
            $firstDep = $firstStop['raw_actual_departure'] ? Carbon::parse($firstStop['raw_actual_departure']) : null;
            $lastArr = $lastStop['raw_actual_arrival'] ? Carbon::parse($lastStop['raw_actual_arrival']) : null;

            if ($firstDep && $now->lessThan($firstDep)) {
                $status = 'Not Started';
                $currentPosition = 0;
            } elseif ($lastArr && $now->greaterThanOrEqualTo($lastArr)) {
                $status = 'Completed';
                $currentPosition = 100;
            } else {
                for ($i = 0; $i < $totalStops; $i++) {
                    $currStop = $formattedRoutes[$i];
                    $currArr = $currStop['raw_actual_arrival'] ? Carbon::parse($currStop['raw_actual_arrival']) : null;
                    $currDep = $currStop['raw_actual_departure'] ? Carbon::parse($currStop['raw_actual_departure']) : null;
                    
                    if ($currArr && $currDep && $now->greaterThanOrEqualTo($currArr) && $now->lessThanOrEqualTo($currDep)) {
                        $status = 'At Station';
                        $currentStationId = $currStop['station_id'];
                        $currentPosition = ($i / ($totalStops - 1)) * 100;
                        break;
                    }
                    
                    if ($i < $totalStops - 1) {
                        $nextStop = $formattedRoutes[$i + 1];
                        $nextArr = $nextStop['raw_actual_arrival'] ? Carbon::parse($nextStop['raw_actual_arrival']) : null;
                        
                        if ($currDep && $nextArr && $now->greaterThan($currDep) && $now->lessThan($nextArr)) {
                            $status = 'In Transit';
                            $currentStationId = $currStop['station_id'];
                            $nextStationId = $nextStop['station_id'];
                            
                            $durationSeconds = $nextArr->diffInSeconds($currDep);
                            $elapsedSeconds = $now->diffInSeconds($currDep);
                            $transitProgress = $durationSeconds > 0 ? ($elapsedSeconds / $durationSeconds) * 100 : 0;
                            
                            $posStart = ($i / ($totalStops - 1)) * 100;
                            $posEnd = (($i + 1) / ($totalStops - 1)) * 100;
                            $currentPosition = $posStart + (($posEnd - $posStart) * ($transitProgress / 100));
                            break;
                        }
                    }
                }
            }
        }

        return Inertia::render('LiveTracking', [
            'schedule' => $schedule,
            'delay' => $delay,
            'routes' => $formattedRoutes,
            'tracking' => [
                'status' => $status,
                'current_position' => round($currentPosition, 2),
                'current_station_id' => $currentStationId,
                'next_station_id' => $nextStationId,
                'transit_progress' => round($transitProgress, 2),
                'last_updated' => now()->toIso8601String(),
            ]
        ]);
    }
}
