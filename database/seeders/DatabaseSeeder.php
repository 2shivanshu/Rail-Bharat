<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Station;
use App\Models\Train;
use App\Models\Route;
use App\Models\Schedule;
use App\Models\Coach;
use App\Models\Booking;
use App\Models\Passenger;
use App\Models\Ticket;
use App\Models\Payment;
use App\Models\Complaint;
use App\Models\Notification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Core Users
        $admin = User::create([
            'name' => 'Admin Controller',
            'email' => 'admin@railway.gov.in',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $passenger = User::create([
            'name' => 'Shivanshu Sharma',
            'email' => 'passenger@gmail.com',
            'password' => Hash::make('passenger123'),
            'role' => 'passenger',
            'email_verified_at' => now(),
        ]);

        $agent = User::create([
            'name' => 'Bharat Agent Services',
            'email' => 'agent@railway.gov.in',
            'password' => Hash::make('agent123'),
            'role' => 'agent',
            'wallet_balance' => 10000.00,
            'email_verified_at' => now(),
        ]);

        $fakePassengers = [];
        $names = ['Amit Kumar', 'Priya Patel', 'Rahul Singh', 'Neha Sharma', 'Rohan Verma', 'Anjali Gupta'];
        foreach ($names as $idx => $name) {
            $fakePassengers[] = User::create([
                'name' => $name,
                'email' => 'passenger' . ($idx + 1) . '@example.com',
                'password' => Hash::make('password'),
                'role' => 'passenger',
                'email_verified_at' => now(),
            ]);
        }

        // 2. Create Stations
        $stationsData = [
            ['name' => 'New Delhi', 'code' => 'NDLS', 'city' => 'New Delhi'],
            ['name' => 'Howrah Junction', 'code' => 'HWH', 'city' => 'Kolkata'],
            ['name' => 'KSR Bengaluru City', 'code' => 'SBC', 'city' => 'Bengaluru'],
            ['name' => 'MGR Chennai Central', 'code' => 'MAS', 'city' => 'Chennai'],
            ['name' => 'Chhatrapati Shivaji Terminus', 'code' => 'CSTM', 'city' => 'Mumbai'],
            ['name' => 'Lucknow Charbagh', 'code' => 'LKO', 'city' => 'Lucknow'],
            ['name' => 'Patna Junction', 'code' => 'PNBE', 'city' => 'Patna'],
            ['name' => 'Gorakhpur Junction', 'code' => 'GKP', 'city' => 'Gorakhpur'],
            ['name' => 'Ahmedabad Junction', 'code' => 'ADI', 'city' => 'Ahmedabad'],
            ['name' => 'Pune Junction', 'code' => 'PUNE', 'city' => 'Pune'],
            ['name' => 'Secunderabad Junction', 'code' => 'SC', 'city' => 'Hyderabad'],
            ['name' => 'Kanpur Central', 'code' => 'CNB', 'city' => 'Kanpur'],
            ['name' => 'Jaipur Junction', 'code' => 'JP', 'city' => 'Jaipur'],
            ['name' => 'Bhopal Junction', 'code' => 'BPL', 'city' => 'Bhopal'],
            ['name' => 'Nagpur Junction', 'code' => 'NGP', 'city' => 'Nagpur'],
            ['name' => 'Visakhapatnam Junction', 'code' => 'VSKP', 'city' => 'Visakhapatnam'],
            ['name' => 'Ranchi Junction', 'code' => 'RNC', 'city' => 'Ranchi'],
            ['name' => 'Bhubaneswar', 'code' => 'BBS', 'city' => 'Bhubaneswar'],
            ['name' => 'Guwahati', 'code' => 'GHY', 'city' => 'Guwahati'],
            ['name' => 'Dehradun', 'code' => 'DDN', 'city' => 'Dehradun'],
            ['name' => 'Jammu Tawi', 'code' => 'JAT', 'city' => 'Jammu'],
            ['name' => 'Amritsar Junction', 'code' => 'ASR', 'city' => 'Amritsar'],
            ['name' => 'Chandigarh Junction', 'code' => 'CDG', 'city' => 'Chandigarh'],
            ['name' => 'Varanasi Junction', 'code' => 'BSB', 'city' => 'Varanasi'],
            ['name' => 'Prayagraj Junction', 'code' => 'PRYJ', 'city' => 'Prayagraj'],
            ['name' => 'Agra Cantt.', 'code' => 'AGC', 'city' => 'Agra'],
            ['name' => 'Gwalior Junction', 'code' => 'GWL', 'city' => 'Gwalior'],
            ['name' => 'VGL Jhansi Junction', 'code' => 'VGLJ', 'city' => 'Jhansi'],
            ['name' => 'Indore Junction', 'code' => 'INDB', 'city' => 'Indore'],
            ['name' => 'Jabalpur Junction', 'code' => 'JBP', 'city' => 'Jabalpur'],
            ['name' => 'Raipur Junction', 'code' => 'R', 'city' => 'Raipur'],
            ['name' => 'Bilaspur Junction', 'code' => 'BSP', 'city' => 'Bilaspur'],
            ['name' => 'Cuttack Junction', 'code' => 'CTC', 'city' => 'Cuttack'],
            ['name' => 'Puri', 'code' => 'PURI', 'city' => 'Puri'],
            ['name' => 'Rourkela Junction', 'code' => 'ROU', 'city' => 'Rourkela'],
            ['name' => 'Tatanagar Junction', 'code' => 'TATA', 'city' => 'Jamshedpur'],
            ['name' => 'Dhanbad Junction', 'code' => 'DHN', 'city' => 'Dhanbad'],
            ['name' => 'Gaya Junction', 'code' => 'GAYA', 'city' => 'Gaya'],
            ['name' => 'Muzaffarpur Junction', 'code' => 'MFP', 'city' => 'Muzaffarpur'],
            ['name' => 'Bhagalpur Junction', 'code' => 'BGP', 'city' => 'Bhagalpur'],
            ['name' => 'Darbhanga Junction', 'code' => 'DBG', 'city' => 'Darbhanga'],
            ['name' => 'New Jalpaiguri', 'code' => 'NJP', 'city' => 'Siliguri'],
            ['name' => 'Asansol Junction', 'code' => 'ASN', 'city' => 'Asansol'],
            ['name' => 'Kharagpur Junction', 'code' => 'KGP', 'city' => 'Kharagpur'],
            ['name' => 'Balasore', 'code' => 'BLS', 'city' => 'Balasore'],
            ['name' => 'Vijayawada Junction', 'code' => 'BZA', 'city' => 'Vijayawada'],
            ['name' => 'Nellore', 'code' => 'NLR', 'city' => 'Nellore'],
            ['name' => 'Tirupati', 'code' => 'TPTY', 'city' => 'Tirupati'],
            ['name' => 'Coimbatore Junction', 'code' => 'CBE', 'city' => 'Coimbatore'],
            ['name' => 'Madurai Junction', 'code' => 'MDU', 'city' => 'Madurai'],
            ['name' => 'Tiruchchirappalli Junction', 'code' => 'TPJ', 'city' => 'Trichy'],
            ['name' => 'Salem Junction', 'code' => 'SA', 'city' => 'Salem'],
            ['name' => 'Ernakulam Junction', 'code' => 'ERS', 'city' => 'Kochi'],
            ['name' => 'Kozhikode Main', 'code' => 'CLT', 'city' => 'Kozhikode'],
            ['name' => 'Thiruvananthapuram Central', 'code' => 'TVC', 'city' => 'Trivandrum'],
            ['name' => 'Mangaluru Central', 'code' => 'MAQ', 'city' => 'Mangalore'],
            ['name' => 'Mysuru Junction', 'code' => 'MYS', 'city' => 'Mysore'],
            ['name' => 'Hubballi Junction', 'code' => 'UBL', 'city' => 'Hubli'],
            ['name' => 'Belagavi', 'code' => 'BGM', 'city' => 'Belgaum'],
            ['name' => 'Madgaon Junction', 'code' => 'MAO', 'city' => 'Goa'],
            ['name' => 'Kolhapur SCSMT', 'code' => 'KOP', 'city' => 'Kolhapur'],
            ['name' => 'Solapur', 'code' => 'SUR', 'city' => 'Solapur'],
            ['name' => 'Aurangabad', 'code' => 'AWB', 'city' => 'Aurangabad'],
            ['name' => 'Hazur Sahib Nanded', 'code' => 'NED', 'city' => 'Nanded'],
            ['name' => 'Nashik Road', 'code' => 'NK', 'city' => 'Nashik'],
            ['name' => 'Vadodara Junction', 'code' => 'BRC', 'city' => 'Vadodara'],
            ['name' => 'Surat', 'code' => 'ST', 'city' => 'Surat'],
            ['name' => 'Rajkot Junction', 'code' => 'RJT', 'city' => 'Rajkot'],
            ['name' => 'Bhavnagar Terminus', 'code' => 'BVC', 'city' => 'Bhavnagar'],
            ['name' => 'Udaipur City', 'code' => 'UDZ', 'city' => 'Udaipur'],
            ['name' => 'Ajmer Junction', 'code' => 'AII', 'city' => 'Ajmer'],
            ['name' => 'Jodhpur Junction', 'code' => 'JU', 'city' => 'Jodhpur'],
            ['name' => 'Bikaner Junction', 'code' => 'BKN', 'city' => 'Bikaner'],
            ['name' => 'Kota Junction', 'code' => 'KOTA', 'city' => 'Kota'],
            ['name' => 'Ujjain Junction', 'code' => 'UJN', 'city' => 'Ujjain'],
            ['name' => 'Ratlam Junction', 'code' => 'RTM', 'city' => 'Ratlam'],
            ['name' => 'Mathura Junction', 'code' => 'MTJ', 'city' => 'Mathura'],
            ['name' => 'Aligarh Junction', 'code' => 'ALJN', 'city' => 'Aligarh'],
            ['name' => 'Bareilly Junction', 'code' => 'BE', 'city' => 'Bareilly'],
            ['name' => 'Moradabad Junction', 'code' => 'MB', 'city' => 'Moradabad'],
            ['name' => 'Saharanpur Junction', 'code' => 'SRE', 'city' => 'Saharanpur'],
            ['name' => 'Haridwar', 'code' => 'HW', 'city' => 'Haridwar'],
            ['name' => 'Roorkee', 'code' => 'RK', 'city' => 'Roorkee'],
            ['name' => 'Ambala Cantt. Junction', 'code' => 'UMB', 'city' => 'Ambala'],
            ['name' => 'Ludhiana Junction', 'code' => 'LDH', 'city' => 'Ludhiana'],
            ['name' => 'Jalandhar City Junction', 'code' => 'JUC', 'city' => 'Jalandhar'],
            ['name' => 'Pathankot Cantt.', 'code' => 'PTKC', 'city' => 'Pathankot'],
            ['name' => 'Udhampur', 'code' => 'UHP', 'city' => 'Udhampur'],
            ['name' => 'Katara Jammu', 'code' => 'SVDK', 'city' => 'Katra'],
            ['name' => 'Shalimar', 'code' => 'SHM', 'city' => 'Kolkata'],
            ['name' => 'Sealdah', 'code' => 'SDAH', 'city' => 'Kolkata'],
            ['name' => 'Bandra Terminus', 'code' => 'BDTS', 'city' => 'Mumbai'],
            ['name' => 'Mumbai Central', 'code' => 'MMCT', 'city' => 'Mumbai'],
            ['name' => 'Lokmanya Tilak Terminus', 'code' => 'LTT', 'city' => 'Mumbai'],
            ['name' => 'Yesvantpur Junction', 'code' => 'YPR', 'city' => 'Bengaluru'],
            ['name' => 'Kachiguda', 'code' => 'KCG', 'city' => 'Hyderabad'],
            ['name' => 'Chennai Egmore', 'code' => 'MS', 'city' => 'Chennai'],
            ['name' => 'Tambaram', 'code' => 'TBM', 'city' => 'Chennai'],
            ['name' => 'Anand Vihar Terminus', 'code' => 'ANVT', 'city' => 'Delhi'],
            ['name' => 'Hazrat Nizamuddin', 'code' => 'NZM', 'city' => 'Delhi']
        ];

        $stations = [];
        foreach ($stationsData as $s) {
            $stations[$s['code']] = Station::create($s);
        }

        // 3. Create Bidirectional Trains & Routes (25 routes * 2 = 50 trains)
        $routesConfig = [
            [
                'forward_no' => '12301', 'reverse_no' => '12302',
                'forward_name' => 'Howrah Rajdhani Express', 'reverse_name' => 'Kolkata New Delhi Rajdhani Express',
                'type' => 'Rajdhani', 'runs_on' => '1,2,3,4,5,6,7',
                'stops' => [
                    ['code' => 'NDLS', 'arr' => null, 'dep' => '16:55:00', 'dist' => 0, 'fare' => 1.00],
                    ['code' => 'PNBE', 'arr' => '05:45:00', 'dep' => '05:55:00', 'dist' => 998, 'fare' => 1.20],
                    ['code' => 'HWH', 'arr' => '12:15:00', 'dep' => null, 'dist' => 1450, 'fare' => 1.40],
                ]
            ],
            [
                'forward_no' => '12004', 'reverse_no' => '12003',
                'forward_name' => 'Lucknow Swarn Shatabdi Express', 'reverse_name' => 'New Delhi Swarn Shatabdi Express',
                'type' => 'Shatabdi', 'runs_on' => '1,2,3,4,5,6,7',
                'stops' => [
                    ['code' => 'NDLS', 'arr' => null, 'dep' => '06:10:00', 'dist' => 0, 'fare' => 1.00],
                    ['code' => 'CNB', 'arr' => '11:20:00', 'dep' => '11:25:00', 'dist' => 440, 'fare' => 1.15],
                    ['code' => 'LKO', 'arr' => '12:40:00', 'dep' => null, 'dist' => 512, 'fare' => 1.25],
                ]
            ],
            [
                'forward_no' => '22692', 'reverse_no' => '22691',
                'forward_name' => 'Hazrat Nizamuddin Bengaluru Rajdhani', 'reverse_name' => 'Bengaluru Hazrat Nizamuddin Rajdhani',
                'type' => 'Rajdhani', 'runs_on' => '1,3,4,6',
                'stops' => [
                    ['code' => 'NDLS', 'arr' => null, 'dep' => '19:50:00', 'dist' => 0, 'fare' => 1.00],
                    ['code' => 'SC', 'arr' => '14:20:00', 'dep' => '14:35:00', 'dist' => 1670, 'fare' => 1.35],
                    ['code' => 'SBC', 'arr' => '05:20:00', 'dep' => null, 'dist' => 2365, 'fare' => 1.50],
                ]
            ],
            [
                'forward_no' => '12616', 'reverse_no' => '12615',
                'forward_name' => 'Grand Trunk Express', 'reverse_name' => 'Grand Trunk Express (Reverse)',
                'type' => 'Superfast', 'runs_on' => '1,2,3,4,5,6,7',
                'stops' => [
                    ['code' => 'NDLS', 'arr' => null, 'dep' => '18:40:00', 'dist' => 0, 'fare' => 1.00],
                    ['code' => 'BPL', 'arr' => '05:25:00', 'dep' => '05:30:00', 'dist' => 700, 'fare' => 1.20],
                    ['code' => 'MAS', 'arr' => '06:20:00', 'dep' => null, 'dist' => 2182, 'fare' => 1.45],
                ]
            ],
            [
                'forward_no' => '12137', 'reverse_no' => '12138',
                'forward_name' => 'Punjab Mail (NDLS to CSTM)', 'reverse_name' => 'Punjab Mail (CSTM to NDLS)',
                'type' => 'Express', 'runs_on' => '1,2,3,4,5,6,7',
                'stops' => [
                    ['code' => 'NDLS', 'arr' => null, 'dep' => '21:40:00', 'dist' => 0, 'fare' => 1.00],
                    ['code' => 'ADI', 'arr' => '10:15:00', 'dep' => '10:30:00', 'dist' => 960, 'fare' => 1.25],
                    ['code' => 'CSTM', 'arr' => '19:35:00', 'dep' => null, 'dist' => 1540, 'fare' => 1.40],
                ]
            ],
            [
                'forward_no' => '12958', 'reverse_no' => '12957',
                'forward_name' => 'Swarna Jayanti Rajdhani', 'reverse_name' => 'Swarna Jayanti Rajdhani (Reverse)',
                'type' => 'Rajdhani', 'runs_on' => '1,2,3,4,5,6,7',
                'stops' => [
                    ['code' => 'NDLS', 'arr' => null, 'dep' => '19:55:00', 'dist' => 0, 'fare' => 1.00],
                    ['code' => 'JP', 'arr' => '00:30:00', 'dep' => '00:40:00', 'dist' => 308, 'fare' => 1.15],
                    ['code' => 'ADI', 'arr' => '08:40:00', 'dep' => null, 'dist' => 930, 'fare' => 1.35],
                ]
            ],
            [
                'forward_no' => '12264', 'reverse_no' => '12263',
                'forward_name' => 'Pune Duronto Express', 'reverse_name' => 'Pune Duronto Express (Reverse)',
                'type' => 'Superfast', 'runs_on' => '1,2,3,4,5,6,7',
                'stops' => [
                    ['code' => 'NDLS', 'arr' => null, 'dep' => '11:10:00', 'dist' => 0, 'fare' => 1.00],
                    ['code' => 'BRC', 'arr' => '22:30:00', 'dep' => '22:40:00', 'dist' => 992, 'fare' => 1.25],
                    ['code' => 'PUNE', 'arr' => '07:10:00', 'dep' => null, 'dist' => 1520, 'fare' => 1.45],
                ]
            ],
            [
                'forward_no' => '12425', 'reverse_no' => '12426',
                'forward_name' => 'Jammu Rajdhani Express', 'reverse_name' => 'New Delhi Jammu Rajdhani',
                'type' => 'Rajdhani', 'runs_on' => '1,2,3,4,5,6,7',
                'stops' => [
                    ['code' => 'NDLS', 'arr' => null, 'dep' => '20:40:00', 'dist' => 0, 'fare' => 1.00],
                    ['code' => 'LDH', 'arr' => '01:15:00', 'dep' => '01:25:00', 'dist' => 312, 'fare' => 1.15],
                    ['code' => 'JAT', 'arr' => '05:45:00', 'dep' => null, 'dist' => 577, 'fare' => 1.30],
                ]
            ],
            [
                'forward_no' => '22439', 'reverse_no' => '22440',
                'forward_name' => 'New Delhi Katra Vande Bharat', 'reverse_name' => 'Katra New Delhi Vande Bharat',
                'type' => 'Superfast', 'runs_on' => '1,2,3,4,6,7',
                'stops' => [
                    ['code' => 'NDLS', 'arr' => null, 'dep' => '06:00:00', 'dist' => 0, 'fare' => 1.00],
                    ['code' => 'UMB', 'arr' => '08:10:00', 'dep' => '08:12:00', 'dist' => 199, 'fare' => 1.10],
                    ['code' => 'SVDK', 'arr' => '14:00:00', 'dep' => null, 'dist' => 655, 'fare' => 1.35],
                ]
            ],
            [
                'forward_no' => '12013', 'reverse_no' => '12014',
                'forward_name' => 'Amritsar Shatabdi Express', 'reverse_name' => 'New Delhi Amritsar Shatabdi',
                'type' => 'Shatabdi', 'runs_on' => '1,2,3,4,5,6,7',
                'stops' => [
                    ['code' => 'NDLS', 'arr' => null, 'dep' => '16:30:00', 'dist' => 0, 'fare' => 1.00],
                    ['code' => 'JUC', 'arr' => '21:15:00', 'dep' => '21:17:00', 'dist' => 370, 'fare' => 1.15],
                    ['code' => 'ASR', 'arr' => '22:30:00', 'dep' => null, 'dist' => 448, 'fare' => 1.25],
                ]
            ],
            [
                'forward_no' => '22812', 'reverse_no' => '22811',
                'forward_name' => 'Bhubaneswar Rajdhani Express', 'reverse_name' => 'New Delhi Bhubaneswar Rajdhani',
                'type' => 'Rajdhani', 'runs_on' => '2,3,5,6',
                'stops' => [
                    ['code' => 'NDLS', 'arr' => null, 'dep' => '17:05:00', 'dist' => 0, 'fare' => 1.00],
                    ['code' => 'TATA', 'arr' => '10:35:00', 'dep' => '10:45:00', 'dist' => 1341, 'fare' => 1.30],
                    ['code' => 'BBS', 'arr' => '16:15:00', 'dep' => null, 'dist' => 1730, 'fare' => 1.45],
                ]
            ],
            [
                'forward_no' => '12424', 'reverse_no' => '12423',
                'forward_name' => 'Dibrugarh Rajdhani Express', 'reverse_name' => 'New Delhi Dibrugarh Rajdhani',
                'type' => 'Rajdhani', 'runs_on' => '1,2,3,4,5,6,7',
                'stops' => [
                    ['code' => 'NDLS', 'arr' => null, 'dep' => '16:10:00', 'dist' => 0, 'fare' => 1.00],
                    ['code' => 'NJP', 'arr' => '13:15:00', 'dep' => '13:25:00', 'dist' => 1466, 'fare' => 1.30],
                    ['code' => 'GHY', 'arr' => '20:10:00', 'dep' => null, 'dist' => 2050, 'fare' => 1.45],
                ]
            ],
            [
                'forward_no' => '12859', 'reverse_no' => '12860',
                'forward_name' => 'Gitanjali Express', 'reverse_name' => 'Gitanjali Express (Reverse)',
                'type' => 'Superfast', 'runs_on' => '1,2,3,4,5,6,7',
                'stops' => [
                    ['code' => 'CSTM', 'arr' => null, 'dep' => '06:00:00', 'dist' => 0, 'fare' => 1.00],
                    ['code' => 'NGP', 'arr' => '18:55:00', 'dep' => '19:00:00', 'dist' => 837, 'fare' => 1.20],
                    ['code' => 'HWH', 'arr' => '12:30:00', 'dep' => null, 'dist' => 1968, 'fare' => 1.45],
                ]
            ],
            [
                'forward_no' => '12863', 'reverse_no' => '12864',
                'forward_name' => 'Howrah Yesvantpur Express', 'reverse_name' => 'Yesvantpur Howrah Express',
                'type' => 'Express', 'runs_on' => '1,2,3,4,5,6,7',
                'stops' => [
                    ['code' => 'HWH', 'arr' => null, 'dep' => '22:55:00', 'dist' => 0, 'fare' => 1.00],
                    ['code' => 'VSKP', 'arr' => '12:45:00', 'dep' => '13:05:00', 'dist' => 878, 'fare' => 1.20],
                    ['code' => 'SBC', 'arr' => '07:15:00', 'dep' => null, 'dist' => 1954, 'fare' => 1.45],
                ]
            ],
            [
                'forward_no' => '12028', 'reverse_no' => '12027',
                'forward_name' => 'Bengaluru Chennai Shatabdi', 'reverse_name' => 'Chennai Bengaluru Shatabdi',
                'type' => 'Shatabdi', 'runs_on' => '1,2,4,5,6,7',
                'stops' => [
                    ['code' => 'SBC', 'arr' => null, 'dep' => '06:00:00', 'dist' => 0, 'fare' => 1.00],
                    ['code' => 'SA', 'arr' => '09:05:00', 'dep' => '09:10:00', 'dist' => 200, 'fare' => 1.10],
                    ['code' => 'MAS', 'arr' => '11:00:00', 'dep' => null, 'dist' => 362, 'fare' => 1.20],
                ]
            ],
            [
                'forward_no' => '12841', 'reverse_no' => '12842',
                'forward_name' => 'Coromandel Express', 'reverse_name' => 'Coromandel Express (Reverse)',
                'type' => 'Superfast', 'runs_on' => '1,2,3,4,5,6,7',
                'stops' => [
                    ['code' => 'HWH', 'arr' => null, 'dep' => '15:20:05', 'dist' => 0, 'fare' => 1.00],
                    ['code' => 'BBS', 'arr' => '21:40:00', 'dep' => '21:45:00', 'dist' => 437, 'fare' => 1.15],
                    ['code' => 'MAS', 'arr' => '11:15:00', 'dep' => null, 'dist' => 1659, 'fare' => 1.40],
                ]
            ],
            [
                'forward_no' => '11013', 'reverse_no' => '11014',
                'forward_name' => 'Mumbai Bengaluru Express', 'reverse_name' => 'Bengaluru Mumbai Express',
                'type' => 'Express', 'runs_on' => '1,2,3,4,5,6,7',
                'stops' => [
                    ['code' => 'CSTM', 'arr' => null, 'dep' => '22:35:00', 'dist' => 0, 'fare' => 1.00],
                    ['code' => 'PUNE', 'arr' => '02:00:00', 'dep' => '02:05:00', 'dist' => 192, 'fare' => 1.10],
                    ['code' => 'SBC', 'arr' => '21:10:00', 'dep' => null, 'dist' => 1135, 'fare' => 1.35],
                ]
            ],
            [
                'forward_no' => '22159', 'reverse_no' => '22160',
                'forward_name' => 'Mumbai Chennai Mail', 'reverse_name' => 'Chennai Mumbai Mail',
                'type' => 'Express', 'runs_on' => '1,2,3,4,5,6,7',
                'stops' => [
                    ['code' => 'CSTM', 'arr' => null, 'dep' => '12:45:00', 'dist' => 0, 'fare' => 1.00],
                    ['code' => 'SUR', 'arr' => '20:15:00', 'dep' => '20:20:00', 'dist' => 455, 'fare' => 1.15],
                    ['code' => 'MAS', 'arr' => '10:45:00', 'dep' => null, 'dist' => 1284, 'fare' => 1.35],
                ]
            ],
            [
                'forward_no' => '13240', 'reverse_no' => '13239',
                'forward_name' => 'Lucknow Patna Express', 'reverse_name' => 'Patna Lucknow Express',
                'type' => 'Express', 'runs_on' => '2,4,6,7',
                'stops' => [
                    ['code' => 'LKO', 'arr' => null, 'dep' => '23:10:00', 'dist' => 0, 'fare' => 1.00],
                    ['code' => 'BSB', 'arr' => '05:30:00', 'dep' => '05:40:00', 'dist' => 301, 'fare' => 1.15],
                    ['code' => 'PNBE', 'arr' => '10:30:00', 'dep' => null, 'dist' => 530, 'fare' => 1.30],
                ]
            ],
            [
                'forward_no' => '12916', 'reverse_no' => '12915',
                'forward_name' => 'Ashram Express (Jaipur to ADI)', 'reverse_name' => 'Ashram Express (ADI to Jaipur)',
                'type' => 'Superfast', 'runs_on' => '1,2,3,4,5,6,7',
                'stops' => [
                    ['code' => 'JP', 'arr' => null, 'dep' => '20:25:00', 'dist' => 0, 'fare' => 1.00],
                    ['code' => 'UDZ', 'arr' => '02:30:00', 'dep' => '02:40:00', 'dist' => 432, 'fare' => 1.15],
                    ['code' => 'ADI', 'arr' => '08:15:00', 'dep' => null, 'dist' => 687, 'fare' => 1.30],
                ]
            ],
            [
                'forward_no' => '19711', 'reverse_no' => '19712',
                'forward_name' => 'Jaipur Bhopal Express', 'reverse_name' => 'Bhopal Jaipur Express',
                'type' => 'Express', 'runs_on' => '1,2,3,4,5,6,7',
                'stops' => [
                    ['code' => 'JP', 'arr' => null, 'dep' => '18:25:00', 'dist' => 0, 'fare' => 1.00],
                    ['code' => 'UJN', 'arr' => '04:10:00', 'dep' => '04:20:00', 'dist' => 520, 'fare' => 1.20],
                    ['code' => 'BPL', 'arr' => '07:20:00', 'dep' => null, 'dist' => 705, 'fare' => 1.30],
                ]
            ],
            [
                'forward_no' => '19303', 'reverse_no' => '19304',
                'forward_name' => 'Indore Bhopal Express', 'reverse_name' => 'Bhopal Indore Express',
                'type' => 'Express', 'runs_on' => '1,2,3,4,5,6,7',
                'stops' => [
                    ['code' => 'INDB', 'arr' => null, 'dep' => '23:15:00', 'dist' => 0, 'fare' => 1.00],
                    ['code' => 'UJN', 'arr' => '00:40:00', 'dep' => '00:45:00', 'dist' => 80, 'fare' => 1.05],
                    ['code' => 'BPL', 'arr' => '03:45:00', 'dep' => null, 'dist' => 263, 'fare' => 1.20],
                ]
            ],
            [
                'forward_no' => '12334', 'reverse_no' => '12333',
                'forward_name' => 'Vibhuti Express (BSB to PNBE)', 'reverse_name' => 'Vibhuti Express (PNBE to BSB)',
                'type' => 'Express', 'runs_on' => '1,2,3,4,5,6,7',
                'stops' => [
                    ['code' => 'BSB', 'arr' => null, 'dep' => '18:00:00', 'dist' => 0, 'fare' => 1.00],
                    ['code' => 'GAYA', 'arr' => '22:10:00', 'dep' => '22:20:00', 'dist' => 220, 'fare' => 1.10],
                    ['code' => 'PNBE', 'arr' => '00:45:00', 'dep' => null, 'dist' => 312, 'fare' => 1.20],
                ]
            ],
            [
                'forward_no' => '14204', 'reverse_no' => '14203',
                'forward_name' => 'Lucknow Varanasi Intercity', 'reverse_name' => 'Varanasi Lucknow Intercity',
                'type' => 'Express', 'runs_on' => '1,2,3,4,5,6,7',
                'stops' => [
                    ['code' => 'LKO', 'arr' => null, 'dep' => '07:00:00', 'dist' => 0, 'fare' => 1.00],
                    ['code' => 'PRYJ', 'arr' => '10:45:00', 'dep' => '10:55:00', 'dist' => 200, 'fare' => 1.10],
                    ['code' => 'BSB', 'arr' => '12:30:00', 'dep' => null, 'dist' => 320, 'fare' => 1.20],
                ]
            ],
            [
                'forward_no' => '12017', 'reverse_no' => '12018',
                'forward_name' => 'Dehradun Shatabdi Express', 'reverse_name' => 'New Delhi Dehradun Shatabdi',
                'type' => 'Shatabdi', 'runs_on' => '1,2,3,4,5,6,7',
                'stops' => [
                    ['code' => 'NDLS', 'arr' => null, 'dep' => '06:45:00', 'dist' => 0, 'fare' => 1.00],
                    ['code' => 'HW', 'arr' => '11:20:00', 'dep' => '11:25:00', 'dist' => 250, 'fare' => 1.15],
                    ['code' => 'DDN', 'arr' => '12:50:00', 'dep' => null, 'dist' => 305, 'fare' => 1.25],
                ]
            ]
        ];

        $trains = [];
        foreach ($routesConfig as $cfg) {
            // Forward Train
            $forwardTrain = Train::create([
                'train_number' => $cfg['forward_no'],
                'name' => $cfg['forward_name'],
                'type' => $cfg['type'],
                'source_station_id' => $stations[$cfg['stops'][0]['code']]->id,
                'destination_station_id' => $stations[$cfg['stops'][count($cfg['stops']) - 1]['code']]->id,
                'runs_on' => $cfg['runs_on'],
            ]);

            foreach ($cfg['stops'] as $index => $stop) {
                Route::create([
                    'train_id' => $forwardTrain->id,
                    'station_id' => $stations[$stop['code']]->id,
                    'stop_number' => $index + 1,
                    'arrival_time' => $stop['arr'],
                    'departure_time' => $stop['dep'],
                    'distance_from_source' => $stop['dist'],
                    'fare_factor' => $stop['fare'],
                ]);
            }
            $trains[$forwardTrain->train_number] = $forwardTrain;

            // Reverse Train
            $reverseTrain = Train::create([
                'train_number' => $cfg['reverse_no'],
                'name' => $cfg['reverse_name'],
                'type' => $cfg['type'],
                'source_station_id' => $stations[$cfg['stops'][count($cfg['stops']) - 1]['code']]->id,
                'destination_station_id' => $stations[$cfg['stops'][0]['code']]->id,
                'runs_on' => $cfg['runs_on'],
            ]);

            $reversedStops = array_reverse($cfg['stops']);
            $totalDistance = $cfg['stops'][count($cfg['stops']) - 1]['dist'];

            foreach ($reversedStops as $index => $stop) {
                $isFirst = ($index === 0);
                $isLast = ($index === count($reversedStops) - 1);

                $dist = $totalDistance - $stop['dist'];
                $totalFareFactor = $cfg['stops'][count($cfg['stops']) - 1]['fare'];
                $fare = 1.00 + ($totalFareFactor - $stop['fare']);

                $arrTime = null;
                $depTime = null;
                if ($isFirst) {
                    $depTime = '15:00:00';
                } elseif ($isLast) {
                    $arrTime = '06:00:00';
                } else {
                    $arrTime = '22:00:00';
                    $depTime = '22:10:00';
                }

                Route::create([
                    'train_id' => $reverseTrain->id,
                    'station_id' => $stations[$stop['code']]->id,
                    'stop_number' => $index + 1,
                    'arrival_time' => $arrTime,
                    'departure_time' => $depTime,
                    'distance_from_source' => $dist,
                    'fare_factor' => $fare,
                ]);
            }
            $trains[$reverseTrain->train_number] = $reverseTrain;
        }

        // 5. Create Coaches
        $coachClasses = [
            '1A' => ['prefix' => 'H', 'count' => 1, 'seats' => 24],
            '2A' => ['prefix' => 'A', 'count' => 2, 'seats' => 46],
            '3A' => ['prefix' => 'B', 'count' => 3, 'seats' => 64],
            'SL' => ['prefix' => 'S', 'count' => 4, 'seats' => 72],
            'CC' => ['prefix' => 'C', 'count' => 2, 'seats' => 60],
        ];

        foreach ($trains as $train) {
            foreach ($coachClasses as $class => $cfg) {
                // If it's a Rajdhani, skip CC (Chair Car), they usually don't have CC
                if ($train->type === 'Rajdhani' && $class === 'CC') continue;
                // If it's Shatabdi, skip SL and 1A, Shatabdi is CC and EC (2A equivalent)
                if ($train->type === 'Shatabdi' && in_array($class, ['SL', '1A'])) continue;

                for ($i = 1; $i <= $cfg['count']; $i++) {
                    Coach::create([
                        'train_id' => $train->id,
                        'coach_number' => $cfg['prefix'] . $i,
                        'class_type' => $class,
                        'total_seats' => $cfg['seats'],
                    ]);
                }
            }
        }

        // 6. Create Schedules (for next 15 days, starting from 2026-05-22)
        $schedules = [];
        $startDate = Carbon::create(2026, 5, 22);

        for ($d = 0; $d < 15; $d++) {
            $currentDate = $startDate->copy()->addDays($d);
            $dayOfWeek = $currentDate->dayOfWeek === 0 ? 7 : $currentDate->dayOfWeek; // 1=Mon, 7=Sun

            foreach ($trains as $train) {
                $runsOn = explode(',', $train->runs_on);
                if (in_array($dayOfWeek, $runsOn)) {
                    // Introduce a few delays/cancellations randomly
                    $status = 'Scheduled';
                    $delay = 0;
                    $rand = rand(1, 20);
                    if ($rand === 1) {
                        $status = 'Delayed';
                        $delay = rand(15, 120); // 15 to 120 mins delay
                    } elseif ($rand === 2) {
                        $status = 'Cancelled';
                    }

                    $schedules[] = Schedule::create([
                        'train_id' => $train->id,
                        'departure_date' => $currentDate->format('Y-m-d'),
                        'status' => $status,
                        'delay_minutes' => $delay,
                    ]);
                }
            }
        }

        // 7. Seed Simulated Bookings & Passengers
        // We will seed bookings on the first schedule (2026-05-22)
        $todaySchedules = collect($schedules)->filter(function($s) {
            return $s->departure_date === '2026-05-22' && $s->status === 'Scheduled';
        });

        $bookingCounter = 1;
        foreach ($todaySchedules as $schedule) {
            $train = $schedule->train;
            // Let's create some bookings for different classes
            $classes = ['1A', '2A', '3A', 'SL'];
            if ($train->type === 'Shatabdi') {
                $classes = ['CC', '2A'];
            }

            foreach ($classes as $class) {
                // Book 5-10 seats in each class to simulate real occupancy
                $coaches = Coach::where('train_id', $train->id)->where('class_type', $class)->get();
                if ($coaches->isEmpty()) continue;

                $numBookings = rand(1, 4);
                for ($b = 0; $b < $numBookings; $b++) {
                    $randomPassengerUser = $fakePassengers[array_rand($fakePassengers)];
                    $pnr = '4' . str_pad($bookingCounter . rand(100, 999), 9, '0', STR_PAD_LEFT);
                    
                    // Route endpoints
                    $source = Route::where('train_id', $train->id)->orderBy('stop_number', 'asc')->first();
                    $dest = Route::where('train_id', $train->id)->orderBy('stop_number', 'desc')->first();

                    $baseFare = 150.00;
                    if ($class === '1A') $baseFare = 1200.00;
                    elseif ($class === '2A') $baseFare = 800.00;
                    elseif ($class === '3A') $baseFare = 500.00;
                    elseif ($class === 'CC') $baseFare = 450.00;

                    $numPassengers = rand(1, 3);
                    $totalFare = $baseFare * $numPassengers * $dest->fare_factor;

                    $booking = Booking::create([
                        'user_id' => $randomPassengerUser->id,
                        'train_id' => $train->id,
                        'schedule_id' => $schedule->id,
                        'pnr' => $pnr,
                        'booking_date' => Carbon::create(2026, 5, 21, rand(9, 21), rand(1, 59)),
                        'journey_date' => '2026-05-22',
                        'source_station_id' => $source->station_id,
                        'destination_station_id' => $dest->station_id,
                        'class_type' => $class,
                        'total_fare' => $totalFare,
                        'status' => 'Booked',
                    ]);

                    // Create Payment
                    Payment::create([
                        'booking_id' => $booking->id,
                        'transaction_id' => 'TXN' . strtoupper(uniqid()),
                        'amount' => $totalFare,
                        'payment_status' => 'Success',
                        'payment_method' => ['UPI', 'Card', 'Net Banking'][rand(0, 2)],
                    ]);

                    // Assign seats
                    for ($p = 0; $p < $numPassengers; $p++) {
                        $coach = $coaches->random();
                        $seatNo = rand(1, $coach->total_seats);
                        
                        $passengerName = 'Passenger ' . rand(1, 100);
                        $age = rand(18, 65);
                        $gender = ['Male', 'Female'][rand(0, 1)];

                        $psg = Passenger::create([
                            'booking_id' => $booking->id,
                            'name' => $passengerName,
                            'age' => $age,
                            'gender' => $gender,
                            'coach_number' => $coach->coach_number,
                            'seat_number' => $seatNo,
                            'berth_preference' => ['Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper'][rand(0, 4)],
                            'status' => 'CNF',
                        ]);

                        Ticket::create([
                            'booking_id' => $booking->id,
                            'passenger_id' => $psg->id,
                            'ticket_number' => 'TKT' . str_pad($bookingCounter . $p . rand(100, 999), 10, '0', STR_PAD_LEFT),
                            'status' => 'Active',
                        ]);
                    }
                    $bookingCounter++;
                }
            }
        }

        // Create a direct booking for the main passenger user (Shivanshu) to test history
        $hwhRajdhani = $trains['12301'];
        $hwhSchedule = collect($schedules)->first(function($s) use ($hwhRajdhani) {
            return $s->train_id === $hwhRajdhani->id && $s->departure_date === '2026-05-24';
        });

        if ($hwhSchedule) {
            $myBooking = Booking::create([
                'user_id' => $passenger->id,
                'train_id' => $hwhRajdhani->id,
                'schedule_id' => $hwhSchedule->id,
                'pnr' => '9876543210',
                'booking_date' => Carbon::now(),
                'journey_date' => '2026-05-24',
                'source_station_id' => $stations['NDLS']->id,
                'destination_station_id' => $stations['HWH']->id,
                'class_type' => '3A',
                'total_fare' => 1750.00,
                'status' => 'Booked',
            ]);

            Payment::create([
                'booking_id' => $myBooking->id,
                'transaction_id' => 'TXN' . strtoupper(uniqid()),
                'amount' => 1750.00,
                'payment_status' => 'Success',
                'payment_method' => 'UPI',
            ]);

            $myPsg = Passenger::create([
                'booking_id' => $myBooking->id,
                'name' => 'Shivanshu Sharma',
                'age' => 24,
                'gender' => 'Male',
                'coach_number' => 'B1',
                'seat_number' => 7,
                'berth_preference' => 'Lower',
                'status' => 'CNF',
            ]);

            Ticket::create([
                'booking_id' => $myBooking->id,
                'passenger_id' => $myPsg->id,
                'ticket_number' => 'TKT1000000001',
                'status' => 'Active',
            ]);
        }

        // 8. Seed Complaints
        Complaint::create([
            'user_id' => $passenger->id,
            'booking_id' => isset($myBooking) ? $myBooking->id : null,
            'category' => 'Catering',
            'subject' => 'Cold meals served in B1 coach',
            'description' => 'I booked a meal via e-catering, but the rice and curry served were ice-cold and the container was partially leaking.',
            'status' => 'Resolved',
            'resolution_details' => 'Catering contractor was notified. A refund of Rs. 120 has been processed for the food charge, and the onboard coach team replaced the meal.',
        ]);

        Complaint::create([
            'user_id' => $passenger->id,
            'booking_id' => isset($myBooking) ? $myBooking->id : null,
            'category' => 'Cleanliness',
            'subject' => 'Washrooms in B1 coach dirty',
            'description' => 'The toilets in B1 coach do not have water and the trash bin is overflowing since departure from New Delhi.',
            'status' => 'Open',
        ]);

        Complaint::create([
            'user_id' => $fakePassengers[0]->id,
            'category' => 'Electrical',
            'subject' => 'Mobile charging port not working in S1 seat 25',
            'description' => 'The charging plug at seat 25 is loose and not supplying electricity. Please repair.',
            'status' => 'In Progress',
        ]);

        // 9. Seed Notifications
        Notification::create([
            'user_id' => $passenger->id,
            'type' => 'Booking',
            'title' => 'Ticket Booked Successfully!',
            'message' => 'Your ticket for Train 12301 - Howrah Rajdhani on 2026-05-24 has been booked successfully under PNR 9876543210. Coach: B1, Seat: 7 (CNF).',
            'read_status' => 'Read',
        ]);

        Notification::create([
            'user_id' => $passenger->id,
            'type' => 'Complaint',
            'title' => 'Complaint Resolved',
            'message' => 'Your complaint ticket regarding Cold meals served in B1 coach has been resolved. The refund has been initiated.',
            'read_status' => 'Unread',
        ]);

        // 10. Seed Meal Options
        $mealItems = [
            ['item_name' => 'North Indian Veg Thali', 'description' => 'Dal makhani, paneer, 2 roti, rice, sweet', 'price' => 150.00],
            ['item_name' => 'Chicken Biryani Combo', 'description' => 'Flavorful basmati rice with chicken, raita, salad', 'price' => 220.00],
            ['item_name' => 'South Indian Masala Dosa', 'description' => 'Crispy crepe with potato filling, sambar, chutney', 'price' => 110.00],
            ['item_name' => 'Kolkata Rosogolla Pack', 'description' => 'Box of 4 soft spongy syrup sweets', 'price' => 80.00],
            ['item_name' => 'Paneer Butter Masala Combo', 'description' => 'Creamy paneer gravy with 3 butter rotis or jeera rice', 'price' => 180.00],
        ];

        foreach (Station::all() as $station) {
            foreach ($mealItems as $item) {
                // Seed random subset for stations to make it realistic
                if (rand(0, 4) > 0) {
                    \App\Models\MealOption::create([
                        'station_id' => $station->id,
                        'item_name' => $item['item_name'],
                        'description' => $item['description'],
                        'price' => $item['price'],
                        'is_available' => true,
                    ]);
                }
            }
        }
    }
}
