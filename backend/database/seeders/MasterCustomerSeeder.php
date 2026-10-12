<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MasterCustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $doctors = [
            ['dr. Arvino Kalandra, Sp.PD',   'Penyakit Dalam', 'Jl. Lembayung Biru No. 12, Kompleks Cendana Fiktif, Kota Contoh',   '0800-0000-0001'],
            ['dr. Selvina Maharani, Sp.A',   'Anak',           'Jl. Camar Putih No. 5, Perumahan Taman Rekaan, Kota Contoh',         '0800-0000-0002'],
            ['dr. Baskara Wiratama, Sp.JP',  'Jantung',        'Jl. Fajar Timur No. 8, Gedung Medika Dummy, Kota Contoh',            '0800-0000-0003'],
            ['dr. Cantika Ayuningrum, Sp.OG', 'Kandungan',      'Jl. Melur Raya No. 20, Klinik Sehat Contoh, Kota Sampel',            '0800-0000-0004'],
            ['dr. Damar Prakoso',            'Umum',           'Jl. Bukit Senja No. 3, Ruko Citra Rekaan, Kota Sampel',              '0800-0000-0005'],
            ['dr. Elvara Nugraheni, Sp.P',   'Paru',           'Jl. Samudra Biru No. 15, Pusat Medis Fiktif, Kota Sampel',           '0800-0000-0006'],
            ['dr. Fadlan Mahendra, Sp.S',    'Saraf',          'Jl. Kenari Emas No. 7, Kompleks Griya Dummy, Kota Uji',              '0800-0000-0007'],
            ['dr. Gayatri Saraswati, Sp.KK', 'Kulit',          'Jl. Pelangi Selatan No. 11, Klinik Kulit Contoh, Kota Uji',          '0800-0000-0008'],
            ['dr. Harsa Dirgantara, Sp.B',   'Bedah',          'Jl. Rimba Hijau No. 9, Rumah Sakit Rekaan, Kota Uji',                '0800-0000-0009'],
            ['dr. Ismaya Kusumawardani, Sp.A', 'Anak',          'Jl. Nirwana Barat No. 4, Klinik Anak Dummy, Kota Contoh',            '0800-0000-0010'],
            ['dr. Jagad Purnomo',            'Umum',           'Jl. Cakrawala No. 6, Ruko Mentari Fiktif, Kota Sampel',              '0800-0000-0011'],
            ['dr. Kirana Paramitha, Sp.PD',  'Penyakit Dalam', 'Jl. Bintang Utara No. 14, Gedung Prima Contoh, Kota Uji',            '0800-0000-0012'],
            ['dr. Laksmana Adiwijaya, Sp.JP', 'Jantung',        'Jl. Gemilang No. 2, Pusat Jantung Rekaan, Kota Contoh',              '0800-0000-0013'],
            ['dr. Mentari Salsabila, Sp.M',  'Mata',           'Jl. Embun Pagi No. 10, Klinik Mata Dummy, Kota Sampel',              '0800-0000-0014'],
            ['dr. Narendra Satrio, Sp.THT',  'THT',            'Jl. Purnama Tengah No. 17, Klinik THT Contoh, Kota Uji',             '0800-0000-0015'],
        ];
    }
}
