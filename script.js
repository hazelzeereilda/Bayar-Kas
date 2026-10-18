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

let siswa = [];

try {
  const data = JSON.parse(localStorage.getItem("bayarKasSiswa") || "[]");

  if (Array.isArray(data)) {
    siswa = data.filter(item =>
      item &&
      typeof item.id === "string" &&
      typeof item.nama === "string" &&
      typeof item.kelas === "string"
    ).map(item => ({
      ...item,
      nim: typeof item.nim === "string" ? item.nim : ""
    }));
  }
} catch (error) {
  siswa = [];
}

function simpanData() {
  localStorage.setItem("bayarKasSiswa", JSON.stringify(siswa));
}

function tampilkanSiswa() {
  const kataKunci = inputCari.value.trim().toLowerCase();

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

      const nilai = [
        index + 1,
        item.nim || "—",
        item.nama,
        item.kelas
      ];

      nilai.forEach(teks => {
        const kolom = document.createElement("td");
        kolom.textContent = teks;
        baris.appendChild(kolom);
      });

      const aksi = document.createElement("td");
      aksi.className = "student-actions";

      const tombolEdit = document.createElement("button");
      tombolEdit.type = "button";
      tombolEdit.textContent = "Edit";
      tombolEdit.className = "action-edit";
      tombolEdit.addEventListener("click", () => editSiswa(item.id));

      const tombolHapus = document.createElement("button");
      tombolHapus.type = "button";
      tombolHapus.textContent = "Hapus";
      tombolHapus.className = "action-delete";
      tombolHapus.addEventListener("click", () => hapusSiswa(item.id));

      aksi.append(tombolEdit, tombolHapus);
      baris.appendChild(aksi);
      daftarSiswa.appendChild(baris);
    });
  }

  totalSiswa.textContent = `${siswa.length} siswa`;

  if (jumlahSiswa) {
    jumlahSiswa.textContent = `${siswa.length} siswa`;
  }
}

formSiswa.addEventListener("submit", event => {
  event.preventDefault();

  const nim = inputNim.value.trim();
  const nama = inputNama.value.trim();
  const kelas = inputKelas.value.trim();

  if (!nim || !nama || !kelas) {
    alert("NIM, nama, dan kelas wajib diisi.");
    return;
  }

  const nimSudahAda = siswa.some(item =>
    item.nim.toLowerCase() === nim.toLowerCase() &&
    item.id !== inputId.value
  );

  if (nimSudahAda) {
    alert("NIM tersebut sudah terdaftar.");
    return;
  }

  if (inputId.value) {
    const index = siswa.findIndex(item => item.id === inputId.value);

    if (index !== -1) {
      siswa[index] = { ...siswa[index], nim, nama, kelas };
    }
  } else {
    siswa.push({
      id: crypto.randomUUID(),
      nim,
      nama,
      kelas
    });
  }

  simpanData();
  resetForm();
  tampilkanSiswa();
    });
  
/* ===== FITUR PEMBAYARAN KAS MINGGUAN ===== */

const pilihMinggu = document.getElementById("pilih-minggu");
const nominalKas = document.getElementById("nominal-kas");
const daftarPembayaran = document.getElementById("daftar-pembayaran");
const totalKasMinggu = document.getElementById("total-kas-minggu");
const sudahBayar = document.getElementById("sudah-bayar");
const belumBayar = document.getElementById("belum-bayar");
const progressBayar = document.getElementById("progress-bayar");
const persentaseBayar = document.getElementById("persentase-bayar");
const periodeKas = document.getElementById("periode");

let dataPembayaran = {};

try {
  const tersimpan = JSON.parse(
    localStorage.getItem("bayarKasMingguan") || "{}"
  );

  if (tersimpan && typeof tersimpan === "object" && !Array.isArray(tersimpan)) {
    dataPembayaran = tersimpan;
  }
} catch (error) {
  dataPembayaran = {};
}

function simpanPembayaran() {
  localStorage.setItem(
    "bayarKasMingguan",
    JSON.stringify(dataPembayaran)
  );
}

function kunciMinggu() {
  return pilihMinggu.value;
}

function dataMingguAktif() {
  const minggu = kunciMinggu();

  if (!dataPembayaran[minggu]) {
    dataPembayaran[minggu] = {
      nominal: Number(nominalKas.value) || 5000,
      siswa: {}
    };
  }

  if (!dataPembayaran[minggu].siswa) {
    dataPembayaran[minggu].siswa = {};
  }

  return dataPembayaran[minggu];
}

function rupiah(nilai) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(nilai);
}

function tampilkanPembayaran() {
  if (!pilihMinggu || !nominalKas || !daftarPembayaran) return;

  const minggu = kunciMinggu();
  const data = dataMingguAktif();

  nominalKas.value = data.nominal;

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

        dataAktif.siswa[item.id] = !(
          dataAktif.siswa[item.id] === true
        );

        simpanPembayaran();
        tampilkanPembayaran();
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

  if (sudahBayar) {
    sudahBayar.textContent = `${jumlahSudahBayar} siswa`;
  }

  if (belumBayar) {
    belumBayar.textContent = `${jumlahBelumBayar} siswa`;
  }

  if (progressBayar) {
    progressBayar.style.width = `${persen}%`;
  }

  if (persentaseBayar) {
    persentaseBayar.textContent =
      `${persen}% siswa sudah membayar minggu ke-${minggu}`;
  }

  if (totalKasMinggu) {
    totalKasMinggu.textContent = rupiah(totalTerkumpul);
  }

  if (periodeKas) {
    periodeKas.textContent = `Minggu ke-${minggu}`;
  }

  simpanPembayaran();
}

if (pilihMinggu && nominalKas && daftarPembayaran) {
  pilihMinggu.addEventListener("change", () => {
    tampilkanPembayaran();
  });

  nominalKas.addEventListener("change", () => {
    const nominal = Number(nominalKas.value);

    if (!Number.isFinite(nominal) || nominal < 0) {
      alert("Nominal kas harus berupa angka nol atau lebih.");
      tampilkanPembayaran();
      return;
    }

    dataMingguAktif().nominal = nominal;
    simpanPembayaran();
    tampilkanPembayaran();
  });

    tampilkanPembayaran();
}

function editSiswa(id) {
  const item = siswa.find(s => s.id === id);
  if (!item) return;

  inputId.value = item.id;
  inputNim.value = item.nim;
  inputNama.value = item.nama;
  inputKelas.value = item.kelas;

  tombolSimpan.textContent = "Simpan Perubahan";
  tombolBatal.hidden = false;

  formSiswa.scrollIntoView({ behavior: "smooth", block: "center" });
  inputNim.focus();
}

function hapusSiswa(id) {
  const item = siswa.find(s => s.id === id);
  if (!item) return;

  if (!confirm(`Yakin ingin menghapus data ${item.nama}?`)) return;

  siswa = siswa.filter(s => s.id !== id);

  simpanData();
  resetForm();
  tampilkanSiswa();
}

function resetForm() {
  formSiswa.reset();
  inputId.value = "";
  tombolSimpan.textContent = "Tambah Siswa";
  tombolBatal.hidden = true;
}

tombolBatal.addEventListener("click", resetForm);
inputCari.addEventListener("input", tampilkanSiswa);

tampilkanSiswa();

(() => {
  const form = document.getElementById("form-pengeluaran");
  const tanggalInput = document.getElementById("tanggal-pengeluaran");
  const keteranganInput = document.getElementById("keterangan-pengeluaran");
  const nominalInput = document.getElementById("nominal-pengeluaran");
  const tabel = document.getElementById("daftar-pengeluaran");
  const totalTeks = document.getElementById("total-pengeluaran");

  if (!form || !tabel || !totalTeks) return;

  let transaksi = [];

  try {
    transaksi = JSON.parse(
      localStorage.getItem("bayarKasPengeluaran") || "[]"
    );

    if (!Array.isArray(transaksi)) transaksi = [];
  } catch {
    transaksi = [];
  }

  const rupiah = (angka) =>
    "Rp" + Number(angka).toLocaleString("id-ID");

  function simpan() {
    localStorage.setItem(
      "bayarKasPengeluaran",
      JSON.stringify(transaksi)
    );
  }

  function render() {
    tabel.innerHTML = "";

    if (transaksi.length === 0) {
      tabel.innerHTML = `
        <tr>
          <td colspan="5" class="empty-state">
            Belum ada pengeluaran.
          </td>
        </tr>
      `;
    }

    transaksi.forEach((item, index) => {
      const baris = document.createElement("tr");

      [
        index + 1,
        item.tanggal,
        item.keterangan,
        rupiah(item.nominal)
      ].forEach((isi) => {
        const sel = document.createElement("td");
        sel.textContent = isi;
        baris.appendChild(sel);
      });

      const kolomAksi = document.createElement("td");
      const tombol = document.createElement("button");

      tombol.type = "button";
      tombol.className = "student-cancel";
      tombol.textContent = "Hapus";

      tombol.addEventListener("click", () => {
        if (!confirm("Yakin mau menghapus transaksi ini?")) return;

        transaksi = transaksi.filter(
          (data) => data.id !== item.id
        );

        simpan();
        render();
      });

      kolomAksi.appendChild(tombol);
      baris.appendChild(kolomAksi);
      tabel.appendChild(baris);
    });

    const total = transaksi.reduce(
      (jumlah, item) => jumlah + Number(item.nominal),
      0
    );

    totalTeks.textContent = rupiah(total);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const tanggal = tanggalInput.value;
    const keterangan = keteranganInput.value.trim();
    const nominal = Number(nominalInput.value);

    if (!tanggal || !keterangan || !Number.isFinite(nominal) || nominal <= 0) {
      alert("Isi semua data dengan benar ya!");
      return;
    }

    transaksi.push({
      id: Date.now(),
      tanggal,
      keterangan,
      nominal
    });

    simpan();
    form.reset();
    render();
  });

  render();
})();
