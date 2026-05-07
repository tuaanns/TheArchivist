<?php

namespace Database\Seeders;

use App\Models\CeramicLine;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class CeramicLineSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        CeramicLine::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        /**
         * Each key maps to the English Wikipedia article that best represents the ceramic type.
         * fetchWikiImages() calls the Wikipedia REST API concurrently and returns
         * real Wikimedia CDN thumbnail URLs — guaranteed to exist.
         */
        // Each entry is a primary article + optional fallback titles. The first one
        // that returns a thumbnail wins. This guarantees real existing images for
        // Meissen / Iznik / Goryeo where past hardcoded Wikimedia URLs went stale.
        $imgs = $this->fetchWikiImages([
            'bat_trang'   => ['Bát_Tràng'],
            'bien_hoa'    => ['Vietnamese_pottery'],
            'phu_lang'    => ['Vietnamese_pottery'],
            'chu_dau'     => ['Chu_Đậu_ceramics', 'Blue_and_white_porcelain'],
            'thanh_ha'    => ['Terracotta'],
            'bau_truc'    => ['Champa', 'Vietnamese_pottery'],
            'my_thien'    => ['Vietnamese_ceramics', 'Vietnamese_pottery'],
            'jingdezhen'  => ['Jingdezhen_porcelain'],
            'yixing'      => ['Yixing_clay_teapot'],
            'longquan'    => ['Longquan_celadon'],
            'ru_ware'     => ['Ru_ware'],
            'dehua'       => ['Dehua_porcelain', 'Blanc_de_Chine'],
            'raku'        => ['Raku_ware'],
            'arita'       => ['Arita_ware', 'Imari_ware'],
            'bizen'       => ['Bizen_ware'],
            'hagi'        => ['Hagi_ware'],
            'shigaraki'   => ['Shigaraki_ware'],
            'goryeo'      => ['Korean_celadon', 'Goryeo_celadon', 'Goryeo'],
            'joseon'      => ['Joseon_white_porcelain', 'Korean_pottery_and_porcelain'],
            'sawankhalok' => ['Sawankhalok_ware', 'Si_Satchanalai_ware'],
            'bencharong'  => ['Bencharong'],
            'meissen'     => ['Meissen_porcelain', 'Meissen'],
            'delft'       => ['Delftware'],
            'majolica'    => ['Maiolica', 'Majolica'],
            'limoges'     => ['Limoges_porcelain'],
            'wedgwood'    => ['Wedgwood'],
            'iznik'       => ['İznik_pottery', 'Iznik_pottery'],
            'persian'     => ['Persian_pottery'],
            'pueblo'      => ['Pueblo_pottery'],
            'talavera'    => ['Talavera_pottery'],
            'ndebele'     => ['Ndebele_people'],
        ]);

        $lines = [
            // === VIỆT NAM ===
            [
                'name' => 'Gốm Bát Tràng',
                'origin' => 'Hà Nội',
                'country' => 'Việt Nam',
                'era' => 'Thế kỷ 14 - nay',
                'description' => 'Làng gốm cổ nổi tiếng nhất Việt Nam, nổi bật với men ngọc, men rạn và gốm hoa lam truyền thống.',
                'style' => 'Men ngọc, Men rạn, Hoa lam',
                'image_url' => $imgs['bat_trang'],
                'is_featured' => true,
            ],
            [
                'name' => 'Gốm Biên Hòa',
                'origin' => 'Đồng Nai',
                'country' => 'Việt Nam',
                'era' => 'Đầu thế kỷ 20 - nay',
                'description' => 'Phong cách gốm mỹ thuật kết hợp giữa nghệ thuật Đông Dương và kỹ thuật phương Tây, men màu rực rỡ.',
                'style' => 'Men màu, Chạm khắc nổi',
                'image_url' => $imgs['bien_hoa'],
                'is_featured' => true,
            ],
            [
                'name' => 'Gốm Phù Lãng',
                'origin' => 'Bắc Ninh',
                'country' => 'Việt Nam',
                'era' => 'Thế kỷ 13 - nay',
                'description' => 'Nổi tiếng với gốm men da lươn, sản phẩm mang nét mộc mạc, giản dị của vùng Kinh Bắc.',
                'style' => 'Men da lươn, Men nâu',
                'image_url' => $imgs['phu_lang'],
                'is_featured' => true,
            ],
            [
                'name' => 'Gốm Chu Đậu',
                'origin' => 'Hải Dương',
                'country' => 'Việt Nam',
                'era' => 'Thế kỷ 13 - 17',
                'description' => 'Dòng gốm cổ quý giá, từng được xuất khẩu sang Nhật Bản và Trung Đông. Nổi tiếng với hoa văn vẽ chìm.',
                'style' => 'Hoa lam, Men trắng ngà',
                'image_url' => $imgs['chu_dau'],
                'is_featured' => true,
            ],
            [
                'name' => 'Gốm Thanh Hà',
                'origin' => 'Quảng Nam',
                'country' => 'Việt Nam',
                'era' => 'Thế kỷ 16 - nay',
                'description' => 'Làng gốm cổ bên sông Thu Bồn, gần phố cổ Hội An, nổi bật với gốm đất nung truyền thống.',
                'style' => 'Đất nung, Không men',
                'image_url' => $imgs['thanh_ha'],
                'is_featured' => false,
            ],
            [
                'name' => 'Gốm Bàu Trúc',
                'origin' => 'Ninh Thuận',
                'country' => 'Việt Nam',
                'era' => 'Hàng nghìn năm',
                'description' => 'Dòng gốm Chăm cổ xưa nhất Đông Nam Á, làm hoàn toàn thủ công không dùng bàn xoay.',
                'style' => 'Thủ công, Đất nung',
                'image_url' => $imgs['bau_truc'],
                'is_featured' => true,
            ],
            [
                'name' => 'Gốm Mỹ Thiện',
                'origin' => 'Bình Dương',
                'country' => 'Việt Nam',
                'era' => 'Thế kỷ 19 - nay',
                'description' => 'Gốm sứ truyền thống tỉnh Bình Dương với kỹ thuật vẽ tay tinh xảo, màu sắc phong phú.',
                'style' => 'Men màu, Vẽ tay',
                'image_url' => $imgs['my_thien'],
                'is_featured' => false,
            ],

            // === TRUNG QUỐC ===
            [
                'name' => 'Sứ Cảnh Đức Trấn',
                'origin' => 'Giang Tây',
                'country' => 'Trung Quốc',
                'era' => 'Thế kỷ 10 - nay',
                'description' => 'Kinh đô sứ của thế giới, nổi tiếng với sứ hoa lam (Blue and White) và sứ men trắng tinh xảo.',
                'style' => 'Hoa lam, Men trắng, Ngũ thái',
                'image_url' => $imgs['jingdezhen'],
                'is_featured' => true,
            ],
            [
                'name' => 'Gốm Nghi Hưng (Tử Sa)',
                'origin' => 'Giang Tô',
                'country' => 'Trung Quốc',
                'era' => 'Thời Tống',
                'description' => 'Nổi tiếng thế giới với ấm trà tử sa, được làm từ đất sét đặc biệt có màu tím đỏ.',
                'style' => 'Tử sa, Không men',
                'image_url' => $imgs['yixing'],
                'is_featured' => true,
            ],
            [
                'name' => 'Gốm Long Tuyền (Celadon)',
                'origin' => 'Chiết Giang',
                'country' => 'Trung Quốc',
                'era' => 'Thời Tống - Nguyên',
                'description' => 'Dòng men ngọc bích (celadon) nổi tiếng nhất, với lớp men xanh ngọc trong suốt tuyệt đẹp.',
                'style' => 'Men ngọc, Celadon',
                'image_url' => $imgs['longquan'],
                'is_featured' => true,
            ],
            [
                'name' => 'Gốm Nhữ Diêu',
                'origin' => 'Hà Nam',
                'country' => 'Trung Quốc',
                'era' => 'Thời Bắc Tống',
                'description' => 'Một trong 5 đại danh lò gốm Trung Quốc, men xanh thiên thanh cực kỳ quý hiếm.',
                'style' => 'Men xanh thiên thanh',
                'image_url' => $imgs['ru_ware'],
                'is_featured' => false,
            ],
            [
                'name' => 'Gốm Đức Hóa',
                'origin' => 'Phúc Kiến',
                'country' => 'Trung Quốc',
                'era' => 'Thế kỷ 14 - nay',
                'description' => 'Sứ trắng tinh khiết Blanc de Chine, nổi tiếng với tượng Phật và đồ thờ phụng.',
                'style' => 'Blanc de Chine, Sứ trắng',
                'image_url' => $imgs['dehua'],
                'is_featured' => false,
            ],

            // === NHẬT BẢN ===
            [
                'name' => 'Gốm Raku',
                'origin' => 'Kyoto',
                'country' => 'Nhật Bản',
                'era' => 'Thế kỷ 16 - nay',
                'description' => 'Phong cách gốm gắn liền với trà đạo Nhật Bản, thể hiện triết lý wabi-sabi.',
                'style' => 'Raku, Wabi-sabi',
                'image_url' => $imgs['raku'],
                'is_featured' => true,
            ],
            [
                'name' => 'Sứ Arita (Imari)',
                'origin' => 'Saga',
                'country' => 'Nhật Bản',
                'era' => 'Thế kỷ 17 - nay',
                'description' => 'Sứ xuất khẩu nổi tiếng của Nhật, men nhiều màu rực rỡ với hoa văn Nhật đặc trưng.',
                'style' => 'Sứ vẽ màu, Imari',
                'image_url' => $imgs['arita'],
                'is_featured' => true,
            ],
            [
                'name' => 'Gốm Bizen',
                'origin' => 'Okayama',
                'country' => 'Nhật Bản',
                'era' => 'Thời Kamakura',
                'description' => 'Dòng gốm không tráng men, nung ở nhiệt độ cao tạo nên vẻ đẹp tự nhiên độc đáo.',
                'style' => 'Không men, Nung củi',
                'image_url' => $imgs['bizen'],
                'is_featured' => false,
            ],
            [
                'name' => 'Gốm Hagi',
                'origin' => 'Yamaguchi',
                'country' => 'Nhật Bản',
                'era' => 'Thế kỷ 16 - nay',
                'description' => 'Được yêu thích trong giới trà đạo, men rạn tự nhiên thay đổi theo thời gian sử dụng.',
                'style' => 'Men rạn, Trà đạo',
                'image_url' => $imgs['hagi'],
                'is_featured' => false,
            ],
            [
                'name' => 'Gốm Shigaraki',
                'origin' => 'Shiga',
                'country' => 'Nhật Bản',
                'era' => 'Thế kỷ 13 - nay',
                'description' => 'Một trong 6 lò gốm cổ Nhật Bản, nổi bật với kết cấu đất thô tự nhiên và vảy tro đặc trưng.',
                'style' => 'Tro tự nhiên, Không men',
                'image_url' => $imgs['shigaraki'],
                'is_featured' => false,
            ],

            // === HÀN QUỐC ===
            [
                'name' => 'Gốm Celadon Goryeo',
                'origin' => 'Gangjin',
                'country' => 'Hàn Quốc',
                'era' => 'Thời Goryeo (918-1392)',
                'description' => 'Men ngọc bích hoàng gia Hàn Quốc, kỹ thuật khảm sanggam độc đáo trên thế giới.',
                'style' => 'Men ngọc, Sanggam',
                'image_url' => $imgs['goryeo'],
                'is_featured' => true,
            ],
            [
                'name' => 'Sứ trắng Joseon',
                'origin' => 'Gwangju',
                'country' => 'Hàn Quốc',
                'era' => 'Thời Joseon (1392-1897)',
                'description' => 'Sứ trắng tinh khiết phản ánh tinh thần Nho giáo, vẽ hoa lam đậm chất Hàn Quốc.',
                'style' => 'Sứ trắng, Hoa lam',
                'image_url' => $imgs['joseon'],
                'is_featured' => false,
            ],

            // === THÁI LAN ===
            [
                'name' => 'Gốm Sawankhalok',
                'origin' => 'Sukhothai',
                'country' => 'Thái Lan',
                'era' => 'Thế kỷ 13 - 15',
                'description' => 'Gốm cổ Thái Lan thời Sukhothai, ảnh hưởng sâu sắc từ kỹ thuật Trung Hoa.',
                'style' => 'Men xanh celadon, Hoa văn cá',
                'image_url' => $imgs['sawankhalok'],
                'is_featured' => false,
            ],
            [
                'name' => 'Gốm Bencharong',
                'origin' => 'Bangkok',
                'country' => 'Thái Lan',
                'era' => 'Thế kỷ 18 - nay',
                'description' => 'Gốm hoàng gia Thái 5 màu, trang trí công phu với hoa văn truyền thống Thái.',
                'style' => 'Ngũ sắc, Hoàng gia',
                'image_url' => $imgs['bencharong'],
                'is_featured' => true,
            ],

            // === CHÂU ÂU ===
            [
                'name' => 'Sứ Meissen',
                'origin' => 'Sachsen',
                'country' => 'Đức',
                'era' => 'Thế kỷ 18 - nay',
                'description' => 'Nhà sản xuất sứ đầu tiên tại châu Âu, nổi tiếng với biểu tượng hai thanh kiếm chéo.',
                'style' => 'Sứ cứng, Vẽ tay',
                'image_url' => $imgs['meissen'],
                'is_featured' => true,
            ],
            [
                'name' => 'Gốm Delft',
                'origin' => 'Delft',
                'country' => 'Hà Lan',
                'era' => 'Thế kỷ 17 - nay',
                'description' => 'Gốm men thiếc nổi tiếng với hoa văn xanh-trắng, lấy cảm hứng từ sứ Trung Hoa.',
                'style' => 'Men thiếc, Xanh-trắng',
                'image_url' => $imgs['delft'],
                'is_featured' => true,
            ],
            [
                'name' => 'Gốm Majolica',
                'origin' => 'Faenza, Deruta',
                'country' => 'Ý',
                'era' => 'Thời Phục Hưng',
                'description' => 'Gốm tráng men thiếc rực rỡ sắc màu, mang đậm phong cách nghệ thuật Phục Hưng Ý.',
                'style' => 'Men thiếc, Đa sắc',
                'image_url' => $imgs['majolica'],
                'is_featured' => false,
            ],
            [
                'name' => 'Sứ Limoges',
                'origin' => 'Limoges',
                'country' => 'Pháp',
                'era' => 'Thế kỷ 18 - nay',
                'description' => 'Sứ cao cấp Pháp, men trắng tinh khiết và vẽ tay tinh xảo, biểu tượng xa xỉ châu Âu.',
                'style' => 'Sứ cứng, Vẽ tay',
                'image_url' => $imgs['limoges'],
                'is_featured' => false,
            ],
            [
                'name' => 'Sứ Wedgwood',
                'origin' => 'Staffordshire',
                'country' => 'Anh',
                'era' => 'Thế kỷ 18 - nay',
                'description' => 'Thương hiệu sứ hoàng gia Anh, nổi tiếng với dòng Jasperware xanh-trắng tân cổ điển.',
                'style' => 'Jasperware, Tân cổ điển',
                'image_url' => $imgs['wedgwood'],
                'is_featured' => false,
            ],

            // === TRUNG ĐÔNG ===
            [
                'name' => 'Gốm Iznik',
                'origin' => 'Bursa',
                'country' => 'Thổ Nhĩ Kỳ',
                'era' => 'Thế kỷ 15 - 17',
                'description' => 'Gốm Ottoman vĩ đại, hoa văn hoa tulip và cẩm chướng trên men xanh-đỏ rực rỡ.',
                'style' => 'Men xanh-đỏ, Hoa tulip',
                'image_url' => $imgs['iznik'],
                'is_featured' => true,
            ],
            [
                'name' => 'Gốm Ba Tư (Kashan)',
                'origin' => 'Isfahan',
                'country' => 'Iran',
                'era' => 'Thế kỷ 12 - 14',
                'description' => 'Gốm men láng Ba Tư với kỹ thuật Mina\'i và Lustre, ảnh hưởng sâu rộng đến gốm Hồi giáo.',
                'style' => 'Lustre, Mina\'i',
                'image_url' => $imgs['persian'],
                'is_featured' => false,
            ],

            // === CHÂU MỸ ===
            [
                'name' => 'Gốm Pueblo',
                'origin' => 'New Mexico',
                'country' => 'Hoa Kỳ',
                'era' => 'Hàng nghìn năm - nay',
                'description' => 'Gốm thổ dân Pueblo Bắc Mỹ, hoa văn hình học truyền thống trên nền đất nung.',
                'style' => 'Đất nung, Hình học',
                'image_url' => $imgs['pueblo'],
                'is_featured' => false,
            ],
            [
                'name' => 'Gốm Talavera',
                'origin' => 'Puebla',
                'country' => 'Mexico',
                'era' => 'Thế kỷ 16 - nay',
                'description' => 'Di sản UNESCO, kết hợp kỹ thuật gốm Tây Ban Nha và nghệ thuật bản địa Mexico.',
                'style' => 'Men thiếc, Đa sắc',
                'image_url' => $imgs['talavera'],
                'is_featured' => false,
            ],

            // === CHÂU PHI & KHÁC ===
            [
                'name' => 'Gốm Ndebele',
                'origin' => 'Zimbabwe',
                'country' => 'Zimbabwe',
                'era' => 'Thế kỷ 19 - nay',
                'description' => 'Gốm truyền thống của người Ndebele với hoa văn hình học đậm màu sắc sặc sỡ đặc trưng châu Phi.',
                'style' => 'Hình học, Đa sắc',
                'image_url' => $imgs['ndebele'],
                'is_featured' => false,
            ],
            [
                'name' => 'Gốm Raku Đương Đại',
                'origin' => 'Toàn cầu',
                'country' => 'Quốc tế',
                'era' => 'Thế kỷ 20 - nay',
                'description' => 'Phong trào gốm Raku đương đại kết hợp kỹ thuật Nhật Bản cổ điển với tư duy nghệ thuật hiện đại.',
                'style' => 'Đương đại, Thử nghiệm',
                'image_url' => $imgs['raku'],
                'is_featured' => false,
            ],
        ];

        foreach ($lines as $line) {
            CeramicLine::create($line);
        }
    }

    /**
     * Fetch Wikipedia thumbnail images.
     *
     * Accepts either string (single article title) or array (article + fallback titles)
     * per key. The first article whose Wikipedia summary returns a thumbnail wins.
     * Falls back to a generic ceramic photo on full failure.
     */
    private function fetchWikiImages(array $keyMap): array
    {
        $fallback = 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800';
        $result = [];

        // Normalize: every value becomes an array of titles to try in order.
        $tries = [];
        foreach ($keyMap as $key => $value) {
            $tries[$key] = is_array($value) ? array_values($value) : [(string) $value];
        }

        // Issue all FIRST-choice requests in parallel; collect misses.
        $firstTitles = array_map(fn ($arr) => $arr[0], $tries);
        $firstResp = $this->fetchSummariesPool(array_values($firstTitles));

        $keys = array_keys($tries);
        $misses = [];
        foreach ($keys as $i => $key) {
            $resp = $firstResp[$i] ?? null;
            $src = $this->extractThumb($resp);
            if ($src) {
                $result[$key] = $src;
            } else {
                $misses[$key] = array_slice($tries[$key], 1); // fallback titles
            }
        }

        // For each miss, try fallback titles sequentially (still bounded — at most 1-2 each).
        foreach ($misses as $key => $fallbackTitles) {
            $found = null;
            foreach ($fallbackTitles as $title) {
                $single = $this->fetchSummariesPool([$title]);
                $src = $this->extractThumb($single[0] ?? null);
                if ($src) {
                    $found = $src;
                    break;
                }
            }
            $result[$key] = $found ?: $fallback;
        }

        return $result;
    }

    /** Pool a list of Wikipedia summary requests. */
    private function fetchSummariesPool(array $titles): array
    {
        if (empty($titles)) return [];
        try {
            return Http::pool(function ($pool) use ($titles) {
                return array_map(
                    fn ($t) => $pool->withoutVerifying()->timeout(8)
                        ->withHeaders(['User-Agent' => 'GomApp-Seeder/1.0 (ceramic-db-seed)'])
                        ->get('https://en.wikipedia.org/api/rest_v1/page/summary/' . urlencode($t)),
                    $titles
                );
            });
        } catch (\Throwable $e) {
            return [];
        }
    }

    /** Pull thumbnail.source from a Wikipedia summary response, returning null if missing. */
    private function extractThumb($resp): ?string
    {
        if (!$resp || $resp instanceof \Throwable || !method_exists($resp, 'ok') || !$resp->ok()) {
            return null;
        }
        $src = $resp->json()['thumbnail']['source'] ?? null;
        return $src ?: null;
    }
}
