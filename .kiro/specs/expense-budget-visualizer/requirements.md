# Requirements Document

## Introduction

Expense & Budget Visualizer adalah web app mobile-friendly berbasis client-side untuk melacak pengeluaran harian. Aplikasi ini berjalan sepenuhnya di browser menggunakan HTML, CSS, dan Vanilla JavaScript tanpa backend. Data disimpan secara persisten menggunakan Local Storage API sehingga tetap ada setelah browser ditutup. Antarmuka dirancang minimal dan responsif agar mudah digunakan di perangkat mobile maupun desktop.

Aplikasi terdiri dari empat komponen utama: form input transaksi, daftar transaksi yang dapat digulir dan dihapus, tampilan total pengeluaran yang selalu ter-update, dan pie chart distribusi pengeluaran per kategori.

## Glossary

- **App**: Aplikasi web Expense & Budget Visualizer secara keseluruhan.
- **Transaction**: Satu catatan pengeluaran yang terdiri dari nama item, jumlah uang (amount), dan kategori.
- **Transaction_List**: Komponen UI yang menampilkan seluruh daftar transaksi yang tersimpan.
- **Input_Form**: Komponen UI berupa form dengan field Item Name, Amount, dan Category untuk memasukkan transaksi baru.
- **Category**: Klasifikasi pengeluaran; nilai yang valid adalah "Food", "Transport", dan "Fun".
- **Total_Display**: Komponen UI yang menampilkan jumlah total seluruh pengeluaran.
- **Chart**: Komponen visualisasi pie chart distribusi pengeluaran per kategori menggunakan Chart.js.
- **Storage**: Mekanisme persistensi data menggunakan browser Local Storage API.
- **Validator**: Logika validasi yang memastikan semua field terisi sebelum transaksi disimpan.
- **Custom_Category**: Kategori pengeluaran yang dibuat oleh pengguna, tersimpan di Local Storage terpisah, dan muncul bersamaan dengan kategori default di dropdown dan pie chart.
- **Monthly_Summary**: Ringkasan statistik pengeluaran untuk bulan dan tahun kalender yang sedang berjalan, dihitung dari field `createdAt` pada setiap transaksi.
- **Budget_Limit**: Angka batas pengeluaran bulanan yang ditetapkan oleh pengguna dan disimpan di Local Storage terpisah; digunakan sebagai acuan progress bar pemakaian anggaran.
- **Theme_Toggle**: Tombol di header yang memungkinkan pengguna berpindah antara tema terang (light) dan gelap (dark), dengan preferensi disimpan di Local Storage.

---

## Requirements

### Requirement 1: Input Transaksi Baru

**User Story:** Sebagai pengguna, saya ingin mengisi form untuk menambahkan pengeluaran baru, sehingga saya dapat mencatat setiap transaksi dengan cepat.

#### Acceptance Criteria

1. THE Input_Form SHALL menyediakan field "Item Name" bertipe teks, field "Amount" bertipe angka, dan dropdown "Category" dengan pilihan "Food", "Transport", dan "Fun".
2. WHEN pengguna menekan tombol Submit, THE Validator SHALL memeriksa bahwa field Item Name tidak kosong, field Amount berisi angka lebih dari nol, dan Category telah dipilih.
3. IF field Item Name kosong SAAT Submit ditekan, THEN THE Input_Form SHALL menampilkan pesan error "Item name is required".
4. IF field Amount kosong atau bernilai nol atau negatif SAAT Submit ditekan, THEN THE Input_Form SHALL menampilkan pesan error "Amount must be greater than 0".
5. IF field Category belum dipilih SAAT Submit ditekan, THEN THE Input_Form SHALL menampilkan pesan error "Please select a category".
6. WHEN validasi berhasil, THE Input_Form SHALL mereset semua field ke nilai awal setelah transaksi ditambahkan.

---

### Requirement 2: Penyimpanan Data Persisten

**User Story:** Sebagai pengguna, saya ingin data pengeluaran saya tersimpan secara otomatis, sehingga data tidak hilang saat browser ditutup atau halaman di-refresh.

#### Acceptance Criteria

1. WHEN sebuah transaksi berhasil divalidasi dan di-submit, THE Storage SHALL menyimpan transaksi tersebut ke Local Storage dalam format JSON.
2. WHEN halaman App dimuat (page load), THE Storage SHALL membaca seluruh data transaksi dari Local Storage dan memuat ulang ke Transaction_List.
3. WHEN sebuah transaksi dihapus, THE Storage SHALL memperbarui data di Local Storage untuk mencerminkan penghapusan tersebut.
4. THE Storage SHALL menyimpan setiap transaksi dengan atribut: id unik (string), itemName (string), amount (number), dan category (string).

---

### Requirement 3: Daftar Transaksi

**User Story:** Sebagai pengguna, saya ingin melihat semua transaksi yang telah dicatat dalam sebuah daftar, sehingga saya bisa memantau riwayat pengeluaran saya.

#### Acceptance Criteria

1. THE Transaction_List SHALL menampilkan setiap transaksi dengan informasi: nama item, jumlah uang (diformat sebagai mata uang), dan kategori.
2. WHEN sebuah transaksi baru ditambahkan, THE Transaction_List SHALL menampilkan transaksi baru tersebut tanpa memuat ulang halaman.
3. THE Transaction_List SHALL dapat digulir (scrollable) ketika jumlah item melebihi tinggi tampilan yang tersedia.
4. WHEN pengguna menekan tombol hapus pada sebuah item, THE Transaction_List SHALL menghapus item tersebut dari daftar dan dari Storage secara bersamaan.
5. WHEN Transaction_List kosong (tidak ada transaksi), THE Transaction_List SHALL menampilkan pesan "No transactions yet".

---

### Requirement 4: Tampilan Total Pengeluaran

**User Story:** Sebagai pengguna, saya ingin melihat total pengeluaran saya secara langsung di bagian atas halaman, sehingga saya dapat memantau anggaran saya dengan cepat.

#### Acceptance Criteria

1. THE Total_Display SHALL menampilkan jumlah kumulatif dari seluruh amount transaksi yang tersimpan.
2. WHEN sebuah transaksi baru ditambahkan, THE Total_Display SHALL memperbarui nilai total secara otomatis tanpa memuat ulang halaman.
3. WHEN sebuah transaksi dihapus, THE Total_Display SHALL memperbarui nilai total secara otomatis untuk mencerminkan penghapusan tersebut.
4. THE Total_Display SHALL memformat nilai total sebagai mata uang dengan pemisah ribuan (contoh: "Rp 1.250.000").

---

### Requirement 5: Visualisasi Pie Chart

**User Story:** Sebagai pengguna, saya ingin melihat distribusi pengeluaran saya per kategori dalam bentuk pie chart, sehingga saya dapat memahami pola pengeluaran saya secara visual.

#### Acceptance Criteria

1. THE Chart SHALL menampilkan pie chart yang merepresentasikan proporsi pengeluaran untuk setiap kategori ("Food", "Transport", "Fun") berdasarkan total amount per kategori.
2. WHEN sebuah transaksi baru ditambahkan, THE Chart SHALL memperbarui tampilan pie chart secara otomatis tanpa memuat ulang halaman.
3. WHEN sebuah transaksi dihapus, THE Chart SHALL memperbarui tampilan pie chart secara otomatis untuk mencerminkan perubahan data.
4. THE Chart SHALL menampilkan label kategori dan persentase proporsi pada setiap segmen.
5. WHEN semua transaksi dihapus sehingga tidak ada data, THE Chart SHALL menampilkan kondisi kosong (placeholder atau pesan "No data").
6. THE Chart SHALL menggunakan library Chart.js yang dimuat melalui CDN.

---

### Requirement 6: Kompatibilitas dan Struktur Proyek

**User Story:** Sebagai developer, saya ingin aplikasi berjalan di semua browser modern dengan struktur file yang rapi, sehingga mudah dikembangkan dan di-deploy tanpa konfigurasi tambahan.

#### Acceptance Criteria

1. THE App SHALL berjalan dengan benar di browser Chrome, Firefox, Edge, dan Safari versi terbaru menggunakan HTML5, CSS3, dan Vanilla JavaScript (ES6+) tanpa framework.
2. THE App SHALL menggunakan tepat satu file CSS yang berlokasi di direktori `css/`.
3. THE App SHALL menggunakan tepat satu file JavaScript yang berlokasi di direktori `js/`.
4. THE App SHALL tidak memerlukan build tool, bundler, atau server backend untuk dijalankan; cukup membuka file `index.html` di browser.
5. THE App SHALL berperilaku responsif, menampilkan layout yang sesuai pada lebar layar minimal 320px hingga 1440px.

---

### Requirement 7: Performa dan Responsivitas UI

**User Story:** Sebagai pengguna, saya ingin aplikasi terasa cepat dan responsif, sehingga saya tidak mengalami lag saat memasukkan atau menghapus data.

#### Acceptance Criteria

1. WHEN pengguna menambahkan atau menghapus sebuah transaksi, THE App SHALL memperbarui Transaction_List, Total_Display, dan Chart dalam waktu kurang dari 200ms.
2. WHEN App dimuat pertama kali, THE App SHALL menyelesaikan render antarmuka awal dalam waktu kurang dari 2 detik pada koneksi jaringan standar.
3. THE App SHALL mempertahankan UI yang dapat digunakan (tidak ada elemen yang terblokir atau tidak responsif) selama operasi penambahan dan penghapusan transaksi.

---

### Requirement 8: Custom Category

**User Story:** Sebagai pengguna, saya ingin menambahkan kategori pengeluaran sendiri selain Food, Transport, dan Fun, sehingga saya dapat mencatat pengeluaran yang tidak masuk ke kategori bawaan.

#### Acceptance Criteria

1. THE Input_Form SHALL menyediakan tombol "+ Add Category" yang, ketika ditekan, menampilkan field input teks untuk nama Custom_Category baru dengan panjang maksimal 20 karakter.
2. WHEN pengguna mengisi nama Custom_Category dan menekan tombol konfirmasi, THE App SHALL menyimpan Custom_Category tersebut ke Local Storage menggunakan key `"expense_custom_categories"` (terpisah dari key transaksi `"expense_transactions"`).
3. WHEN App dimuat (page load), THE Input_Form SHALL membaca seluruh Custom_Category dari Local Storage dan menampilkan setiap Custom_Category tersebut sebagai opsi di dropdown Category, dengan tiga kategori default ("Food", "Transport", "Fun") ditampilkan terlebih dahulu diikuti Custom_Category dalam urutan abjad.
4. THE Chart SHALL menampilkan segmen pie untuk setiap Custom_Category yang memiliki transaksi, dengan warna yang diambil dari palet warna Chart.js default (setelah tiga warna untuk kategori default Food/Transport/Fun).
5. WHEN dropdown Category menampilkan Custom_Category, setiap Custom_Category SHALL ditampilkan dengan tombol hapus kecil ("×") di sebelah kanannya.
6. WHEN pengguna menekan tombol hapus pada sebuah Custom_Category, THE App SHALL menghapus Custom_Category tersebut dari Local Storage dan memperbarui dropdown Category tanpa memuat ulang halaman.
7. IF nama Custom_Category yang dimasukkan kosong (hanya whitespace) atau melebihi 20 karakter, THEN THE Input_Form SHALL menampilkan pesan error "Category name must be 1-20 characters" dan tidak menyimpan kategori tersebut.
8. IF nama Custom_Category yang dimasukkan sudah ada (duplikat, tidak peka huruf besar/kecil) di antara kategori default ("Food", "Transport", "Fun") atau Custom_Category yang tersimpan, THEN THE Input_Form SHALL menampilkan pesan error "Category already exists" dan tidak menyimpan kategori tersebut.
9. WHEN Custom_Category yang memiliki transaksi terkait dihapus, THE App SHALL menampilkan dialog konfirmasi yang menyebutkan jumlah transaksi yang akan terkena dampak, dengan opsi untuk melanjutkan penghapusan atau membatalkan.
10. IF pengguna mengonfirmasi penghapusan Custom_Category yang memiliki transaksi terkait, THEN THE App SHALL menghapus Custom_Category tersebut dari Local Storage dan mengubah field `category` dari seluruh transaksi terkait menjadi string kosong `""` (uncategorized), lalu memperbarui Transaction_List dan Chart.

---

### Requirement 9: Monthly Summary

**User Story:** Sebagai pengguna, saya ingin melihat ringkasan pengeluaran bulan ini secara sekilas, sehingga saya dapat memantau kondisi keuangan saya dalam periode berjalan.

#### Acceptance Criteria

1. WHEN sebuah transaksi dibuat melalui Input_Form, THE App SHALL mengisi field `createdAt` dari transaksi tersebut dengan nilai `Date.now()` (Unix milliseconds) secara otomatis sebelum menyimpannya ke Local Storage; field `createdAt` tidak boleh diubah setelah transaksi dibuat (immutable).
2. WHEN App dimuat (page load) atau setelah transaksi ditambahkan/dihapus, THE App SHALL merender section Monthly_Summary yang memuat empat metrik: total pengeluaran bulan ini (diformat sebagai mata uang), jumlah transaksi bulan ini, rata-rata pengeluaran per transaksi bulan ini (diformat sebagai mata uang), dan nama kategori dengan pengeluaran terbesar bulan ini.
3. WHEN menghitung Monthly_Summary, THE App SHALL hanya memperhitungkan transaksi yang field `createdAt`-nya berada dalam bulan dan tahun kalender yang sedang berjalan (ditentukan menggunakan `new Date().getMonth()` dan `new Date().getFullYear()` pada saat perhitungan dilakukan).
4. WHEN menghitung rata-rata pengeluaran per transaksi bulan ini, THE App SHALL membulatkan hasil ke bilangan bulat terdekat (menggunakan `Math.round()`).
5. WHEN tidak ada transaksi pada bulan berjalan, THE Monthly_Summary SHALL menampilkan nilai `"Rp 0"` untuk metrik total dan rata-rata, nilai `"0"` untuk metrik jumlah transaksi, dan teks `"–"` untuk metrik kategori.
6. WHEN sebuah transaksi ditambahkan atau dihapus, THE Monthly_Summary SHALL memperbarui semua empat metrik secara otomatis tanpa memuat ulang halaman.
7. IF dua atau lebih kategori memiliki total pengeluaran bulan ini yang sama dan keduanya merupakan nilai terbesar, THEN THE Monthly_Summary SHALL menampilkan kategori yang muncul pertama kali dalam urutan: kategori default ("Food", "Transport", "Fun") terlebih dahulu, diikuti Custom_Category dalam urutan abjad.

---

### Requirement 10: Budget Limit Highlight

**User Story:** Sebagai pengguna, saya ingin menetapkan batas anggaran bulanan dan mendapatkan indikasi visual ketika pengeluaran saya mendekati atau melewati batas tersebut, sehingga saya dapat mengelola keuangan dengan lebih disiplin.

#### Acceptance Criteria

1. THE App SHALL menyediakan field input bertipe angka di area Total_Display untuk pengguna menetapkan angka Budget_Limit bulanan; nilai ini disimpan ke Local Storage menggunakan key `"expense_budget_limit"` (terpisah dari key transaksi dan Custom_Category).
2. WHILE Budget_Limit telah ditetapkan (nilai > 0), THE Total_Display SHALL menampilkan progress bar horizontal yang lebarnya merepresentasikan persentase total pengeluaran bulan ini terhadap Budget_Limit, dengan lebar maksimal progress bar dibatasi hingga 100% dari lebar kontainer meskipun persentase pengeluaran melebihi 100%.
3. WHILE total pengeluaran bulan ini kurang dari 80% dari Budget_Limit, THE Total_Display SHALL menampilkan progress bar dengan warna hijau.
4. WHILE total pengeluaran bulan ini berada di antara 80% (inklusif) hingga kurang dari 100% dari Budget_Limit, THE Total_Display SHALL menampilkan progress bar dengan warna kuning.
5. IF total pengeluaran bulan ini sama dengan atau melebihi Budget_Limit, THEN THE Total_Display SHALL mengubah warna progress bar menjadi merah dan menampilkan pesan di bawah progress bar: `"Over budget by [selisih]"`, dengan `[selisih]` adalah selisih antara total pengeluaran bulan ini dan Budget_Limit, diformat sebagai mata uang Indonesian Rupiah (contoh: `"Over budget by Rp 50.000"`).
6. WHILE Budget_Limit belum ditetapkan atau bernilai nol, THE Total_Display SHALL menyembunyikan progress bar sepenuhnya (tidak ada elemen progress bar di DOM).
7. IF nilai yang dimasukkan sebagai Budget_Limit bukan angka (NaN), bernilai nol, atau bernilai negatif, THEN THE App SHALL menampilkan pesan error `"Budget limit must be a positive number"` di bawah field input dan tidak menyimpan nilai tersebut; Budget_Limit yang sebelumnya valid (jika ada) tetap tersimpan dan tidak berubah.

---

### Requirement 11: Dark/Light Mode Toggle

**User Story:** Sebagai pengguna, saya ingin dapat beralih antara tema terang dan gelap, sehingga saya dapat menggunakan aplikasi dengan nyaman di berbagai kondisi pencahayaan.

#### Acceptance Criteria

1. THE App SHALL menampilkan tombol Theme_Toggle di header yang memungkinkan pengguna berpindah antara tema terang dan tema gelap.
2. WHEN pengguna menekan Theme_Toggle, THE App SHALL mengganti tema aktif dari terang ke gelap atau sebaliknya dengan transisi CSS berdurasi antara 200ms dan 400ms pada semua elemen yang berubah warna atau background.
3. WHEN tema berubah, THE App SHALL menyimpan preferensi tema (`"light"` atau `"dark"`) ke Local Storage menggunakan key `"expense_theme"`.
4. WHEN App dimuat (page load), THE App SHALL membaca preferensi tema dari Local Storage dan menerapkan tema tersebut pada elemen `<body>` (melalui atribut `data-theme` atau class `theme-dark`/`theme-light`) di dalam blok `<script>` inline di `<head>` sebelum konten pertama kali dirender, agar tidak ada kilatan perubahan tema (flash of unstyled content / FOUC).
5. WHERE preferensi tema belum tersimpan di Local Storage, THE App SHALL memeriksa CSS media query `prefers-color-scheme: dark`; jika cocok, tema gelap digunakan; jika tidak cocok atau tidak didukung, tema terang digunakan sebagai default akhir.
6. WHILE tema terang aktif, THE Theme_Toggle SHALL menampilkan ikon bulan ("🌙" atau SVG bulan) untuk menandakan bahwa pengguna dapat beralih ke tema gelap.
7. WHILE tema gelap aktif, THE Theme_Toggle SHALL menampilkan ikon matahari ("☀️" atau SVG matahari) untuk menandakan bahwa pengguna dapat beralih ke tema terang.

---

## Correctness Properties (Requirements 8–11)

### Property 12: Custom Category Round-Trip Preservation

*For any* array of valid Custom_Category name strings, the following round-trip SHALL preserve all data:
1. Simpan array Custom_Category ke Local Storage
2. Baca kembali dari Local Storage

Array yang dibaca SHALL memiliki panjang dan isi yang sama dengan array asli. Tidak ada duplikat yang tersimpan meskipun `save()` dipanggil berkali-kali dengan input yang sama (idempotent).

**Validates: Requirements 8.2, 8.3**

---

### Property 13: Custom Category Uniqueness Invariant

*For any* sequence of add-category operations (termasuk duplikat case-insensitive), hasil akhir dari daftar Custom_Category yang tersimpan di Local Storage SHALL tidak mengandung dua entri yang sama ketika dibandingkan secara case-insensitive.

Mathematically: `∀ i ≠ j: categories[i].toLowerCase() ≠ categories[j].toLowerCase()`

**Validates: Requirements 8.6**

---

### Property 14: Category Sums Include Custom Categories

*For any* array of transactions yang mengandung campuran kategori default dan Custom_Category, jumlah semua amount dari `getByCategory()` (termasuk Custom_Category) SHALL tepat sama dengan `getTotalAmount()`.

Mathematically:
```
sum(getByCategory().values()) === getTotalAmount()
```

Ini adalah perluasan dari Property 11 untuk mencakup Custom_Category.

**Validates: Requirements 8.4, 5.1**

---

### Property 15: Monthly Summary Consistency

*For any* array of transactions, nilai yang dikembalikan oleh Monthly_Summary (total, count, average) SHALL konsisten satu sama lain:

```
monthlySummary.total === sum(txns.filter(inCurrentMonth).map(t => t.amount))
monthlySummary.count === txns.filter(inCurrentMonth).length
monthlySummary.average === (count === 0 ? 0 : monthlySummary.total / monthlySummary.count)
```

Selain itu, hanya transaksi dengan `createdAt` di bulan dan tahun kalender yang sedang berjalan yang diikutsertakan dalam perhitungan.

**Validates: Requirements 9.2, 9.3**

---

### Property 16: Monthly Summary Updates on Mutation

*For any* initial transaction list dan transaksi baru dengan `amount = A` di bulan berjalan, setelah `TransactionStore.add(newTransaction)`:

`monthlySummary.total_baru === monthlySummary.total_lama + A`
`monthlySummary.count_baru === monthlySummary.count_lama + 1`

Ini adalah metamorphic property yang memverifikasi bahwa Monthly_Summary di-refresh secara konsisten setiap ada perubahan data.

**Validates: Requirements 9.5**

---

### Property 17: Budget Progress Bar Correctness

*For any* nilai `spent` (total pengeluaran bulan ini) dan nilai `limit` (Budget_Limit) yang keduanya positif, persentase yang ditampilkan oleh progress bar SHALL sama dengan `Math.min((spent / limit) * 100, 100)`.

Ketika `spent > limit`, pesan kelebihan SHALL menampilkan nilai `spent - limit` diformat sebagai mata uang Indonesian Rupiah.

Ketika `limit === 0` atau belum ditetapkan, progress bar SHALL tidak ditampilkan (hidden/tidak ada di DOM).

**Validates: Requirements 10.2, 10.3, 10.4, 10.5**

---

### Property 18: Theme Preference Round-Trip

*For any* pilihan tema ("light" atau "dark"), setelah pengguna mengaktifkan tema tersebut:
1. Local Storage SHALL menyimpan nilai preferensi yang tepat
2. Setelah page reload, App SHALL menerapkan tema yang sama tanpa melalui tema default terlebih dahulu (tidak ada FOUC)

Ini adalah round-trip property yang memverifikasi persistensi preferensi tema.

**Validates: Requirements 11.3, 11.4**

---

## Technical Constraints (berlaku untuk semua Requirements)

- **TC-1**: THE App SHALL diimplementasikan menggunakan HTML, CSS, dan Vanilla JavaScript saja, tanpa framework JavaScript atau CSS tambahan.
- **TC-2**: THE App SHALL menyimpan seluruh data (transaksi, Custom_Category, Budget_Limit, preferensi tema) di Local Storage browser; tidak ada backend atau API eksternal yang diperlukan.
- **NFR-1**: THE App SHALL dijaga sesederhana mungkin; tidak perlu menambahkan test setup, build tools, atau infrastruktur yang tidak diperlukan untuk menjalankan fitur.
- **NFR-3**: Semua fitur baru (Requirement 8–11) SHALL menggunakan desain visual yang konsisten dengan komponen yang sudah ada (warna, tipografi, spacing, gaya tombol).
