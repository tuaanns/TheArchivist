<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        User::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $pwd = Hash::make('Thearchitist88@');
        $now = now();

        /**
         * Columns: [name, email, pwd, balance, free_used, phone, reg_days_ago, verified, role]
         * balance = (credits bought) – (credits spent). Must be ≥ 0 and consistent with PaymentSeeder logic.
         * free_used: 0–5. phone: real VN prefix patterns.
         * role: 'admin' or 'user'
         */
        $users = [
            // ── Super admins ──
            ['Mã Gia Tuấn',            'dongnguyenkh123@gmail.com',     Hash::make('Thearchitist88@'), 500,  5, '0901112233', 365, true, 'admin'],
            ['Quách Phú Thuận',        'thuanmobile1111@gmail.com',     Hash::make('Thearchitist88@'), 500,  5, '0901234567', 365, true, 'admin'],
            ['The Archivist Admin',    'thearchitist.admin@gmail.com',  Hash::make('Thearchitist88@'), 500,  5, '0909999999', 365, true, 'admin'],
            
            // ── Test accounts for different roles ──
            ['The Archivist User',     'thearchitist.user@gmail.com',   $pwd, 100, 3, '0908888888', 180, true, 'user'],

            // ── Power users – đã nạp gói Chuyên Gia (200 credits), còn nhiều ──
            ['Nguyễn Minh Tuấn',       'minhtuannguyen95@gmail.com',    $pwd, 192, 5, '0912345601', 310, true, 'user'],
            ['Trần Quốc Hùng',         'quochung.tran@gmail.com',       $pwd, 187, 5, '0909876502', 280, true, 'user'],
            ['Lê Hoàng Phúc',          'hoangphuc.le1992@gmail.com',    $pwd, 196, 5, '0934567803', 260, true, 'user'],
            ['Phạm Đức Thắng',         'ducthang.pham@gmail.com',       $pwd, 183, 5, '0978123404', 250, true, 'user'],
            ['Hoàng Minh Tú',          'minhtuphuong98@gmail.com',      $pwd, 145, 5, '0898667705', 240, true, 'user'],
            ['Bùi Quang Huy',          'quanghuy.bui2000@gmail.com',    $pwd, 178, 5, '0776543206', 230, true, 'user'],
            ['Ngô Thế Vinh',           'thevinh.ngo@gmail.com',         $pwd, 165, 5, '0358912307', 220, true, 'user'],
            ['Đặng Tiến Dũng',         'tiendung.dang91@gmail.com',     $pwd, 140, 5, '0919283408', 215, true, 'user'],
            ['Vũ Xuân Trường',         'xuantruong.vu@gmail.com',       $pwd, 158, 5, '0867451209', 200, true, 'user'],

            // ── Heavy users – đã nạp gói Phổ Biến (50 credits) 1–2 lần ──
            ['Hồ Quang Minh',          'quangminh.ho1997@gmail.com',    $pwd, 43,  5, '0923001110', 190, true, 'user'],
            ['Lý Thị Hồng Vân',        'hongvan.ly@gmail.com',          $pwd, 38,  5, '0908990011', 185, true, 'user'],
            ['Phan Thị Thu Hà',        'thuha.phan@gmail.com',          $pwd, 46,  5, '0345671212', 180, true, 'user'],
            ['Đỗ Minh Nhật',           'minhnhat.do96@gmail.com',       $pwd, 29,  5, '0796543213', 175, true, 'user'],
            ['Dương Văn Tài',          'vantai.duong@gmail.com',        $pwd, 34,  5, '0562781214', 170, true, 'user'],
            ['Huỳnh Thị Kim Chi',      'kimchi.huynh1993@gmail.com',    $pwd, 41,  5, '0939904315', 165, true, 'user'],
            ['Nguyễn Thế Anh',         'theanh.nguyen@gmail.com',       $pwd, 7,   5, '0912007616', 160, true, 'user'],
            ['Trần Thị Bảo Châu',      'baochau.tran2001@gmail.com',    $pwd, 18,  5, '0974223317', 155, true, 'user'],
            ['Võ Thanh Phong',         'thanhphong.vo@gmail.com',       $pwd, 22,  5, '0865432118', 150, true, 'user'],
            ['Lê Ngọc Hân',            'ngochan.le@gmail.com',          $pwd, 13,  5, '0793456719', 145, true, 'user'],

            // ── Moderate users – còn lượt free, chưa hoặc vừa nạp ──
            ['Trần Thị Lan',           'thilan.tran1998@gmail.com',     $pwd, 10,  4, '0987654320', 140, true, 'user'],
            ['Lý Thị Mỹ Dung',         'mydung.ly@gmail.com',           $pwd, 0,   4, '0945678921', 135, true, 'user'],
            ['Phan Quốc Việt',         'quocviet.phan@gmail.com',       $pwd, 10,  3, '0978090123', 130, true, 'user'],
            ['Hồ Thị Thanh Thúy',      'thanhthuy.ho2002@gmail.com',   $pwd, 0,   2, '0344560924', 125, true, 'user'],
            ['Vũ Thị Quỳnh Nga',       'quynhnga.vu@gmail.com',         $pwd, 0,   3, '0865781225', 120, true, 'user'],
            ['Nguyễn Văn Hải',         'vanhaingt99@gmail.com',         $pwd, 10,  4, '0902111226', 115, true, 'user'],
            ['Phạm Thị Hương',         'phamhg1996@gmail.com',          $pwd, 0,   3, '0776123427', 110, true, 'user'],
            ['Đặng Văn Khoa',          'vankhoa.dang@gmail.com',        $pwd, 0,   4, '0919219828', 105, true, 'user'],
            ['Bùi Minh Quân',          'minhquan.bui@gmail.com',        $pwd, 10,  5, '0358098729', 100, true, 'user'],
            ['Hoàng Thị Thu',          'thuhoang1994@gmail.com',        $pwd, 0,   2, '0869001130', 95,  true, 'user'],

            // ── Light users – mới đăng ký, dùng 0–2 lượt free ──
            ['Phạm Văn Long',          'pvlong2003@gmail.com',          $pwd, 0, 1, '0945112231', 90, true, 'user'],
            ['Lê Thị Diễm',            'diem.le.art@gmail.com',         $pwd, 0, 2, '0914556732', 85, true, 'user'],
            ['Võ Minh Khải',           'minhkhai.vo@gmail.com',         $pwd, 0, 1, '0792556633', 80, true, 'user'],
            ['Bùi Văn Đạt',            'vandat.bui2004@gmail.com',      $pwd, 0, 0, '0368001134', 75, true, 'user'],
            ['Hoàng Anh Kiệt',         'anhkiet.hoang@gmail.com',       $pwd, 0, 1, '0982334435', 70, true, 'user'],
            ['Ngô Thị Hải Yến',        'haiyen.ngo@gmail.com',          $pwd, 0, 0, '0916334436', 65, true, 'user'],
            ['Hồ Văn Phong',           'vanphong.ho1999@gmail.com',     $pwd, 0, 2, '0345667737', 60, true, 'user'],
            ['Phan Thị Cẩm Tú',        'camtu.phan.ceramics@gmail.com', $pwd, 0, 1, '0767998838', 55, true, 'user'],
            ['Lý Quốc Cường',          'quoccuong.ly@gmail.com',        $pwd, 0, 0, '0938881239', 50, true, 'user'],
            ['Đặng Thị Ngọc Trâm',     'ngoctram.dang@gmail.com',       $pwd, 0, 1, '0856889940', 45, true, 'user'],

            // ── New / chưa verify ──
            ['Dương Thị Phương Thảo',  'phuongthao.duong2005@gmail.com',$pwd, 0, 0, null,         30, false, 'user'],
            ['Huỳnh Văn Bảo',          'bao.huynh2006@gmail.com',       $pwd, 0, 0, '0779334442', 28, false, 'user'],
            ['Nguyễn Thị Cẩm Nhung',   'camnhung.nguyen@gmail.com',     $pwd, 0, 1, '0912556643', 25, true, 'user'],
            ['Trần Anh Tuấn',          'anhtuan.tran01@gmail.com',      $pwd, 0, 0, '0934778844', 22, false, 'user'],
            ['Lê Thị Hồng Nhung',      'hongnhung.le@gmail.com',        $pwd, 10, 5, '0857990045', 20, true, 'user'],
            ['Phạm Đức Huy',           'duchuy.pham@gmail.com',         $pwd, 0,  2, '0778112246', 18, true, 'user'],
            ['Võ Thị Kiều Trinh',      'kieutrinh.vo@gmail.com',        $pwd, 50, 5, '0856334447', 15, true, 'user'],
            ['Đặng Văn Bình',          'vanbinh.dang1996@gmail.com',    $pwd, 0,  1, null,         12, true, 'user'],
            ['Bùi Thị Thu Hà',         'thuha.bui.gom@gmail.com',       $pwd, 0,  3, '0923556648', 10, true, 'user'],
            ['Hoàng Phương Linh',      'phuonglinh.hoang@gmail.com',    $pwd, 200, 5, '0895778849', 7, true, 'user'],
        ];

        foreach ($users as [$name, $email, $password, $balance, $freeUsed, $phone, $daysAgo, $verified, $role]) {
            // pravatar.cc: deterministic real portrait photo seeded by email hash
            $avatarUrl = 'https://i.pravatar.cc/200?u=' . urlencode($email);

            User::create([
                'name'                  => $name,
                'email'                 => $email,
                'password'              => $password,
                'role'                  => $role,
                'avatar'                => $avatarUrl,
                'token_balance'         => (float) $balance,
                'free_predictions_used' => $freeUsed,
                'phone'                 => $phone,
                'email_verified_at'     => $verified
                    ? $now->copy()->subDays($daysAgo - 1)
                    : null,
                'created_at'            => $now->copy()->subDays($daysAgo),
                'updated_at'            => $now->copy()->subDays(max(0, $daysAgo - rand(1, min(10, $daysAgo)))),
            ]);
        }
    }
}
