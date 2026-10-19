
/* =========================================
   KAS KELAS - SCRIPT LENGKAP
   Penyimpanan lokal:
   - bayarKasSiswa
   - bayarKasMingguan
   - bayarKasPengeluaran

   Data lama tidak dihapus saat halaman dibuka.
========================================= */

"use strict";

/* =========================================
   UTILITAS
========================================= */

function formatRupiah(nilai) {
  return "Rp" + (Number(nilai) || 0).toLocaleString("id-ID");
}

function buatId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "id-" + Date.now() + "-" + Math.random().toString(36).slice(2);
}

function ambilData(key, nilaiDefault) {
  try {
    const raw = localStorage.getItem(key);

    if (raw === null) {
      return {
        berhasil: true,
        ada: false,
        data: nilaiDefault
      };
    }

    return {
      berhasil: true,
      ada: true,
      data: JSON.parse(raw)
    };
  } catch (error) {
    console.error("Gagal membaca " + key + ":", error);

    return {
      berhasil: false,
      ada: true,
      data: nilaiDefault
    };
  }
}

/* =========================================
   DATA SISWA
========================================= */

const formSiswa = document.getElementById("form-siswa");
const inputId = document.getElementById("id-siswa");
const inputNim = document.getElementById("nim-siswa");
const inputNama = document.getElementById("nama-siswa");
const inputKelas = document.getElementById("kelas-siswa");
const inputCari = document.getElementById("cari-siswa");
const daftarSiswa = document.getElementById("daftar-siswa");
const totalSiswa = document.getElementById("total-siswa");
const jumlahSiswa = document.getElementById("jumlah-siswa");
const tombolSimpan = document.getElementById("tombol-simpan");
const tombolBatal = document.getElementById("batal-edit");

const hasilBacaSiswa = ambilData("bayarKasSiswa", []);
let siswa = [];
let siswaSiapDisimpan = false;

if (
  hasilBacaSiswa.berhasil &&
  Array.isArray(hasilBacaSiswa.data)
) {
  // Terima data lama yang belum memiliki ID atau NIM.
  // ID sementara dibuat di memori, tanpa langsung menimpa data lama.
  siswa = hasilBacaSiswa.data
    .filter(item => item && typeof item === "object")
    .map(item => ({
      ...item,
      id: item.id != null && String(item.id) !== ""
        ? String(item.id)
        : buatId(),
      nim: String(item.nim ?? item.NIM ?? ""),
      nama: String(item.nama ?? item.name ?? ""),
      kelas: String(item.kelas ?? item.class ?? "")
    }));

  // Simpan hanya jika data yang dibaca memang array berisi objek.
  siswaSiapDisimpan = hasilBacaSiswa.data.every(
    item => item && typeof item === "object"
  );
} else if (!hasilBacaSiswa.ada) {
  siswaSiapDisimpan = true;
} else {
  console.error(
    "Data siswa tidak dikenali. Penyimpanan siswa dikunci agar data lama tidak tertimpa."
  );
}

function simpanDataSiswa() {
  if (!siswaSiapDisimpan) {
    alert(
      "Data siswa lama belum bisa dipastikan formatnya. " +
      "Data tidak ditimpa agar tidak hilang."
    );
    return false;
  }

  try {
    localStorage.setItem("bayarKasSiswa", JSON.stringify(siswa));
    return true;
  } catch (error) {
    console.error("Gagal menyimpan data siswa:", error);
    alert("Data siswa gagal disimpan. Periksa penyimpanan browser.");
    return false;
  }
}

function resetFormSiswa() {
  if (formSiswa) formSiswa.reset();
  if (inputId) inputId.value = "";
  if (tombolSimpan) tombolSimpan.textContent = "Tambah Siswa";
  if (tombolBatal) tombolBatal.hidden = true;
}

function editSiswa(id) {
  const item = siswa.find(s => s.id === String(id));
  if (!item) return;

  if (!formSiswa || !inputId || !inputNim || !inputNama || !inputKelas) {
    alert("Form siswa belum lengkap. Periksa ID elemen di index.html.");
    return;
  }

  inputId.value = item.id;
  inputNim.value = item.nim;
  inputNama.value = item.nama;
  inputKelas.value = item.kelas;

  if (tombolSimpan) tombolSimpan.textContent = "Simpan Perubahan";
  if (tombolBatal) tombolBatal.hidden = false;

  formSiswa.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  inputNim.focus();
}

function hapusSiswa(id) {
  const item = siswa.find(s => s.id === String(id));
  if (!item) return;

  if (!confirm(`Yakin ingin menghapus data ${item.nama}?`)) return;

  const siswaSebelumnya = [...siswa];
  siswa = siswa.filter(s => s.id !== String(id));

  if (!simpanDataSiswa()) {
    siswa = siswaSebelumnya;
    return;
  }

  resetFormSiswa();
  tampilkanSiswa();
}

function tampilkanSiswa() {
  if (!daftarSiswa) return;

  const kataKunci = inputCari
    ? inputCari.value.trim().toLowerCase()
    : "";

  const hasil = siswa.filter(item =>
    item.nim.toLowerCase().includes(kataKunci) ||
    item.nama.toLowerCase().includes(kataKunci) ||
    item.kelas.toLowerCase().includes(kataKunci)
  );

  daftarSiswa.innerHTML = "";

  if (hasil.length === 0) {
    const baris = document.createElement("tr");
    const kolom = document.createElement("td");

    kolom.colSpan = 5;
    kolom.className = "empty-state";
    kolom.textContent = siswa.length
      ? "Data siswa tidak ditemukan."
      : "Belum ada data siswa.";

    baris.appendChild(kolom);
    daftarSiswa.appendChild(baris);
  } else {
    hasil.forEach((item, index) => {
      const baris = document.createElement("tr");

      [
        index + 1,
        item.nim || "—",
        item.nama,
        item.kelas
      ].forEach(teks => {
        const kolom = document.createElement("td");
        kolom.textContent = teks;
        baris.appendChild(kolom);
      });

      const kolomAksi = document.createElement("td");
      kolomAksi.className = "student-actions";

      const tombolEditSiswa = document.createElement("button");
      tombolEditSiswa.type = "button";
      tombolEditSiswa.textContent = "Edit";
      tombolEditSiswa.className = "action-edit";
      tombolEditSiswa.addEventListener("click", () => {
        editSiswa(item.id);
      });

      const tombolHapusSiswa = document.createElement("button");
      tombolHapusSiswa.type = "button";
      tombolHapusSiswa.textContent = "Hapus";
      tombolHapusSiswa.className = "action-delete";
      tombolHapusSiswa.addEventListener("click", () => {
        hapusSiswa(item.id);
      });

      kolomAksi.append(tombolEditSiswa, tombolHapusSiswa);
      baris.appendChild(kolomAksi);
      daftarSiswa.appendChild(baris);
    });
  }

  if (totalSiswa) totalSiswa.textContent = `${siswa.length} siswa`;
  if (jumlahSiswa) jumlahSiswa.textContent = `${siswa.length} siswa`;

  tampilkanPembayaran();
}

if (formSiswa) {
  formSiswa.addEventListener("submit", event => {
    event.preventDefault();

    if (!inputId || !inputNim || !inputNama || !inputKelas) {
      alert("Form siswa belum lengkap. Periksa index.html.");
      return;
    }

    const nim = inputNim.value.trim();
    const nama = inputNama.value.trim();
    const kelas = inputKelas.value.trim();
    const idEdit = inputId.value;

    if (!nim || !nama || !kelas) {
      alert("NIM, nama, dan kelas wajib diisi.");
      return;
    }

    const nimSudahAda = siswa.some(item =>
      item.nim.toLowerCase() === nim.toLowerCase() &&
      item.id !== idEdit
    );

    if (nimSudahAda) {
      alert("NIM tersebut sudah terdaftar.");
      return;
    }

    const siswaSebelumnya = [...siswa];

    if (idEdit) {
      const index = siswa.findIndex(item => item.id === idEdit);

      if (index === -1) {
        alert("Data siswa yang mau diedit tidak ditemukan.");
        return;
      }

      siswa[index] = {
        ...siswa[index],
        nim,
        nama,
        kelas
      };
    } else {
      siswa.push({
        id: buatId(),
        nim,
        nama,
        kelas
      });
    }

    if (!simpanDataSiswa()) {
      siswa = siswaSebelumnya;
      return;
    }

    resetFormSiswa();
    tampilkanSiswa();
  });
}

if (tombolBatal) {
  tombolBatal.addEventListener("click", resetFormSiswa);
}

if (inputCari) {
  inputCari.addEventListener("input", tampilkanSiswa);
}

/* =========================================
   PEMBAYARAN KAS MINGGUAN
========================================= */

const pilihMinggu = document.getElementById("pilih-minggu");
const nominalKas = document.getElementById("nominal-kas");
const daftarPembayaran = document.getElementById("daftar-pembayaran");
const totalKasMinggu = document.getElementById("total-kas-minggu");
const sudahBayar = document.getElementById("sudah-bayar");
const belumBayar = document.getElementById("belum-bayar");
const progressBayar = document.getElementById("progress-bayar");
const persentaseBayar = document.getElementById("persentase-bayar");
const periodeKas = document.getElementById("periode");

const hasilBacaPembayaran = ambilData("bayarKasMingguan", {});
let dataPembayaran = {};

if (
  hasilBacaPembayaran.berhasil &&
  hasilBacaPembayaran.data &&
  typeof hasilBacaPembayaran.data === "object" &&
  !Array.isArray(hasilBacaPembayaran.data)
) {
  dataPembayaran = hasilBacaPembayaran.data;
} else if (hasilBacaPembayaran.ada) {
  console.error(
    "Format pembayaran tidak dikenali. Data pembayaran tidak ditimpa."
  );
}

function simpanPembayaran() {
  try {
    localStorage.setItem(
      "bayarKasMingguan",
      JSON.stringify(dataPembayaran)
    );
    return true;
  } catch (error) {
    console.error("Gagal menyimpan pembayaran:", error);
    alert("Data pembayaran gagal disimpan di browser.");
    return false;
  }
}

function kunciMinggu() {
  return pilihMinggu ? pilihMinggu.value : "1";
}

function dataMingguAktif() {
  const minggu = kunciMinggu();

  if (
    !dataPembayaran[minggu] ||
    typeof dataPembayaran[minggu] !== "object" ||
    Array.isArray(dataPembayaran[minggu])
  ) {
    dataPembayaran[minggu] = {
      nominal: Number(nominalKas?.value) || 5000,
      siswa: {}
    };
  }

  if (
    !dataPembayaran[minggu].siswa ||
    typeof dataPembayaran[minggu].siswa !== "object" ||
    Array.isArray(dataPembayaran[minggu].siswa)
  ) {
    dataPembayaran[minggu].siswa = {};
  }

  return dataPembayaran[minggu];
}

function tampilkanPembayaran() {
  if (!pilihMinggu || !nominalKas || !daftarPembayaran) return;

  const minggu = kunciMinggu();
  const data = dataMingguAktif();

  nominalKas.value = data.nominal ?? 5000;
  daftarPembayaran.innerHTML = "";

  let jumlahSudahBayar = 0;
  let totalTerkumpul = 0;

  if (siswa.length === 0) {
    const baris = document.createElement("tr");
    const kolom = document.createElement("td");

    kolom.colSpan = 5;
    kolom.textContent = "Tambahkan data siswa terlebih dahulu.";

    baris.appendChild(kolom);
    daftarPembayaran.appendChild(baris);
  } else {
    siswa.forEach((item, index) => {
      const sudah = data.siswa[item.id] === true;
      const baris = document.createElement("tr");

      const nomor = document.createElement("td");
      nomor.textContent = index + 1;

      const nim = document.createElement("td");
      nim.textContent = item.nim || "—";

      const nama = document.createElement("td");
      nama.textContent = item.nama;

      const status = document.createElement("td");
      const labelStatus = document.createElement("span");

      labelStatus.className = sudah
        ? "payment-status-paid"
        : "payment-status-unpaid";

      labelStatus.textContent = sudah ? "Sudah Bayar" : "Belum Bayar";
      status.appendChild(labelStatus);

      const aksi = document.createElement("td");
      const tombol = document.createElement("button");

      tombol.type = "button";
      tombol.textContent = sudah ? "Batalkan" : "Tandai Bayar";

      tombol.addEventListener("click", () => {
        const dataAktif = dataMingguAktif();
        const nilaiLama = dataAktif.siswa[item.id];

        dataAktif.siswa[item.id] = nilaiLama !== true;

        if (!simpanPembayaran()) {
          if (nilaiLama === undefined) {
            delete dataAktif.siswa[item.id];
          } else {
            dataAktif.siswa[item.id] = nilaiLama;
          }
          return;
        }

        tampilkanPembayaran();
        renderPengeluaran();
      });

      aksi.appendChild(tombol);
      baris.append(nomor, nim, nama, status, aksi);
      daftarPembayaran.appendChild(baris);

      if (sudah) {
        jumlahSudahBayar++;
        totalTerkumpul += Number(data.nominal) || 0;
      }
    });
  }

  const jumlahBelumBayar = siswa.length - jumlahSudahBayar;
  const persen = siswa.length
    ? Math.round((jumlahSudahBayar / siswa.length) * 100)
    : 0;

  if (sudahBayar) sudahBayar.textContent = `${jumlahSudahBayar} siswa`;
  if (belumBayar) belumBayar.textContent = `${jumlahBelumBayar} siswa`;

  if (progressBayar) progressBayar.style.width = `${persen}%`;

  if (persentaseBayar) {
    persentaseBayar.textContent =
      `${persen}% siswa sudah membayar minggu ke-${minggu}`;
  }

  if (totalKasMinggu) {
    totalKasMinggu.textContent = formatRupiah(totalTerkumpul);
  }

  if (periodeKas) periodeKas.textContent = `Minggu ke-${minggu}`;

  // Jangan menyimpan otomatis hanya karena halaman dibuka.
}

if (pilihMinggu) {
  pilihMinggu.addEventListener("change", tampilkanPembayaran);
}

if (nominalKas) {
  nominalKas.addEventListener("change", () => {
    const nominal = Number(nominalKas.value);

    if (!Number.isFinite(nominal) || nominal < 0) {
      alert("Nominal kas harus berupa angka nol atau lebih.");
      tampilkanPembayaran();
      return;
    }

    const dataAktif = dataMingguAktif();
    const nominalLama = dataAktif.nominal;
    dataAktif.nominal = nominal;

    if (!simpanPembayaran()) {
      dataAktif.nominal = nominalLama;
      tampilkanPembayaran();
      return;
    }

    tampilkanPembayaran();
    renderPengeluaran();
  });
}

/* =========================================
   PENGELUARAN KAS
========================================= */

const formPengeluaran = document.getElementById("form-pengeluaran");
const tanggalPengeluaran = document.getElementById("tanggal-pengeluaran");
const keteranganPengeluaran = document.getElementById("keterangan-pengeluaran");
const nominalPengeluaran = document.getElementById("nominal-pengeluaran");
const daftarPengeluaran = document.getElementById("daftar-pengeluaran");
const totalPengeluaran = document.getElementById("total-pengeluaran");
const totalPengeluaranDashboard = document.getElementById(
  "total-pengeluaran-dashboard"
);
const saldoDashboard = document.getElementById("saldo");
const pemasukanDashboard = document.getElementById("pemasukan");

const hasilBacaPengeluaran = ambilData("bayarKasPengeluaran", []);
let transaksiPengeluaran = [];

if (
  hasilBacaPengeluaran.berhasil &&
  Array.isArray(hasilBacaPengeluaran.data)
) {
  transaksiPengeluaran = hasilBacaPengeluaran.data.filter(item =>
    item &&
    typeof item === "object" &&
    item.id !== undefined &&
    typeof item.tanggal === "string" &&
    typeof item.keterangan === "string"
  );
} else if (hasilBacaPengeluaran.ada) {
  console.error(
    "Format pengeluaran tidak dikenali. Data pengeluaran tidak ditimpa."
  );
}

function simpanPengeluaran() {
  try {
    localStorage.setItem(
      "bayarKasPengeluaran",
      JSON.stringify(transaksiPengeluaran)
    );
    return true;
  } catch (error) {
    console.error("Gagal menyimpan pengeluaran:", error);
    alert("Data pengeluaran gagal disimpan di browser.");
    return false;
  }
}

function hitungTotalPemasukanSemuaMinggu() {
  let total = 0;

  Object.values(dataPembayaran).forEach(data => {
    if (!data || typeof data !== "object") return;

    const nominal = Number(data.nominal) || 0;
    const statusSiswa = data.siswa || {};

    Object.values(statusSiswa).forEach(sudah => {
      if (sudah === true) total += nominal;
    });
  });

  return total;
}

function renderPengeluaran() {
  if (!daftarPengeluaran) {
    // Ringkasan dashboard tetap dihitung jika elemen tabel tidak ada.
    perbaruiRingkasanKas();
    return;
  }

  daftarPengeluaran.innerHTML = "";

  if (transaksiPengeluaran.length === 0) {
    const baris = document.createElement("tr");
    const kolom = document.createElement("td");

    kolom.colSpan = 5;
    kolom.className = "empty-state";
    kolom.textContent = "Belum ada pengeluaran.";

    baris.appendChild(kolom);
    daftarPengeluaran.appendChild(baris);
  } else {
    transaksiPengeluaran.forEach((item, index) => {
      const baris = document.createElement("tr");

      [
        index + 1,
        item.tanggal,
        item.keterangan,
        formatRupiah(item.nominal)
      ].forEach(teks => {
        const kolom = document.createElement("td");
        kolom.textContent = teks;
        baris.appendChild(kolom);
      });

      const kolomAksi = document.createElement("td");
      const tombolHapus = document.createElement("button");

      tombolHapus.type = "button";
      tombolHapus.className = "student-cancel";
      tombolHapus.textContent = "Hapus";

      tombolHapus.addEventListener("click", () => {
        if (!confirm("Yakin mau menghapus transaksi ini?")) return;

        const sebelumnya = [...transaksiPengeluaran];

        transaksiPengeluaran = transaksiPengeluaran.filter(
          data => String(data.id) !== String(item.id)
        );

        if (!simpanPengeluaran()) {
          transaksiPengeluaran = sebelumnya;
          return;
        }

        renderPengeluaran();
      });

      kolomAksi.appendChild(tombolHapus);
      baris.appendChild(kolomAksi);
      daftarPengeluaran.appendChild(baris);
    });
  }

  perbaruiRingkasanKas();
}

function perbaruiRingkasanKas() {
  const total = transaksiPengeluaran.reduce(
    (jumlah, item) => jumlah + (Number(item.nominal) || 0),
    0
  );

  const pemasukan = hitungTotalPemasukanSemuaMinggu();

  if (totalPengeluaran) {
    totalPengeluaran.textContent = formatRupiah(total);
  }

  if (totalPengeluaranDashboard) {
    totalPengeluaranDashboard.textContent = formatRupiah(total);
  }

  if (saldoDashboard) {
    saldoDashboard.textContent = formatRupiah(pemasukan - total);
  }

  if (pemasukanDashboard) {
    pemasukanDashboard.textContent = formatRupiah(pemasukan);
  }
}

if (formPengeluaran) {
  formPengeluaran.addEventListener("submit", event => {
    event.preventDefault();

    if (
      !tanggalPengeluaran ||
      !keteranganPengeluaran ||
      !nominalPengeluaran
    ) {
      alert("Form pengeluaran belum lengkap. Periksa index.html.");
      return;
    }

    const tanggal = tanggalPengeluaran.value;
    const keterangan = keteranganPengeluaran.value.trim();
    const nominal = Number(nominalPengeluaran.value);

    if (
      !tanggal ||
      !keterangan ||
      !Number.isFinite(nominal) ||
      nominal <= 0
    ) {
      alert("Isi semua data pengeluaran dengan benar ya!");
      return;
    }

    const sebelumnya = [...transaksiPengeluaran];

    transaksiPengeluaran.push({
      id: buatId(),
      tanggal,
      keterangan,
      nominal
    });

    if (!simpanPengeluaran()) {
      transaksiPengeluaran = sebelumnya;
      return;
    }

    formPengeluaran.reset();
    renderPengeluaran();
  });
}

/* =========================================
   SIDEBAR
========================================= */

const menuSidebar = document.querySelectorAll(
  ".navigation .nav-item"
);

function updateSidebarActive() {
  const hash = window.location.hash || "#dashboard";

  menuSidebar.forEach(menu => {
    menu.classList.toggle(
      "active",
      menu.getAttribute("href") === hash
    );
  });
}

menuSidebar.forEach(menu => {
  menu.addEventListener("click", () => {
    menuSidebar.forEach(item => item.classList.remove("active"));
    menu.classList.add("active");
  });
});

window.addEventListener("hashchange", updateSidebarActive);

/* =========================================
   TAMPILKAN SAAT HALAMAN DIBUKA
========================================= */

tampilkanSiswa();
tampilkanPembayaran();
renderPengeluaran();
updateSidebarActive();
